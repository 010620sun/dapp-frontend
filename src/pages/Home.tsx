
// src/pages/Home.tsx
import React from 'react';
import { ConnectedGate } from '../components/ConnectedGate';
import { MyTokenPanel } from '../components/MyTokenPanel';
import { StakingPanel } from '../components/StakingPanel';
import { AccountBadge } from '../components/AccountBadge';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div style={{ maxWidth: 1024, margin: '0 auto', padding: 16 }}>
      {/* 헤더 영역 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>DApp — MyToken & Staking</h1>

        {/* ✅ 연결 전: 아무 것도 표시하지 않음, 연결 후: 계정 팝오버 버튼 */}
        {isConnected && <AccountBadge />}
      </div>

      {/* 본문: 연결 후에만 패널 활성화 */}
      <ConnectedGate>
        <div style={{ marginTop: 16 }}>
          <MyTokenPanel />
        </div>
        <div style={{ marginTop: 24 }}>
          <StakingPanel />
        </div>
      </ConnectedGate>
    </div>
  );
}
