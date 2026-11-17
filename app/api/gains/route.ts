import { connection } from "next/server";
import { DEMO_USER, practicePositions } from "@/lib/api/practice";

// GET /api/gains: realized gain per stock, plus the total. Needs no prices.
export async function GET() {
  await connection();
  const positions = await practicePositions(DEMO_USER, {});
  const bySymbol = positions.map(({ symbol, realizedGain }) => ({ symbol, realizedGain }));
  const total = bySymbol.reduce((sum, p) => sum + p.realizedGain, 0);
  return Response.json({ total, bySymbol });
}
