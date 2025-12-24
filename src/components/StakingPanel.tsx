
import React, { useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { Address } from 'viem';
import { parseUnits, formatUnits } from 'viem';
import { STAKING_ABI } from '../abi/Staking';
import { MYTOKEN_ABI } from '../abi/MyToken';
import { env } from '../app/env';

// 주소 유효성
function isAddress(addr?: string): addr is Address {
  return !!addr && /^0x[a-fA-F0-9]{40}$/.test(addr);
}

// 체인별 주소 매핑 (staking / token)
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

  const staking = resolveStaking(chainId);
  const token   = resolveToken(chainId);

  const canUse = isConnected && !!staking && !!token;

  // --- 토큰 메타 ---
  const { data: symbol } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'symbol',
    query: { enabled: !!token },
  });
  const { data: decimals } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'decimals',
    query: { enabled: !!token },
  });
  const dec = Number(decimals ?? 18);

  // paused 상태: approve/stake/unstake 비활성 (finalizeReward는 가능)
  const { data: paused } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'paused',
    query: { enabled: !!token },
  });

  // --- 내 지갑의 토큰 잔액 & 허용량(스테이킹 컨트랙트에 대한) ---
  const { data: myWalletBalance, refetch: refetchWalletBalance } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'balanceOf', args: [me!],
    query: { enabled: !!token && !!me },
  });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'allowance', args: [me!, staking!],
    query: { enabled: false }, // 버튼으로만 조회
  });

  // --- 스테이킹 상태 ---
  const { data: staked, refetch: refetchStaked } = useReadContract({
    address: staking, abi: STAKING_ABI, functionName: 'getStaked', args: [me!],
    query: { enabled: !!staking && !!me },
  });

  // 👉 earned(예상 보상): 자동 갱신 제거, 버튼으로만 조회
  const { data: earnedNow, refetch: refetchEarned } = useReadContract({
    address: staking, abi: STAKING_ABI, functionName: 'earned', args: [me!],
    query: { enabled: false },
  });

  // --- 입력값 ---
  const [approveAmt, setApproveAmt] = useState<string>('');
  const [stakeAmt, setStakeAmt]     = useState<string>('');
  const [unstakeAmt, setUnstakeAmt] = useState<string>('');

  // --- Writes ---
  const { data: txHash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const disabledWriteToken   = !canUse || !!paused || isPending || isConfirming || !decimals;
  const disabledWriteStaking = !canUse || isPending || isConfirming || !decimals;

  const onApprove = async () => {
    if (!token || !staking || !approveAmt.trim()) return;
    writeContract({
      address: token, abi: MYTOKEN_ABI, functionName: 'approve',
      args: [staking, parseUnits(approveAmt, dec)],
    });
  };

  const onStake = async () => {
    if (!staking || !stakeAmt.trim()) return;
    writeContract({
      address: staking, abi: STAKING_ABI, functionName: 'stake',
      args: [parseUnits(stakeAmt, dec)],
    });
  };

  const onUnstake = async () => {
    if (!staking || !unstakeAmt.trim()) return;
    writeContract({
      address: staking, abi: STAKING_ABI, functionName: 'unstake',
      args: [parseUnits(unstakeAmt, dec)],
    });
  };

  const onFinalize = async () => {
    if (!staking) return;
    writeContract({
      address: staking, abi: STAKING_ABI, functionName: 'finalizeReward',
      args: [],
    });
  };

  // Tx 확정 후 상태 갱신 (필요한 것만)
  useEffect(() => {
    if (!isSuccess) return;
    (async () => {
      await Promise.allSettled([
        refetchWalletBalance?.(),
        refetchAllowance?.(),
        refetchStaked?.(),
        // earned는 자동 갱신하지 않음
      ]);
    })();
  }, [isSuccess, refetchWalletBalance, refetchAllowance, refetchStaked]);

  return (
    <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:16, maxWidth:900, margin:'0 auto' }}>
      <h2 style={{ marginTop:0 }}>Staking 패널</h2>

      {!canUse && (
        <p style={{ color:'#ef4444' }}>
          지갑을 연결하고, 현재 체인({chainId})의 MyToken / Staking 주소를 .env에 설정해 주세요.
        </p>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div>
          <div><strong>토큰</strong>: {String(symbol) || 'MTK'}</div>
          <div>decimals: {dec}</div>
          <div>상태: {paused ? <span style={{ color:'#ef4444' }}>Paused ⏸️</span> : <span style={{ color:'#10b981' }}>Active ▶️</span>}</div>
        </div>
        <div>
          <div><strong>지갑 잔액</strong>: {myWalletBalance != null ? `${formatUnits(myWalletBalance as bigint, dec)} ${String(symbol)}` : '...'}</div>
          <div><strong>스테이킹 중</strong>: {staked != null ? `${formatUnits(staked as bigint, dec)} ${String(symbol)}` : '...'}</div>
        </div>
      </div>

      <hr style={{ margin:'16px 0' }} />

      {/* 허용량/승인 */}
      <section style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
        <h3 style={{ marginTop:0 }}>Approve (Staking용)</h3>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => refetchAllowance?.()} disabled={!canUse}>허용량 조회</button>
          <span style={{ fontFamily:'monospace' }}>
            {allowance != null ? `${formatUnits(allowance as bigint, dec)} ${String(symbol)}` : ''}
          </span>
        </div>
        <label style={{ display:'block', marginTop:8 }}>승인 수량 ({String(symbol) || ''})
          <input value={approveAmt} onChange={(e)=>setApproveAmt(e.target.value)} placeholder="100"
                 style={{ width:'100%', padding:8, marginTop:6 }} />
        </label>
        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          <button onClick={onApprove} disabled={disabledWriteToken}>승인하기</button>
          <button
            type="button"
            onClick={() => setApproveAmt('115792089237316195423570985008687907853269984665640564039457584007913129639935')}
            disabled={!canUse || !!paused}
            title="최대치로 승인"
          >
            Max
          </button>
        </div>
        {!!paused && <p style={{ color:'#ef4444', marginTop:8 }}>현재 Paused 상태에서는 승인/전송/스테이킹이 제한됩니다.</p>}
      </section>

      {/* 스테이킹 / 언스테이킹 */}
      <section style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
        <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
          <h3 style={{ marginTop:0 }}>Stake</h3>
          <label>수량 ({String(symbol) || ''})
            <input value={stakeAmt} onChange={(e)=>setStakeAmt(e.target.value)} placeholder="50"
                   style={{ width:'100%', padding:8, marginTop:6 }} />
          </label>
          <button onClick={onStake} disabled={disabledWriteToken} style={{ marginTop:10 }}>
            스테이크
          </button>
          <p style={{ fontSize:12, marginTop:8 }}>
            * 허용량이 부족하면 실패합니다. 먼저 Approve로 Staking 컨트랙트에 충분한 허용량을 부여하세요.
          </p>
        </div>

        <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
          <h3 style={{ marginTop:0 }}>Unstake</h3>
          <label>수량 ({String(symbol) || ''})
            <input value={unstakeAmt} onChange={(e)=>setUnstakeAmt(e.target.value)} placeholder="10"
                   style={{ width:'100%', padding:8, marginTop:6 }} />
          </label>
          <button onClick={onUnstake} disabled={disabledWriteToken} style={{ marginTop:10 }}>
            언스테이크
          </button>
        </div>
      </section>

      {/* 보상: earned만 버튼으로 조회 */}
      <section style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12, marginTop:16 }}>
        <h3 style={{ marginTop:0 }}>Reward (예상 보상)</h3>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => refetchEarned?.()} disabled={!canUse}>예상 보상 조회</button>
          <span style={{ fontFamily:'monospace' }}>
            {earnedNow != null ? `${formatUnits(earnedNow as bigint, dec)} ${String(symbol)}` : '(조회 전)'}
          </span>
        </div>

        <div style={{ marginTop:12 }}>
          <button onClick={onFinalize} disabled={disabledWriteStaking}>
            보상 수령(finalizeReward)
          </button>
          <p style={{ fontSize:12, marginTop:8 }}>
            * finalizeReward는 토큰 <code>mint</code>로 보상을 지급합니다. Paused 상태에서도 가능합니다.
          </p>
        </div>
      </section>

      {/* Tx 상태 */}
      {(isPending || isConfirming || isSuccess || error) && (
        <div style={{ marginTop:12, fontSize:12 }}>
          {isPending && <span>트랜잭션 서명 대기 중...</span>}
          {isConfirming && <span style={{ marginLeft:8 }}>확인 중...</span>}
          {isSuccess && <span style={{ color:'#10b981', marginLeft:8 }}>확정됨 ✅</span>}
          {error && <div style={{ color:'#ef4444' }}>오류: {String(error.message ?? error)}</div>}
          {txHash && <div>Tx: <code>{txHash}</code></div>}
        </div>
      )}
    </div>
  );
};
