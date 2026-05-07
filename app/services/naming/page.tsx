"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ── 타입 ──────────────────────────────────────────────────
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

// ── 상수 ──────────────────────────────────────────────────
const SURNAME_STROKES: Record<string, number> = {
  김:8, 이:7, 박:6, 최:11, 정:15, 강:9, 조:14, 윤:4,
  장:11, 임:8, 한:17, 오:7, 서:10, 신:5, 권:22, 황:12,
  안:6, 송:7, 류:9, 전:6, 홍:9, 고:10, 문:4, 양:11,
  손:10, 배:14, 백:5, 허:11, 유:9, 남:9,
};

const GUK_INFO: Record<string, { period: string; desc: string }> = {
  "원격(元格)": { period: "초년운",   desc: "이름 두 글자를 합친 기운 — 유년기의 운" },
  "형격(亨格)": { period: "청년운",   desc: "성씨 + 이름 첫 글자 — 사회 진출 시기의 운" },
  "이격(利格)": { period: "장년운",   desc: "성씨 + 이름 끝 글자 — 중년 성취와 가정운" },
  "정격(貞格)": { period: "총운 ✨",  desc: "성씨 + 이름 전체 — 인생 전체를 관통하는 가장 중요한 운" },
};

const ELEMENT_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  목: { color: "#15803d", bg: "#f0fdf4", label: "木 나무" },
  화: { color: "#b91c1c", bg: "#fef2f2", label: "火 불" },
  토: { color: "#b45309", bg: "#fffbeb", label: "土 흙" },
  금: { color: "#4b5563", bg: "#f9fafb", label: "金 쇠" },
  수: { color: "#1d4ed8", bg: "#eff6ff", label: "水 물" },
};

function getRatingStyle(rating: string) {
  switch (rating) {
    case "매우좋음": return { color: "#1d4ed8", bg: "#eff6ff", bar: "#2563eb", emoji: "🔵" };
    case "좋음":     return { color: "#15803d", bg: "#f0fdf4", bar: "#16a34a", emoji: "🟢" };
    case "보통":     return { color: "#b45309", bg: "#fffbeb", bar: "#d97706", emoji: "🟡" };
    case "나쁨":     return { color: "#b91c1c", bg: "#fef2f2", bar: "#dc2626", emoji: "🔴" };
    case "매우나쁨": return { color: "#7f1d1d", bg: "#fee2e2", bar: "#991b1b", emoji: "❌" };
    default:         return { color: "#6b7280", bg: "#f9fafb", bar: "#9ca3af", emoji: "⚪" };
  }
}

function getRatingScore(r: string) {
  return { 매우좋음:100, 좋음:75, 보통:50, 나쁨:25, 매우나쁨:10 }[r] ?? 50;
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function NamingPage() {
  const [step, setStep] = useState<"input" | "hanja" | "result">("input");

  // 입력 상태
  const [nameInput, setNameInput]       = useState("");
  const [surnameStrokes, setSurnameStrokes] = useState(0);

  // 한자 선택 상태
  const [hanjaOptions, setHanjaOptions] = useState<HanjaOption[][]>([]);
  const [selectedHanja, setSelectedHanja] = useState<(SelectedHanja | null)[]>([]);
  const [loadingHanja, setLoadingHanja] = useState(false);

  // 결과
  const [result, setResult]   = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // 이름 입력 처리
  function handleNameChange(val: string) {
    const t = val.replace(/\s/g, "").slice(0, 4);
    setNameInput(t);
    const ss = SURNAME_STROKES[t[0]] ?? 0;
    setSurnameStrokes(ss);
    setSelectedHanja(Array(t.length).fill(null));
    setError("");
  }

  // 한자 선택 화면으로 이동 (한자 목록 불러오기)
  async function handleGoToHanja() {
    if (nameInput.length < 2) { setError("성씨 포함 2글자 이상 입력해주세요."); return; }
    if (!surnameStrokes) { setError("성씨 획수를 확인할 수 없어요. 직접 입력해주세요."); return; }

    setLoadingHanja(true);
    try {
      const chars = Array.from(nameInput);
      const results = await Promise.all(
        chars.map((char, i) =>
          i === 0
            ? Promise.resolve([]) // 성씨는 한자 선택 없이 고정
            : fetch(`/api/naming/hanja?sound=${char}&surnameStrokes=${surnameStrokes}`)
                .then(r => r.json())
                .then(d => d.results ?? [])
        )
      );
      setHanjaOptions(results);
      setStep("hanja");
    } catch {
      setError("한자 목록을 불러오는 데 실패했어요.");
    } finally {
      setLoadingHanja(false);
    }
  }

  // 한자 선택
  function selectHanja(charIdx: number, option: HanjaOption) {
    const next = [...selectedHanja];
    next[charIdx] = {
      hanja: option.hanja,
      meaning: option.meaning,
      strokes: option.strokes_original,
      element: option.five_elements,
    };
    setSelectedHanja(next);
  }

  // 분석 실행
  async function handleAnalyze() {
    const nameChars = Array.from(nameInput);
    const strokesList = nameChars.map((_, i) => {
      if (i === 0) return surnameStrokes;
      return selectedHanja[i]?.strokes ?? 0;
    });

    if (strokesList.some(s => !s)) {
      setError("이름 글자의 한자를 모두 선택해주세요."); return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/naming/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameHangul: nameInput, strokesList }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setResult(data.result);
      setStep("result");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() { setStep("input"); setResult(null); setNameInput(""); setSelectedHanja([]); }

  // ── STEP 1: 이름 입력 ──────────────────────────────────
  if (step === "input") return (
    <main className="page">
      <div className="container" style={{ maxWidth: 460 }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--text-faint)", textDecoration: "none" }}>← 홈으로</Link>
          <h1 style={{ marginTop: 16, fontSize: 26, fontWeight: 700, color: "var(--text-primary)" }}>이름 감명 ✨</h1>
          <p style={{ marginTop: 6, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            이름을 입력하면 한자를 직접 고르고<br />수리성명학으로 점수를 분석해드려요.
          </p>
        </div>

        {/* 이름 입력 */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
            이름 입력 <span style={{ fontWeight: 400, color: "var(--text-faint)" }}>(성씨 포함, 최대 4글자)</span>
          </label>
          <input
            type="text" value={nameInput}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="예: 한지민"
            maxLength={4}
            style={{
              width: "100%", padding: "16px", fontSize: 24, fontWeight: 700,
              border: "1.5px solid var(--border)", borderRadius: 14,
              background: "var(--card-bg)", color: "var(--text-primary)",
              outline: "none", letterSpacing: 14, textAlign: "center",
            }}
          />
        </div>

        {/* 성씨 획수 표시 */}
        {nameInput.length > 0 && (
          <div style={{
            marginBottom: 20, padding: "12px 16px",
            background: surnameStrokes ? "#f0fdf4" : "var(--section-bg)",
            borderRadius: 12,
            border: `1px solid ${surnameStrokes ? "#bbf7d0" : "var(--border)"}`,
          }}>
            {surnameStrokes ? (
              <p style={{ fontSize: 13, color: "#15803d" }}>
                ✅ <strong>{nameInput[0]}</strong> 성씨 원획법 획수: <strong>{surnameStrokes}획</strong> (자동 입력)
              </p>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                  <strong>{nameInput[0]}</strong> 성씨 획수를 직접 입력해주세요
                </p>
                <input
                  type="number" min={1} max={50}
                  value={surnameStrokes || ""}
                  onChange={e => setSurnameStrokes(Number(e.target.value))}
                  placeholder="획수"
                  style={{
                    width: 80, padding: "8px", fontSize: 16, fontWeight: 700,
                    border: "1.5px solid var(--border)", borderRadius: 8,
                    background: "var(--card-bg)", color: "var(--text-primary)",
                    textAlign: "center", outline: "none",
                  }}
                />
              </div>
            )}
          </div>
        )}

        {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button
          onClick={handleGoToHanja}
          disabled={loadingHanja || nameInput.length < 2}
          style={{
            width: "100%", padding: "15px", fontSize: 16, fontWeight: 700,
            background: nameInput.length >= 2 ? "var(--text-primary)" : "var(--border)",
            color: nameInput.length >= 2 ? "var(--card-bg)" : "var(--text-faint)",
            border: "none", borderRadius: 12,
            cursor: nameInput.length >= 2 ? "pointer" : "not-allowed",
          }}
        >
          {loadingHanja ? "한자 불러오는 중..." : "다음 — 한자 선택하기 →"}
        </button>

        {/* 지원 성씨 */}
        <div style={{ marginTop: 20, padding: "14px 16px", background: "var(--section-bg)", borderRadius: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>자동입력 지원 성씨</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(SURNAME_STROKES).map(([s, n]) => (
              <span key={s} style={{
                fontSize: 12, padding: "3px 8px", borderRadius: 8,
                background: "var(--card-bg)", color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}>{s}({n})</span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );

  // ── STEP 2: 한자 선택 ──────────────────────────────────
  if (step === "hanja") {
    const nameChars = Array.from(nameInput);
    const allSelected = nameChars.every((_, i) => i === 0 || selectedHanja[i] !== null);

    return (
      <main className="page">
        <div className="container" style={{ maxWidth: 460 }}>
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => setStep("input")}
              style={{ fontSize: 13, color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              ← 이름 다시 입력
            </button>
            <h1 style={{ marginTop: 16, fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
              한자 선택
            </h1>
            <p style={{ marginTop: 4, fontSize: 13, color: "var(--text-secondary)" }}>
              각 글자에 맞는 한자를 골라주세요.
            </p>
          </div>

          {/* 현재 선택 상태 미리보기 */}
          <div style={{
            display: "flex", gap: 8, padding: "16px", marginBottom: 24,
            background: "var(--card-bg)", borderRadius: 14, border: "1px solid var(--border)",
            justifyContent: "center",
          }}>
            {nameChars.map((char, i) => {
              const sel = selectedHanja[i];
              const es = sel ? ELEMENT_STYLE[sel.element] : null;
              return (
                <div key={i} style={{ textAlign: "center", minWidth: 60 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{char}</div>
                  {i === 0 ? (
                    <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>
                      성씨({surnameStrokes}획)
                    </div>
                  ) : sel ? (
                    <>
                      <div style={{ fontSize: 18, color: es?.color ?? "#888", fontWeight: 600 }}>{sel.hanja}</div>
                      <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{sel.strokes}획</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>미선택</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 글자별 한자 선택 */}
          {nameChars.map((char, charIdx) => {
            if (charIdx === 0) return null;
            const options = hanjaOptions[charIdx] ?? [];
            const sel = selectedHanja[charIdx];

            return (
              <div key={charIdx} style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
                  <span style={{ fontSize: 20, marginRight: 8 }}>{char}</span>
                  글자 한자 선택
                  {sel && (
                    <span style={{
                      fontSize: 12, marginLeft: 10, padding: "2px 10px", borderRadius: 20,
                      background: "#f0fdf4", color: "#15803d", fontWeight: 600,
                    }}>✓ {sel.hanja} 선택됨</span>
                  )}
                </h2>

                {options.length === 0 ? (
                  <div style={{ padding: "16px", background: "var(--section-bg)", borderRadius: 12,
                    fontSize: 13, color: "var(--text-faint)", textAlign: "center" }}>
                    '{char}' 음절의 한자 데이터가 없어요.<br />
                    <span style={{ fontSize: 12 }}>다른 글자를 사용하거나 DB 추가가 필요해요.</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {options.map((opt) => {
                      const isSelected = sel?.hanja === opt.hanja;
                      const rs = opt.suriPreview ? getRatingStyle(opt.suriPreview.rating) : null;
                      const es = ELEMENT_STYLE[opt.five_elements];
                      return (
                        <button
                          key={opt.hanja}
                          onClick={() => selectHanja(charIdx, opt)}
                          style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "14px 16px", borderRadius: 12, textAlign: "left",
                            border: `1.5px solid ${isSelected ? "#2563eb" : "var(--border)"}`,
                            background: isSelected ? "#eff6ff" : "var(--card-bg)",
                            cursor: "pointer", transition: "all 0.15s",
                          }}
                        >
                          {/* 한자 */}
                          <div style={{ fontSize: 28, fontWeight: 700, color: isSelected ? "#1d4ed8" : "var(--text-primary)", minWidth: 40, textAlign: "center" }}>
                            {opt.hanja}
                          </div>
                          {/* 정보 */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                                {opt.meaning}
                              </span>
                              <span style={{
                                fontSize: 11, padding: "1px 7px", borderRadius: 10,
                                background: es?.bg, color: es?.color, fontWeight: 600,
                              }}>
                                {es?.label}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-faint)" }}>
                              획수 {opt.strokes_original}획
                              {opt.suriPreview && ` · 형격 ${opt.suriPreview.strokes}획`}
                            </div>
                          </div>
                          {/* 수리 등급 */}
                          {rs && (
                            <div style={{
                              fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                              background: rs.bg, color: rs.color, whiteSpace: "nowrap",
                            }}>
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
              width: "100%", padding: "15px", fontSize: 16, fontWeight: 700,
              background: allSelected ? "var(--text-primary)" : "var(--border)",
              color: allSelected ? "var(--card-bg)" : "var(--text-faint)",
              border: "none", borderRadius: 12,
              cursor: allSelected ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "분석 중..." : "이름 분석하기 →"}
          </button>
        </div>
      </main>
    );
  }

  // ── STEP 3: 결과 ───────────────────────────────────────
  const score = result!.namingScore;
  const nameChars = Array.from(nameInput);
  const overallStyle = getRatingStyle(score.overallRating);
  const gukList = [
    { label: "원격(元格)",  data: score.fourGuk.wonGuk },
    { label: "형격(亨格)",  data: score.fourGuk.hyeongGuk },
    { label: "이격(利格)",  data: score.fourGuk.iGuk },
    { label: "정격(貞格)",  data: score.fourGuk.jeonGuk },
  ];
  const avgScore = Math.round(gukList.reduce((a, { data }) => a + getRatingScore(data.rating), 0) / 4);

  // 한자 이름 조합
  const hanjaName = nameChars.map((_, i) => {
    if (i === 0) return "";
    return selectedHanja[i]?.hanja ?? "?";
  }).join("");

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 460 }}>
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => setStep("hanja")}
            style={{ fontSize: 13, color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            ← 한자 다시 선택
          </button>
        </div>

        {/* 이름 + 한자 헤더 */}
        <div style={{
          padding: "24px 20px", borderRadius: 16, marginBottom: 20, textAlign: "center",
          background: overallStyle.bg, border: `1.5px solid ${overallStyle.color}33`,
        }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: 4 }}>
              {nameInput}
            </span>
            <span style={{ fontSize: 20, color: overallStyle.color, marginLeft: 10, letterSpacing: 4 }}>
              {hanjaName}
            </span>
          </div>
          {/* 한자별 뜻 */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 16 }}>
            {nameChars.map((char, i) => {
              if (i === 0) return null;
              const sel = selectedHanja[i];
              const es = sel ? ELEMENT_STYLE[sel.element] : null;
              return sel ? (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{char} {sel.hanja}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: es?.color }}>{sel.meaning}</div>
                </div>
              ) : null;
            })}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>이름 종합 점수</p>
          <p style={{ fontSize: 30, fontWeight: 800, color: overallStyle.color, marginBottom: 12 }}>
            {overallStyle.emoji} {score.overallRating}
          </p>
          <div style={{ background: "#e5e7eb", borderRadius: 999, height: 10, overflow: "hidden" }}>
            <div style={{ width: `${avgScore}%`, height: "100%", background: overallStyle.bar, borderRadius: 999 }} />
          </div>
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 6 }}>4격 평균 {avgScore}점</p>
        </div>

        {/* 4격 분석 */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>4격 수리 분석</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {gukList.map(({ label, data }) => {
              const s = getRatingStyle(data.rating);
              const info = GUK_INFO[label];
              return (
                <div key={label} style={{
                  padding: "16px", borderRadius: 14,
                  background: "var(--card-bg)", border: `1px solid ${s.color}33`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</span>
                      <span style={{
                        fontSize: 11, marginLeft: 8, padding: "2px 7px", borderRadius: 6,
                        background: "var(--section-bg)", color: "var(--text-faint)", fontWeight: 600,
                      }}>{info?.period}</span>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: s.bg, color: s.color, whiteSpace: "nowrap",
                    }}>{s.emoji} {data.rating}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 8, lineHeight: 1.5 }}>{info?.desc}</p>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                    {data.strokes}획 · {data.name}
                  </div>
                  <div style={{ background: "#e5e7eb", borderRadius: 999, height: 4, marginBottom: 6 }}>
                    <div style={{ width: `${getRatingScore(data.rating)}%`, height: "100%", background: s.bar, borderRadius: 999 }} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{data.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 발음오행 */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>발음오행</h2>
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 12 }}>
            이름을 부를 때 나오는 소리의 기운이에요.
          </p>
          <div style={{ display: "flex", gap: 10, padding: "16px", background: "var(--card-bg)", borderRadius: 14, border: "1px solid var(--border)" }}>
            {score.pronunciationElements.map((el, i) => {
              const es = ELEMENT_STYLE[el.element] ?? { color: "#888", bg: "#f9fafb", label: el.elementKr };
              return (
                <div key={i} style={{ flex: 1, textAlign: "center", padding: "12px 8px", background: es.bg, borderRadius: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{el.char}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: es.color }}>{es.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 요약 */}
        <div style={{
          padding: "14px 16px", borderRadius: 12, marginBottom: 24,
          background: "var(--section-bg)", fontSize: 13, color: "var(--text-secondary)",
          lineHeight: 1.8, borderLeft: `3px solid ${overallStyle.bar}`,
        }}>
          <strong style={{ color: "var(--text-primary)" }}>요약</strong><br />{score.summary}
        </div>

        <button onClick={reset} style={{
          width: "100%", padding: "14px", fontSize: 15, fontWeight: 700,
          background: "var(--text-primary)", color: "var(--card-bg)",
          border: "none", borderRadius: 12, cursor: "pointer",
        }}>
          다른 이름 분석하기
        </button>
      </div>
    </main>
  );
}
