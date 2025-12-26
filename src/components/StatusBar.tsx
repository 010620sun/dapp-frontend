
// src/components/StatusBar.tsx
import React from 'react';
import type { Address } from 'viem';
import { useAccount, useChainId } from 'wagmi';

type Props = {
  chainId?: number;
  token?: Address | undefined;
  staking?: Address | undefined;
  paused?: boolean | undefined;
};

export const StatusBar: React.FC<Props> = ({ chainId, token, staking, paused }) => {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const short = (a?: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '(unset)');

  return (
    <div style={{
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
      fontSize: 12,
      padding: '8px 12px',
      background: '#f8fafc',
      border: '1px solid #e5e7eb',
      borderRadius: 8
    }}>
      <span><strong>지갑</strong>: {isConnected ? short(address) : '미연결'}</span>
      <span><strong>체인</strong>: {currentChainId ?? chainId ?? '-'}</span>
      <span><strong>Token</strong>: {short(token)}</span>
      <span><strong>Staking</strong>: {short(staking)}</span>
      <span>
        <strong>상태</strong>:{' '}
        {paused === true ? <span style={{ color: '#ef4444' }}>Paused ⏸️</span> :
         paused === false ? <span style={{ color: '#10b981' }}>Active ▶️</span> :
         '-'}
      </span>
    </div>
  );
};
``
