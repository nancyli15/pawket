import { describe, expect, it } from "vitest";
import { toTrades, type SnapTradeActivity } from "./activities";

// Your real XQQ buy from the TFSA, trimmed to the fields we read
const xqqBuy: SnapTradeActivity = {
  type: "BUY",
  symbol: { symbol: "XQQ.TO" },
  units: 0.433,
  price: 69.261,
  trade_date: "2026-11-02T17:06:38.204000Z",
  description: "Bought 0.43300 of XQQ.TO at $69.26",
};

describe("toTrades", () => {
  it("turns a real BUY into a trade", () => {
    expect(toTrades([xqqBuy]).trades).toEqual([
      { symbol: "XQQ.TO", side: "buy", quantity: 0.433, price: 69.261, date: "2026-11-02" },
    ]);
  });

  it("makes a SELL's negative units positive", () => {
    const sell: SnapTradeActivity = { ...xqqBuy, type: "SELL", units: -5 };
    expect(toTrades([sell]).trades[0]).toMatchObject({ side: "sell", quantity: 5 });
  });

  it("lists other types as unhandled instead of dropping them", () => {
    const dividend: SnapTradeActivity = {
      type: "DIVIDEND",
      symbol: { symbol: "XEQT.TO" },
      units: 0,
      price: 0.2053,
      trade_date: "2026-01-05T00:00:00Z",
      description: "Dividend",
    };
    const result = toTrades([dividend]);
    expect(result.trades).toEqual([]);
    expect(result.unhandled).toEqual([
      {
        date: "2026-01-05",
        type: "DIVIDEND",
        symbol: "XEQT.TO",
        description: "Dividend",
        reason: "type not supported yet",
      },
    ]);
  });

  it("lists a BUY with missing details as unhandled", () => {
    const noSymbol: SnapTradeActivity = { ...xqqBuy, symbol: null };
    const result = toTrades([noSymbol]);
    expect(result.trades).toEqual([]);
    expect(result.unhandled[0].reason).toBe("missing symbol, date, units or price");
  });
});
