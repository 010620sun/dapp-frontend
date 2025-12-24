
export const env = {
  rpc: {
    local: import.meta.env.VITE_RPC_HTTP_LOCAL as string,
    sepolia: import.meta.env.VITE_RPC_HTTP_SEPOLIA as string | undefined,
  },
  chainId: {
    local: Number(import.meta.env.VITE_CHAIN_ID_LOCAL ?? 31337),
    sepolia: Number(import.meta.env.VITE_CHAIN_ID_SEPOLIA ?? 11155111),
  },
  mytoken: {
    local: import.meta.env.VITE_ERC20_ADDRESS_LOCAL as string | undefined,
    sepolia: import.meta.env.VITE_ERC20_ADDRESS_SEPOLIA as string | undefined,
  },
  staking: {
    local: import.meta.env.VITE_STAKING_ADDRESS_LOCAL as string | undefined,
    sepolia: import.meta.env.VITE_STAKING_ADDRESS_SEPOLIA as string | undefined,
  }
};
