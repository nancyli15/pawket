import { describe, expect, it } from "vitest";
import { summarize } from "./portfolio";
import type { ValuedPosition } from "./types";

const vfv: ValuedPosition = {
  symbol: "VFV", quantity: 15, bookValue: 1650, averageCost: 110, realizedGain: 100,
  marketValue: 1875, unrealizedGain: 225, simpleReturn: 225 / 1650,
};
const soldOut: ValuedPosition = {
  symbol: "TSLA", quantity: 0, bookValue: 0, averageCost: 0, realizedGain: -40,
  marketValue: 0, unrealizedGain: 0, simpleReturn: null,
};

describe("summarize", () => {
  it("adds up held positions, and realized gains from all of them", () => {
    expect(summarize([vfv, soldOut])).toEqual({
      holdings: 1,
      bookValue: 1650,
      marketValue: 1875,
      realizedGain: 60, // 100 − 40
      unrealizedGain: 225,
      simpleReturn: 225 / 1650,
    });
  });

  it("makes market value unknown if any held stock has no price", () => {
    const noPrice = { ...vfv, symbol: "XQQ", marketValue: null, unrealizedGain: null, simpleReturn: null };
    const summary = summarize([vfv, noPrice]);
    expect(summary.marketValue).toBeNull();
    expect(summary.simpleReturn).toBeNull();
    expect(summary.bookValue).toBe(3300);
  });

  it("handles an empty portfolio", () => {
    expect(summarize([])).toMatchObject({ holdings: 0, bookValue: 0, marketValue: 0, simpleReturn: null });
  });
});
