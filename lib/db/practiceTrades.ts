import { neon } from "@neondatabase/serverless";
import type { Trade } from "../ledger/types";

// A practice trade as stored: a Trade plus its row id
export type StoredTrade = Trade & { id: number };

// Read the connection string when a query runs, so importing this file never needs it
function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

// Creates the table if it doesn't exist yet; safe to run more than once
export async function createTable(): Promise<void> {
  await db()`
    CREATE TABLE IF NOT EXISTS practice_trades (
      id         SERIAL PRIMARY KEY,
      user_id    TEXT NOT NULL,
      symbol     TEXT NOT NULL,
      side       TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
      quantity   NUMERIC NOT NULL CHECK (quantity > 0),
      price      NUMERIC NOT NULL CHECK (price > 0),
      date       DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
}

// Columns cast back to the shapes Trade uses (NUMERIC → number, DATE → "YYYY-MM-DD")
const COLUMNS = "id, symbol, side, quantity::float8 AS quantity, price::float8 AS price, date::text AS date";

export async function addTrade(userId: string, trade: Trade): Promise<StoredTrade> {
  const sql = db();
  const rows = await sql.query(
    `INSERT INTO practice_trades (user_id, symbol, side, quantity, price, date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${COLUMNS}`,
    [userId, trade.symbol, trade.side, trade.quantity, trade.price, trade.date],
  );
  return rows[0] as StoredTrade;
}

export async function listTrades(userId: string): Promise<StoredTrade[]> {
  const rows = await db().query(
    `SELECT ${COLUMNS} FROM practice_trades WHERE user_id = $1 ORDER BY date, id`,
    [userId],
  );
  return rows as StoredTrade[];
}

// Returns false if there was no such trade for this user
export async function deleteTrade(userId: string, id: number): Promise<boolean> {
  const rows = await db().query(
    "DELETE FROM practice_trades WHERE user_id = $1 AND id = $2 RETURNING id",
    [userId, id],
  );
  return rows.length > 0;
}
