"use client";

import { Address } from "viem";
import { useRouter } from "next/navigation";
import { invoke } from "@tauri-apps/api/core";

import ReadWallet from "./../components/ReadWallet";
import GetTokenData from "./../components/GetTokenData";
import UpdateTokenBalance from "./../components/UpdateTokenBalance";
import AddToken from "./../components/AddToken";
import ReadTokenList from "./../components/ReadTokenList";


type TokenData = {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  balance: bigint;
};

export default function Home() {

  const router = useRouter();
  const savedPath = localStorage.getItem("filePath");

  // Exemple d'adresse et de tokens pour les tests
  const address = "0x2CfF890f0378a11913B6129B2E97417a2c302680" as Address;

  const tokens = [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" as Address,
    "0xdAC17F958D2ee523a2206206994597C13D831ec7" as Address
  ];

  function goToLogin() {
    localStorage.setItem("auth", "true");
    router.push("/");
  }

  return (
    <main className="page">
      <nav>
        <h1>Arctic Wallet</h1>
        <p>V0.1</p>
        <p>A free and easy to use cold wallet.</p>
        <br />
        <a href="/">Dashboard</a>
        <a href="/Crypto">Crypto</a>
        <a href="/NFT">NFT</a>
        <a href="/History">History</a>
        <a href="/Settings">Settings</a>
      </nav>

      <header>
        <h2>ETHBalance ETH</h2>
        <p>Address</p>
        <br />
        <div>
          <button>Send</button>
          <button>Swap</button>
          <button>Receive</button>
          {/* <button>Buy</button>
          <button>Stake</button> */}
        </div>
      </header>

      <section className="content">
        <h1>Main section</h1>

        <ReadTokenList />

        <UpdateTokenBalance userAddress={address} />

        <button onClick={goToLogin}>Go to login</button>
      </section>
    </main>
  );
}
