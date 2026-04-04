import { useState } from "react";
import { parseAbi, Address } from "viem";;
import { invoke } from "@tauri-apps/api/core";

import { TokenData } from "./../types/TokenData";
import { publicClient } from "./../clients/publicClient";

export default function UpdateTokenBalance(userAddress: Address) {
  const [balances, setBalances] = useState<Record<string, bigint>>({});


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

    const addresses = tokens
      .map((token) => token.address)
      .filter((address): address is string => !!address && address.trim() !== "");

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

    const updatedTokens = tokens.map((token) => {
      if (token.address && newBalances[token.address]) {
        return {
          ...token,
          balance: newBalances[token.address].toString() // bigint → string pour JSON,
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

    setBalances(newBalances);
  }

  return (
    <main>
      <button onClick={updateBalance}>
        Update balances
      </button>
    </main>
  );
}