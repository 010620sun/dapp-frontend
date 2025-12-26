
// src/pages/Home.tsx
import React from 'react';
import { ConnectedGate } from '../components/ConnectedGate';
import { MyTokenPanel } from '../components/MyTokenPanel';
import { StakingPanel } from '../components/StakingPanel';

export default function Home() {
  return (
    <div style={{ maxWidth: 1040, margin: '40px auto', padding: '0 16px' }}>
      {/* 헤더 영역 */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16
      }}>
        <h1 style={{ margin: 0 }}>DApp — MyToken &amp; Staking</h1>
        {/* 지갑 연결은 ConnectedGate 내부에서도 가능하지만
            상단에 한 번 더 보여주고 싶으면 RainbowKit 버튼을 그대로 사용 가능합니다.
            예: <ConnectButton /> */}
      </header>

      {/* 본문: 지갑 연결되면 패널 노출 */}
      <ConnectedGate>
        {/* MyToken 패널 */}
        <section aria-label="MyToken Panel">
          <MyTokenPanel />
        </section>

        {/* Spacing */}
        <div style={{ height: 24 }} />

        {/* Staking 패널 */}
        <section aria-label="Staking Panel">
          <StakingPanel />
        </section>
      </ConnectedGate>

      {/* 푸터 (선택) */}
      <footer style={{ marginTop: 32, fontSize: 12, color: '#6b7280' }}>
        <div>※ 주소/체인/Paused 상태는 각 패널 상단의 StatusBar에서 확인할 수 있습니다.</div>
        <div>※ 허용량/예상 보상 조회는 버튼 클릭 시에만 네트워크 호출합니다.</div>
      </footer>
    </div>
  );
}
