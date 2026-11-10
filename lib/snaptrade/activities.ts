import type { Trade } from "../ledger/types";

// One activity as SnapTrade sends it (only the fields we read).
export type SnapTradeActivity = {
  type?: string | null;
  symbol?: { symbol?: string | null } | null;
  units?: number | null;
  price?: number | null;
  trade_date?: string | null;
  description?: string | null;
};

// An activity the ledger can't use, kept so the app can list it.
export type UnhandledActivity = {
  date: string;
  type: string;
  symbol: string | null;
  description: string;
  reason: string;
};

const SIDES: Record<string, Trade["side"]> = { BUY: "buy", SELL: "sell" };

// Turns SnapTrade activities into ledger trades; everything else goes to `unhandled`.
export function toTrades(activities: SnapTradeActivity[]): {
  trades: Trade[];
  unhandled: UnhandledActivity[];
} {
  const trades: Trade[] = [];
  const unhandled: UnhandledActivity[] = [];

  for (const activity of activities) {
    const type = (activity.type ?? "").toUpperCase();
    // "XQQ.TO", not "XQQ": the exchange suffix keeps the same ticker on two exchanges apart
    const symbol = activity.symbol?.symbol ?? null;
    // "2026-11-02T17:06:38Z" → "2026-11-02"
    const date = activity.trade_date?.slice(0, 10) ?? "";
    // SnapTrade sends sells as negative units; Trade wants positive
    const quantity = Math.abs(activity.units ?? 0);
    const price = activity.price ?? 0;
    const side = SIDES[type];

    const skip = (reason: string) =>
      unhandled.push({ date, type, symbol, description: activity.description ?? "", reason });

    if (!side) {
      skip("type not supported yet");
      continue;
    }
    if (!symbol || !date || quantity === 0 || price <= 0) {
      skip("missing symbol, date, units or price");
      continue;
    }
    trades.push({ symbol, side, quantity, price, date });
  }

  return { trades, unhandled };
}
