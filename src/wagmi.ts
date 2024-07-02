import { http, createConfig } from "wagmi";
import { arbitrum, arbitrumSepolia, hardhat } from "wagmi/chains";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [arbitrum, arbitrumSepolia, hardhat],
  connectors: [
    // metaMask(),
    // coinbaseWallet(),
    // walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
  ],
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
    [hardhat.id]: http(),
  },
});

export const contracts = {
  SIFA: import.meta.env.VITE_ADDRESS_SIFA,
  Faucet: import.meta.env.VITE_ADDRESS_FAUCET,
};

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
