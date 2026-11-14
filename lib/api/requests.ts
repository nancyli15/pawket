import type { Trade } from "../ledger/types";

// "VFV:125,XEQT.TO:32" → { VFV: 125, "XEQT.TO": 32 }. Throws on a malformed pair.
export function parsePrices(text: string | null): Record<string, number> {
  const prices: Record<string, number> = {};
  if (!text) return prices;
  for (const pair of text.split(",")) {
    const [symbol, value] = pair.split(":");
    const price = Number(value);
    if (!symbol?.trim() || !(price > 0)) {
      throw new Error(`Bad price "${pair}": use SYMBOL:PRICE, e.g. VFV:125`);
    }
    prices[symbol.trim().toUpperCase()] = price;
  }
  return prices;
}

// Checks a request body is a valid trade. Returns the trade, or what's wrong with it.
export function parseTrade(body: unknown): { trade: Trade } | { error: string } {
  const input = (body ?? {}) as Record<string, unknown>;
  const symbol = typeof input.symbol === "string" ? input.symbol.trim().toUpperCase() : "";
  const { side, quantity, price, date } = input;

  if (!symbol) return { error: "symbol is required, e.g. \"VFV\"" };
  if (side !== "buy" && side !== "sell") return { error: "side must be \"buy\" or \"sell\"" };
  if (typeof quantity !== "number" || !(quantity > 0)) return { error: "quantity must be a number above 0" };
  if (typeof price !== "number" || !(price > 0)) return { error: "price must be a number above 0" };
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
    return { error: "date must be YYYY-MM-DD" };
  }
  return { trade: { symbol, side, quantity, price, date } };
}
