import { connection } from "next/server";
import { deleteTrade, listTrades } from "@/lib/db/practiceTrades";
import { DEMO_USER } from "@/lib/api/practice";
import { computePositions } from "@/lib/ledger/positions";

// DELETE /api/trades/7: remove one practice trade
export async function DELETE(_request: Request, ctx: RouteContext<"/api/trades/[id]">) {
  await connection();
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return Response.json({ error: "id must be a number" }, { status: 400 });

  const trades = await listTrades(DEMO_USER);
  if (!trades.some((t) => t.id === id)) return Response.json({ error: "No such trade" }, { status: 404 });

  // Deleting a buy could leave a later sell with no shares behind it
  try {
    computePositions(trades.filter((t) => t.id !== id));
  } catch (error) {
    return Response.json(
      { error: `Can't delete: ${(error as Error).message}. Delete the later sell first.` },
      { status: 409 },
    );
  }
  await deleteTrade(DEMO_USER, id);
  return new Response(null, { status: 204 });
}
