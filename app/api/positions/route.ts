import { connection } from "next/server";
import { notSignedIn, practicePositions, signedInUser } from "@/lib/api/practice";
import { parsePrices } from "@/lib/api/requests";

// GET /api/positions?prices=VFV:125: every position, valued at the given prices
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
  return Response.json(await practicePositions(userId, prices));
}
