"use client";

import { useState } from "react";
import { createPublicClient, http, Address, parseAbi, formatUnits } from "viem";
import { mainnet } from "viem/chains";
import { invoke } from "@tauri-apps/api/core";

type TokenData = {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  balance: bigint;
};

type Props = {
  userAddress: Address;
  tokenAddress: Address;
};

export default function AddToken({ userAddress, tokenAddress }: Props) {
  const [data, setData] = useState<TokenData | null>(null);
  
  // Remplace ce chemin par un emplacement sur ton disque ou USB
  const filePath = "C:/Users/quent/Desktop/Test/mon_texte.txt";

  const publicClient = createPublicClient({ 
    chain: mainnet,
    transport: http()
  });

  const abi = parseAbi([
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
  ]);

  async function handleAddToken() {

    try {
      // ✅ 1. Multicall pour récupérer toutes les données en une seule requête
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

      setData(tokenData);

      // 2️⃣ Lire le fichier JSON existant
      const fileContent = await invoke("read_text_from_file", { filePath }) as string;
      const json = JSON.parse(fileContent);

      // 3️⃣ Ajouter le token à la liste, en créant le tableau si nécessaire
      if (!Array.isArray(json.token)) {
        json.token = [];
      }

      json.token.push({
        name: tokenData.name,
        symbol: tokenData.symbol,
        address: tokenData.address,
        decimals: tokenData.decimals,
        balance: tokenData.balance.toString() // bigint → string pour JSON
      });

      // 4️⃣ Réécrire le fichier
      await invoke("write_text_to_file", { filePath, content: JSON.stringify(json, null, 2) });

    } catch (err: any) {
      console.error(err);
      console.log("Erreur lors de l'ajout du token : " + err.message);
    }
  }

  return (
    <main>
      <button onClick={handleAddToken}>
        Add Token
      </button>

      {data && (
        <div>
          <h3>{data.name}</h3>
          <p>{formatUnits(data.balance, data.decimals)} {data.symbol}</p>
        </div>
      )}
    </main>
  );
}