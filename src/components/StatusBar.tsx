
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

  const Item: React.FC<{ label: string; value: React.ReactNode; tone?: 'default'|'success'|'danger' }> =
    ({ label, value, tone='default' }) => (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        border: '1px solid var(--border)',
        borderRadius: '999px',
        padding: '6px 10px',
        background: 'var(--bg-soft)',
        color: tone==='success' ? 'var(--success)' : tone==='danger' ? 'var(--danger)' : 'var(--text)',
        boxShadow: 'var(--shadow)'
      }}>
        <span style={{ fontSize: 12, color: 'var(--subtext)' }}>{label}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{value}</span>
      </div>
    );

  return (
    <div style={{
      width:  '100%',
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      padding: '8px 12px',
      background: 'var(--bg-soft)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
    }}>
      <Item label="지갑" value={isConnected ? short(address) : '미연결'} />
      <Item label="체인" value={currentChainId ?? chainId ?? '-'} />
      <Item label="Token" value={short(token)} />
      <Item label="Staking" value={short(staking)} />
      <Item
        label="상태"
        value={
          paused === true ? 'Paused ⏸️' :
          paused === false ? 'Active ▶️' : '-'
        }
        tone={paused === true ? 'danger' : paused === false ? 'success' : 'default'}
      />
    </div>
  );
};
