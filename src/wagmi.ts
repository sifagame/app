import { http, createConfig } from "wagmi";
import { arbitrum, arbitrumSepolia, hardhat } from "wagmi/chains";
import type { Chain } from "wagmi/chains";
import GA from "react-ga4";

const trackingId = import.meta.env.VITE_ANALYTICS_ID;
GA.initialize(trackingId);

const chainId = Number.parseInt(import.meta.env.VITE_NETWORK_ID);
const chain = [arbitrum, arbitrumSepolia, hardhat].find(
  (c) => c.id === chainId
);

export const config = createConfig({
  chains: [chain as Chain],
  connectors: [],
  transports: {
    [chainId]: http(),
  },
});

export const contracts = {
  SIFA: import.meta.env.VITE_ADDRESS_SIFA,
  Faucet: import.meta.env.VITE_ADDRESS_FAUCET,
  Emitter: import.meta.env.VITE_ADDRESS_EMITTER,
  Vault: import.meta.env.VITE_ADDRESS_VAULT,
};

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
