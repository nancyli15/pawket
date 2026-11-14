import type { Position, ValuedPosition } from "./types";

// Adds market value and unrealized gain to each position, using today's prices.
export function valuePositions(
  positions: Position[],
  prices: Record<string, number>,
): ValuedPosition[] {
  return positions.map((position) => {
    // Sold out: worth $0, no price needed
    if (position.quantity === 0) {
      return { ...position, marketValue: 0, unrealizedGain: 0, simpleReturn: null };
    }

    const price = prices[position.symbol];
    // No price: unknown, not $0 (which would look like a total loss)
    if (price === undefined) {
      return { ...position, marketValue: null, unrealizedGain: null, simpleReturn: null };
    }

    const marketValue = position.quantity * price;
    const unrealizedGain = marketValue - position.bookValue;
    return {
      ...position,
      marketValue,
      unrealizedGain,
      // How much the shares still held have grown; e.g. 225 ÷ 1650 = 0.136 (13.6%)
      simpleReturn: unrealizedGain / position.bookValue,
    };
  });
}
