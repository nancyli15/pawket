"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { StoredTrade } from "@/lib/db/practiceTrades";
import { addTrade, deleteTrade, getTrades } from "@/lib/client/api";
import { money, units } from "@/lib/client/format";

const today = () => new Date().toISOString().slice(0, 10);
const field = "rounded-md border border-line bg-card px-2 py-1";

// Section 1: add, list and delete practice trades
export default function TradesSection({ version, onChange }: { version: number; onChange: () => void }) {
  const [trades, setTrades] = useState<StoredTrade[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Reload the list when the page opens and after every change
  useEffect(() => {
    getTrades().then(setTrades, (e: Error) => setError(e.message));
  }, [version]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // stay on the page instead of the browser's default form submit
    const form = new FormData(event.currentTarget);
    try {
      await addTrade({
        symbol: String(form.get("symbol")),
        side: form.get("side") === "sell" ? "sell" : "buy",
        quantity: Number(form.get("quantity")),
        price: Number(form.get("price")),
        date: String(form.get("date")),
      });
      setError(null);
      onChange();
    } catch (e) {
      setError((e as Error).message); // the server's own message, e.g. "Can't sell 10 XEQT.TO…"
    }
  }

  async function remove(id: number) {
    try {
      await deleteTrade(id);
      setError(null);
      onChange();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-card p-4">
      <div>
        <h2 className="text-xl font-semibold">Practice trades</h2>
        <p className="text-sm text-muted">Made-up trades, saved only for you. Try a sell, then delete a buy before it.</p>
      </div>

      <form onSubmit={submit} className="flex flex-wrap items-end gap-2 text-sm">
        <input name="symbol" placeholder="Symbol, e.g. VFV" required className={`${field} w-36`} />
        <select name="side" className={field}>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <input name="quantity" type="number" step="any" min="0" placeholder="Shares" required className={`${field} w-24`} />
        <input name="price" type="number" step="any" min="0" placeholder="Price" required className={`${field} w-24`} />
        <input name="date" type="date" defaultValue={today()} required className={field} />
        <button className="rounded-md bg-accent px-3 py-1 font-medium text-white">Add trade</button>
      </form>

      {error && <p className="text-sm text-danger">{error}</p>}

      {trades.length === 0 ? (
        <p className="text-sm text-muted">No practice trades yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="py-1">Date</th>
              <th>Stock</th>
              <th>Side</th>
              <th>Shares</th>
              <th>Price</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} className="border-t border-line">
                <td className="py-1">{t.date}</td>
                <td className="font-medium">{t.symbol}</td>
                <td>{t.side}</td>
                <td>{units(t.quantity)}</td>
                <td>{money(t.price)}</td>
                <td className="text-right">
                  <button onClick={() => remove(t.id)} className="text-muted hover:text-danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
