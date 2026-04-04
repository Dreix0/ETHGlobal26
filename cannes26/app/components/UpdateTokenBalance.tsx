import { useState } from "react";
import { createPublicClient, http, parseAbi, Address } from "viem";
import { mainnet } from "viem/chains";
import { invoke } from "@tauri-apps/api/core";

type Props = {
  userAddress: Address;
};

type TokenData = {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  balance: bigint;
};

export default function UpdateTokenBalance({ userAddress }: Props) {

    // Passer publicClient en prop pour éviter de le recréer à chaque composant et pouvoir récupérer l'adresse de l'utilisateur
  const [balances, setBalances] = useState<Record<string, bigint>>({});

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http("https://eth.llamarpc.com"),
  });

  const abi = parseAbi(["function balanceOf(address) view returns (uint256)"]);

  const balanceOfFunction = {
    abi,
    functionName: "balanceOf" as const,
    args: [userAddress] as const,
  };

  async function updateBalance() {
    const data = await invoke("read_text_from_file", {filePath: localStorage.getItem("filePath")}) as string;
    const tokens: TokenData[] = JSON.parse(data).token;

    // Extraction des adresses non vides
    const addresses = tokens
      .map((token) => token.address)
      .filter((address): address is string => !!address && address.trim() !== "");

    // Créer un tableau de contrats pour multicall
    const contracts = addresses.map((token) => ({
      ...balanceOfFunction,
      address: token
    }));

    const results = await publicClient.multicall({
      contracts,
    });
    console.log("Résultats du multicall : ", results);

    const newBalances: Record<string, bigint> = {};

    results.forEach((res, index) => {
      if (res.status === "success") {
        newBalances[addresses[index]] = res.result as bigint;
      }
    });

    setBalances(newBalances);
  }

  return (
    <main>
      <button onClick={updateBalance}>
        Update balances
      </button>

      <ul>
        {Object.entries(balances).map(([token, balance]) => (
          <li key={token}>
            {token} : {balance.toString()}
          </li>
        ))}
      </ul>
    </main>
  );
}