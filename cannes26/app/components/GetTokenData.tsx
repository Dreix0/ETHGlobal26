import { useState } from "react";
import { createPublicClient, http, Address, parseAbi, formatUnits } from "viem";
import { mainnet } from "viem/chains";

type Props = {
  tokens: Address[];
  userAddress: Address;
};

type TokenData = {
  name: string;
  symbol: string;
  decimals: number;
  balance: bigint;
};

export default function GetTokenData({ tokens, userAddress }: Props)  {

    // Passer publicClient en prop pour éviter de le recréer à chaque composant et pouvoir récupérer l'adresse de l'utilisateur
  const [datas, setDatas] = useState<Record<string, TokenData>>({});

  const publicClient = createPublicClient({ 
      chain: mainnet,
      transport: http()
  });

  const abi = parseAbi([
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
  ]);

  async function getERC20Data() {
    // Créer un tableau de contrats pour multicall
    const contracts = tokens.flatMap((token) => [
      { address: token, abi, functionName: "name" as const },
      { address: token, abi, functionName: "symbol" as const },
      { address: token, abi, functionName: "decimals" as const },
      { address: token, abi, functionName: "balanceOf" as const, args: [userAddress] as const },
    ]);

    const results = await publicClient.multicall({
      contracts,
    });

    const newDatas: Record<string, TokenData> = {};

    tokens.forEach((token, i) => {
      const baseIndex = i * 4;

      const name = results[baseIndex]?.result as string;
      const symbol = results[baseIndex + 1]?.result as string;
      const decimals = results[baseIndex + 2]?.result as number;
      const balance = results[baseIndex + 3]?.result as bigint;

      newDatas[token] = {name,symbol,decimals,balance};
    });

    setDatas(newDatas);
  }

  return (
    <main>
      <button onClick={getERC20Data}>
        Get Data
      </button>

      {Object.entries(datas).map(([token, data]) => (
          <div key={token}>
            <h3>{data.name}</h3>
            <p>{formatUnits(data.balance, data.decimals)} {data.symbol}</p>
          </div>
        ))}
    </main>
  );
}
