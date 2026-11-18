// Number formatting for the screens

export const money = (value: number | null | undefined) =>
  value == null ? "—" : value.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const units = (value: number | null | undefined) =>
  value == null ? "—" : value.toLocaleString("en-CA", { maximumFractionDigits: 4 });
