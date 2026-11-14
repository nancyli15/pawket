import type { ValuedPosition } from "./types";

export type PortfolioSummary = {
  holdings: number; // stocks with shares still owned
  bookValue: number;
  marketValue: number | null; // null if any held stock has no price
  realizedGain: number;
  unrealizedGain: number | null;
  simpleReturn: number | null; // unrealizedGain ÷ bookValue
};

// Adds up every position into one set of totals for the whole portfolio.
export function summarize(positions: ValuedPosition[]): PortfolioSummary {
  const held = positions.filter((p) => p.quantity > 0);
  const total = (list: ValuedPosition[], value: (p: ValuedPosition) => number) =>
    list.reduce((sum, p) => sum + value(p), 0);

  const bookValue = total(held, (p) => p.bookValue);
  // One missing price makes the total unknown, rather than quietly too low
  const marketValue = held.some((p) => p.marketValue === null)
    ? null
    : total(held, (p) => p.marketValue ?? 0);
  const unrealizedGain = marketValue === null ? null : marketValue - bookValue;

  return {
    holdings: held.length,
    bookValue,
    marketValue,
    realizedGain: total(positions, (p) => p.realizedGain),
    unrealizedGain,
    simpleReturn: unrealizedGain === null || bookValue === 0 ? null : unrealizedGain / bookValue,
  };
}
