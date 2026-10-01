"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";

export default function CommentCount({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const q = query(collection(db, "comments"), where("slug", "==", slug));
        const snap = await getCountFromServer(q);
        if (!cancelled) setCount(snap.data().count);
      } catch {
        if (!cancelled) setCount(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // 로딩 중이거나 댓글이 0개면 표시하지 않음 (원하시면 0개도 표시하도록 바꿔드릴 수 있어요)
  if (!count) return null;

  return (
    <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>
      💬 {count}
    </span>
  );
}
