import { connection } from "next/server";
import { addTrade, listTrades } from "@/lib/db/practiceTrades";
import { notSignedIn, signedInUser } from "@/lib/api/practice";
import { parseTrade } from "@/lib/api/requests";
import { computePositions } from "@/lib/ledger/positions";

// GET /api/trades: every saved practice trade, oldest first
export async function GET() {
  await connection();
  const userId = await signedInUser();
  if (!userId) return notSignedIn();
  return Response.json(await listTrades(userId));
}

// POST /api/trades: save one practice trade, e.g. { symbol, side, quantity, price, date }
export async function POST(request: Request) {
  await connection();
  const userId = await signedInUser();
  if (!userId) return notSignedIn();
  const body = await request.json().catch(() => undefined);
  if (body === undefined) return Response.json({error: "body must be valid JSON"}, { status: 400}); // undefined instead of null since null is valid JSON
  const parsed = parseTrade(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  // Replay with the new trade first, so a sell of shares you don't own is never saved
  try {
    computePositions([...(await listTrades(userId)), parsed.trade]);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
  return Response.json(await addTrade(userId, parsed.trade), { status: 201 });
}
