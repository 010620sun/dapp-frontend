
import type { Address } from 'viem';

export function isAddress(addr?: string): addr is Address {
  return !!addr && /^0x[a-fA-F0-9]{40}$/.test(addr);
}

export function eqAddress(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}
