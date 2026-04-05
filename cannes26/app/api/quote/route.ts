import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const options = {
    method: "POST",
    headers: {
      "x-universal-router-version": "2.0",
      "x-api-key": process.env.UNISWAP_API_KEY || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  try {
    const res = await fetch("https://trade-api.gateway.uniswap.org/v1/quote", options);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Uniswap API Error: ${text}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}