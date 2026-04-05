"use client";

import { show } from "@tauri-apps/api/app";
import { useState } from "react";
import { parseUnits } from "viem";

type Props = {
  sendEth: (to: string, amount: string) => Promise<any>;
  sendERC20: (params: {
    tokenAddress: `0x${string}`;
    to: `0x${string}`;
    amount: string;
    decimals?: number;
  }) => Promise<any>;
  show: boolean; onClose: () => void
};

export default function Transfer({ sendEth, sendERC20, show, onClose }: Props) {
  const [type, setType] = useState<"ETH" | "ERC20">("ETH");

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  // ERC20 specific
  const [tokenAddress, setTokenAddress] = useState("");
  const [decimals, setDecimals] = useState(18);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res;

      if (type === "ETH") {
        res = await sendEth(to, amount);
      } else {
        res = await sendERC20({
          tokenAddress: tokenAddress as `0x${string}`,
          to: to as `0x${string}`,
          amount,
          decimals,
        });
      }

      setResult(JSON.stringify(res));
    } catch (err: any) {
      setError(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

    const handlePopupClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    if (!show) return null;
  return (
    <main className="overlay" onClick={onClose}>
        <div className="popup" onClick={handlePopupClick}>
            
            <button className="closeBtn" onClick={onClose}>
            &times;
            </button>
            
      <h2>Send Transaction</h2>

      {/* Type selector */}
      <select value={type} onChange={(e) => setType(e.target.value as any)}>
        <option value="ETH">ETH</option>
        <option value="ERC20">ERC20</option>
      </select>

      {/* Common fields */}
      <input
        placeholder="Recipient address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />

      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* ERC20 fields */}
      {type === "ERC20" && (
        <>
          <input
            placeholder="Token address"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />

          <input
            type="number"
            placeholder="Decimals (default 18)"
            value={decimals}
            onChange={(e) => setDecimals(Number(e.target.value))}
          />
        </>
      )}

      <button onClick={handleSend} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>

      {/* Feedback */}
      {result && <p style={{ color: "green" }}>Success: {result}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
    </main>
  );
}