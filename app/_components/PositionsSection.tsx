"use client";

import { useEffect, useState } from "react";
import type { PortfolioSummary } from "@/lib/ledger/portfolio";
import type { ValuedPosition } from "@/lib/ledger/types";
import { getPortfolio, getPositions } from "@/lib/client/api";
import { money, units } from "@/lib/client/format";

const percent = (value: number | null) => (value == null ? "—" : `${(value * 100).toFixed(2)}%`);
const signed = (value: number) => `${value >= 0 ? "up" : "down"} $${money(Math.abs(value))}`;

// Section 2: positions worked out from the practice trades, with totals and an explain card per stock
export default function PositionsSection({ version }: { version: number }) {
  const [prices, setPrices] = useState("");
  const [positions, setPositions] = useState<ValuedPosition[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [open, setOpen] = useState<string | null>(null); // the stock whose explain card is showing
  const [error, setError] = useState<string | null>(null);

  // Reload after a trade changes, and as today's prices are typed
  useEffect(() => {
    Promise.all([getPositions(prices), getPortfolio(prices)]).then(
      ([p, s]) => {
        setPositions(p);
        setSummary(s);
        setError(null);
      },
      (e: Error) => setError(e.message), // e.g. "Bad price "VFV": use SYMBOL:PRICE"
    );
  }, [version, prices]);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-card p-4">
      <div>
        <h2 className="text-xl font-semibold">Positions</h2>
        <p className="text-sm text-muted">Worked out from your practice trades every time. Click a stock to see how.</p>
      </div>

      <label className="text-sm">
        Today&apos;s prices (optional):{" "}
        <input
          value={prices}
          onChange={(e) => setPrices(e.target.value)}
          placeholder="VFV:125, XEQT.TO:32"
          className="w-64 rounded-md border border-line px-2 py-1"
        />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}

      {summary && (
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <Total label="Book value (paid)" value={`$${money(summary.bookValue)}`} />
          <Total label="Realized gain" value={`$${money(summary.realizedGain)}`} />
          <Total label="Market value" value={summary.marketValue == null ? "—" : `$${money(summary.marketValue)}`} />
          <Total
            label="Unrealized gain"
            value={summary.unrealizedGain == null ? "—" : `$${money(summary.unrealizedGain)} (${percent(summary.simpleReturn)})`}
          />
        </div>
      )}

      {positions.length > 0 && (
        <table className="w-full text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="py-1">Stock</th>
              <th>Shares</th>
              <th>Book value</th>
              <th>Avg cost</th>
              <th>Realized</th>
              <th>Market value</th>
              <th>Unrealized</th>
              <th>Return</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <Row key={p.symbol} position={p} open={open === p.symbol} toggle={() => setOpen(open === p.symbol ? null : p.symbol)} />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-page p-2">
      <div className="text-muted">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function Row({ position: p, open, toggle }: { position: ValuedPosition; open: boolean; toggle: () => void }) {
  return (
    <>
      <tr onClick={toggle} className={`cursor-pointer border-t border-line hover:bg-selected ${open ? "bg-selected" : ""}`}>
        <td className="py-1 font-medium">{p.symbol}</td>
        <td>{units(p.quantity)}</td>
        <td>${money(p.bookValue)}</td>
        <td>${money(p.averageCost)}</td>
        <td>${money(p.realizedGain)}</td>
        <td>{p.marketValue == null ? "—" : `$${money(p.marketValue)}`}</td>
        <td>{p.unrealizedGain == null ? "—" : `$${money(p.unrealizedGain)}`}</td>
        <td>{percent(p.simpleReturn)}</td>
      </tr>
      {open && (
        <tr className="bg-selected">
          <td colSpan={8} className="p-3">
            <Explain position={p} />
          </td>
        </tr>
      )}
    </>
  );
}

// The plain-English explain card: each number, where it comes from, with the real values
function Explain({ position: p }: { position: ValuedPosition }) {
  if (p.quantity === 0) {
    return (
      <p>
        You&apos;ve sold all your {p.symbol}. Selling locked in a <b>realized gain</b> of {signed(p.realizedGain)}: for each
        share, the sale price minus what it cost you on average.
      </p>
    );
  }
  const price = p.marketValue == null ? null : p.marketValue / p.quantity;
  return (
    <div className="flex flex-col gap-1">
      <p>
        You own {units(p.quantity)} shares of {p.symbol} and paid ${money(p.bookValue)} for them in total (<b>book value</b>
        ). So each share cost you ${money(p.bookValue)} ÷ {units(p.quantity)} = ${money(p.averageCost)} on average (
        <b>average cost</b>).
      </p>
      {p.realizedGain !== 0 && (
        <p>
          Shares you sold locked in {signed(p.realizedGain)} (<b>realized gain</b>): sale price minus average cost, times the
          shares sold. Selling doesn&apos;t change the average cost of the shares you kept.
        </p>
      )}
      {price == null ? (
        <p className="text-muted">Type today&apos;s price for {p.symbol} above to see what your shares are worth now.</p>
      ) : (
        <p>
          At today&apos;s ${money(price)}, they&apos;re worth {units(p.quantity)} × ${money(price)} = ${money(p.marketValue)} (
          <b>market value</b>). That&apos;s {signed(p.unrealizedGain ?? 0)} on paper (<b>unrealized gain</b>), or{" "}
          {percent(p.simpleReturn)} of what you paid (<b>simple return</b>). It only becomes realized if you sell.
        </p>
      )}
    </div>
  );
}
