"use client";

import { useState } from "react";
import Link from "next/link";

interface HanjaOption {
  hanja: string;
  hangul_sound: string;
  strokes_original: number;
  five_elements: string;
  meaning: string;
  suriPreview: { strokes: number; rating: string; name: string; description: string } | null;
}

interface SelectedHanja {
  hanja: string;
  meaning: string;
  strokes: number;
  element: string;
}

interface AnalysisResult {
  namingScore: {
    overallRating: string;
    fourGuk: {
      wonGuk:    { strokes: number; name: string; rating: string; description: string };
      hyeongGuk: { strokes: number; name: string; rating: string; description: string };
      iGuk:      { strokes: number; name: string; rating: string; description: string };
      jeonGuk:   { strokes: number; name: string; rating: string; description: string };
    };
    pronunciationElements: { char: string; element: string; elementKr: string }[];
    summary: string;
  };
}

const SURNAME_STROKES: Record<string, number> = {
  김:8, 이:7, 박:6, 최:11, 정:15, 강:9, 조:14, 윤:4,
  장:11, 임:8, 한:17, 오:7, 서:10, 신:5, 권:22, 황:12,
  안:6, 송:7, 류:9, 전:6, 홍:9, 고:10, 문:4, 양:11,
  손:10, 배:14, 백:5, 허:11, 유:9, 남:9,
};

const ELEMENT_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  목: { color: "#15803d", bg: "#f0fdf4", label: "木 나무" },
  화: { color: "#b91c1c", bg: "#fef2f2", label: "火 불" },
  토: { color: "#b45309", bg: "#fffbeb", label: "土 흙" },
  금: { color: "#4b5563", bg: "#f3f4f6", label: "金 쇠" },
  수: { color: "#1d4ed8", bg: "#eff6ff", label: "水 물" },
};

const GUK_INFO: Record<string, { period: string; desc: string }> = {
  "원격(元格)": { period: "초년운",  desc: "이름 두 글자를 합친 기운 — 유년기의 운" },
  "형격(亨格)": { period: "청년운",  desc: "성씨 + 이름 첫 글자 — 사회 진출 시기의 운" },
  "이격(利格)": { period: "장년운",  desc: "성씨 + 이름 끝 글자 — 중년 성취와 가정운" },
  "정격(貞格)": { period: "총운 ✨", desc: "성씨 + 이름 전체 — 인생 전체를 관통하는 가장 중요한 운" },
};

function getRatingStyle(r: string) {
  switch (r) {
    case "매우좋음": return { color: "#1d4ed8", bg: "#eff6ff", bar: "#2563eb", emoji: "🔵" };
    case "좋음":     return { color: "#15803d", bg: "#f0fdf4", bar: "#16a34a", emoji: "🟢" };
    case "보통":     return { color: "#b45309", bg: "#fffbeb", bar: "#d97706", emoji: "🟡" };
    case "나쁨":     return { color: "#b91c1c", bg: "#fef2f2", bar: "#dc2626", emoji: "🔴" };
    case "매우나쁨": return { color: "#7f1d1d", bg: "#fee2e2", bar: "#991b1b", emoji: "❌" };
    default:         return { color: "#6b7280", bg: "#f9fafb", bar: "#9ca3af", emoji: "⚪" };
  }
}

function getRatingScore(r: string) {
  return ({ 매우좋음: 100, 좋음: 75, 보통: 50, 나쁨: 25, 매우나쁨: 10 } as any)[r] ?? 50;
}

function StepBar({ current }: { current: number }) {
  const steps = ["이름 입력", "한자 선택", "결과 확인"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700,
                background: done ? "#16a34a" : active ? "var(--text-primary)" : "var(--border)",
                color: done || active ? "white" : "var(--text-faint)",
              }}>
                {done ? "✓" : idx}
              </div>
              <span style={{
                fontSize: 11, marginTop: 4, fontWeight: active ? 700 : 400,
                color: active ? "var(--text-primary)" : "var(--text-faint)",
                whiteSpace: "nowrap",
              }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: "0 4px", marginBottom: 14,
                background: done ? "#16a34a" : "var(--border)",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NamingPage() {
  const [step, setStep] = useState(1);
  const [nameInput, setNameInput] = useState("");
  const [surnameStrokes, setSurnameStrokes] = useState(0);
  const [hanjaOptions, setHanjaOptions] = useState<HanjaOption[][]>([]);
  const [selectedHanja, setSelectedHanja] = useState<(SelectedHanja | null)[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleNameChange(val: string) {
    const t = val.replace(/\s/g, "").slice(0, 4);
    setNameInput(t);
    setSurnameStrokes(SURNAME_STROKES[t[0]] ?? 0);
    setSelectedHanja(Array(t.length).fill(null));
    setError("");
  }

  async function handleGoStep2() {
    if (nameInput.length < 2) { setError("성씨 포함 2글자 이상 입력해주세요."); return; }
    if (!surnameStrokes) { setError("성씨 획수를 입력해주세요."); return; }
    setLoading(true);
    try {
      const chars = Array.from(nameInput);
      const results = await Promise.all(
        chars.map((char, i) =>
          i === 0 ? Promise.resolve([])
            : fetch(`/api/naming/hanja?sound=${char}&surnameStrokes=${surnameStrokes}`)
                .then(r => r.json()).then(d => d.results ?? [])
        )
      );
      setHanjaOptions(results);
      setStep(2);
    } catch { setError("한자 목록을 불러오지 못했어요."); }
    finally { setLoading(false); }
  }

  function selectHanja(idx: number, opt: HanjaOption) {
    const next = [...selectedHanja];
    next[idx] = { hanja: opt.hanja, meaning: opt.meaning, strokes: opt.strokes_original, element: opt.five_elements };
    setSelectedHanja(next);
  }

  async function handleAnalyze() {
    const chars = Array.from(nameInput);
    const strokesList = chars.map((_, i) => i === 0 ? surnameStrokes : (selectedHanja[i]?.strokes ?? 0));
    if (strokesList.some(s => !s)) { setError("모든 글자의 한자를 선택해주세요."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/naming/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameHangul: nameInput, strokesList }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setResult(data.result);
      setStep(3);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  function reset() { setStep(1); setResult(null); setNameInput(""); setSelectedHanja([]); setError(""); setSurnameStrokes(0); }

  const nameChars = Array.from(nameInput);
  const allSelected = nameChars.every((_, i) => i === 0 || selectedHanja[i] !== null);

  // ══════════════════════════════════════
  // STEP 1 — 이름 입력
  // ══════════════════════════════════════
  if (step === 1) return (
    <main className="page">
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      <div className="container" style={{ maxWidth: 460 }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--text-faint)", textDecoration: "none" }}>← 홈으로</Link>
        <h1 style={{ marginTop: 12, marginBottom: 4, fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>이름 감명 ✨</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
          현재 생각 중인 이름이 좋은 이름인지 확인해드려요.
        </p>

        <StepBar current={1} />

        {/* 안내 카드 */}
        <div style={{ padding: "16px", marginBottom: 24, borderRadius: 14, background: "var(--section-bg)", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>📝 사용 방법</p>
          {["① 아래 네모 칸을 눌러 이름을 입력하세요 (성씨 포함)", "② 각 글자에 맞는 한자를 골라요", "③ 수리성명학 점수를 확인해요"].map((t, i) => (
            <p key={i} style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 2 }}>{t}</p>
          ))}
        </div>

        {/* 네모칸 입력 */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
            이름을 입력하세요
          </p>
          <div
            onClick={() => (document.getElementById("name-hidden-input") as HTMLInputElement)?.focus()}
            style={{
              display: "flex", gap: 12, justifyContent: "center",
              padding: "24px 20px", borderRadius: 16,
              border: "2px solid var(--border)", background: "var(--card-bg)",
              cursor: "text", position: "relative",
            }}
          >
            {[0, 1, 2, 3].map(i => {
              const char = nameInput[i];
              const isCurrent = nameInput.length === i;
              return (
                <div key={i} style={{
                  width: 64, height: 72, borderRadius: 14,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 2,
                  border: `2px solid ${char ? "#2563eb" : isCurrent ? "#93c5fd" : "#e5e7eb"}`,
                  background: char ? "#eff6ff" : isCurrent ? "#f0f9ff" : "#f9fafb",
                  transition: "all 0.15s",
                }}>
                  {char ? (
                    <span style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", lineHeight: 1 }}>
                      {char}
                    </span>
                  ) : (
                    <>
                      {isCurrent ? (
                        <span style={{
                          display: "inline-block", width: 2, height: 28,
                          background: "#2563eb", borderRadius: 2,
                          animation: "blink 1s step-end infinite",
                        }} />
                      ) : null}
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        {i === 0 ? "성씨" : `${i}번째`}
                      </span>
                    </>
                  )}
                </div>
              );
            })}

            {/* 실제 숨겨진 input */}
            <input
              id="name-hidden-input"
              type="text"
              value={nameInput}
              onChange={e => handleNameChange(e.target.value)}
              maxLength={4}
              style={{
                position: "absolute", opacity: 0, pointerEvents: "none",
                width: 1, height: 1, top: 0, left: 0,
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 8, textAlign: "center" }}>
            👆 네모 칸을 탭하면 키보드가 올라와요 (성씨 포함 2~4글자)
          </p>
        </div>

        {/* 성씨 획수 확인 */}
        {nameInput.length > 0 && (
          <div style={{
            padding: "14px 16px", marginBottom: 20, borderRadius: 12,
            background: surnameStrokes ? "#f0fdf4" : "#fef9c3",
            border: `1px solid ${surnameStrokes ? "#bbf7d0" : "#fde68a"}`,
          }}>
            {surnameStrokes ? (
              <p style={{ fontSize: 14, color: "#15803d" }}>
                ✅ <strong>{nameInput[0]}</strong>씨 성씨 획수 <strong>{surnameStrokes}획</strong> 자동 확인됐어요!
              </p>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: "#92400e", marginBottom: 10, fontWeight: 600 }}>
                  ⚠️ <strong>{nameInput[0]}</strong>씨 성씨는 직접 획수를 입력해주세요
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="number" min={1} max={50}
                    value={surnameStrokes || ""}
                    onChange={e => setSurnameStrokes(Number(e.target.value))}
                    placeholder="획수"
                    style={{
                      width: 90, padding: "10px", fontSize: 16, fontWeight: 700,
                      border: "1.5px solid #fde68a", borderRadius: 8,
                      background: "white", color: "#1c1917",
                      textAlign: "center", outline: "none",
                    }}
                  />
                  <span style={{ fontSize: 13, color: "#92400e" }}>획 (원획법 기준)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button
          onClick={handleGoStep2}
          disabled={loading || nameInput.length < 2 || !surnameStrokes}
          style={{
            width: "100%", padding: "16px", fontSize: 17, fontWeight: 700,
            background: (nameInput.length >= 2 && surnameStrokes) ? "#1e293b" : "var(--border)",
            color: (nameInput.length >= 2 && surnameStrokes) ? "white" : "var(--text-faint)",
            border: "none", borderRadius: 14,
            cursor: (nameInput.length >= 2 && surnameStrokes) ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "⏳ 한자 불러오는 중..." : "다음 단계 — 한자 선택하기 →"}
        </button>
      </div>
    </main>
  );

  // ══════════════════════════════════════
  // STEP 2 — 한자 선택
  // ══════════════════════════════════════
  if (step === 2) return (
    <main className="page">
      <div className="container" style={{ maxWidth: 460 }}>
        <button onClick={() => setStep(1)}
          style={{ fontSize: 13, color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 12 }}>
          ← 이름 다시 입력
        </button>

        <StepBar current={2} />

        <div style={{ marginBottom: 20, padding: "14px 16px", background: "var(--section-bg)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            💡 <strong>각 글자에 사용할 한자를 하나씩 골라주세요.</strong><br />
            <span style={{ color: "#2563eb", fontWeight: 600 }}>파란색</span>은 좋은 이름,
            <span style={{ color: "#b91c1c", fontWeight: 600 }}> 빨간색</span>은 피하는 것이 좋아요.
          </p>
        </div>

        {/* 선택 현황 */}
        <div style={{
          display: "flex", gap: 8, padding: "16px", marginBottom: 24,
          background: "var(--card-bg)", borderRadius: 14, border: "1px solid var(--border)",
          alignItems: "center", justifyContent: "center",
        }}>
          {nameChars.map((char, i) => {
            const sel = selectedHanja[i];
            const es = sel ? ELEMENT_STYLE[sel.element] : null;
            return (
              <div key={i} style={{ textAlign: "center", minWidth: 56 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{char}</div>
                {i === 0 ? (
                  <div style={{ fontSize: 11, color: "#15803d", marginTop: 2, fontWeight: 600 }}>성씨 ✓</div>
                ) : sel ? (
                  <>
                    <div style={{ fontSize: 20, color: es?.color, fontWeight: 700 }}>{sel.hanja}</div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{sel.strokes}획</div>
                  </>
                ) : (
                  <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>선택 필요</div>
                )}
              </div>
            );
          })}
        </div>

        {/* 글자별 한자 목록 */}
        {nameChars.map((char, charIdx) => {
          if (charIdx === 0) return null;
          const options = hanjaOptions[charIdx] ?? [];
          const sel = selectedHanja[charIdx];
          const allBad = options.length > 0 && options.every(opt =>
            ["나쁨", "매우나쁨"].includes(opt.suriPreview?.rating ?? "")
          );

          return (
            <div key={charIdx} style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700,
                  background: sel ? "#f0fdf4" : "var(--section-bg)",
                  border: `2px solid ${sel ? "#16a34a" : "var(--border)"}`,
                  color: "var(--text-primary)",
                }}>{char}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    "{char}" 글자의 한자를 선택해주세요
                  </p>
                  {sel && (
                    <p style={{ fontSize: 12, color: "#15803d", margin: 0 }}>
                      ✓ {sel.hanja}({sel.meaning}) 선택됨
                    </p>
                  )}
                </div>
              </div>

              {/* 글자 자체가 성씨와 안 맞는 경우 경고 */}
              {allBad && (
                <div style={{
                  padding: "12px 14px", borderRadius: 10, marginBottom: 10,
                  background: "#fffbeb", border: "1px solid #fde68a",
                  fontSize: 13, color: "#92400e", lineHeight: 1.6,
                }}>
                  ⚠️ <strong>"{char}"</strong> 글자는 <strong>{nameInput[0]}씨</strong>와 수리 조합이 불리해요.<br />
                  <span style={{ fontSize: 12 }}>다른 글자 사용을 권장하지만, 원하시면 선택 가능해요.</span>
                </div>
              )}

              {options.length === 0 ? (
                <div style={{ padding: "20px", background: "var(--section-bg)", borderRadius: 12, textAlign: "center", fontSize: 13, color: "var(--text-faint)" }}>
                  <p style={{ marginBottom: 4 }}>😅 '{char}' 글자의 한자 데이터가 없어요</p>
                  <p style={{ fontSize: 12 }}>다른 글자를 사용하거나 데이터 추가가 필요해요</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {options.map(opt => {
                    const isSelected = sel?.hanja === opt.hanja;
                    const rs = opt.suriPreview ? getRatingStyle(opt.suriPreview.rating) : null;
                    const es = ELEMENT_STYLE[opt.five_elements];
                    const isGood = opt.suriPreview && ["매우좋음", "좋음"].includes(opt.suriPreview.rating);
                    return (
                      <button key={opt.hanja} onClick={() => selectHanja(charIdx, opt)}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "14px 16px", borderRadius: 14, textAlign: "left",
                          border: `2px solid ${isSelected ? "#2563eb" : isGood ? "#bbf7d0" : "var(--border)"}`,
                          background: isSelected ? "#eff6ff" : "var(--card-bg)",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{
                          fontSize: 32, fontWeight: 700, minWidth: 44, textAlign: "center",
                          color: isSelected ? "#1d4ed8" : "var(--text-primary)",
                        }}>{opt.hanja}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{opt.meaning}</span>
                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: es?.bg, color: es?.color, fontWeight: 600 }}>
                              {es?.label}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: "var(--text-faint)", margin: 0 }}>
                            획수 {opt.strokes_original}획
                            {opt.suriPreview && ` · 형격 ${opt.suriPreview.strokes}획 (${opt.suriPreview.name})`}
                          </p>
                        </div>
                        {rs && (
                          <div style={{ fontSize: 13, fontWeight: 700, padding: "6px 12px", borderRadius: 20, background: rs.bg, color: rs.color, whiteSpace: "nowrap" }}>
                            {rs.emoji} {opt.suriPreview?.rating}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button
          onClick={handleAnalyze}
          disabled={!allSelected || loading}
          style={{
            width: "100%", padding: "16px", fontSize: 17, fontWeight: 700,
            background: allSelected ? "#1e293b" : "var(--border)",
            color: allSelected ? "white" : "var(--text-faint)",
            border: "none", borderRadius: 14,
            cursor: allSelected ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "⏳ 분석 중..." : allSelected ? "이름 분석하기 →" : "모든 한자를 선택해주세요"}
        </button>
      </div>
    </main>
  );

  // ══════════════════════════════════════
  // STEP 3 — 결과
  // ══════════════════════════════════════
  const score = result!.namingScore;
  const overallStyle = getRatingStyle(score.overallRating);
  const avgScore = Math.round([
    score.fourGuk.wonGuk, score.fourGuk.hyeongGuk,
    score.fourGuk.iGuk, score.fourGuk.jeonGuk,
  ].reduce((a, d) => a + getRatingScore(d.rating), 0) / 4);
  const hanjaName = nameChars.map((_, i) => i === 0 ? "" : selectedHanja[i]?.hanja ?? "?").join("");
  const gukList = [
    { label: "원격(元格)", data: score.fourGuk.wonGuk },
    { label: "형격(亨格)", data: score.fourGuk.hyeongGuk },
    { label: "이격(利格)", data: score.fourGuk.iGuk },
    { label: "정격(貞格)", data: score.fourGuk.jeonGuk },
  ];

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 460 }}>
        <button onClick={() => setStep(2)}
          style={{ fontSize: 13, color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 12 }}>
          ← 한자 다시 선택
        </button>

        <StepBar current={3} />

        {/* 이름 + 종합 결과 */}
        <div style={{
          padding: "24px 20px", borderRadius: 16, marginBottom: 20, textAlign: "center",
          background: overallStyle.bg, border: `2px solid ${overallStyle.color}33`,
        }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", letterSpacing: 6 }}>
              {nameInput}
            </span>
          </div>
          <div style={{ fontSize: 24, color: overallStyle.color, letterSpacing: 8, marginBottom: 14, fontWeight: 700 }}>
            {hanjaName}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            {nameChars.map((char, i) => {
              if (i === 0) return null;
              const sel = selectedHanja[i];
              const es = sel ? ELEMENT_STYLE[sel.element] : null;
              return sel ? (
                <div key={i} style={{ padding: "6px 14px", borderRadius: 10, background: es?.bg, border: `1px solid ${es?.color}33` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{char} {sel.hanja}</div>
                  <div style={{ fontSize: 12, color: es?.color, fontWeight: 600 }}>{sel.meaning}</div>
                </div>
              ) : null;
            })}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>종합 점수</p>
          <p style={{ fontSize: 32, fontWeight: 800, color: overallStyle.color, marginBottom: 12 }}>
            {overallStyle.emoji} {score.overallRating}
          </p>
          <div style={{ background: "#e5e7eb", borderRadius: 999, height: 12, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ width: `${avgScore}%`, height: "100%", background: overallStyle.bar, borderRadius: 999 }} />
          </div>
          <p style={{ fontSize: 12, color: "var(--text-faint)" }}>4격 평균 {avgScore}점</p>
        </div>

        {/* 4격 분석 */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>4격 수리 분석</h2>
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 12 }}>이름을 4가지 방식으로 나눠 각각의 운을 봐요.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {gukList.map(({ label, data }) => {
              const s = getRatingStyle(data.rating);
              const info = GUK_INFO[label];
              return (
                <div key={label} style={{ padding: "16px", borderRadius: 14, background: "var(--card-bg)", border: `1.5px solid ${s.color}33` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{label}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "var(--section-bg)", color: "var(--text-faint)" }}>
                        {info?.period}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: s.bg, color: s.color }}>
                      {s.emoji} {data.rating}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 8 }}>{info?.desc}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                    {data.strokes}획 · {data.name}
                  </p>
                  <div style={{ background: "#e5e7eb", borderRadius: 999, height: 4, marginBottom: 8 }}>
                    <div style={{ width: `${getRatingScore(data.rating)}%`, height: "100%", background: s.bar, borderRadius: 999 }} />
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{data.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 발음오행 */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>발음오행</h2>
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 12 }}>이름을 소리 낼 때의 기운이에요.</p>
          <div style={{ display: "flex", gap: 10 }}>
            {score.pronunciationElements.map((el, i) => {
              const es = ELEMENT_STYLE[el.element] ?? { color: "#888", bg: "#f9fafb", label: el.elementKr };
              return (
                <div key={i} style={{ flex: 1, textAlign: "center", padding: "16px 8px", background: es.bg, borderRadius: 14, border: `1px solid ${es.color}33` }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>{el.char}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: es.color }}>{es.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 요약 */}
        <div style={{ padding: "16px", borderRadius: 12, marginBottom: 24, background: "var(--section-bg)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, borderLeft: `4px solid ${overallStyle.bar}` }}>
          <strong style={{ color: "var(--text-primary)" }}>한 줄 요약</strong><br />
          {score.summary}
        </div>

        <button onClick={reset} style={{ width: "100%", padding: "16px", fontSize: 16, fontWeight: 700, background: "#1e293b", color: "white", border: "none", borderRadius: 14, cursor: "pointer" }}>
          다른 이름 분석하기
        </button>
      </div>
    </main>
  );
}
