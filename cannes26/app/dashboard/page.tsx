"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { formatUnits } from "viem";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Wallet } from "ethers";

import { TokenData } from "../types/TokenData";
import { useUpdateBalance } from "../hooks/useUpdateBalance";
import AddToken from "../components/AddToken";
import { Swap } from "../components/Swap";
import Receive from "../components/Receive";
import Stake from "../components/Stake";

import { publicClient } from "../clients/publicClient";
import { sepolia } from "viem/chains";

  import { createPublicClient, parseUnits } from 'viem'
import Transfer from "../components/Transfer";

export default function Home() {
  const [showAddToken, setShowAddToken] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showStake, setShowStake] = useState(false);


  const [walletAddress, setWalletAddress] = useState<string>("");
  const [tokenList, setTokenList] = useState<TokenData[]>([]);
  const [wallet, setWallet] = useState<string>("");
  const { updateBalance, loading, error } = useUpdateBalance();

  const router = useRouter();

  useEffect(() => {
    readFile();
  }, []);

  useEffect(() => {
    getNewBalance();
}, [wallet]);

  async function getNewBalance() {
    if (!wallet) return;
    const updated = await updateBalance(walletAddress as `0x${string}`);
    if (updated) setTokenList(updated);
  }

  async function readFile() {
    try {
      const data = await invoke("read_text_from_file", {filePath: localStorage.getItem("filePath")}) as string;
      const json = JSON.parse(data);
      setTokenList(json.token);
      setWalletAddress("0x" + JSON.parse(json.wallet).address);
      setWallet(json.wallet);
      console.log("Wallet loaded from file : ", json.wallet);
    } catch (err) {
      console.log("Erreur : " + err);
    }
  }

async function sendEth(to: string, amountInEth: string) {

  const decryptedWallet = await Wallet.fromEncryptedJson(wallet, "test");

  const walletClient = createWalletClient({
      chain: sepolia,
      transport: http(),
      account: privateKeyToAccount(decryptedWallet.privateKey as `0x${string}`),
    })

    console.log(walletClient);

    try {
      // Convert ETH en wei
      const value = BigInt(parseFloat(amountInEth) * 1e18)

      // Crée la transaction
      const txHash = await walletClient.sendTransaction({
        to: to as `0x${string}`,
        value,
      })

      console.log('Transaction envoyée, hash :', txHash)

      return txHash
    } catch (error) {
      console.error('Erreur lors de l\'envoi de ETH:', error)
      throw error
    }
  }


// -------------------------------------------------------------------------------------------------------
// ABI minimale ERC20
const erc20Abi = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
]

async function sendERC20({tokenAddress, to, amount, decimals = 18}: {tokenAddress: `0x${string}`,to: `0x${string}`, amount: string, decimals?: number}) {
  

  const decryptedWallet = await Wallet.fromEncryptedJson(wallet, "test");

  const walletClient = createWalletClient({
      chain: sepolia,
      transport: http(),
      account: privateKeyToAccount(decryptedWallet.privateKey as `0x${string}`),
    })
  
  try {
    // Conversion en unités du token
    const value = parseUnits(amount, decimals)

    const hash = await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to, value],
    })

    console.log('Transaction ERC20 envoyée, hash :', hash)

    // 👇 attendre confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    return {
      hash,
      status: receipt.status,
    }
  } catch (error) {
    console.error('Erreur envoi ERC20:', error)
    throw error
  }
}

  function disconnect() {
    localStorage.removeItem("auth");
    router.push("/");
  }

  return (
    <main className="page">
      <nav>
        <h1>Polar Wallet</h1>
        <p>V0.1</p>
        <p>A free and easy to use cold wallet.</p>
        <br />
        <button onClick={() => setShowTransfer(true)}>Send</button>
        <button onClick={() => setShowSwap(true)}>Swap</button>
        <button onClick={() => setShowReceive(true)}>Receive</button>
        <button onClick={() => setShowStake(true)}>Stake</button>
        <button onClick={disconnect}>Disconnect</button>
      </nav>

      <header>
        <h2>{tokenList[0]?.balance ? formatUnits(tokenList[0].balance, tokenList[0].decimals) : "0"} ETH</h2>
        <p>Network : {publicClient.chain?.name}</p>
        <p>{walletAddress}</p>
      </header>

      <section className="content">
        <button onClick={getNewBalance}>
          {loading ? "Updating..." : "Update balances"}
        </button>
        
        {Object.entries(tokenList).map(([token, data]) => (
            <div key={token} className="tokenList">
            <h3>{data.name}</h3>
            <p>{formatUnits(data.balance, data.decimals)} {data.symbol}</p>
            </div>
        ))}

        <button onClick={() => setShowAddToken(true)}>Add token</button>
        <AddToken userAddress={walletAddress as `0x${string}`} onTokenAdded={readFile} show={showAddToken} onClose={() => setShowAddToken(false)} />
      </section>

          <Transfer sendEth={sendEth} sendERC20={sendERC20} show={showTransfer} onClose={() => setShowTransfer(false)} />
          <Swap show={showSwap} onClose={() => setShowSwap(false)} />
          <Receive adresse={walletAddress} show={showReceive} onClose={() => setShowReceive(false)} />
          <Stake show={showStake} onClose={() => setShowStake(false)} />
      </main>
  );
}
