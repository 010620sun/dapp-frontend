
import React from 'react';
import { ConnectedGate } from '../components/ConnectedGate';
import { MyTokenPanel } from '../components/MyTokenPanel';

export default function Home() {
  return (
    <div style={{ maxWidth: 960, margin:'40px auto', padding:'0 16px' }}>
      <h1 style={{ textAlign:'center' }}>지갑 연결 / MyToken</h1>
      <ConnectedGate>
        <MyTokenPanel />
      </ConnectedGate>
    </div>
  );
}
``
