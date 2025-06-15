import { createContext, useState, ReactNode } from "react";

import { Network, Wallet } from "../../lib/wallets";

interface IWalletContext {
  wallet: Wallet | null;
  setWallet: (wallet: Wallet | null) => void;
  connectedAddress: string | null;
  setConnectedAddress: (address: string | null) => void;
  publicKey: string | null;
  setPublicKey: (publicKey: string | null) => void;
  network: Network | null;
  setNetwork: (network: Network | null) => void;
}

export const WalletContext = createContext<IWalletContext>({
  wallet: null,
  setWallet: () => {},
  connectedAddress: null,
  setConnectedAddress: () => {},
  publicKey: null,
  setPublicKey: () => {},
  network: null,
  setNetwork: () => {},
});

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);

  const contextValue = {
    wallet,
    setWallet,
    connectedAddress,
    setConnectedAddress,
    publicKey,
    setPublicKey,
    network,
    setNetwork,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};
