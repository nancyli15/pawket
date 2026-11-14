import { describe, expect, it } from "vitest";
import { parsePrices, parseTrade } from "./requests";

describe("parsePrices", () => {
  it("reads SYMBOL:PRICE pairs", () => {
    expect(parsePrices("VFV:125, xeqt.to:32.5")).toEqual({ VFV: 125, "XEQT.TO": 32.5 });
  });
  it("gives no prices when none are sent", () => {
    expect(parsePrices(null)).toEqual({});
  });
  it("rejects a malformed pair", () => {
    expect(() => parsePrices("VFV")).toThrow("Bad price");
    expect(() => parsePrices("VFV:-3")).toThrow("Bad price");
  });
});

describe("parseTrade", () => {
  const good = { symbol: " vfv ", side: "buy", quantity: 10, price: 100, date: "2026-11-10" };

  it("accepts a valid trade and tidies the symbol", () => {
    expect(parseTrade(good)).toEqual({ trade: { ...good, symbol: "VFV" } });
  });
  it("says what's wrong with a bad trade", () => {
    expect(parseTrade({ ...good, side: "hold" })).toEqual({ error: "side must be \"buy\" or \"sell\"" });
    expect(parseTrade({ ...good, quantity: 0 })).toHaveProperty("error");
    expect(parseTrade({ ...good, price: "100" })).toHaveProperty("error");
    expect(parseTrade({ ...good, date: "Nov 10" })).toHaveProperty("error");
    expect(parseTrade(null)).toHaveProperty("error");
  });
});
