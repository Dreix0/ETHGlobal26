"use client";

import { Address } from "viem";
import { useRouter } from "next/navigation";

import UpdateTokenBalance from "./../components/UpdateTokenBalance";
import ReadTokenList from "./../components/ReadTokenList";


export default function Home() {

  const router = useRouter();

  function disconnect() {
    localStorage.removeItem("auth");
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

        <button onClick={disconnect}>Disconnect</button>
      </section>
    </main>
  );
}
