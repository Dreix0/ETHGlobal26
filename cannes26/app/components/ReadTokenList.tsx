// Utile ??


import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { formatUnits } from "viem";

import { TokenData } from "./../types/TokenData";

export default function ReadTokenList() {
  const [tokenList, setTokenList] = useState<TokenData[]>([]);

  async function readFile() {

    try {
      const data = await invoke("read_text_from_file", {filePath: localStorage.getItem("filePath")}) as string;
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
