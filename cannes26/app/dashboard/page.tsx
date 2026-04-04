"use client";

import { useRouter } from "next/navigation";
import ReadTokenList from "../components/ReadTokenList";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { formatUnits } from "viem";

import { TokenData } from "../types/TokenData";
import { useUpdateBalance } from "../hooks/useUpdateBalance";
import AddToken from "../components/AddToken";
import { publicClient } from "../clients/publicClient";

export default function Home() {
  const [showAddToken, setShowAddToken] = useState(false);
  const [tokenList, setTokenList] = useState<TokenData[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const { updateBalance, loading, error } = useUpdateBalance();

  const router = useRouter();

  useEffect(() => {
    readFile();
  }, []);

  useEffect(() => {
    getNewBalance();
}, [walletAddress]);

  async function getNewBalance() {
    if (!walletAddress) return;
    const updated = await updateBalance(walletAddress as `0x${string}`);
    if (updated) setTokenList(updated);
  }

  async function readFile() {
    try {
      const data = await invoke("read_text_from_file", {filePath: localStorage.getItem("filePath")}) as string;
      const json = JSON.parse(data);
      setTokenList(json.token);
      setWalletAddress("0x" + JSON.parse(json.wallet).address);
    } catch (err) {
      console.log("Erreur : " + err);
    }
  }

  function closeAddToken() {
    setShowAddToken(false);
  }

  function disconnect() {
    localStorage.removeItem("auth");
    router.push("/");
  }

  return (
    <main className="page">
      <nav>
        <h1>Arctic Wallet</h1>
        <p>V0.1</p>
        <p>A free and easy to use cold wallet.</p>
        <br />
        <button>Send</button>
        <button>Swap</button>
        <button>Receive</button>
        <button>Stake</button>
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
        <AddToken userAddress={walletAddress as `0x${string}`} onTokenAdded={readFile} show={showAddToken} onClose={closeAddToken} />
      </section>
    </main>
  );
}
