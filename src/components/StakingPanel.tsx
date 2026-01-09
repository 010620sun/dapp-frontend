
// src/components/StakingPanel.tsx
import React, { useEffect, useState } from 'react';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { Address } from 'viem';
import { parseUnits, formatUnits } from 'viem';
import { STAKING_ABI } from '../abi/Staking';
import { MYTOKEN_ABI } from '../abi/MyToken';
import { env } from '../app/env';
import { isAddress, eqAddress } from '../utils/address';
import { StatusBar } from './StatusBar';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

function resolveStaking(chainId?: number): Address | undefined {
  if (!chainId) return undefined;
  if (chainId === env.chainId.local && env.staking.local) return env.staking.local as Address;
  if (chainId === env.chainId.sepolia && env.staking.sepolia) return env.staking.sepolia as Address;
  return undefined;
}
function resolveToken(chainId?: number): Address | undefined {
  if (!chainId) return undefined;
  if (chainId === env.chainId.local && env.mytoken.local) return env.mytoken.local as Address;
  if (chainId === env.chainId.sepolia && env.mytoken.sepolia) return env.mytoken.sepolia as Address;
  return undefined;
}

export const StakingPanel: React.FC = () => {
  const { address: me, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const staking = resolveStaking(chainId);
  const token = resolveToken(chainId);
  const addressesOk =
    isAddress(token) &&
    isAddress(staking) &&
    !eqAddress(token, staking);

  // 토큰 메타/상태
  const { data: symbol } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'symbol',
    query: { enabled: addressesOk },
  });
  const { data: decimals } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'decimals',
    query: { enabled: addressesOk },
  });
  const dec = Number(decimals ?? 18);
  const { data: paused } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'paused',
    query: { enabled: addressesOk },
  });

  // 잔액/허용량/스테이킹 상태
  const { data: myWalletBalance, refetch: refetchWalletBalance } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'balanceOf', args: [me!],
    query: { enabled: addressesOk && !!me },
  });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'allowance', args: [me!, staking!],
    query: { enabled: false }, // 수동 조회
  });
  const { data: staked, refetch: refetchStaked } = useReadContract({
    address: staking, abi: STAKING_ABI, functionName: 'getStaked', args: [me!],
    query: { enabled: addressesOk && !!me },
  });
  const { data: earnedNow, refetch: refetchEarned } = useReadContract({
    address: staking, abi: STAKING_ABI, functionName: 'earned', args: [me!],
    query: { enabled: false },
  });

  const [stakeAmt, setStakeAmt] = useState<string>('');
  const [unstakeAmt, setUnstakeAmt] = useState<string>('');

  const { data: txHash, writeContract, writeContractAsync, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const canUse = isConnected && addressesOk;
  const disabledWriteToken =
    !canUse ||
    !!paused ||
    isPending ||
    isConfirming ||
    !decimals;
  const disabledWriteStaking =
    !canUse ||
    isPending ||
    isConfirming ||
    !decimals;

  // ✅ Write 성공 시 입력들 초기화(B 전략)
  useEffect(() => {
    if (!isSuccess) return;
    const id = setTimeout(() => {
      setStakeAmt('');
      setUnstakeAmt('');
    }, 0);
    return () => clearTimeout(id);
  }, [isSuccess]);

  // ✅ 지갑 연결 해제 시 입력 초기화
  useEffect(() => {
    if (isConnected) return;
    setStakeAmt('');
    setUnstakeAmt('');
  }, [isConnected]);

  const onQueryEarned = async () => {
    await refetchEarned?.();
  };

  // ✅ 자동 승인 후 스테이킹
  const onStake = async () => {
    if (!staking || !token || !stakeAmt.trim()) return;
    const amount = parseUnits(stakeAmt, dec);

    // 1) 최신 허용량 확인
    let current = allowance as bigint | null;
    if (current == null) {
      const res = await refetchAllowance?.();
      current = (res?.data ?? null) as bigint | null;
    }

    // 2) 부족하면 필요한 만큼 approve
    if ((current ?? 0n) < amount) {
      const approveHash = await writeContractAsync({
        address: token,
        abi: MYTOKEN_ABI,
        functionName: 'approve',
        args: [staking, amount],
      });
      await publicClient?.waitForTransactionReceipt({ hash: approveHash as `0x${string}` });
      await refetchAllowance?.(); // UI 반영
    }

    // 3) stake 실행
    const stakeHash = await writeContractAsync({
      address: staking,
      abi: STAKING_ABI,
      functionName: 'stake',
      args: [amount],
    });
    await publicClient?.waitForTransactionReceipt({ hash: stakeHash as `0x${string}` });
    // 완료 후 상태 갱신
    await Promise.allSettled([
      refetchWalletBalance?.(),
      refetchStaked?.(),
    ]);
  };

  const onUnstake = async () => {
    if (!staking || !unstakeAmt.trim()) return;
    const amount = parseUnits(unstakeAmt, dec);
    const unstakeHash = await writeContractAsync({
      address: staking,
      abi: STAKING_ABI,
      functionName: 'unstake',
      args: [amount],
    });
    await publicClient?.waitForTransactionReceipt({ hash: unstakeHash as `0x${string}` });
    await Promise.allSettled([
      refetchWalletBalance?.(),
      refetchStaked?.(),
    ]);
  };

  const onFinalize = async () => {
    if (!staking) return;
    writeContract({ address: staking, abi: STAKING_ABI, functionName: 'finalizeReward', args: [] });
  };

  const statusBar = (
    <StatusBar
      chainId={chainId}
      token={token}
      staking={staking}
      paused={paused as boolean | undefined}
    />
  );

  if (!addressesOk) {
    return (
      <div style={{ width: '100%' }}>
        <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>Staking 패널</h2>
        {statusBar}
        <Card title="주소 설정 오류" note=".env.local의 VITE_MYTOKEN_ADDRESS_*과 VITE_STAKING_ADDRESS_* 값을 확인하세요. 두 주소는 모두 유효해야 하며 서로 달라야 합니다.">
          <ul style={{ fontFamily: 'monospace', margin: 0 }}>
            <li>token: {String(token ?? '(unset)')}</li>
            <li>staking: {String(staking ?? '(unset)')}</li>
          </ul>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>Staking 패널</h2>
      {statusBar}

      {/* 요약 카드 */}
      <Card>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16 }}>
          <div>
            <div>
              <strong>지갑 잔액</strong>:{' '}
              {decimals != null && myWalletBalance != null
                ? `${formatUnits(myWalletBalance as bigint, dec)} ${String(symbol)}`
                : '...'}
            </div>
          </div>
          <div>
              <div>
                <strong>내 스테이킹 잔량</strong>:{' '}
                {decimals != null && staked != null
                  ? `${formatUnits(staked as bigint, dec)} ${String(symbol)}`
                  : '...'}
              </div>
          </div>
        </div>
      </Card>

      {/* Stake / Unstake */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <Card title="Stake">
          <Input
            label={`수량 (${String(symbol) ?? ''})`}
            placeholder="50"
            value={stakeAmt}
            onChange={(e) => setStakeAmt(e.target.value)}
          />
          <Button
            variant="primary"
            onClick={onStake}
            disabled={disabledWriteToken}
            style={{ marginTop: 10 }}
          >
            스테이킹
          </Button>
          {!!paused && (
            <p style={{ color: 'var(--danger)', marginTop: 8 }}>
              현재 Paused 상태에서는 승인/전송/스테이킹이 제한됩니다.
            </p>
          )}
        </Card>

        <Card title="Unstake">
          <Input
            label={`수량 (${String(symbol) ?? ''})`}
            placeholder="10"
            value={unstakeAmt}
            onChange={(e) => setUnstakeAmt(e.target.value)}
          />
          <Button
            onClick={onUnstake}
            disabled={disabledWriteToken}
            style={{ marginTop: 10 }}
          >
            언스테이킹
          </Button>
        </Card>
      </div>

      {/* Reward */}
      <Card title="Reward (예상 보상)" note="필요할 때만 조회합니다.">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button onClick={onQueryEarned} disabled={!canUse}>예상 보상 조회</Button>
          <span style={{ fontFamily: 'monospace' }}>
            {earnedNow != null
              ? `${formatUnits(earnedNow as bigint, dec)} ${String(symbol)}`
              : '(조회 전)'}
          </span>
        </div>
        <div style={{ marginTop: 12 }}>
          <Button onClick={onFinalize} disabled={disabledWriteStaking}>
            보상 수령(finalizeReward)
          </Button>
          <p style={{ fontSize: 12, color: 'var(--subtext)', marginTop: 8 }}>
            * finalizeReward는 토큰 <code>mint</code>로 보상을 지급합니다. Paused 상태에서도 가능합니다.
          </p>
        </div>
      </Card>

      {/* Tx 상태 표시 */}
      {(isPending || isConfirming || isSuccess || error) && (
        <div style={{ marginTop: 12, fontSize: 12 }}>
          {isPending && <span>트랜잭션 서명 대기 중…</span>}
          {isConfirming && <span style={{ marginLeft: 8 }}>확인 중…</span>}
          {isSuccess && <span style={{ color: 'var(--success)', marginLeft: 8 }}>확정됨 ✅</span>}
          {error && <div style={{ color: 'var(--danger)' }}>오류: {String(error.message ?? error)}</div>}
          {txHash && <div>Tx: <code>{txHash}</code></div>}
        </div>
      )}
    </div>
  );
};
