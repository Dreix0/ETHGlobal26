import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { formatUnits } from "viem";


type TokenData = {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  balance: bigint;
};

export default function ReadTokenList() {
    const [tokenList, setTokenList] = useState<TokenData[]>([]);

  async function readFile() {

    // Remplace ce chemin par un emplacement sur ton disque ou USB
    const filePath = "C:/Users/quent/Desktop/Test/mon_texte.txt";

    try {
      const data = await invoke("read_text_from_file", {filePath}) as string;
      setTokenList(JSON.parse(data).token);

      console.log("Données lues : ", data);
      console.log("Token list : ", tokenList);

    } catch (err) {
      console.log("Erreur : " + err);
    }
  }

  return (
    <main>
        <button onClick={readFile}>Lire la liste de tokens</button>

        {Object.entries(tokenList).map(([token, data]) => (
            <div key={token}>
            <h3>{data.name}</h3>
            <p>{formatUnits(data.balance, data.decimals)} {data.symbol}</p>
            </div>
        ))}
    </main>
  );
}
