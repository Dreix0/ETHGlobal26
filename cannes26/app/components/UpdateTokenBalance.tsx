import { useState } from "react";
import { createPublicClient, http, parseAbi, Address } from "viem";
import { mainnet } from "viem/chains";

type Props = {
  tokens: Address[];
  userAddress: Address;
};

export default function UpdateTokenBalance({ tokens, userAddress }: Props) {

    // Passer publicClient en prop pour éviter de le recréer à chaque composant et pouvoir récupérer l'adresse de l'utilisateur
  const [balances, setBalances] = useState<Record<string, bigint>>({});

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const abi = parseAbi(["function balanceOf(address) view returns (uint256)"]);

  const balanceOfFunction = {
    abi,
    functionName: "balanceOf" as const,
    args: [userAddress] as const,
  };

  async function updateBalance() {
    // Créer un tableau de contrats pour multicall
    const contracts = tokens.map((token) => ({
      ...balanceOfFunction,
      address: token
    }));

    const results = await publicClient.multicall({
      contracts,
    });

    const newBalances: Record<string, bigint> = {};

    results.forEach((res, index) => {
      if (res.status === "success") {
        newBalances[tokens[index]] = res.result as bigint;
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