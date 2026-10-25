// lib/useToeic3Progress.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import type { P3Kind } from "@/lib/toeicPart3";

// Part 2 / 기존 140구문의 기록과 섞이지 않도록 별도 키를 사용합니다.
const keyOf = (kind: P3Kind) => `toeic-p3-${kind}-mastered`;

export function useToeic3Progress(kind: P3Kind) {
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(keyOf(kind));
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
          localStorage.setItem(keyOf(kind), JSON.stringify([...next]));
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
