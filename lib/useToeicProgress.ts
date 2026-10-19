// lib/useToeicProgress.ts
"use client";

import { useCallback, useEffect, useState } from "react";

// 기존 140구문의 마스터 기록과 섞이지 않도록 별도 키를 사용합니다.
const KEYS = {
  expr: "toeic-p2-expr-mastered",
  set: "toeic-p2-set-mastered",
} as const;

export type ToeicKind = keyof typeof KEYS;

export function useToeicProgress(kind: ToeicKind) {
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEYS[kind]);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setMastered(new Set(arr.map(Number)));
      }
    } catch {
      // 저장소를 못 읽어도 학습은 가능하도록 무시
    }
    setLoaded(true);
  }, [kind]);

  const toggle = useCallback(
    (no: number) => {
      setMastered((prev) => {
        const next = new Set(prev);
        if (next.has(no)) next.delete(no);
        else next.add(no);
        try {
          localStorage.setItem(KEYS[kind], JSON.stringify([...next]));
        } catch {
          // 저장 실패는 무시
        }
        return next;
      });
    },
    [kind]
  );

  const isMastered = useCallback((no: number) => mastered.has(no), [mastered]);

  return { mastered, isMastered, toggle, loaded };
}
