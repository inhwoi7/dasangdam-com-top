"use client";

import { useState } from "react";
import Link from "next/link";

const SURNAME_STROKES: Record<string, number> = {
  김: 8, 이: 7, 박: 6, 최: 11, 정: 15, 강: 9, 조: 14, 윤: 4,
  장: 11, 임: 8, 한: 17, 오: 7, 서: 10, 신: 5, 권: 22, 황: 12,
  안: 6, 송: 7, 류: 9, 전: 6, 홍: 9, 고: 10, 문: 4, 양: 11,
  손: 10, 배: 14, 백: 5, 허: 11, 유: 9, 남: 9,
};

const GUK_EASY: Record<string, { period: string; desc: string }> = {
  "원격(元格)":  { period: "초년운 (유년기)",    desc: "이름 두 글자를 합친 획수예요. 어린 시절과 인생의 기초가 되는 기운이에요." },
  "형격(亨格)":  { period: "청년운 (사회진출)",  desc: "성씨 + 이름 첫 글자의 획수예요. 성격 형성과 사회에 나아가는 시기의 기운이에요." },
  "이격(利格)":  { period: "장년운 (중년기)",    desc: "성씨 + 이름 마지막 글자의 획수예요. 중년의 사회적 성취와 가정운을 나타내요." },
  "정격(貞格)":  { period: "총운 ✨ 가장 중요",  desc: "성씨 + 이름 전체 획수예요. 인생 전체를 관통하는 가장 중요한 기운이에요." },
};

const ELEMENT_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  목: { color: "#15803d", bg: "#f0fdf4", label: "木 (나무)" },
  화: { color: "#b91c1c", bg: "#fef2f2", label: "火 (불)" },
  토: { color: "#b45309", bg: "#fffbeb", label: "土 (흙)" },
  금: { color: "#6b7280", bg: "#f9fafb", label: "金 (쇠)" },
  수: { color: "#1d4ed8", bg: "#eff6ff", label: "水 (물)" },
};


function getRatingStyle(rating: string) {
  switch (rating) {
    case "매우좋음": return { color: "#1d4ed8", bg: "#eff6ff", emoji: "🔵", bar: "#2563eb" };
    case "좋음":     return { color: "#15803d", bg: "#f0fdf4", emoji: "🟢", bar: "#16a34a" };
    case "보통":     return { color: "#b45309", bg: "#fffbeb", emoji: "🟡", bar: "#d97706" };
    case "나쁨":     return { color: "#b91c1c", bg: "#fef2f2", emoji: "🔴", bar: "#dc2626" };
    case "매우나쁨": return { color: "#7f1d1d", bg: "#fee2e2", emoji: "❌", bar: "#991b1b" };
    default:         return { color: "#6b7280", bg: "#f9fafb", emoji: "⚪", bar: "#9ca3af" };
  }
}

function getRatingScore(rating: string): number {
  switch (rating) {
    case "매우좋음": return 100;
    case "좋음":     return 75;
    case "보통":     return 50;
    case "나쁨":     return 25;
    case "매우나쁨": return 10;
    default:         return 50;
  }
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

export default function NamingPage() {
  const [step, setStep] = useState<"input" | "result">("input");
  const [nameInput, setNameInput] = useState("");
  const [strokeInputs, setStrokeInputs] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleNameChange(val: string) {
    const trimmed = val.replace(/\s/g, "");
    setNameInput(trimmed);
    const newStrokes = Array.from({ length: trimmed.length }, (_, i) => {
      if (i === 0) {
        const auto = SURNAME_STROKES[trimmed[0]];
        return auto ? String(auto) : (strokeInputs[0] ?? "");
      }
      return strokeInputs[i] ?? "";
    });
    setStrokeInputs(newStrokes);
    setError("");
  }

  async function handleAnalyze() {
    setError("");
    if (nameInput.length < 2) { setError("성씨 포함 2글자 이상 입력해주세요."); return; }
    if (strokeInputs.some((s) => !s || isNaN(Number(s)) || Number(s) < 1)) {
      setError("모든 글자의 획수를 입력해주세요."); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/naming/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameHangul: nameInput, strokesList: strokeInputs.map(Number) }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "분석 실패");
      setResult(data.result);
      setStep("result");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === "input") {
    return (
      <main className="page">
        <div className="container" style={{ maxWidth: 460 }}>
          <div style={{ marginBottom: 28 }}>
            <Link href="/" style={{ fontSize: 13, color: "var(--text-faint)", textDecoration: "none" }}>← 홈으로</Link>
            <h1 style={{ marginTop: 16, fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>이름 감명 ✨</h1>
            <p style={{ marginTop: 6, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              이름을 입력하면 수리성명학으로 분석해드려요.<br />
              성씨 획수는 자동으로 입력돼요!
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              이름 입력 <span style={{ fontWeight: 400, color: "var(--text-faint)" }}>(성씨 포함, 최대 4글자)</span>
            </label>
            <input
              type="text" value={nameInput}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="예: 한지민"
              maxLength={4}
              style={{
                width: "100%", padding: "14px", fontSize: 22, fontWeight: 700,
                border: "1.5px solid var(--border)", borderRadius: 14,
                background: "var(--card-bg)", color: "var(--text-primary)",
                outline: "none", letterSpacing: 12, textAlign: "center",
              }}
            />
          </div>

          {nameInput.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                각 글자의 획수 <span style={{ fontWeight: 400, color: "var(--text-faint)" }}>(원획법 기준)</span>
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                {Array.from(nameInput).map((char, i) => {
                  const isAuto = i === 0 && !!SURNAME_STROKES[char];
                  return (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>{char}</div>
                      <input
                        type="number" min={1} max={81}
                        value={strokeInputs[i] ?? ""}
                        onChange={(e) => {
                          const next = [...strokeInputs];
                          next[i] = e.target.value;
                          setStrokeInputs(next);
                        }}
                        placeholder="획수"
                        style={{
                          width: "100%", padding: "10px 4px", fontSize: 16, fontWeight: 700,
                          border: `1.5px solid ${isAuto ? "#16a34a55" : "var(--border)"}`,
                          borderRadius: 10, background: isAuto ? "#f0fdf4" : "var(--card-bg)",
                          color: "var(--text-primary)", textAlign: "center", outline: "none",
                        }}
                      />
                      {isAuto && <div style={{ fontSize: 10, color: "#16a34a", marginTop: 3 }}>자동입력</div>}
                    </div>
                  );
                })}
              </div>
              <p style={{ marginTop: 10, fontSize: 12, color: "var(--text-faint)", lineHeight: 1.6 }}>
                💡 주요 성씨는 획수가 자동으로 입력돼요.<br />
                이름 글자는 한자 사전에서 원획법 획수를 확인해주세요.
              </p>
            </div>
          )}

          {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button
            onClick={handleAnalyze}
            disabled={loading || nameInput.length < 2}
            style={{
              width: "100%", padding: "15px", fontSize: 16, fontWeight: 700,
              background: nameInput.length >= 2 ? "var(--text-primary)" : "var(--border)",
              color: nameInput.length >= 2 ? "var(--card-bg)" : "var(--text-faint)",
              border: "none", borderRadius: 12, cursor: nameInput.length >= 2 ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "분석 중..." : "이름 분석하기 →"}
          </button>

          <div style={{ marginTop: 20, padding: "14px 16px", background: "var(--section-bg)", borderRadius: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>자동입력 지원 성씨</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(SURNAME_STROKES).map(([sur, str]) => (
                <span key={sur} style={{
                  fontSize: 12, padding: "3px 8px", borderRadius: 8,
                  background: "var(--card-bg)", color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}>
                  {sur}({str})
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const score = result!.namingScore;
  const overallStyle = getRatingStyle(score.overallRating);
  const gukList = [
    { label: "원격(元格)",  data: score.fourGuk.wonGuk },
    { label: "형격(亨格)",  data: score.fourGuk.hyeongGuk },
    { label: "이격(利格)",  data: score.fourGuk.iGuk },
    { label: "정격(貞格)",  data: score.fourGuk.jeonGuk },
  ];
  const avgScore = Math.round(
    gukList.reduce((acc, { data }) => acc + getRatingScore(data.rating), 0) / gukList.length
  );

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 460 }}>
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => { setStep("input"); setResult(null); }}
            style={{ fontSize: 13, color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            ← 다시 분석하기
          </button>
          <h1 style={{ marginTop: 16, fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
            {nameInput} 분석 결과
          </h1>
        </div>

        <div style={{
          padding: "24px 20px", borderRadius: 16, marginBottom: 20, textAlign: "center",
          background: overallStyle.bg, border: `1.5px solid ${overallStyle.color}33`,
        }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>이름 종합 점수</p>
          <p style={{ fontSize: 32, fontWeight: 800, color: overallStyle.color, marginBottom: 12 }}>
            {overallStyle.emoji} {score.overallRating}
          </p>
          <div style={{ background: "#e5e7eb", borderRadius: 999, height: 10, overflow: "hidden" }}>
            <div style={{ width: `${avgScore}%`, height: "100%", background: overallStyle.bar, borderRadius: 999 }} />
          </div>
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 6 }}>4격 평균 점수 {avgScore}점</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>4격 수리 분석</h2>
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 12 }}>이름을 4가지 방식으로 나눠서 각각의 기운을 봐요.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {gukList.map(({ label, data }) => {
              const s = getRatingStyle(data.rating);
              const easy = GUK_EASY[label];
              return (
                <div key={label} style={{
                  padding: "16px", borderRadius: 14,
                  background: "var(--card-bg)", border: `1px solid ${s.color}33`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, marginLeft: 8,
                        padding: "2px 7px", borderRadius: 6,
                        background: "var(--section-bg)", color: "var(--text-faint)",
                      }}>
                        {easy?.period}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: s.bg, color: s.color, whiteSpace: "nowrap",
                    }}>
                      {s.emoji} {data.rating}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 8, lineHeight: 1.5 }}>
                    {easy?.desc}
                  </p>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                    {data.strokes}획 · {data.name}
                  </div>
                  <div style={{ background: "#e5e7eb", borderRadius: 999, height: 4, marginBottom: 6 }}>
                    <div style={{ width: `${getRatingScore(data.rating)}%`, height: "100%", background: s.bar, borderRadius: 999 }} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {data.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>발음오행</h2>
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 12 }}>
            이름을 부를 때 나오는 소리의 기운이에요. 서로 잘 어울리면 좋아요.
          </p>
          <div style={{ display: "flex", gap: 10, padding: "16px", background: "var(--card-bg)", borderRadius: 14, border: "1px solid var(--border)" }}>
            {score.pronunciationElements.map((el, i) => {
              const es = ELEMENT_STYLE[el.element] ?? { color: "#888", bg: "#f9fafb", label: el.elementKr };
              return (
                <div key={i} style={{ flex: 1, textAlign: "center", padding: "12px 8px", background: es.bg, borderRadius: 10 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>{el.char}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: es.color }}>{es.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          padding: "14px 16px", borderRadius: 12, marginBottom: 24,
          background: "var(--section-bg)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8,
          borderLeft: `3px solid ${overallStyle.bar}`,
        }}>
          <strong style={{ color: "var(--text-primary)" }}>요약</strong><br />
          {score.summary}
        </div>

        <button
          onClick={() => { setStep("input"); setResult(null); }}
          style={{
            width: "100%", padding: "14px", fontSize: 15, fontWeight: 700,
            background: "var(--text-primary)", color: "var(--card-bg)",
            border: "none", borderRadius: 12, cursor: "pointer",
          }}
        >
          다른 이름 분석하기
        </button>
      </div>
    </main>
  );
}
