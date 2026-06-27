// components/DialogueLine.tsx
"use client";

import { useState } from "react";
import type { Dialogue } from "@/lib/patterns";

interface DialogueLineProps {
  line: Dialogue;
}

/**
 * 책 본문처럼 E / K 화자 표시.
 * 영어 문장이 먼저 보이고, 탭하면 한국어 해석이 토글된다.
 */
export default function DialogueLine({ line }: DialogueLineProps) {
  const [open, setOpen] = useState(false);
  const isE = line.speaker === "E";

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="flex w-full items-start gap-3 rounded-2xl bg-white p-3.5 text-left ring-1 ring-slate-200/70 transition-colors hover:bg-slate-50 active:bg-slate-100"
    >
      <span
        className={[
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          isE ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700",
        ].join(" ")}
      >
        {line.speaker}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium leading-relaxed text-slate-800">
          {line.text_en}
        </span>
        <span
          className={[
            "grid transition-all duration-300 ease-out",
            open ? "mt-1.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <span className="overflow-hidden text-sm leading-relaxed text-slate-500">
            {line.text_ko}
          </span>
        </span>
        {!open && (
          <span className="mt-0.5 block text-[11px] text-slate-300">탭하여 해석 보기</span>
        )}
      </span>
    </button>
  );
}
