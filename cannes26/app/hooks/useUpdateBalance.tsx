"use client";

import { useCallback, useState } from "react";
import { parseAbi, Address } from "viem";
import { invoke } from "@tauri-apps/api/core";

import { TokenData } from "./../types/TokenData";
import { publicClient } from "./../clients/publicClient";
import { isAddress } from "viem";

export function useUpdateBalance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBalance = useCallback(
    async (userAddress: Address): Promise<TokenData[] | null> => {
      if (!isAddress(userAddress)) {
        setError(`Adresse invalide: ${userAddress}`);
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        // Parse ABI
        const abi = parseAbi([
          "function balanceOf(address) view returns (uint256)",
        ]);

        const balanceOfFunction = {
          abi,
          functionName: "balanceOf" as const,
          args: [userAddress] as const,
        };

        // Lecture du fichier
        const filePath = localStorage.getItem("filePath");
        if (!filePath) throw new Error("filePath manquant");

        const data = (await invoke("read_text_from_file", {
          filePath,
        })) as string;

        const json = JSON.parse(data);
        const tokens: TokenData[] = json.token;

        // Séparer ERC20 / natif
        const erc20Tokens = tokens.filter(
          (t) =>
            t.address &&
            t.address !== "0x0000000000000000000000000000000000000000"
        );

        const nativeTokens = tokens.filter(
          (t) =>
            t.address === "0x0000000000000000000000000000000000000000"
        );

        // Multicall ERC20
        const contracts = erc20Tokens.map((token) => ({
          ...balanceOfFunction,
          address: token.address as Address,
        }));

        const results = await publicClient.multicall({ contracts });

        let erc20Balances: Record<string, bigint> = {};

        results.forEach((res, index) => {
          if (res.status === "success") {
            erc20Balances[erc20Tokens[index].address] = res.result as bigint;
          }
        });

        // Balance native token
        let nativeBalance: bigint | null = null;
        if (nativeTokens.length > 0) {
          nativeBalance = await publicClient.getBalance({ address: userAddress });
        }

        // Construire tableau mis à jour
        const updatedTokens: TokenData[] = tokens.map((token) => {
          if (token.address && token.address in erc20Balances) {
            return {
              ...token,
              balance: erc20Balances[token.address].toString(),
            };
          }

          if (
            token.address ===
              "0x0000000000000000000000000000000000000000" &&
            nativeBalance !== null
          ) {
            return {
              ...token,
              balance: nativeBalance.toString(),
            };
          }

          return token;
        });

        // Écrire le fichier mis à jour (optionnel)
        await invoke("write_text_to_file", {
          filePath,
          content: JSON.stringify({ ...json, token: updatedTokens }, null, 2),
        });

        return updatedTokens;
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateBalance, loading, error };
}