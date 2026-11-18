import { computePositions } from "../ledger/positions";
import { toTrades, type SnapTradeActivity } from "./activities";

// One holding as SnapTrade's /positions/all sends it (only the fields we read)
export type SnapTradePosition = {
  instrument?: { symbol?: string | null } | null;
  units?: string | number | null;
  cost_basis?: string | number | null; // average cost per share
  currency?: string | null;
};

export type CompareRow = {
  symbol: string;
  pawketUnits: number | null;
  snaptradeUnits: number;
  pawketAverageCost: number | null; // in the currency of the trades
  snaptradeAverageCost: number;
  snaptradeCurrency: string;
  matches: boolean; // same units and average cost, to the cent
};

export type AccountComparison = {
  account: string;
  tradesUsed: number;
  unhandled: number; // activities the ledger can't use yet (dividends, deposits…)
  rows: CompareRow[];
  error?: string; // e.g. a sell with no buy before it
};

const close = (a: number, b: number, tolerance: number) => Math.abs(a - b) <= tolerance;

// Replays an account's activities through Pawket's ledger and lines the result up with SnapTrade's positions
export function compareAccount(
  account: string,
  activities: SnapTradeActivity[],
  positions: SnapTradePosition[],
): AccountComparison {
  const { trades, unhandled } = toTrades(activities);
  const base = { account, tradesUsed: trades.length, unhandled: unhandled.length };

  let pawket;
  try {
    pawket = computePositions(trades);
  } catch (error) {
    return { ...base, rows: [], error: (error as Error).message };
  }

  const rows = positions
    .filter((s) => s.instrument?.symbol)
    .map((s) => {
      const symbol = s.instrument!.symbol!;
      const mine = pawket.find((p) => p.symbol === symbol);
      const snaptradeUnits = Number(s.units ?? 0);
      const snaptradeAverageCost = Number(s.cost_basis ?? 0);
      return {
        symbol,
        pawketUnits: mine?.quantity ?? null,
        snaptradeUnits,
        pawketAverageCost: mine?.averageCost ?? null,
        snaptradeAverageCost,
        snaptradeCurrency: s.currency ?? "",
        matches:
          !!mine && close(mine.quantity, snaptradeUnits, 1e-6) && close(mine.averageCost, snaptradeAverageCost, 0.01),
      };
    });

  return { ...base, rows };
}
