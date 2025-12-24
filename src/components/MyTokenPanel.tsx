
// src/components/MyTokenPanel.tsx
import React, { useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { Address } from 'viem';
import { parseUnits, formatUnits } from 'viem';
import { MYTOKEN_ABI } from '../abi/MyToken';
import { env } from '../app/env';

// 간단한 주소/체인 → 토큰 주소 매핑
function resolveAddress(chainId?: number): Address | undefined {
  if (!chainId) return undefined;
  if (chainId === env.chainId.local && env.mytoken.local) return env.mytoken.local as Address;
  if (chainId === env.chainId.sepolia && env.mytoken.sepolia) return env.mytoken.sepolia as Address;
  return undefined;
}
function isAddress(addr?: string): addr is Address {
  return !!addr && /^0x[a-fA-F0-9]{40}$/.test(addr);
}

export const MyTokenPanel: React.FC = () => {
  const { address: me, isConnected } = useAccount();
  const chainId = useChainId();
  const address = resolveAddress(chainId);

  // 입력 상태
  const [spender, setSpender] = useState<string>('');
  const [approveAmt, setApproveAmt] = useState<string>('');
  const [transferTo, setTransferTo] = useState<string>('');
  const [transferAmt, setTransferAmt] = useState<string>('');
  const [tfFrom, setTfFrom] = useState<string>('');
  const [tfTo, setTfTo] = useState<string>('');
  const [tfAmt, setTfAmt] = useState<string>('');

  const canUse = isConnected && !!address;

  // ------- Reads -------
  const { data: name } = useReadContract({
    address, abi: MYTOKEN_ABI, functionName: 'name',
    query: { enabled: !!address },
  });
  const { data: symbol } = useReadContract({
    address, abi: MYTOKEN_ABI, functionName: 'symbol',
    query: { enabled: !!address },
  });
  const { data: decimals } = useReadContract({
    address, abi: MYTOKEN_ABI, functionName: 'decimals',
    query: { enabled: !!address },
  });
  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address, abi: MYTOKEN_ABI, functionName: 'totalSupply',
    query: { enabled: !!address },
  });
  const { data: paused } = useReadContract({
    address, abi: MYTOKEN_ABI, functionName: 'paused',
    query: { enabled: !!address },
  });
  const { data: myBalance, refetch: refetchMyBalance } = useReadContract({
    address, abi: MYTOKEN_ABI, functionName: 'balanceOf', args: [me!],
    query: { enabled: !!address && !!me },
  });

  // allowance는 버튼으로 조회(필요할 때만 네트워크 호출)
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address, abi: MYTOKEN_ABI, functionName: 'allowance', args: [me!, spender as Address],
    // 입력이 올바를 때만 수동 조회
    query: { enabled: false },
  });

  // ------- Writes -------
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const disabledWrite = !canUse || !!paused || isPending || isConfirming || !decimals;

  const doApprove = async () => {
    if (!address || !decimals) return;
    if (!isAddress(spender) || !approveAmt.trim()) return;
    writeContract({
      address, abi: MYTOKEN_ABI, functionName: 'approve',
      args: [spender as Address, parseUnits(approveAmt, Number(decimals))],
    });
  };

  const doTransfer = async () => {
    if (!address || !decimals) return;
    if (!isAddress(transferTo) || !transferAmt.trim()) return;
    writeContract({
      address, abi: MYTOKEN_ABI, functionName: 'transfer',
      args: [transferTo as Address, parseUnits(transferAmt, Number(decimals))],
    });
  };

  const doTransferFrom = async () => {
    if (!address || !decimals) return;
    if (!isAddress(tfFrom) || !isAddress(tfTo) || !tfAmt.trim()) return;
    writeContract({
      address, abi: MYTOKEN_ABI, functionName: 'transferFrom',
      args: [tfFrom as Address, tfTo as Address, parseUnits(tfAmt, Number(decimals))],
    });
  };

  // 트랜잭션 완료 후 상태 갱신
  const afterSuccess = async () => {
    if (isSuccess) {
      refetchMyBalance?.();
      refetchTotalSupply?.();
      if (allowance !== undefined) {
        // spender 입력이 유효하면 허용량도 갱신
        isAddress(spender) && refetchAllowance?.();
      }
    }
  };
  if (isSuccess) {
    // 간단히 후처리 트리거 (렌더 타이밍 겹침 방지용)
    setTimeout(afterSuccess, 0);
  }

  return (
    <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:16, maxWidth:900, margin:'0 auto' }}>
      <h2 style={{ marginTop:0 }}>MyToken 패널</h2>

      {!canUse && (
        <p style={{ color:'#ef4444' }}>
          지갑을 연결하고, 현재 체인({chainId})의 MyToken 주소를 .env에 설정해 주세요.
        </p>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div>
          <div><strong>토큰</strong>: {String(name)} ({String(symbol)})</div>
          <div>decimals: {Number(decimals ?? 0)}</div>
          <div>상태: {paused ? <span style={{ color:'#ef4444' }}>Paused ⏸️</span> : <span style={{ color:'#10b981' }}>Active ▶️</span>}</div>
        </div>
        <div>
          <div><strong>총 발행량</strong>: {decimals != null && totalSupply != null ? `${formatUnits(totalSupply as bigint, Number(decimals))} ${String(symbol)}` : '...'}</div>
          <div><strong>내 잔액</strong>: {decimals != null && myBalance != null ? `${formatUnits(myBalance as bigint, Number(decimals))} ${String(symbol)}` : '...'}</div>
        </div>
      </div>

      <hr style={{ margin:'16px 0' }} />

      <section style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Approve / Allowance */}
        <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
          <h3 style={{ marginTop:0 }}>Approve / Allowance</h3>
          <label>Spender 주소
            <input value={spender} onChange={(e)=>setSpender(e.target.value)} placeholder="0x..." style={{ width:'100%', padding:8, marginTop:6 }} />
          </label>
          <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:8 }}>
            <button
              onClick={() => isAddress(spender) && refetchAllowance?.()}
              disabled={!canUse}
            >
              허용량 조회
            </button>
            <span style={{ fontFamily:'monospace' }}>
              {decimals != null && allowance != null ? `${formatUnits(allowance as bigint, Number(decimals))} ${String(symbol)}` : ''}
            </span>
          </div>
          <label style={{ marginTop:8, display:'block' }}>승인 수량 ({String(symbol) || ''})
            <input value={approveAmt} onChange={(e)=>setApproveAmt(e.target.value)} placeholder="100" style={{ width:'100%', padding:8, marginTop:6 }} />
          </label>
          <div style={{ marginTop:10, display:'flex', gap:8 }}>
            <button onClick={doApprove} disabled={disabledWrite}>승인하기</button>
            {/* 최대 승인 */}
            <button
              type="button"
              onClick={() => setApproveAmt('115792089237316195423570985008687907853269984665640564039457584007913129639935')}
              disabled={!canUse || !!paused}
              title="최대치로 승인"
            >
              Max
            </button>
          </div>
        </div>

        {/* Transfer */}
        <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
          <h3 style={{ marginTop:0 }}>Transfer</h3>
          <label>수신자 주소
            <input value={transferTo} onChange={(e)=>setTransferTo(e.target.value)} placeholder="0x..." style={{ width:'100%', padding:8, marginTop:6 }} />
          </label>
          <label style={{ marginTop:8, display:'block' }}>수량 ({String(symbol) || ''})
            <input value={transferAmt} onChange={(e)=>setTransferAmt(e.target.value)} placeholder="10.5" style={{ width:'100%', padding:8, marginTop:6 }} />
          </label>
          <button onClick={doTransfer} disabled={disabledWrite} style={{ marginTop:10 }}>
            전송하기
          </button>
          {!!paused && <p style={{ color:'#ef4444', marginTop:8 }}>현재 Paused 상태에서는 전송/승인이 제한됩니다.</p>}
        </div>
      </section>

      {/* 선택: TransferFrom (spender용) */}
      <section style={{ marginTop:16 }}>
        <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
          <h3 style={{ marginTop:0 }}>TransferFrom (옵션)</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <label>From
              <input value={tfFrom} onChange={(e)=>setTfFrom(e.target.value)} placeholder="0x..." style={{ width:'100%', padding:8, marginTop:6 }} />
            </label>
            <label>To
              <input value={tfTo} onChange={(e)=>setTfTo(e.target.value)} placeholder="0x..." style={{ width:'100%', padding:8, marginTop:6 }} />
            </label>
          </div>
          <label style={{ marginTop:8, display:'block' }}>수량 ({String(symbol) || ''})
            <input value={tfAmt} onChange={(e)=>setTfAmt(e.target.value)} placeholder="5" style={{ width:'100%', padding:8, marginTop:6 }} />
          </label>
          <button onClick={doTransferFrom} disabled={disabledWrite} style={{ marginTop:10 }}>
            TransferFrom 실행
          </button>
          <p style={{ fontSize:12, marginTop:8 }}>
            * 현재 계정이 <code>spender</code>로서 <code>from</code> 주소로부터 충분한 허용량(approve)을 보유해야 성공합니다.
          </p>
        </div>
      </section>

      {/* Tx 상태 표시 */}
      {(isPending || isConfirming || isSuccess || error) && (
        <div style={{ marginTop:12, fontSize:12 }}>
          {isPending && <span>트랜잭션 서명 대기 중...</span>}
          {isConfirming && <span style={{ marginLeft:8 }}>확인 중...</span>}
          {isSuccess && <span style={{ color:'#10b981', marginLeft:8 }}>확정됨 ✅</span>}
          {error && <div style={{ color:'#ef4444' }}>오류: {String(error.message ?? error)}</div>}
          {hash && <div>Tx: <code>{hash}</code></div>}
        </div>
      )}
    </div>
  );
};
