import { connection } from "next/server";
import { notSignedIn, practicePositions, signedInUser } from "@/lib/api/practice";
import { parsePrices } from "@/lib/api/requests";
import { summarize } from "@/lib/ledger/portfolio";

// GET /api/portfolio?prices=VFV:125: totals for the whole practice portfolio
export async function GET(request: Request) {
  await connection();
  const userId = await signedInUser();
  if (!userId) return notSignedIn();
  let prices;
  try {
    prices = parsePrices(new URL(request.url).searchParams.get("prices"));
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
  return Response.json(summarize(await practicePositions(userId, prices)));
}
