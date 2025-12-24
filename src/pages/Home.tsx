
import React from 'react';
import { ConnectedGate } from '../components/ConnectedGate';
import { MyTokenPanel } from '../components/MyTokenPanel';
import { StakingPanel } from '../components/StakingPanel';

export default function Home() {
  return (
    <div style={{ maxWidth: 960, margin:'40px auto', padding:'0 16px' }}>
      <h1 style={{ textAlign:'center' }}>지갑 연결 / MyToken + Staking</h1>

      <ConnectedGate>
        <MyTokenPanel />
        <div style={{ height:16 }} />
        <StakingPanel />
      </ConnectedGate>
    </div>
  );
}
