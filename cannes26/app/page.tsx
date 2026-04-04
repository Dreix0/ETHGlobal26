"use client";

import { useState } from "react";

import CreateWallet from "./components/CreateWallet";
import ImportWallet from "./components/ImportWallet";
import Login from "./components/Login";

import "./styles/login.css";

export default function Home() {
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showImportWallet, setShowImportWallet] = useState(false);

  function closeCreateWallet() {
    setShowCreateWallet(false);
  }

  function closeImportWallet() {
    setShowImportWallet(false);
  }

  return (
    <main className="loginPage">
      <CreateWallet show={showCreateWallet} onClose={closeCreateWallet} />
      <ImportWallet show={showImportWallet} onClose={closeImportWallet} />
      <Login />
      <div className="space"></div>
      <div>
        <h1>Sign In</h1>
        <button onClick={() => setShowCreateWallet(true)}>Create Wallet</button>
        <button onClick={() => setShowImportWallet(true)}>Import Wallet</button>
      </div>
    </main>
  );
}
