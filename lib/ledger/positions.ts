import type { Position, Trade } from "./types";

// Replays all trades (oldest first) into one position per stock.
export function computePositions(trades: Trade[]): Position[] {
  // Copy before sorting so the caller's list isn't changed
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));

  // Notebook: one page of running totals per stock
  const totals = new Map<string, { quantity: number; bookValue: number; realizedGain: number }>();

  for (const trade of sorted) {
    const current = totals.get(trade.symbol) ?? { quantity: 0, bookValue: 0, realizedGain: 0 };

    if (trade.side === "buy") {
      totals.set(trade.symbol, {
        quantity: current.quantity + trade.quantity,
        bookValue: current.bookValue + trade.quantity * trade.price,
        realizedGain: current.realizedGain,
      });
    } 
    // Otherwise transaction is sell
    else {
      // Can't sell more than you own
      if (trade.quantity > current.quantity) {
        throw new Error(
          `Can't sell ${trade.quantity} ${trade.symbol} on ${trade.date}: you own ${current.quantity}`,
        );
      }

      // Sells remove shares at the average cost, so the average doesn't change
      const averageCost = current.bookValue / current.quantity;
      const quantityLeft = current.quantity - trade.quantity;

      totals.set(trade.symbol, {
        quantity: quantityLeft,
        // If exactly 0 when sold out, so no rounding crumbs remain 
        bookValue: quantityLeft === 0 ? 0 : current.bookValue - trade.quantity * averageCost,
        realizedGain: current.realizedGain + (trade.price - averageCost) * trade.quantity,
      });
    }
  }

  // Sold-out stocks stay (0 shares) so their realized gain still shows
  return [...totals].map(([symbol, { quantity, bookValue, realizedGain }]) => ({
    symbol,
    quantity,
    bookValue,
    averageCost: quantity === 0 ? 0 : bookValue / quantity,
    realizedGain,
  }));
}
