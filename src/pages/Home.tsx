
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h1>지갑 연결 테스트</h1>
      <ConnectButton />
    </div>
  );
}
