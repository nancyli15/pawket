// Ledger's data model - A list of trades in order
// Trade goes in, Position comes out, ValuedPosition is Position w/ today's price applied.

// one buy or sell of a stock; positions are worked out from list of trades
export type Trade = {
  symbol: string; // e.g. "VFV"
  side: "buy" | "sell"; // trade can be buy or sell
  quantity: number; // number of shares, always positive
  price: number; // price per share, in dollars
  date: string; // e.g. "2026-11-10"
};

// what the account holds in one stock
export type Position = {
  symbol: string; // e.g. "AAPL"
  quantity: number; // shares you own now
  bookValue: number; // total you paid for the shares you still own
  averageCost: number; // bookValue ÷ quantity
  realizedGain: number; // money locked in by sells: (sale price − average cost) × shares sold, added up
};

// A position plus what it's worth at today's price. null = no price available.
export type ValuedPosition = Position & {
  marketValue: number | null; // quantity × current price
  unrealizedGain: number | null; // marketValue − bookValue: gain on paper, not locked in
};
