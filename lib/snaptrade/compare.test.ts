import { describe, expect, it } from "vitest";
import { compareAccount } from "./compare";
import type { SnapTradeActivity } from "./activities";

const buy = (symbol: string, units: number, price: number, date: string): SnapTradeActivity => ({
  type: "BUY",
  symbol: { symbol },
  units,
  price,
  trade_date: `${date}T00:00:00Z`,
});

describe("compareAccount", () => {
  it("matches when Pawket and SnapTrade agree", () => {
    const activities = [buy("XQQ.TO", 4, 30, "2026-11-10"), buy("XQQ.TO", 2, 35, "2026-11-13")];
    const positions = [{ instrument: { symbol: "XQQ.TO" }, units: "6", cost_basis: "31.6667", currency: "CAD" }];
    const result = compareAccount("TFSA", activities, positions);
    expect(result.tradesUsed).toBe(2);
    expect(result.rows[0]).toMatchObject({ symbol: "XQQ.TO", pawketUnits: 6, matches: true });
  });

  it("flags a different average cost, like GOOG in CAD vs USD", () => {
    const activities = [buy("GOOG", 1, 495.2, "2026-11-10")];
    const positions = [{ instrument: { symbol: "GOOG" }, units: 1, cost_basis: 342.7, currency: "USD" }];
    expect(compareAccount("TFSA", activities, positions).rows[0].matches).toBe(false);
  });

  it("reports a ledger error instead of crashing, like a sell with no buy", () => {
    const sell = { ...buy("TSLA", -2, 200, "2026-11-10"), type: "SELL" };
    const result = compareAccount("Sandbox", [sell], []);
    expect(result.rows).toEqual([]);
    expect(result.error).toContain("Can't sell 2 TSLA");
  });
});
