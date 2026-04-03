"use client";

import styles from "./styles/page.module.css";
import { Address } from "viem";

import CreateWallet from "./components/CreateWallet";
import ImportWallet from "./components/ImportWallet";
import ReadWallet from "./components/ReadWallet";
import GetTokenData from "./components/GetTokenData";
import UpdateTokenBalance from "./components/UpdateTokenBalance";
import AddToken from "./components/AddToken";
import ReadTokenList from "./components/ReadTokenList";

export default function Home() {

  // Exemple d'adresse et de tokens pour les tests
  const address = "0x2CfF890f0378a11913B6129B2E97417a2c302680";

  const tokens = [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" as Address,
    "0xdAC17F958D2ee523a2206206994597C13D831ec7" as Address
  ];

  return (
    <div className={styles.page}>
      <main className={styles.main}>
{/* 
        <GetTokenData tokens={tokens} userAddress={address} />
        <UpdateTokenBalance tokens={tokens} userAddress={address} /> */}

        {/* <AddToken userAddress={address} tokenAddress={tokens[0]} />
        <AddToken userAddress={address} tokenAddress={tokens[1]} />
        <AddToken userAddress={address} tokenAddress={tokens[2]} /> */}

        <ReadTokenList />


        {/* <h1>Create wallet</h1>
        <CreateWallet />
        <hr />
        <h1>Import wallet</h1>
        <ImportWallet />
        <hr />
        <h1>Read wallet</h1>
        <ReadWallet /> */}

      </main>
    </div>
  );
}
