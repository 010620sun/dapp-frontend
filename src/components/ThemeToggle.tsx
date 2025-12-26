
// src/components/ThemeToggle.tsx
import React, { useEffect, useState } from 'react';

const THEME_KEY = 'app-theme'; // 'light' | 'dark' | 'system'

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeToggle: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>('system');

  // 초기 로드: 저장된 모드 반영 + 시스템 모드 지원
  useEffect(() => {
    const saved = (localStorage.getItem(THEME_KEY) as 'light' | 'dark' | 'system') || 'system';
    setMode(saved);
    const target = saved === 'system' ? getSystemTheme() : saved;
    applyTheme(target);
  }, []);

  // 시스템 모드 변경 감지(사용자가 system 선택 시)
  useEffect(() => {
    if (mode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(media.matches ? 'dark' : 'light');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [mode]);

  const setTheme = (next: 'light' | 'dark' | 'system') => {
    setMode(next);
    localStorage.setItem(THEME_KEY, next);
    const target = next === 'system' ? getSystemTheme() : next;
    applyTheme(target);
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button
        onClick={() => setTheme('light')}
        style={{
          padding: '6px 10px',
          border: '1px solid var(--border)',
          background: mode === 'light' ? 'var(--primary)' : 'transparent',
          color: mode === 'light' ? 'var(--primary-contrast)' : 'var(--text)',
          borderRadius: 'var(--radius-xs)',
          cursor: 'pointer'
        }}
        title="라이트 모드"
      >
        라이트
      </button>
      <button
        onClick={() => setTheme('dark')}
        style={{
          padding: '6px 10px',
          border: '1px solid var(--border)',
          background: mode === 'dark' ? 'var(--primary)' : 'transparent',
          color: mode === 'dark' ? 'var(--primary-contrast)' : 'var(--text)',
          borderRadius: 'var(--radius-xs)',
          cursor: 'pointer'
        }}
        title="다크 모드"
      >
        다크
      </button>
      <button
        onClick={() => setTheme('system')}
        style={{
          padding: '6px 10px',
          border: '1px solid var(--border)',
          background: mode === 'system' ? 'var(--primary)' : 'transparent',
          color: mode === 'system' ? 'var(--primary-contrast)' : 'var(--text)',
          borderRadius: 'var(--radius-xs)',
          cursor: 'pointer'
        }}
        title="시스템 모드"
      >
        시스템
      </button>
    </div>
  );
};
