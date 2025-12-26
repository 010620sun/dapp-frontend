
// src/components/ui/Button.tsx
import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'neutral' | 'danger' | 'outline';
  size?: 'sm' | 'md';
};

export const Button: React.FC<Props> = ({ variant='neutral', size='md', style, ...rest }) => {
  const base: React.CSSProperties = {
    borderRadius: 'var(--radius-xs)',
    border: '1.5px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    padding: size === 'sm' ? '6px 10px' : '8px 12px',
    cursor: 'pointer',
    boxShadow: 'var(--shadow)',
  };
  const map: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--primary)', color: 'var(--primary-contrast)', borderColor: 'var(--primary)' },
    neutral: {},
    danger: { color: 'var(--danger)', borderColor: 'var(--danger)' },
    outline: { background: 'transparent', color: 'var(--primary)', borderColor: 'var(--primary)' },
  };
  return <button {...rest} style={{ ...base, ...map[variant], ...style }} />;
};
``
