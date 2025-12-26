
// src/components/AccountBadge.tsx
import React from 'react';
import { useAccount } from 'wagmi';
import { useAccountModal } from '@rainbow-me/rainbowkit';

/**
 * 연결된 경우 우측 상단에 표시되는 "계정" 버튼.
 * 클릭하면 RainbowKit의 Account Card 팝오버가 열린다.
 */
export const AccountBadge: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { openAccountModal } = useAccountModal();

  if (!isConnected) return null;

  const short = (a?: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '');

  return (
    <button
      onClick={() => openAccountModal?.()}
      title="계정 정보"
      style={{
        padding: '8px 12px',
        borderRadius: 'var(--radius-xs)',
        background: 'var(--primary)',
        color:  'var(--primary-contrast)',
        border: '1px solid var(--primary)',
        cursor: 'pointer',
      }}
    >
      {short(address)}
    </button>
  );
};
