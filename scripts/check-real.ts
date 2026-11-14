// Compares Pawket's numbers (from your real TFSA trades) with SnapTrade's own positions.
// Reads data/activities-raw.json, downloaded from the ETF app. Run with `npm run check`.
import { readFileSync } from "node:fs";
import { computePositions } from "../lib/ledger/positions";
import { toTrades } from "../lib/snaptrade/activities";

type SnapTradePosition = {
  instrument: { symbol: string; currency: string };
  units: string;
  price: string;
  cost_basis: string;
  currency: string;
};

const raw = JSON.parse(readFileSync("data/activities-raw.json", "utf8"));
const tfsa = raw.accounts.find((a: { account: { name: string } }) => a.account.name.includes("TFSA"));

const { trades, unhandled } = toTrades(tfsa.activities.data.data);
const pawket = computePositions(trades);
const snaptrade: SnapTradePosition[] = tfsa.positions.data.results;

console.log(`TFSA: ${trades.length} trades used, ${unhandled.length} activities set aside\n`);

console.table(
  snaptrade.map((s) => {
    const p = pawket.find((x) => x.symbol === s.instrument.symbol);
    return {
      symbol: s.instrument.symbol,
      "Pawket units": p?.quantity,
      "SnapTrade units": Number(s.units),
      "Pawket avg cost (CAD)": p?.averageCost,
      [`SnapTrade avg cost`]: `${Number(s.cost_basis)} ${s.currency}`,
    };
  }),
);
