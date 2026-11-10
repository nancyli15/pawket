import type { Position, Trade } from "./types";

// Takes the user's list of trades and works out what they own in each stock and what they paid

// Called wehnever the app needs to show positions and replays the whole trade history in the order given (future: sort by date)
export function computePositions(trades: Trade[]): Position[] {
  
  // The notebook: one page per stock that holds running totals
  // e.g. "VFV" page --> quantity: 20, bookValue: 2200
  const totals = new Map<string, { quantity: number; bookValue: number }>();

  // Replay each trade: read its stock's page, add to it, write it back
  for (const trade of trades) {
    // Only buys are handled for now
    if (trade.side === "sell") {
      throw new Error("Sells aren't supported yet");
    }
    // Open this stock's page. If it has no page yet, start from 0 shares and $0
    const current = totals.get(trade.symbol) ?? { quantity: 0, bookValue: 0 };
    
    // Write the updated page back into the notebook
    totals.set(trade.symbol, {
      quantity: current.quantity + trade.quantity, // shares so far + shares in this trade
      bookValue: current.bookValue + trade.quantity * trade.price, // money so far + this trade's cost
    });
  }
  // After the replay: turn each notebook page into a position with worked out average cost 
  return [...totals].map(([symbol, { quantity, bookValue }]) => ({
    symbol,
    quantity,
    bookValue,
    averageCost: bookValue / quantity, 
  }));
}
