"use client";

import { Address } from "viem";
import { useState } from "react";

import CreateWallet from "./components/CreateWallet";
import ImportWallet from "./components/ImportWallet";
import Login from "./components/Login";

import "./styles/login.css";

export default function Home() {
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showImportWallet, setShowImportWallet] = useState(false);

  // Exemple d'adresse et de tokens pour les tests
  const address = "0x2CfF890f0378a11913B6129B2E97417a2c302680";

  const tokens = [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" as Address,
    "0xdAC17F958D2ee523a2206206994597C13D831ec7" as Address
  ];


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
