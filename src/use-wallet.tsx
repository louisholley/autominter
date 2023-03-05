import { ContractAbstraction, TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { PermissionScope } from "@airgap/beacon-types";
import { Network, NetworkType, SigningType } from "@airgap/beacon-types";
import { InMemorySigner } from "@taquito/signer";
import { createContext, ReactNode, useContext, useState } from "react";
import { storage } from "./utils/storage";

const toolkit = new TezosToolkit("https://mainnet.tezos.marigold.dev/");
// const toolkit = new TezosToolkit("https://ghostnet.tezos.marigold.dev/");

type Wallet = {
  address: string | null;
  getContract: (address: string) => Promise<ContractAbstraction<any>>;
  setSigner: (privateKey: string) => void;
};

const WalletContext = createContext<Wallet>({} as Wallet);
const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  address?: string | null;
  children: ReactNode;
}

const WalletProvider = ({
  address: initialAddress,
  children,
}: WalletProviderProps) => {
  const [wallet] = useState(
    new BeaconWallet({
      name: "autominter",
      // preferredNetwork: NetworkType.GHOSTNET,
    })
  );
  const [address, setAddress] = useState<string | null>(initialAddress || null);

  const setSigner = async (privateKey: string) => {
    toolkit.setProvider({
      signer: new InMemorySigner(privateKey),
    });
  };

  const getContract = async (address: string) => {
    return toolkit.wallet.at(address);
  };

  return (
    <WalletContext.Provider
      value={{
        getContract,
        setSigner,
        address,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export { WalletProvider, useWallet };
