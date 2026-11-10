import type { Position, ValuedPosition } from "./types";

// Adds market value and unrealized gain to each position, using today's prices.
export function valuePositions(
  positions: Position[],
  prices: Record<string, number>,
): ValuedPosition[] {
  return positions.map((position) => {
    // Sold out: worth $0, no price needed
    if (position.quantity === 0) {
      return { ...position, marketValue: 0, unrealizedGain: 0 };
    }

    const price = prices[position.symbol];
    // No price: unknown, not $0 (which would look like a total loss)
    if (price === undefined) {
      return { ...position, marketValue: null, unrealizedGain: null };
    }

    const marketValue = position.quantity * price;
    return { ...position, marketValue, unrealizedGain: marketValue - position.bookValue };
  });
}
