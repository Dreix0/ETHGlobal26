"use client";

import { createPublicClient, http, Address, parseAbi } from "viem";
import { mainnet } from "viem/chains";

/**
 * Récupère le nom d'un token ERC-20
 * @param tokenAddress L'adresse du token ERC-20
 * @returns Le nom du token (string) ou null si échec
 */
export async function getTokenName(tokenAddress: Address): Promise<string | null> {
  try {
    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http("https://cloudflare-eth.com") // RPC public stable
    });

    // ABI minimal pour lire le nom du token
    const abi = parseAbi([
      "function name() view returns (string)"
    ]);

    const name = await publicClient.readContract({
      address: tokenAddress,
      abi,
      functionName: "name"
    });
    console.log("Name :", name);

    return name;
  } catch (err) {
    console.error("Erreur lors de la récupération du nom du token :", err);
    return null;
  }
}