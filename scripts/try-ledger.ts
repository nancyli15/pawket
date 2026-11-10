// Playground: type in your own trades, run `npm run try`, and see what the ledger works out.
// Not part of the app or the tests; just for checking the maths by eye.
import { computePositions } from "../lib/ledger/positions";
import type { Trade } from "../lib/ledger/types";
import { valuePositions } from "../lib/ledger/value";

const trades: Trade[] = [
  { symbol: "XEQT", side: "sell", quantity: 1,  price: 25,  date: "2026-11-13" },
  { symbol: "VFV",  side: "buy",  quantity: 10, price: 100, date: "2026-11-10" },
  { symbol: "VFV",  side: "sell", quantity: 15, price: 100, date: "2026-11-14" },
  { symbol: "XEQT", side: "buy",  quantity: 4,  price: 30,  date: "2026-11-10" },
  { symbol: "VFV",  side: "buy",  quantity: 10, price: 120, date: "2026-11-11" },
  { symbol: "VFV",  side: "sell", quantity: 5,  price: 130, date: "2026-11-12" },
];

console.log("Input (trades):");
console.table(trades);

// Today's price per share. Remove one to see a missing price (null).
const prices: Record<string, number> = { VFV: 125, XEQT: 32 };

console.log("Output (positions at today's prices):");
console.table(valuePositions(computePositions(trades), prices));
