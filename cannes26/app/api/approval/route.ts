import { NextRequest, NextResponse } from 'next/server'

const API_URL = 'https://trade-api.gateway.uniswap.org/v1'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const res = await fetch(`${API_URL}/check_approval`, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.UNISWAP_API_KEY!,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  return NextResponse.json(data)
}