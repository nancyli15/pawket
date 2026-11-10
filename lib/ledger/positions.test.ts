import { describe, expect, it } from "vitest";
import { computePositions } from "./positions";
import type { Trade } from "./types";

const buy = (symbol: string, quantity: number, price: number, date = "2026-11-10"): Trade => ({
  symbol,
  side: "buy",
  quantity,
  price,
  date,
});

const sell = (symbol: string, quantity: number, price: number, date = "2026-11-12"): Trade => ({
  symbol,
  side: "sell",
  quantity,
  price,
  date,
});

describe("computePositions: buys", () => {
  it("works out the $110 example from the Pawket note", () => {
    const [position] = computePositions([buy("VFV", 10, 100), buy("VFV", 10, 120)]);
    expect(position).toEqual({
      symbol: "VFV",
      quantity: 20,
      bookValue: 2200,
      averageCost: 110,
      realizedGain: 0,
    });
  });

  it("keeps each stock separate", () => {
    const positions = computePositions([buy("VFV", 10, 100), buy("XEQT", 4, 30)]);
    expect(positions).toEqual([
      { symbol: "VFV", quantity: 10, bookValue: 1000, averageCost: 100, realizedGain: 0 },
      { symbol: "XEQT", quantity: 4, bookValue: 120, averageCost: 30, realizedGain: 0 },
    ]);
  });

  it("returns nothing when there are no trades", () => {
    expect(computePositions([])).toEqual([]);
  });
});

describe("computePositions: sells", () => {
  it("sells at the average cost and locks in the gain (the Pawket note example)", () => {
    const [position] = computePositions([
      buy("VFV", 10, 100),
      buy("VFV", 10, 120),
      sell("VFV", 5, 130),
    ]);
    expect(position).toEqual({
      symbol: "VFV",
      quantity: 15,
      bookValue: 1650,
      averageCost: 110,
      realizedGain: 100,
    });
  });

  it("locks in a loss when selling below the average cost", () => {
    const [position] = computePositions([buy("VFV", 10, 100), sell("VFV", 4, 90)]);
    expect(position).toEqual({
      symbol: "VFV",
      quantity: 6,
      bookValue: 600,
      averageCost: 100,
      realizedGain: -40,
    });
  });

  it("keeps a fully sold stock, with 0 shares and its locked-in gain", () => {
    const [position] = computePositions([buy("VFV", 10, 100), sell("VFV", 10, 150)]);
    expect(position).toEqual({
      symbol: "VFV",
      quantity: 0,
      bookValue: 0,
      averageCost: 0,
      realizedGain: 500,
    });
  });

  it("refuses to sell more shares than you own", () => {
    expect(() => computePositions([buy("VFV", 10, 100), sell("VFV", 11, 130)])).toThrow(
      "Can't sell 11 VFV on 2026-11-12: you own 10",
    );
  });

  it("replays trades by date, not by list order", () => {
    // The sell is listed first but happened after the buy
    const [position] = computePositions([
      sell("VFV", 5, 130, "2026-11-12"),
      buy("VFV", 10, 100, "2026-11-10"),
    ]);
    expect(position.quantity).toBe(5);
    expect(position.realizedGain).toBe(150);
  });
});
