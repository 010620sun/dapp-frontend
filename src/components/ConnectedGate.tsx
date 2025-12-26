
// src/components/ConnectedGate.tsx
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export function ConnectedGate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();

  if (!isConnected) {    
      return (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 24,
          textAlign: 'center',
          background: 'var(--bg-soft)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <h3 style={{ marginTop: 0 }}>지갑을 연결해주세요</h3>
          <p style={{ color: 'var(--subtext)', marginTop: -8 }}>
            연결 후 토큰/스테이킹 기능이 활성화됩니다.
          </p>
          <div style={{ display: 'inline-block', marginTop: 12 }}>
            <ConnectButton />
          </div>
        </div>
      );
}

  return <>{children}</>;
}
