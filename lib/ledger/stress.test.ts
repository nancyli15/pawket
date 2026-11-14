import { describe, expect, it } from "vitest";
import { computePositions } from "./positions";
import type { Trade } from "./types";

const SYMBOLS = ["VFV", "XEQT", "XQQ", "AAPL", "MSFT", "NVDA", "GOOG", "AMZN", "TSLA", "SHOP", "RY", "TD"];
const TRADE_COUNT = 120;

// Seeded random numbers (mulberry32): looks random, but the same every run, so failures repeat
function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 120 buys and sells across 12 stocks, never selling more than is owned
function generateTrades(): Trade[] {
  const random = seededRandom(2257);
  const owned: Record<string, number> = {};
  const trades: Trade[] = [];

  for (let i = 0; i < TRADE_COUNT; i++) {
    const symbol = SYMBOLS[i % SYMBOLS.length];
    const date = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
    const price = Math.round((10 + random() * 490) * 100) / 100;
    const have = owned[symbol] ?? 0;

    if (have > 0 && random() < 0.4) {
      // Sometimes sell everything, otherwise part of it
      const quantity = random() < 0.2 ? have : Math.round(have * random() * 10000) / 10000 || have;
      owned[symbol] = have - quantity;
      trades.push({ symbol, side: "sell", quantity, price, date });
    } else {
      const quantity = Math.round((0.1 + random() * 20) * 10000) / 10000;
      owned[symbol] = have + quantity;
      trades.push({ symbol, side: "buy", quantity, price, date });
    }
  }
  return trades;
}

describe(`ledger across ${TRADE_COUNT} trades and ${SYMBOLS.length} stocks`, () => {
  const trades = generateTrades();
  const positions = computePositions(trades);

  it("has the size the resume claims", () => {
    expect(trades.length).toBeGreaterThanOrEqual(100);
    expect(positions.length).toBeGreaterThanOrEqual(10);
    expect(trades.some((t) => t.side === "sell")).toBe(true);
  });

  for (const symbol of SYMBOLS) {
    it(`${symbol}: shares, money and gains all add up`, () => {
      const mine = trades.filter((t) => t.symbol === symbol);
      const sum = (side: Trade["side"], value: (t: Trade) => number) =>
        mine.filter((t) => t.side === side).reduce((total, t) => total + value(t), 0);
      const position = positions.find((p) => p.symbol === symbol)!;

      // Shares owned = bought − sold
      const bought = sum("buy", (t) => t.quantity);
      const sold = sum("sell", (t) => t.quantity);
      expect(position.quantity).toBeCloseTo(bought - sold, 6);

      // Money in = still invested + cost of what was sold (proceeds − realized gain)
      const paid = sum("buy", (t) => t.quantity * t.price);
      const proceeds = sum("sell", (t) => t.quantity * t.price);
      expect(paid).toBeCloseTo(position.bookValue + proceeds - position.realizedGain, 6);

      // Nothing negative that can't be
      expect(position.quantity).toBeGreaterThanOrEqual(-1e-9);
      expect(position.bookValue).toBeGreaterThanOrEqual(-1e-9);
    });
  }
});
