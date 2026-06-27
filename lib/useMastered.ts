// lib/useMastered.ts
"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pattern-master:v1";

/**
 * 마스터한 구문 id를 localStorage에 영구 저장하는 훅.
 * SSR 환경에서 hydration mismatch를 피하려고, 첫 페인트에는 빈 값을 쓰고
 * mount 이후 useEffect에서 저장된 값을 불러온다(loaded 플래그 제공).
 */
export function useMastered() {
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMastered(new Set<number>(JSON.parse(raw)));
    } catch {
      /* localStorage 접근 불가 시 무시 */
    }
    setLoaded(true);
  }, []);

  const toggle = useCallback((id: number) => {
    setMastered((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        /* 저장 실패 무시 */
      }
      return next;
    });
  }, []);

  const isMastered = useCallback((id: number) => mastered.has(id), [mastered]);

  return { mastered, toggle, isMastered, loaded };
}
