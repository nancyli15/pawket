// The browser's side of Pawket's API: one function per endpoint the screens ask.
import type { AccountComparison } from "../snaptrade/compare";

// GET a Pawket endpoint and return its JSON, or throw with the server's error message
async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `${path} failed: ${res.status}`);
  return body as T;
}

export type Me = { signedIn: false } | { signedIn: true; userId: string };

export const getMe = () => getJson<Me>("/api/me");
export const getComparison = () => getJson<AccountComparison[]>("/api/compare");
