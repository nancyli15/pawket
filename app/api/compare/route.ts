import { connection } from "next/server";
import { notSignedIn } from "@/lib/api/practice";
import type { SnapTradeActivity } from "@/lib/snaptrade/activities";
import { NotSignedInError, snapTradeClient } from "@/lib/snaptrade/client";
import { compareAccount, type SnapTradePosition } from "@/lib/snaptrade/compare";

type SnapTradeAccount = { id?: string; name?: string | null };

// GET /api/compare: for each real account, Pawket's ledger next to SnapTrade's own positions
export async function GET() {
  await connection();
  try {
    const get = await snapTradeClient();
    const list = await get("/accounts");
    const accounts = (Array.isArray(list) ? (list as SnapTradeAccount[]) : []).filter((a) => a?.id);

    const results = [];
    for (const account of accounts) {
      const path = `/accounts/${encodeURIComponent(account.id!)}`;
      // Activities come in pages of up to 1000; one page covers these accounts
      const activities = (await get(`${path}/activities`)) as { data?: SnapTradeActivity[] };
      const positions = (await get(`${path}/positions/all`)) as { results?: SnapTradePosition[] };
      results.push(compareAccount(account.name ?? account.id!, activities.data ?? [], positions.results ?? []));
    }
    return Response.json(results);
  } catch (error) {
    if (error instanceof NotSignedInError) return notSignedIn();
    console.error("Compare failed:", (error as Error).message);
    return Response.json({ error: "Couldn't reach SnapTrade. Try again shortly." }, { status: 502 });
  }
}
