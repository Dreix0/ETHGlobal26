"use client";

import styles from "./styles/page.module.css";
import CreateWallet from "./components/CreateWallet";
import ImportWallet from "./components/ImportWallet";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <CreateWallet />
        <ImportWallet />
      </main>
    </div>
  );
}
