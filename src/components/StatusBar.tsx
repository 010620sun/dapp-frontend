
import React from 'react';
import type { Address } from 'viem';

type Props = {
  chainId?: number;
  token?: Address | undefined;
  staking?: Address | undefined;
  paused?: boolean | undefined;
};

export const StatusBar: React.FC<Props> = ({ chainId, token, staking, paused }) => {
  const Item = ({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) => (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      gap: 6, padding: '6px 10px', borderRadius: 999,
      background: color ?? '#f3f4f6', fontSize: 12
    }}>
      <strong style={{ color: '#111827' }}>{label}</strong>
      <span style={{ fontFamily: 'monospace' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0 16px' }}>
      <Item label="Chain" value={chainId ?? 'N/A'} />
      <Item label="MyToken" value={token ?? 'N/A'} />
      <Item label="Staking" value={staking ?? 'N/A'} />
      <Item
        label="Paused"
        value={paused === undefined ? 'N/A' : paused ? 'true' : 'false'}
        color={paused ? '#fee2e2' : '#e4fbf1'}
      />
    </div>
  );
};
