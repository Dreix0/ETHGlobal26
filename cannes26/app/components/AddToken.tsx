import { Address, parseAbi } from "viem";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

import { TokenData } from "./../types/TokenData";
import { publicClient } from "./../clients/publicClient";

import "./../styles/login.css";

type Props = {
  userAddress: Address;
  onTokenAdded: () => Promise<void>
  onClose: () => void
  show: boolean;
};

// Regrouper onTokenAdded et onClose dans une seule fonction pour simplifier la gestion de l'état dans le composant parent (Dashboard)

export default function AddToken({ userAddress, onTokenAdded, show, onClose }: Props) {

  const [tokenInput, setTokenInput] = useState("");

  const abi = parseAbi([
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
  ]);

  async function handleAddToken() {

    const tokenAddress = tokenInput as Address;

    try {
      const calls = [
        { address: tokenAddress, abi, functionName: "name" as const },
        { address: tokenAddress, abi, functionName: "symbol" as const },
        { address: tokenAddress, abi, functionName: "decimals" as const },
        { address: tokenAddress, abi, functionName: "balanceOf" as const, args: [userAddress] as const },
      ];

      const results = await publicClient.multicall({ contracts: calls });

      const tokenData: TokenData = {
        name: results[0].result as string,
        symbol: results[1].result as string,
        address: tokenAddress,
        decimals: results[2].result as number,
        balance: results[3].result as bigint,
      };

      const fileContent = await invoke("read_text_from_file", { filePath: localStorage.getItem("filePath") }) as string;
      const json = JSON.parse(fileContent);

      if (!Array.isArray(json.token)) {
        json.token = [];
      }

      json.token.push({
        name: tokenData.name,
        symbol: tokenData.symbol,
        address: tokenData.address,
        decimals: tokenData.decimals,
        balance: tokenData.balance.toString()
      });

      await invoke("write_text_to_file", { filePath: localStorage.getItem("filePath"), content: JSON.stringify(json, null, 2) });

      await onTokenAdded();

    } catch (err: any) {
      console.error(err);
      console.log("Error adding token: " + err.message);
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

            <div className="slideContent">
              <input
                type="text"
                placeholder="Adresse du token ERC20"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                style={{ width: "400px", padding: "8px", marginRight: "8px" }}
              />
              <button onClick={handleAddToken}>
                Add Token
              </button>
            </div>
      </div>
    </main>
  );
}