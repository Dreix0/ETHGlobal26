"use client";

import { Address } from "viem";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";

import CreateWallet from "./components/CreateWallet";
import ImportWallet from "./components/ImportWallet";
import ReadWallet from "./components/ReadWallet";
import GetTokenData from "./components/GetTokenData";
import UpdateTokenBalance from "./components/UpdateTokenBalance";
import AddToken from "./components/AddToken";
import ReadTokenList from "./components/ReadTokenList";

export default function Home() {

  const router = useRouter();

  const [filePath, setFilePath] = useState<string | null>(null);

  // Exemple d'adresse et de tokens pour les tests
  const address = "0x2CfF890f0378a11913B6129B2E97417a2c302680";

  const tokens = [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" as Address,
    "0xdAC17F958D2ee523a2206206994597C13D831ec7" as Address
  ];

  function goToDashboard() {
    localStorage.setItem("auth", "true");
    router.push("/dashboard");
  }

  async function getPath(){
  try {
    const filePath = await open({
      title: 'Choisir un fichier .plr',
      multiple: false,
      filters: [
        {
          name: 'PLR Files',
          extensions: ['plr']
        }
      ]
    });

    setFilePath(filePath);
    console.log("Chemin du fichier sélectionné : ", filePath);

  } catch (err) {
    console.error('Erreur lors de la sélection du fichier :', err);
  }
  }

  return (
    <main>
      <h1>Se connecter</h1>
      <button onClick={getPath}>
        Sélectionner un fichier .plr
      </button>
      <p>{filePath || "Aucun fichier sélectionné"}</p>
      <ReadTokenList filePath={filePath} />
      <hr />
      <CreateWallet />
      <ImportWallet />
      <ReadWallet />
      <button onClick={goToDashboard}>Go to dashboard</button>
    </main>
  );
}
