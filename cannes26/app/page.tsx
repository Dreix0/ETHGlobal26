"use client";

import styles from "./styles/page.module.css";
import CreateWallet from "./components/CreateWallet";
import ImportWallet from "./components/ImportWallet";
import ReadWallet from "./components/ReadWallet";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Create wallet</h1>
        <CreateWallet />
        <hr />
        <h1>Import wallet</h1>
        <ImportWallet />
        <hr />
        <h1>Read wallet</h1>
        <ReadWallet />
      </main>
    </div>
  );
}
