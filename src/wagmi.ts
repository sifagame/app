import { http, createConfig } from "wagmi";
import { arbitrum, arbitrumSepolia, hardhat } from "wagmi/chains";

export const config = createConfig({
  chains: [arbitrum, arbitrumSepolia, hardhat],
  connectors: [],
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
