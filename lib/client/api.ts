// The browser's side of Pawket's API: one function per endpoint the screens ask.
import type { StoredTrade } from "../db/practiceTrades";
import type { PortfolioSummary } from "../ledger/portfolio";
import type { Trade, ValuedPosition } from "../ledger/types";
import type { AccountComparison } from "../snaptrade/compare";

// Sends a request to a Pawket endpoint and returns its JSON, or throws with the server's error message
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { cache: "no-store", ...init });
  if (res.status === 204) return undefined as T; // deleted: nothing to read
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `${path} failed: ${res.status}`);
  return body as T;
}

export type Me = { signedIn: false } | { signedIn: true; userId: string };

export const getMe = () => request<Me>("/api/me");
export const getComparison = () => request<AccountComparison[]>("/api/compare");

export const getTrades = () => request<StoredTrade[]>("/api/trades");
export const addTrade = (trade: Trade) =>
  request<StoredTrade>("/api/trades", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trade),
  });
export const deleteTrade = (id: number) => request<void>(`/api/trades/${id}`, { method: "DELETE" });

// prices is "VFV:125,XEQT.TO:32", the same format as ?prices= in Insomnia
const withPrices = (path: string, prices: string) => (prices.trim() ? `${path}?prices=${encodeURIComponent(prices)}` : path);
export const getPositions = (prices: string) => request<ValuedPosition[]>(withPrices("/api/positions", prices));
export const getPortfolio = (prices: string) => request<PortfolioSummary>(withPrices("/api/portfolio", prices));
