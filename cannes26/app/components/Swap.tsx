'use client'

import { invoke } from '@tauri-apps/api/core'
import { Wallet } from 'ethers'
import { useState } from 'react'
import { createWalletClient, createPublicClient, http, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

interface Token {
  symbol: string
  address: string
  decimals: number
}

const RPC_URLS = ['https://ethereum.publicnode.com']

const TOKENS: Token[] = [
  { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
  { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
]

function getPublicClient() {
  return createPublicClient({
    chain: mainnet,
    transport: http('https://ethereum.publicnode.com'),
  })
}

export function Swap({ show, onClose }: { show: boolean; onClose: () => void }) {
  const [tokenIn, setTokenIn] = useState(TOKENS[0].address)
  const [tokenOut, setTokenOut] = useState(TOKENS[1].address)
  const [amount, setAmount] = useState('0.001')
  const [loading, setLoading] = useState(false)
  const [quoteData, setQuoteData] = useState<any>(null)
  const [quoteInfo, setQuoteInfo] = useState<any>(null)
  const [slippage, setSlippage] = useState(0.5)

  async function fetchQuote() {
    if (!amount || parseFloat(amount) <= 0) return
    try {
      setQuoteData(null)
      setQuoteInfo(null)

      const filePath = localStorage.getItem('filePath')
      if (!filePath) throw new Error('Aucun fichier wallet sélectionné.')

      const data = await invoke('read_text_from_file', { filePath }) as string
      const json = JSON.parse(data)
      const decryptedWallet = await Wallet.fromEncryptedJson(json.wallet, 'test')

      const tokenInObj = TOKENS.find(t => t.address === tokenIn)!
      const tokenOutObj = TOKENS.find(t => t.address === tokenOut)!

      const res = await fetch('/api/quote', {
        method: 'POST',
        body: JSON.stringify({
          swapper: decryptedWallet.address,
          tokenInChainId: 1,
          tokenOutChainId: 1,
          tokenIn,
          tokenOut,
          amount: parseUnits(amount, tokenInObj.decimals).toString(),
          type: 'EXACT_INPUT',
          slippage: slippage,
          generatePermitAsTransaction: tokenIn !== TOKENS[0].address,
        }),
      }).then(r => r.json())

      if (!res.quote) throw new Error('Quote non disponible')
      setQuoteData(res)

      const q = res.quote
      const amountIn = parseFloat(amount)
      const amountOut = q.output?.amount ? Number(q.output.amount) / Math.pow(10, tokenOutObj.decimals) : 0
      const price = amountOut && amountIn ? amountOut / amountIn : 0
      const gasUSD = q.gasFeeUSD ?? '0'

      setQuoteInfo({ amountIn, amountOut, price, slippage, gasUSD })
    } catch (err: any) {
      console.error(err)
      alert(`❌ Impossible de récupérer le quote : ${err.message || err}`)
    }
  }

  async function handleSwap() {
    if (!quoteData) return alert('Obtenez d’abord un quote.')
    setLoading(true)
    try {
      const filePath = localStorage.getItem('filePath')
      if (!filePath) throw new Error('Aucun fichier wallet sélectionné.')

      const data = await invoke('read_text_from_file', { filePath }) as string
      const json = JSON.parse(data)
      const decryptedWallet = await Wallet.fromEncryptedJson(json.wallet, 'test')

      const walletClient = createWalletClient({
        chain: mainnet,
        transport: http(RPC_URLS[0]),
        account: privateKeyToAccount(decryptedWallet.privateKey as `0x${string}`),
      })

      let nonce = 0
      for (let url of RPC_URLS) {
        try {
          const client = getPublicClient()
          nonce = await client.getTransactionCount({ address: decryptedWallet.address as `0x${string}`, blockTag: 'pending' })
          break
        } catch (err) {
          console.warn(`Impossible de récupérer le nonce depuis ${url}:`, err)
        }
      }

      const body: any = { quote: quoteData.quote }

      if (quoteData.permitData && quoteData.permitData.signature) {
        body.permitData = quoteData.permitData
      }

      body.deadline = Math.floor(Date.now() / 1000) + 300

      const swapRes = await fetch('/api/swap', {
        method: 'POST',
        body: JSON.stringify(body),
      }).then(r => r.json())
      console.log('Réponse swap:', swapRes)

      if (!swapRes.swap) throw new Error('Swap non disponible')
      const tx = swapRes.swap

      const signedTx = await walletClient.signTransaction({
        to: tx.to,
        value: BigInt(tx.value),
        data: tx.data,
        chainId: 1,
        nonce,
        gas: BigInt(tx.gasLimit || 21000),
        maxFeePerGas: tx.maxFeePerGas ? BigInt(tx.maxFeePerGas) : undefined,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas ? BigInt(tx.maxPriorityFeePerGas) : undefined,
      })

      const txHash = await walletClient.request({
        method: 'eth_sendRawTransaction',
        params: [signedTx],
      })

      console.log('Transaction envoyée, hash :', txHash)
      alert(`✅ Transaction envoyée : ${txHash}`)
    } catch (err: any) {
      console.error(err)
      alert(`❌ Erreur swap : ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }

    const handlePopupClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    if (!show) return null;

  return (
    <main className="overlay" onClick={onClose}>
        <div style={{ padding: 20, maxWidth: 500 }} className="popup" onClick={handlePopupClick}>
                <button className="closeBtn" onClick={onClose}>
                &times;
                </button>
        <h2>Swap Mainnet</h2>

        <div style={{ marginBottom: 10 }}>
            <label>Token d'entrée :</label>
            <select value={tokenIn} onChange={e => setTokenIn(e.target.value)}>
            {TOKENS.map(t => <option key={t.address} value={t.address}>{t.symbol}</option>)}
            </select>
        </div>

        <div style={{ marginBottom: 10 }}>
            <label>Token de sortie :</label>
            <select value={tokenOut} onChange={e => setTokenOut(e.target.value)}>
            {TOKENS.map(t => <option key={t.address} value={t.address}>{t.symbol}</option>)}
            </select>
        </div>

        <div style={{ marginBottom: 10 }}>
            <label>Montant :</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} step="any" />
        </div>

        <div style={{ marginBottom: 10 }}>
            <label>Slippage (%):</label>
            <input type="number" value={slippage} onChange={e => setSlippage(parseFloat(e.target.value))} step="0.1" />
        </div>

        <div style={{ marginBottom: 10 }}>
            <button onClick={fetchQuote} disabled={loading}>
            {loading ? 'Chargement...' : 'Obtenir quote'}
            </button>
        </div>

        {quoteInfo && (
            <div style={{ marginBottom: 10, border: '1px solid #ccc', padding: 10 }}>
            <p><strong>Montant reçu estimé :</strong> {quoteInfo.amountOut.toFixed(6)} {TOKENS.find(t => t.address === tokenOut)?.symbol}</p>
            <p><strong>Prix moyen :</strong> {quoteInfo.price.toFixed(6)}</p>
            <p><strong>Slippage :</strong> {quoteInfo.slippage}%</p>
            <p><strong>Frais gas estimés :</strong> ${quoteInfo.gasUSD}</p>
            </div>
        )}

        <button onClick={handleSwap} disabled={loading || !quoteData}>
            {loading ? 'Processing...' : 'Swap maintenant'}
        </button>
        </div>
    </main>
  )
}