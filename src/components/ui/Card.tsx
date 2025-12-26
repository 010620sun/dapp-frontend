
// src/components/ui/Card.tsx
import React from 'react';

export const Card: React.FC<{ title?: string; note?: string; children: React.ReactNode }> =
({ title, note, children }) => {
  return (
    <section style={{
      width: '100%',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '12px',
      background: 'var(--card-bg, var(--bg))', // ✅ 다크 카드 배경
      boxShadow: 'var(--shadow)'
    }}>
      {title && <h3 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h3>}
      {note && <p style={{ fontSize: 12, color: 'var(--subtext)', marginTop: -4, marginBottom: 8 }}>{note}</p>}
      {children}
    </section>
  );
};
