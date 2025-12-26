
// src/components/MyTokenPanel.tsx
import React, { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { Address } from 'viem';
import { parseUnits, formatUnits } from 'viem';
import { MYTOKEN_ABI } from '../abi/MyToken';
import { env } from '../app/env';
import { isAddress } from '../utils/address';
import { StatusBar } from './StatusBar';

// 디자인 컴포넌트
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

// 체인에 따라 MyToken 주소 해석
function resolveToken(chainId?: number): Address | undefined {
  if (!chainId) return undefined;
  if (chainId === env.chainId.local && env.mytoken.local) return env.mytoken.local as Address;
  if (chainId === env.chainId.sepolia && env.mytoken.sepolia) return env.mytoken.sepolia as Address;
  return undefined;
}
function isAddr(addr?: string): addr is Address {
  return isAddress(addr);
}

export const MyTokenPanel: React.FC = () => {
  const { address: me, isConnected } = useAccount();
  const chainId = useChainId();
  const token = resolveToken(chainId);

  // 주소 가드: 토큰 주소가 유효해야 기능 활성화
  const addressOk = isAddr(token);

  // 입력 상태
  const [spender, setSpender] = useState<string>('');
  const [approveAmt, setApproveAmt] = useState<string>('');
  const [transferTo, setTransferTo] = useState<string>('');
  const [transferAmt, setTransferAmt] = useState<string>('');
  const [tfFrom, setTfFrom] = useState<string>('');
  const [tfTo, setTfTo] = useState<string>('');
  const [tfAmt, setTfAmt] = useState<string>('');

  const canUse = isConnected && addressOk;

  // --- Reads ---
  const { data: name } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'name',
    query: { enabled: addressOk },
  });
  const { data: symbol } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'symbol',
    query: { enabled: addressOk },
  });
  const { data: decimals } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'decimals',
    query: { enabled: addressOk },
  });
  const dec = Number(decimals ?? 18);

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'totalSupply',
    query: { enabled: addressOk },
  });
  const { data: paused } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'paused',
    query: { enabled: addressOk },
  });
  const { data: myBalance, refetch: refetchMyBalance } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'balanceOf', args: [me!],
    query: { enabled: addressOk && !!me },
  });

  // allowance는 버튼으로 수동 조회(필요할 때만 네트워크 호출)
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token, abi: MYTOKEN_ABI, functionName: 'allowance', args: [me!, spender as Address],
    query: { enabled: false },
  });

  // --- Writes ---
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const disabledWrite =
    !canUse ||
    !!paused ||
    isPending ||
    isConfirming ||
    !decimals;

  // ✅ Write 성공 시 입력들 초기화(B 전략)
  useEffect(() => {
    if (!isSuccess) return;
    // 다음 tick에서 안전하게 반영
    const id = setTimeout(() => {
      setApproveAmt('');
      setTransferTo('');
      setTransferAmt('');
      setTfFrom('');
      setTfTo('');
      setTfAmt('');
    }, 0);
    return () => clearTimeout(id);
  }, [isSuccess]);

  // ✅ 지갑 연결 해제 시 모든 입력 초기화(UX 정리)
  useEffect(() => {
    if (isConnected) return;
    setSpender('');
    setApproveAmt('');
    setTransferTo('');
    setTransferAmt('');
    setTfFrom('');
    setTfTo('');
    setTfAmt('');
  }, [isConnected]);

  const doApprove = async () => {
    if (!token || !decimals) return;
    if (!isAddr(spender) || !approveAmt.trim()) return;
    writeContract({
      address: token, abi: MYTOKEN_ABI, functionName: 'approve',
      args: [spender as Address, parseUnits(approveAmt, Number(decimals))],
    });
    // 즉시 초기화가 필요하면 아래 주석 해제:
    // setApproveAmt('');
  };
  const doTransfer = async () => {
    if (!token || !decimals) return;
    if (!isAddr(transferTo) || !transferAmt.trim()) return;
    writeContract({
      address: token, abi: MYTOKEN_ABI, functionName: 'transfer',
      args: [transferTo as Address, parseUnits(transferAmt, Number(decimals))],
    });
    // setTransferTo('');
    // setTransferAmt('');
  };
  const doTransferFrom = async () => {
    if (!token || !decimals) return;
    if (!isAddr(tfFrom) || !isAddr(tfTo) || !tfAmt.trim()) return;
    writeContract({
      address: token, abi: MYTOKEN_ABI, functionName: 'transferFrom',
      args: [tfFrom as Address, tfTo as Address, parseUnits(tfAmt, Number(decimals))],
    });
    // setTfFrom(''); setTfTo(''); setTfAmt('');
  };

  // 트랜잭션 완료 후 상태 갱신
  const afterSuccess = async () => {
    if (isSuccess) {
      await Promise.allSettled([
        refetchMyBalance?.(),
        refetchTotalSupply?.(),
        isAddr(spender) ? refetchAllowance?.() : Promise.resolve(),
      ]);
    }
  };
  if (isSuccess) setTimeout(afterSuccess, 0);

  // ✅ 조회 버튼: refetch 끝나면 선택적으로 초기화 (기본은 유지)
  const onQueryAllowance = async () => {
    try {
      await refetchAllowance?.();
    } finally {
      // 조회 후 초기화가 필요하면 주석 해제
      // setSpender('');
    }
  };

  // 상단 상태바
  const statusBar = (
    <StatusBar
      chainId={chainId}
      token={token}
      staking={undefined}
      paused={paused as boolean | undefined}
    />
  );

  // 주소 오류 시 경고 박스
  if (!addressOk) {
    return (
      <div style={{ width: '100%' }}>
        <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>MyToken 패널</h2>
        {statusBar}
        <Card title="주소 설정 오류" note=".env.local의 VITE_MYTOKEN_ADDRESS_* 값을 확인하세요. 현재 체인에 맞는 0x 주소가 필요합니다.">
          <ul style={{ fontFamily: 'monospace', margin: 0 }}>
            <li>token: {String(token ?? '(unset)')}</li>
          </ul>
        </Card>
      </div>
    );
  }

  // 정상 UI
  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>MyToken 패널</h2>
      {statusBar}

      {/* 토큰 메타 */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div><strong>토큰</strong>: {String(name)} ({String(symbol)})</div>
            <div>decimals: {dec}</div>
            <div>
              상태:{' '}
              {paused
                ? <span style={{ color: 'var(--danger)' }}>Paused ⏸️</span>
                : <span style={{ color: 'var(--success)' }}>Active ▶️</span>}
            </div>
          </div>
          <div>
            <div><strong>총 발행량</strong>: {decimals != null && totalSupply != null ? `${formatUnits(totalSupply as bigint, dec)} ${String(symbol)}` : '...'}</div>
            <div><strong>내 잔액</strong>: {decimals != null && myBalance != null ? `${formatUnits(myBalance as bigint, dec)} ${String(symbol)}` : '...'}</div>
          </div>
        </div>
      </Card>

      {/* Approve / Allowance */}
      <Card title="Approve / Allowance" note="필요 시에만 네트워크 조회를 수행합니다.">
        <Input
          label="Spender 주소"
          placeholder="0x..."
          value={spender}
          onChange={(e) => setSpender(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <Button onClick={onQueryAllowance} disabled={!canUse}>허용량 조회</Button>
          <span style={{ fontFamily: 'monospace' }}>
            {decimals != null && allowance != null ? `${formatUnits(allowance as bigint, dec)} ${String(symbol)}` : ''}
          </span>
        </div>

        <Input
          label={`승인 수량 (${String(symbol) || ''})`}
          placeholder="100"
          value={approveAmt}
          onChange={(e) => setApproveAmt(e.target.value)}
          style={{ marginTop: 8 }}
        />
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          <Button variant="primary" onClick={doApprove} disabled={disabledWrite}>승인하기</Button>
          {/* 최대 승인(무한 승인) */}
          <Button
            onClick={() =>
              setApproveAmt('115792089237316195423570985008687907853269984665640564039457584007913129639935')
            }
            disabled={!canUse || !!paused}
            title="최대치로 승인"
            variant="outline"
          >
            Max
          </Button>
        </div>
        {!!paused && (
          <p style={{ color: 'var(--danger)', marginTop: 8 }}>
            현재 Paused 상태에서는 승인/전송이 제한됩니다.
          </p>
        )}
      </Card>

      {/* Transfer */}
      <Card title="Transfer">
        <Input
          label="수신자 주소"
          placeholder="0x..."
          value={transferTo}
          onChange={(e) => setTransferTo(e.target.value)}
        />
        <Input
          label={`수량 (${String(symbol) || ''})`}
          placeholder="10.5"
          value={transferAmt}
          onChange={(e) => setTransferAmt(e.target.value)}
          style={{ marginTop: 8 }}
        />
        <Button variant="primary" onClick={doTransfer} disabled={disabledWrite} style={{ marginTop: 10 }}>
          전송하기
        </Button>
        {!!paused && (
          <p style={{ color: 'var(--danger)', marginTop: 8 }}>
            현재 Paused 상태에서는 전송/승인이 제한됩니다.
          </p>
        )}
      </Card>

      {/* 선택: TransferFrom (spender용) */}
      <Card title="TransferFrom (옵션)" note="spender로서 from 주소로부터 충분한 allowance가 필요합니다.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            label="From"
            placeholder="0x..."
            value={tfFrom}
            onChange={(e) => setTfFrom(e.target.value)}
          />
          <Input
            label="To"
            placeholder="0x..."
            value={tfTo}
            onChange={(e) => setTfTo(e.target.value)}
          />
        </div>
        <Input
          label={`수량 (${String(symbol) || ''})`}
          placeholder="5"
          value={tfAmt}
          onChange={(e) => setTfAmt(e.target.value)}
          style={{ marginTop: 8 }}
        />
        <Button onClick={doTransferFrom} disabled={disabledWrite} style={{ marginTop: 10 }}>
          TransferFrom 실행
        </Button>
      </Card>

      {/* Tx 상태 표시 */}
      {(isPending || isConfirming || isSuccess || error) && (
        <div style={{ marginTop: 12, fontSize: 12 }}>
          {isPending && <span>트랜잭션 서명 대기 중…</span>}
          {isConfirming && <span style={{ marginLeft: 8 }}>확인 중…</span>}
          {isSuccess && <span style={{ color: 'var(--success)', marginLeft: 8 }}>확정됨 ✅</span>}
          {error && <div style={{ color: 'var(--danger)' }}>오류: {String(error.message ?? error)}</div>}
          {hash && <div>Tx: <code>{hash}</code></div>}
        </div>
      )}
    </div>
  );
};
