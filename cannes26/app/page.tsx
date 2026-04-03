"use client";

import styles from "./styles/page.module.css";

import CreateWallet from "./components/CreateWallet";
import ImportWallet from "./components/ImportWallet";
import ReadWallet from "./components/ReadWallet";
import GetTokenData from "./components/GetTokenData";

export default function Home() {

  // Exemple d'adresse et de tokens pour les tests
  const address = "0x3a6Eeed98799aA7915c24a419633e810FA086D0F";

  const tokens = [
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39",
    "0xbd33da1f9a0Cc70224e9a71C80Baa92Fd0Eb82d0"
  ];

  return (
    <div className={styles.page}>
      <main className={styles.main}>

        <GetTokenData tokens={tokens} userAddress={address} />

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
