
// src/hooks/resetAfterRefetch.ts
export async function resetAfterRefetch<T>(
  refetchFn?: () => Promise<T>,
  resets: Array<() => void> = []
) {
  if (!refetchFn) return;
  try {
    await refetchFn();
  } finally {
    // 조회는 실패/성공 모두 끝나면 입력을 비워 UX를 단순화
    resets.forEach((fn) => { try { fn(); } catch {} });
  }
}
