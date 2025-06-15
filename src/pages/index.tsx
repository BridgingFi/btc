import { useContext, useMemo, useState } from "react";

import DefaultLayout from "@/layouts/default";
import { WalletContext } from "@/contexts/wallet";

export default function IndexPage() {
  const { wallet, connectedAddress, network, publicKey } =
    useContext(WalletContext);
  const [balance, setBalance] = useState<number | null>(null);

  useMemo(() => {
    setBalance(null);
    if (wallet) {
      wallet.balance.then((balance) => {
        setBalance(balance.total);
      });
    }
  }, [wallet, network]);

  return (
    <DefaultLayout>
      <section className="flex flex-col justify-center gap-4 py-8 md:py-10">
        <h1>Wallet</h1>
        <p>{connectedAddress}</p>
        <p>{publicKey}</p>
        <p>{balance}</p>
      </section>
    </DefaultLayout>
  );
}
