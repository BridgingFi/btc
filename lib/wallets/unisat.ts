import { Inscription, Network, SignPsbtOptions, Wallet, WalletEvent } from ".";

const UniSatNetworks = [
  "BITCOIN_MAINNET",
  "BITCOIN_TESTNET",
  "BITCOIN_TESTNET4",
  "BITCOIN_SIGNET",
  "FRACTAL_BITCOIN_MAINNET",
  "FRACTAL_BITCOIN_TESTNET",
] as const;

type UniSatNetwork = (typeof UniSatNetworks)[number];

export const UniSatNetworkInfo: Record<
  UniSatNetwork,
  { name: string; unit: string; network: string }
> = {
  BITCOIN_MAINNET: {
    name: "Bitcoin Mainnet",
    unit: "BTC",
    network: "livenet",
  },
  BITCOIN_TESTNET: {
    name: "Bitcoin Testnet",
    unit: "tBTC",
    network: "testnet",
  },
  BITCOIN_TESTNET4: {
    name: "Bitcoin Testnet4 (Beta)",
    unit: "tBTC",
    network: "testnet",
  },
  BITCOIN_SIGNET: {
    name: "Bitcoin Signet",
    unit: "sBTC",
    network: "testnet",
  },
  FRACTAL_BITCOIN_MAINNET: {
    name: "Fractal Bitcoin Mainnet",
    unit: "FB",
    network: "livenet",
  },
  FRACTAL_BITCOIN_TESTNET: {
    name: "Fractal Bitcoin Testnet",
    unit: "tFB",
    network: "livenet",
  },
} as const;

export class UniSat implements Wallet {
  protected get instance() {
    return (window as any).unisat;
  }

  get installed() {
    return typeof this.instance !== "undefined";
  }

  get network() {
    return this.instance.getChain().then((chain: any) => {
      switch (chain.enum) {
        case "BITCOIN_MAINNET":
          return "livenet";
        case "BITCOIN_TESTNET":
          return "testnet";
        case "BITCOIN_TESTNET4":
          return "testnet4";
        case "BITCOIN_SIGNET":
          return "signet";
        default:
          return "unknown";
      }
    });
  }

  switchNetwork(network: Network): Promise<void> {
    var unisatNet = "BITCOIN_MAINNET";

    switch (network) {
      case "testnet":
        unisatNet = "BITCOIN_TESTNET";
        break;
      case "testnet4":
        unisatNet = "BITCOIN_TESTNET4";
        break;
      case "signet":
        unisatNet = "BITCOIN_SIGNET";
        break;
    }

    return this.instance.switchChain(unisatNet);
  }

  get accounts() {
    return this.instance.getAccounts();
  }

  requestAccounts() {
    return this.instance.requestAccounts();
  }

  get publicKey() {
    return this.instance.getPublicKey();
  }

  get balance() {
    return this.instance.getBalance();
  }

  on(event: WalletEvent, handler: (accounts: Array<string>) => void) {
    this.instance.on(event, handler);
  }

  removeListener(
    event: WalletEvent,
    handler: (accounts: Array<string>) => void,
  ) {
    this.instance.removeListener(event, handler);
  }

  sendBitcoin(
    toAddress: string,
    satoshis: number,
    options?: { feeRate: number },
  ): Promise<string> {
    return this.instance.sendBitcoin(toAddress, satoshis, options);
  }

  getInscriptions(
    cursor?: number,
    size?: number,
  ): Promise<{ total: number; list: Inscription[] }> {
    return this.instance.getInscriptions(cursor, size);
  }

  sendInscription(
    toAddress: string,
    inscriptionId: string,
    options?: { feeRate: number },
  ): Promise<string> {
    return this.instance.sendInscription(toAddress, inscriptionId, options);
  }

  signPsbt(psbtHex: string, options?: SignPsbtOptions): Promise<string> {
    return this.instance.signPsbt(psbtHex, options);
  }

  signPsbts(psbtHexs: string[], options?: SignPsbtOptions): Promise<string[]> {
    return this.instance.signPsbts(psbtHexs, options);
  }

  pushPsbt(psbtHex: string): Promise<string> {
    return this.instance.pushPsbt(psbtHex);
  }

  signMessage(message: string): Promise<string> {
    return this.instance.signMessage(message, "bip322-simple");
  }
}
