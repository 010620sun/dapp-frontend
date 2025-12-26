
// src/components/ConnectedGate.tsx
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export function ConnectedGate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <h3 style={{ marginTop: 0 }}>지갑을 연결해주세요</h3>
        {/* ✅ 본문 영역에서 연결 유도 */}
        <div style={{ display: 'inline-block', marginTop: 8 }}>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
