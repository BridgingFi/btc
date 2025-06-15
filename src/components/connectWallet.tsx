import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { useDisclosure } from "@heroui/use-disclosure";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useContext, useState, useEffect } from "react";
import { OKXUniversalConnectUI, THEME } from "@okxconnect/ui";
import { getAddressInfo } from "bitcoin-address-validation";
import { addToast } from "@heroui/toast";
import { NavArrowDown, Wallet } from "iconoir-react";

import { getWallets, Wallets } from "../../lib/wallets";
import { getState, removeState, setState } from "../../lib/state";
import { Network } from "../../lib/btc/types";

import { WalletContext } from "@/contexts/wallet";

export const ConnectWallet = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    wallet,
    setWallet,
    connectedAddress,
    setConnectedAddress,
    network,
    setNetwork,
    setPublicKey,
  } = useContext(WalletContext);
  const [wallets] = useState<Wallets>(getWallets());
  const [isLoading, setIsLoading] = useState(true);

  // Helper function: connect wallet and save state
  const connectWalletAndSave = (
    walletInstance: any,
    walletName: string,
    address: string,
  ) => {
    setWallet(walletInstance);
    setConnectedAddress(address);
    setState({ lastWallet: walletName });
  };

  useEffect(() => {
    try {
      const lastWallet = getState().lastWallet;

      console.log("lastWallet", lastWallet);

      if (lastWallet) {
        const wallet = wallets.find((w) => w.name == lastWallet);

        if (wallet) {
          wallet.wallet.accounts.then((accounts) => {
            if (accounts.length > 0) {
              setWallet(wallet.wallet);
              setConnectedAddress(accounts[0]);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error checking last wallet:", error);
    } finally {
      setIsLoading(false);
    }
  }, [wallets]);

  useEffect(() => {
    if (wallet) wallet.network.then((network) => setNetwork(network));
    else setNetwork(null);
  }, [wallet]);

  // Listen for wallet connection status changes
  useEffect(() => {
    setConnectedAddress(null);
    setPublicKey(null);
    if (wallet) {
      wallet.accounts.then((accounts) => {
        if (accounts.length > 0) {
          setConnectedAddress(accounts[0]);
        }
      });
      wallet.publicKey.then((publicKey) => {
        setPublicKey(publicKey);
      });
    }
  }, [wallet, network]);

  const disconnectWallet = () => {
    setWallet(null);
    removeState("lastWallet");
  };

  const switchNetwork = async (network: Network) => {
    if (!wallet) return;

    try {
      await wallet.switchNetwork(network);
      setNetwork(network);
      addToast({
        title: "Network Switched",
        description: `Switched to ${network}`,
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Network Switch Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        color: "danger",
      });
    }
  };

  const getNetworkDisplayName = (network: Network) => {
    return network[0].toUpperCase() + network.slice(1);
  };

  const connectOKX = (onClose: () => void) => {
    OKXUniversalConnectUI.init({
      dappMetaData: {
        icon: import.meta.env.VITE_BASE_PATH?.includes("localhost")
          ? "https://test.bridging.fi/logo.png"
          : `${import.meta.env.VITE_BASE_PATH}/logo.png`,
        name: "BridgeFi",
      },
      actionsConfiguration: {
        returnStrategy: "tg://resolve",
        modals: "all",
      },
      language: "en_US",
      uiPreferences: {
        theme: THEME.DARK,
      },
    }).then((wallet) => {
      wallet
        ?.openModal({
          namespaces: { btc: { chains: ["btc:mainnet"] } },
          sessionConfig: { redirect: "tg://resolve" },
        })
        .then(() => {
          // setWallet(wallet);
          onClose();
          // let okxBtcProvider = new OKXBtcProvider(wallet);
          // const address = result?.namespaces.btc.accounts[0].split(":")[2];

          // const pubkey =
          //   result?.namespaces.btc.extra?.["btc:mainnet"].publicKey;

          // console.log("address", address, "pubkey", pubkey);

          // const pubkeyBuffer = Buffer.from(pubkey, "hex");
          // const p2tr = bitcoin.payments.p2tr({
          //   internalPubkey: pubkeyBuffer,
          //   network: bitcoin.networks.bitcoin,
          // });

          // console.log("P2TR address:", p2tr.address, p2tr);

          // const p2tr2 = btc.p2tr(pubkeyBuffer);

          // console.log("p2tr2", p2tr2.address, p2tr2);
          // console.log("p2tr3", btc.p2tr_pk(pubkeyBuffer));

          // const addr = bitcoin.address.fromBech32(address);

          // console.log("addr", addr);

          // const scriptpubkey = Address.convertAdressToScriptPubkey(address);

          // console.log("scriptpubkey", bytesToHex(scriptpubkey), scriptpubkey);
          // console.log("pubkey", pubkey, hexToBytes(pubkey));
          // const pubkey2 = btc.utils.taprootTweakPubkey(
          //   pubkeyBuffer,
          //   Uint8Array.of(),
          // );

          // console.log("pubkey2", pubkey2, bytesToHex(pubkey2[0]));

          // return;
          // okxBtcProvider
          //   .signMessage("btc:mainnet", message, "bip322-simple")
          //   .then((sigStr) => {
          //     console.log("Base64 Signature:", sigStr);
          //     if (typeof sigStr !== "string" || !address) return;

          //     const valid = Verifier.verifySignature(address, message, sigStr);

          //     console.log("Valid:", valid);
          //   });
        });
    });
  };

  return (
    <>
      {connectedAddress ? (
        <Dropdown>
          <DropdownTrigger>
            <Button className="justify-between" variant="bordered">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {connectedAddress.slice(0, 6)}...
                    {connectedAddress.slice(-4)}
                  </span>
                  {network && network != "livenet" && (
                    <span className="text-xs text-orange-500">
                      {getNetworkDisplayName(network)}
                    </span>
                  )}
                </div>
              </div>
              <NavArrowDown className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Wallet actions">
            <DropdownItem
              key="network"
              isReadOnly
              className="cursor-default"
              endContent={
                <select
                  className="z-10 outline-none w-20 py-0.5 rounded-md text-tiny group-data-[hover=true]:border-default-500 border-small border-default-300 dark:border-default-200 bg-transparent text-default-500"
                  value={network || "livenet"}
                  onChange={(e) => switchNetwork(e.target.value as Network)}
                >
                  {["livenet", "testnet", "signet", "testnet4", "devnet"].map(
                    (network) => (
                      <option key={network} value={network}>
                        {getNetworkDisplayName(network as Network)}
                      </option>
                    ),
                  )}
                </select>
              }
            >
              Network
            </DropdownItem>
            <DropdownItem
              key="disconnect"
              color="danger"
              onPress={disconnectWallet}
            >
              Disconnect
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <>
          <Button isLoading={isLoading} onPress={onOpen}>
            Connect Wallet
          </Button>

          <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader>Choose wallet</ModalHeader>
                  <ModalBody>
                    {!import.meta.env.VITE_TESTNET && (
                      <Button onPress={() => connectOKX(onClose)}>OKX</Button>
                    )}
                    {wallets.map((wallet) => (
                      <Button
                        key={wallet.name}
                        onPress={async () => {
                          const w = wallet.wallet;

                          if (import.meta.env.VITE_TESTNET) {
                            await w.network
                              .then((network) => {
                                if (network == "livenet") {
                                  return w.switchNetwork("testnet");
                                }
                              })
                              .catch(() => {});
                          }
                          w.accounts
                            .catch(() => [])
                            .then((result) => {
                              if (!Array.isArray(result) || result.length == 0)
                                return w.requestAccounts();

                              return result;
                            })
                            .then((result) => {
                              const info = getAddressInfo(result[0]);

                              if (
                                import.meta.env.VITE_TESTNET &&
                                info.network == "mainnet"
                              ) {
                                throw new Error(
                                  `${result[0]} is not a testnet address`,
                                );
                              }

                              connectWalletAndSave(w, wallet.name, result[0]);
                              onClose();
                            })
                            .catch((error) => {
                              addToast({
                                title: error.name,
                                description: error.message,
                                color: "warning",
                              });
                            });
                        }}
                      >
                        {wallet.name}
                      </Button>
                    ))}
                  </ModalBody>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  );
};
