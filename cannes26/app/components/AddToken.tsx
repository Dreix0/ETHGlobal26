import { createPublicClient, http, Address, parseAbi, formatUnits } from "viem";
import { mainnet } from "viem/chains";
import { invoke } from "@tauri-apps/api/core";

import { TokenData } from "./../types/TokenData";

type Props = {
  userAddress: Address;
  tokenAddress: Address;
  filePath: string;
};

export default function AddToken({ userAddress, tokenAddress, filePath }: Props) {
  const publicClient = createPublicClient({ 
    chain: mainnet,
    transport: http("https://eth.llamarpc.com")
  });

  const abi = parseAbi([
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
  ]);

  async function handleAddToken() {

    try {

      const name = await publicClient.readContract({ address: tokenAddress, abi, functionName: "name" });
      console.log("Name :", name);
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
    </main>
  );
}