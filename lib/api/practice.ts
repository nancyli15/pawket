import { listTrades } from "../db/practiceTrades";
import { computePositions } from "../ledger/positions";
import type { ValuedPosition } from "../ledger/types";
import { valuePositions } from "../ledger/value";

// Everyone shares this practice account until sign-in (step 6) gives each user their own
export const DEMO_USER = "demo";

// Saved practice trades → ledger → positions valued at the given prices
export async function practicePositions(
  userId: string,
  prices: Record<string, number>,
): Promise<ValuedPosition[]> {
  return valuePositions(computePositions(await listTrades(userId)), prices);
}
