"use client";

import { useEffect, useState } from "react";
import { getComparison } from "@/lib/client/api";
import { money, units } from "@/lib/client/format";
import type { AccountComparison } from "@/lib/snaptrade/compare";

// Section 3: Pawket's ledger next to SnapTrade's own positions, for each real account
export default function CompareSection() {
  const [accounts, setAccounts] = useState<AccountComparison[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getComparison().then(setAccounts, (e: Error) => setError(e.message));
  }, []);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Check against SnapTrade</h2>
        <p className="text-sm text-muted">
          Pawket replays each account&apos;s trades through its own ledger and compares the result with SnapTrade&apos;s
          positions. ✗ on average cost can mean a different currency: Pawket uses the currency you traded in.
        </p>
      </div>

      {error && <p className="text-danger">{error}</p>}
      {!accounts && !error && <p className="text-muted">Asking SnapTrade…</p>}

      {accounts?.map((account, i) => (
        <div key={i} className="rounded-lg border border-line bg-card p-4">
          <h3 className="font-semibold">{account.account}</h3>
          <p className="text-sm text-muted">
            {account.tradesUsed} trades used, {account.unhandled} other activities set aside
          </p>
          {account.error && <p className="mt-2 text-sm text-danger">Pawket couldn&apos;t replay this account: {account.error}</p>}
          {account.rows.length > 0 && (
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-muted">
                <tr>
                  <th className="py-1">Stock</th>
                  <th>Units (Pawket / SnapTrade)</th>
                  <th>Average cost (Pawket / SnapTrade)</th>
                  <th>Match</th>
                </tr>
              </thead>
              <tbody>
                {account.rows.map((row) => (
                  <tr key={row.symbol} className="border-t border-line">
                    <td className="py-1 font-medium">{row.symbol}</td>
                    <td>
                      {units(row.pawketUnits)} / {units(row.snaptradeUnits)}
                    </td>
                    <td>
                      {money(row.pawketAverageCost)} / {money(row.snaptradeAverageCost)} {row.snaptradeCurrency}
                    </td>
                    <td className={row.matches ? "text-gain" : "text-danger"}>{row.matches ? "✓" : "✗"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </section>
  );
}
