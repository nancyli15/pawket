// Ledger's data model

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
