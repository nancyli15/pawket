import { connection } from "next/server";
import { DEMO_USER, practicePositions } from "@/lib/api/practice";
import { parsePrices } from "@/lib/api/requests";
import { summarize } from "@/lib/ledger/portfolio";

// GET /api/portfolio?prices=VFV:125: totals for the whole practice portfolio
export async function GET(request: Request) {
  await connection();
  let prices;
  try {
    prices = parsePrices(new URL(request.url).searchParams.get("prices"));
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
  return Response.json(summarize(await practicePositions(DEMO_USER, prices)));
}
