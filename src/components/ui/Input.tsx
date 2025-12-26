
// src/components/ui/Input.tsx
import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  help?: string;
  suffix?: React.ReactNode;
};

export const Input: React.FC<Props> = ({ label, help, suffix, style, ...rest }) => {
  return (
    <label style={{ display: 'block' }}>
      {label && <div style={{ fontSize: 12, color: 'var(--subtext)' }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          {...rest}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1.5px solid var(--input-border, var(--border))',
            borderRadius: 'var(--radius-xs)',
            /* ✅ 다크에서 구분감 ↑ */
            background: 'var(--input-bg, var(--bg))',
            color: 'var(--text)',
            boxShadow: 'var(--shadow)',
            /* 플레이스홀더 색상 적용 (웹킷/모던 브라우저에서 반영) */
            ...style,
          }}
        />
      </div>
      {help && <div style={{ fontSize: 12, color: 'var(--subtext)', marginTop: 4 }}>{help}</div>}
      <style>{`
        input::placeholder { color: var(--input-placeholder, var(--subtext)); }
      `}</style>
    </label>
  );
};
