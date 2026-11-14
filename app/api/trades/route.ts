import { connection } from "next/server";
import { addTrade, listTrades } from "@/lib/db/practiceTrades";
import { DEMO_USER } from "@/lib/api/practice";
import { parseTrade } from "@/lib/api/requests";
import { computePositions } from "@/lib/ledger/positions";

// GET /api/trades: every saved practice trade, oldest first
export async function GET() {
  await connection();
  return Response.json(await listTrades(DEMO_USER));
}

// POST /api/trades: save one practice trade, e.g. { symbol, side, quantity, price, date }
export async function POST(request: Request) {
  await connection();
  const parsed = parseTrade(await request.json().catch(() => null));
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  // Replay with the new trade first, so a sell of shares you don't own is never saved
  try {
    computePositions([...(await listTrades(DEMO_USER)), parsed.trade]);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
  return Response.json(await addTrade(DEMO_USER, parsed.trade), { status: 201 });
}
