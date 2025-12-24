
// src/components/ConnectedGate.tsx
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export function ConnectedGate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  if (!isConnected) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
        <h2 style={{ margin:0 }}>지갑을 연결해 주세요</h2>
        <ConnectButton />
      </div>
    );
  }
  return <>{children}</>;
}
