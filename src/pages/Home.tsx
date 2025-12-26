
// src/pages/Home.tsx
import React from 'react';
import { ConnectedGate } from '../components/ConnectedGate';
import { MyTokenPanel } from '../components/MyTokenPanel';
import { StakingPanel } from '../components/StakingPanel';
import { AccountBadge } from '../components/AccountBadge';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div style={{ display:'flex', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth: 960, padding: 16 }}>
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
        }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>DApp — MyToken & Staking</h1>
          <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
            <ThemeToggle />
            {isConnected && <AccountBadge />}
          </div>
        </header>

        <ConnectedGate>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap: 16 }}>
            <MyTokenPanel />
            <StakingPanel />
          </div>
        </ConnectedGate>
      </div>
    </div>
  );
}
``
