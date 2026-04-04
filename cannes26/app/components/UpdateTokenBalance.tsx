import { parseAbi, Address } from "viem";;
import { invoke } from "@tauri-apps/api/core";

import { TokenData } from "./../types/TokenData";
import { publicClient } from "./../clients/publicClient";

export default function UpdateTokenBalance(userAddress: Address) {
  const abi = parseAbi(["function balanceOf(address) view returns (uint256)"]);

  const balanceOfFunction = {
    abi,
    functionName: "balanceOf" as const,
    args: [userAddress] as const,
  };

  async function updateBalance() {

    const data = await invoke("read_text_from_file", {filePath: localStorage.getItem("filePath")}) as string;
    const json = JSON.parse(data);
    const tokens: TokenData[] = json.token;

    // Tri des tokens en séparant les ERC20 et les natifs
    const erc20Tokens = tokens.filter(
      (t) => t.address && t.address !== "0x0000000000000000000000000000000000000000"
    );

    const nativeTokens = tokens.filter(
      (t) => t.address === "0x0000000000000000000000000000000000000000"
    );

    const contracts = erc20Tokens.map((token) => ({
      ...balanceOfFunction,
      address: token.address as Address,
    }));

    const results = await publicClient.multicall({
      contracts,
    });
    console.log("Résultats du multicall : ", results);

    // Récupération des balances des tokens ERC20
    let erc20Balances: Record<string, bigint> = {};

    results.forEach((res, index) => {
      if (res.status === "success") {
        erc20Balances[erc20Tokens[index].address] = res.result as bigint;
      }
    });

    // Récupération de la balance du token natif (ETH)
    let nativeBalance: bigint | null = null;

    if (nativeTokens.length > 0) {
      nativeBalance = await publicClient.getBalance({
        address: userAddress,
      });
    }

    const updatedTokens = tokens.map((token) => {
      if (token.address && erc20Balances[token.address]) {
        return {
          ...token,
          balance: erc20Balances[token.address].toString(),
        };
      }

      if (token.address === "0x0000000000000000000000000000000000000000" && nativeBalance !== null) {
        return {
          ...token,
          balance: nativeBalance.toString(),
        };
      }
      return token;
    });

    const updatedJson = {
      ...json,
      token: updatedTokens,
    };

    await invoke("write_text_to_file", {
      filePath: localStorage.getItem("filePath")!,
      content: JSON.stringify(updatedJson, null, 2),
    });
  }

  return (
    <main>
      <button onClick={updateBalance}>
        Update balances
      </button>
    </main>
  );
}