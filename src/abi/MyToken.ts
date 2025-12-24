
// src/abi/MyToken.ts
export const MYTOKEN_ABI = [
  { type: 'function', name: 'name',     inputs: [], outputs: [{ type: 'string' }],  stateMutability: 'view' },
  { type: 'function', name: 'symbol',   inputs: [], outputs: [{ type: 'string' }],  stateMutability: 'view' },
  { type: 'function', name: 'decimals', inputs: [], outputs: [{ type: 'uint8' }],   stateMutability: 'view' },
  { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'approve',  inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'transferFrom', inputs: [
      { name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }
    ], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  // Pausable 상태 확인 (읽기 전용)
  { type: 'function', name: 'paused', inputs: [], outputs: [{ type: 'bool' }], stateMutability: 'view' },
] as const;
