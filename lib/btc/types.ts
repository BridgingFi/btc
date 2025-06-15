export type Balance = {
  confirmed: number;
  unconfirmed: number;
  total: number;
};

export const Networks = [
  "unknown",
  "livenet",
  "testnet",
  "testnet4",
  "signet",
  "devnet",
] as const;
export type Network = (typeof Networks)[number];
