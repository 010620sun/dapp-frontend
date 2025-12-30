
import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultConfig,lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, defineChain } from 'viem';
import { sepolia } from 'wagmi/chains'


const queryClient = new QueryClient();

const hardhatLocal = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  network: 'hardhat',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
});

const config = getDefaultConfig({
  appName: 'My Dapp',
  projectId: '2f22e523669af2a8e27857cf9c8eb012',
  chains: [sepolia, hardhatLocal],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL ?? undefined),
    [hardhatLocal.id]: http('http://127.0.0.1:8545'),
  },
});

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      {/* ✅ chains prop 제거 */}
      <RainbowKitProvider
        theme={lightTheme({
        accentColor: '#2563eb',
        accentColorForeground: '#ffffff',
        borderRadius: 'medium',
        fontStack: 'system',
        overlayBlur: 'small',
        })}
      >
        {children}
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
