import { describe, expect, it } from "vitest";
import { valuePositions } from "./value";
import type { Position } from "./types";

// The Pawket note example after selling 5: 15 shares, $1,650 paid, $110 average
const vfv: Position = {
  symbol: "VFV",
  quantity: 15,
  bookValue: 1650,
  averageCost: 110,
  realizedGain: 100,
};

describe("valuePositions", () => {
  it("works out market value and unrealized gain (the Pawket note example)", () => {
    const [valued] = valuePositions([vfv], { VFV: 125 });
    expect(valued.marketValue).toBe(1875);
    expect(valued.unrealizedGain).toBe(225);
    expect(valued.simpleReturn).toBeCloseTo(0.1364, 4);
  });

  it("shows an unrealized loss when the price is below the average cost", () => {
    const [valued] = valuePositions([vfv], { VFV: 100 });
    expect(valued.marketValue).toBe(1500);
    expect(valued.unrealizedGain).toBe(-150);
    expect(valued.simpleReturn).toBeCloseTo(-0.0909, 4);
  });

  it("marks value as unknown (null) when there's no price", () => {
    const [valued] = valuePositions([vfv], {});
    expect(valued.marketValue).toBeNull();
    expect(valued.unrealizedGain).toBeNull();
    expect(valued.simpleReturn).toBeNull();
  });

  it("values a sold-out stock at $0 without needing a price", () => {
    const soldOut: Position = { ...vfv, quantity: 0, bookValue: 0, averageCost: 0 };
    const [valued] = valuePositions([soldOut], {});
    expect(valued.marketValue).toBe(0);
    expect(valued.unrealizedGain).toBe(0);
    expect(valued.simpleReturn).toBeNull(); // nothing invested, so no return
  });

  it("keeps every field from the original position", () => {
    const [valued] = valuePositions([vfv], { VFV: 125 });
    expect(valued).toEqual({ ...vfv, marketValue: 1875, unrealizedGain: 225, simpleReturn: 225 / 1650 });
  });
});
