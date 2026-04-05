'use client'

import { useState } from 'react'
import { createWalletClient, createPublicClient, custom, http, parseUnits } from 'viem'
import { mainnet } from 'viem/chains'

declare global {
  interface Window {
    ethereum?: any
  }
}

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(), // ou autre RPC
})

const tokenIn = '0x0000000000000000000000000000000000000000' // ETH
const tokenOut = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT

export default function Swap() {
  const [loading, setLoading] = useState(false)
  const [account, setAccount] = useState<string | null>(null)

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask non trouvé')
      return
    }

    const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setAccount(accounts[0])
    console.log('Wallet connecté :', accounts[0])
  }

  const handleSwap = async () => {
    if (!account) {
      alert('Connecte ton wallet d’abord')
      return
    }

    setLoading(true)

    try {
      // WalletClient via MetaMask
      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum),
      })

      // -------------------------
      // 1. QUOTE
      // -------------------------
      const quoteRes = await fetch('/api/quote', {
        method: 'POST',
        body: JSON.stringify({
          swapper: account,
          tokenInChainId: 1,
          tokenOutChainId: 1,
          tokenIn,
          tokenOut,
          amount: parseUnits('0.01', 18).toString(),
          type: 'EXACT_INPUT',
          urgency: 'normal',
          generatePermitAsTransaction: false,
        }),
      }).then(res => res.json())

      console.log('Quote response:', quoteRes)

      const { quote, permitData, routing } = quoteRes

      // -------------------------
      // 2. SIGN PERMIT si disponible
      // -------------------------
      let signature
      if (permitData) {
        signature = await walletClient.signTypedData({
          account,
          domain: permitData.domain,
          types: permitData.types,
          primaryType: permitData.primaryType,
          message: permitData.values,
        })
        console.log('Permit signature:', signature)
      }

      // -------------------------
      // 3. SWAP
      // -------------------------
      const body: any = { quote }
      if (signature && permitData) {
        body.signature = signature
        body.permitData = permitData
      }

      const swapRes = await fetch('/api/swap', {
        method: 'POST',
        body: JSON.stringify(body),
      }).then(res => res.json())

      console.log('Swap response:', swapRes)

      // Vérification si swap disponible
      if (!swapRes.swap) {
        throw new Error('Swap non disponible (API ou permit manquant)')
      }

      const tx = swapRes.swap

      const txHash = await walletClient.sendTransaction({
        account,
        to: tx.to,
        data: tx.data,
        value: BigInt(tx.value || 0),
      })

      await publicClient.waitForTransactionReceipt({ hash: txHash })

      alert('✅ Swap réussi')
    } catch (err) {
      console.error(err)
      alert('❌ Erreur swap')
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Swap Mainnet</h2>
      {!account && <button onClick={connectWallet}>Connecter MetaMask</button>}
      {account && (
        <button onClick={handleSwap} disabled={loading}>
          {loading ? 'Processing...' : 'Swap 0.01 ETH → USDT'}
        </button>
      )}
      {account && <p>Wallet connecté : {account}</p>}
    </div>
  )
}