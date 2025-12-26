
// src/hooks/useResetOnSuccess.ts
import { useEffect } from 'react';

export function useResetOnSuccess(isSuccess: boolean, resets: Array<() => void>) {
  useEffect(() => {
    if (!isSuccess) return;
    const id = setTimeout(() => {
      resets.forEach((fn) => { try { fn(); } catch {} });
    }, 0);
    return () => clearTimeout(id);
  }, [isSuccess, resets]);
}
