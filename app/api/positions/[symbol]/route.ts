import { connection } from "next/server";
import { DEMO_USER, practicePositions } from "@/lib/api/practice";
import { parsePrices } from "@/lib/api/requests";

// GET /api/positions/VFV?prices=VFV:125: one position
export async function GET(request: Request, ctx: RouteContext<"/api/positions/[symbol]">) {
  await connection();
  const symbol = decodeURIComponent((await ctx.params).symbol).toUpperCase();
  let prices;
  try {
    prices = parsePrices(new URL(request.url).searchParams.get("prices"));
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
  const position = (await practicePositions(DEMO_USER, prices)).find((p) => p.symbol === symbol);
  if (!position) return Response.json({ error: `No trades for ${symbol}` }, { status: 404 });
  return Response.json(position);
}
