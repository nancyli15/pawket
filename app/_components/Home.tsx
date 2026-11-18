"use client";

import { useEffect, useState } from "react";
import { getMe, type Me } from "@/lib/client/api";
import CompareSection from "./CompareSection";

export default function Home() {
  const [me, setMe] = useState<Me | null>(null); // null while loading

  // Runs once when the page opens: ask who's signed in
  useEffect(() => {
    getMe().then(setMe, () => setMe({ signedIn: false }));
  }, []);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-3xl font-semibold">Pawket</h1>
        <p className="text-muted">Trades in, positions and gains out, with every number explained.</p>
      </header>

      {me === null && <p className="text-muted">Loading…</p>}

      {me?.signedIn === false && (
        <section className="rounded-lg border border-line bg-card p-6">
          <p className="mb-4">
            Sign in with SnapTrade to keep your own practice trades and check Pawket&apos;s maths against your real
            brokerage account. Pawket can only read your data, never trade.
          </p>
          <a href="/login" className="rounded-md bg-accent px-4 py-2 font-medium text-white">
            Sign in with SnapTrade
          </a>
        </section>
      )}

      {me?.signedIn && <CompareSection />}
    </main>
  );
}
