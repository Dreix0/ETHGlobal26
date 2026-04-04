import { useState } from "react";
import { createPublicClient, http, parseAbi, Address } from "viem";
import { mainnet } from "viem/chains";
import { invoke } from "@tauri-apps/api/core";

import { TokenData } from "./../types/TokenData";

export default function UpdateTokenBalance(userAddress: Address) {

    // Passer publicClient en prop pour éviter de le recréer à chaque composant et pouvoir récupérer l'adresse de l'utilisateur
  const [balances, setBalances] = useState<Record<string, bigint>>({});

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http("https://eth.llamarpc.com"),
  });

  const abi = parseAbi(["function balanceOf(address) view returns (uint256)"]);

  const balanceOfFunction = {
    abi,
    functionName: "balanceOf" as const,
    args: [userAddress] as const,
  };

  async function updateBalance() {
    const data = await invoke("read_text_from_file", {filePath: localStorage.getItem("filePath")}) as string;
    const json = JSON.parse(data);
    const tokens: TokenData[] = json.token;

    // Extraction des adresses non vides
    const addresses = tokens
      .map((token) => token.address)
      .filter((address): address is string => !!address && address.trim() !== "");

    // Créer un tableau de contrats pour multicall
    const contracts = addresses.map((token) => ({
      ...balanceOfFunction,
      address: token
    }));

    const results = await publicClient.multicall({
      contracts,
    });
    console.log("Résultats du multicall : ", results);

    const newBalances: Record<string, bigint> = {};

    results.forEach((res, index) => {
      if (res.status === "success") {
        newBalances[addresses[index]] = res.result as bigint;
      }
    });

    // 🔥 Mise à jour des tokens
    const updatedTokens = tokens.map((token) => {
      if (token.address && newBalances[token.address]) {
        return {
          ...token,
          balance: newBalances[token.address].toString() // bigint → string pour JSON,
        };
      }
      return token;
    });

    // 🔥 Réécriture du fichier
    const updatedJson = {
      ...json,
      token: updatedTokens,
    };

    await invoke("write_text_to_file", {
      filePath: localStorage.getItem("filePath")!,
      content: JSON.stringify(updatedJson, null, 2),
    });

    setBalances(newBalances);
  }

  return (
    <main>
      <button onClick={updateBalance}>
        Update balances
      </button>
    </main>
  );
}