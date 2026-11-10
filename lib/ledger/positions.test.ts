import { describe, expect, it } from "vitest";
import { computePositions } from "./positions";
import type { Trade } from "./types";

const buy = (symbol: string, quantity: number, price: number): Trade => ({
  symbol,
  side: "buy",
  quantity,
  price,
  date: "2026-11-10",
});

describe("computePositions", () => {
  it("works out the $110 example from the Pawket note", () => {
    const [position] = computePositions([buy("VFV", 10, 100), buy("VFV", 10, 120)]);
    expect(position).toEqual({ symbol: "VFV", quantity: 20, bookValue: 2200, averageCost: 110 });
  });

  it("keeps each stock separate", () => {
    const positions = computePositions([buy("VFV", 10, 100), buy("XEQT", 4, 30)]);
    expect(positions).toEqual([
      { symbol: "VFV", quantity: 10, bookValue: 1000, averageCost: 100 },
      { symbol: "XEQT", quantity: 4, bookValue: 120, averageCost: 30 },
    ]);
  });

  it("returns nothing when there are no trades", () => {
    expect(computePositions([])).toEqual([]);
  });

  it("refuses sells until change 2 handles them", () => {
    const sell: Trade = { ...buy("VFV", 5, 130), side: "sell" };
    expect(() => computePositions([buy("VFV", 10, 100), sell])).toThrow();
  });
});
