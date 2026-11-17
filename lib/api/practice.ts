import { listTrades } from "../db/practiceTrades";
import { getSession } from "../snaptrade/session";
import { computePositions } from "../ledger/positions";
import type { ValuedPosition } from "../ledger/types";
import { valuePositions } from "../ledger/value";

// The signed-in user's SnapTrade id, or null if nobody is signed in
export async function signedInUser(): Promise<string | null> {
  return (await getSession())?.userId ?? null;
}

// 401: the request needs a signed-in user
export function notSignedIn(): Response {
  return Response.json({ error: "Sign in first: visit /login" }, { status: 401 });
}

// Saved practice trades → ledger → positions valued at the given prices
export async function practicePositions(
  userId: string,
  prices: Record<string, number>,
): Promise<ValuedPosition[]> {
  return valuePositions(computePositions(await listTrades(userId)), prices);
}
