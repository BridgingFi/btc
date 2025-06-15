import { Leather } from "./leather";
import { OKX } from "./okx";
import { UniSat } from "./unisat";
import { SatsWallet, Wallets as SatsWallets } from "./satsConnect";

import { Wallets } from ".";

export function getWallets() {
  const extensionWallets: Wallets = [
    { name: "OKX", wallet: new OKX() },
    { name: "UniSat", wallet: new UniSat() },
    { name: "Leather", wallet: new Leather() },
  ].filter((v) => v.wallet.installed);
  const satsConnectWallets = SatsWallets().map((v) => ({
    name: v.name,
    wallet: new SatsWallet(v),
  }));
  //   const walletStandardWallets = WSWallets().map((v) => ({
  //     name: v.name,
  //     wallet: new WalletStandard(v),
  //   }));

  return [
    ...extensionWallets,
    ...satsConnectWallets,
    // ...walletStandardWallets,
  ];
}
