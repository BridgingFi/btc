import type {
  Balance,
  Inscription,
  Network,
  SignPsbtOptions,
  Wallet,
  WalletEvent,
  WalletType,
} from ".";

import {
  Address,
  AddressPurpose,
  BitcoinNetworkType,
  getSupportedWallets,
  SupportedWallet,
  request,
  MessageSigningProtocols,
} from "@sats-connect/core";
import { hex } from "@scure/base";
import * as btc from "@scure/btc-signer";

import { mempoolApiUrl } from "../btc/utils";

export function Wallets(): SupportedWallet[] {
  return getSupportedWallets().filter(
    (v) => v.isInstalled && v.name.toLowerCase() !== "unisat",
  );
}

export class SatsWallet implements Wallet {
  private _wallet: SupportedWallet;
  private _addresses?: Address[];
  constructor(wallet: WalletType | SupportedWallet) {
    if (typeof wallet == "string") {
      const w = Wallets().find((v) => (v.name == wallet ? v : null));

      if (!w) throw new Error(`wallet ${wallet} not found`);
      wallet = w;
    }
    this._wallet = wallet;
  }

  get installed() {
    return this._wallet.isInstalled;
  }

  get network() {
    return request("wallet_getNetwork", null, this._wallet.id).then((res) => {
      if (res.status === "error") throw res.error;

      return res.result.bitcoin.name.toLowerCase() as Network;
    });
  }

  switchNetwork(network: Network): Promise<void> {
    return request(
      "wallet_changeNetwork",
      {
        name: (network.charAt(0).toUpperCase() +
          network.slice(1)) as BitcoinNetworkType,
      },
      this._wallet.id,
    ).then((res) => {
      if (res.status === "error") throw res.error;
    });
  }

  get accounts() {
    return request(
      "getAddresses",
      { purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment] },
      this._wallet.id,
    ).then((res) => {
      if (res.status === "error") throw res.error;

      this._addresses = res.result.addresses;

      return res.result.addresses.map((v: any) => v.address);
    });
  }

  requestAccounts(): Promise<string[]> {
    return request("wallet_connect", null, this._wallet.id).then((res) => {
      if (res.status === "error") throw res.error;

      return res.result.addresses.map((v: any) => v.address);
    });
  }

  get publicKey() {
    return this._addresses
      ? Promise.resolve(this._addresses[0].publicKey)
      : this.accounts.then(() => this._addresses![0].publicKey);
  }

  get balance(): Promise<Balance> {
    return request("getBalance", undefined, this._wallet.id).then((res) => {
      if (res.status === "error") throw res.error;

      return {
        confirmed: Number(res.result.confirmed),
        unconfirmed: Number(res.result.unconfirmed),
        total: Number(res.result.total),
      };
    });
  }

  on(_event: WalletEvent, _handler: (accounts: Array<string>) => void) {
    throw new Error(`${this._wallet.name} does not support event listening`);
  }

  removeListener() {
    throw new Error(`${this._wallet.name} does not support event listening`);
  }

  sendBitcoin(
    toAddress: string,
    satoshis: number,
    options?: { feeRate: number },
  ): Promise<string> {
    if (options?.feeRate)
      console.warn(`feeRate is not supported in ${this._wallet.name}`);

    return request(
      "sendTransfer",
      { recipients: [{ address: toAddress, amount: satoshis }] },
      this._wallet.id,
    ).then((res) => {
      if (res.status === "error") throw res.error;

      return res.result.txid;
    });
  }

  getInscriptions(
    _cursor?: number,
    _size?: number,
  ): Promise<{ total: number; list: Inscription[] }> {
    return request(
      "ord_getInscriptions",
      { limit: _size ?? 60, offset: _cursor ?? 0 },
      this._wallet.id,
    ).then((res) => {
      if (res.status === "error") throw res.error;

      return {
        total: res.result.total,
        list: res.result.inscriptions.map((v: any) => ({
          ...v,
          outputValue: v.postage,
          location: v.output,
        })),
      };
    });
  }

  sendInscription(
    _toAddress: string,
    _inscriptionId: string,
    _options?: { feeRate: number },
  ): Promise<string> {
    return request(
      "ord_sendInscriptions",
      { transfers: [{ address: _toAddress, inscriptionId: _inscriptionId }] },
      this._wallet.id,
    ).then((res) => {
      if (res.status === "error") throw res.error;

      return res.result.txid;
    });
  }

  signPsbt(psbtHex: string, options?: SignPsbtOptions): Promise<string> {
    const signInputs: Record<string, number[]> = {};

    for (const input of options?.toSignInputs ?? []) {
      const address = input.address ?? this._addresses![0].address;

      if (!signInputs[address]) signInputs[address] = [input.index];
      else signInputs[address].push(input.index);
    }

    return request(
      "signPsbt",
      { psbt: psbtHex, signInputs, broadcast: false },
      this._wallet.id,
    ).then((res) => {
      if (res.status === "error") throw res.error;

      return res.result.psbt;
    });
  }

  signPsbts(psbtHexs: string[], options?: SignPsbtOptions): Promise<string[]> {
    return Promise.all(psbtHexs.map((psbt) => this.signPsbt(psbt, options)));
  }

  pushPsbt(psbtHex: string): Promise<string> {
    return this.network.then((network) =>
      fetch(mempoolApiUrl("/api/tx", network), {
        method: "POST",
        body: hex.encode(
          btc.Transaction.fromPSBT(hex.decode(psbtHex), {
            allowUnknownInputs: true,
          }).extract(),
        ),
      }).then((res) => {
        if (res.status == 200) {
          return res.text();
        }

        return res.text().then((text) => {
          console.error(res.status, text, res);
          throw new Error(text);
        });
      }),
    );
  }

  signMessage(message: string): Promise<string> {
    return request(
      "signMessage",
      {
        message,
        address: this._addresses![0].address,
        protocol: MessageSigningProtocols.BIP322,
      },
      this._wallet.id,
    ).then((res) => {
      if (res.status === "error") throw res.error;

      return res.result.signature;
    });
  }
}
