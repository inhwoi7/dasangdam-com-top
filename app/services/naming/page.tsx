"use client";

import { useState } from "react";
import Link from "next/link";

// ── 타입 ──────────────────────────────────────
interface HanjaInfo {
  hanja: string;
  meaning: string;
  strokes: number;
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

// ── 등급별 색상 ───────────────────────────────
function getRatingColor(rating: string) {
  switch (rating) {
    case "매우좋음": return "#2563eb";
    case "좋음":     return "#16a34a";
    case "보통":     return "#d97706";
    case "나쁨":     return "#dc2626";
    case "매우나쁨": return "#991b1b";
    default:         return "#888";
  }
}

function getRatingBg(rating: string) {
  switch (rating) {
    case "매우좋음": return "#eff6ff";
    case "좋음":     return "#f0fdf4";
    case "보통":     return "#fffbeb";
    case "나쁨":     return "#fef2f2";
    case "매우나쁨": return "#fee2e2";
    default:         return "#f4f4f5";
  }
}

function getRatingEmoji(rating: string) {
  switch (rating) {
    case "매우좋음": return "★★★";
    case "좋음":     return "★★";
    case "보통":     return "★";
    case "나쁨":     return "✕";
    case "매우나쁨": return "✕✕";
    default:         return "";
  }
}

const ELEMENT_COLOR: Record<string, string> = {
  목: "#16a34a", 화: "#dc2626", 토: "#d97706", 금: "#9ca3af", 수: "#2563eb",
};

// ── 메인 컴포넌트 ─────────────────────────────
export default function NamingPage() {
  const [step, setStep] = useState<"input" | "result">("input");
  const [nameInput, setNameInput] = useState("");
  const [strokeInputs, setStrokeInputs] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 이름 입력 시 획수 입력칸 개수 동기화
  function handleNameChange(val: string) {
    setNameInput(val);
    setStrokeInputs(Array.from({ length: val.length }, (_, i) => strokeInputs[i] ?? ""));
    setError("");
  }

  // 분석 요청
  async function handleAnalyze() {
    setError("");

    if (nameInput.length < 2) {
      setError("성씨 포함 2글자 이상 입력해주세요."); return;
    }
    if (strokeInputs.some((s) => !s || isNaN(Number(s)) || Number(s) < 1)) {
      setError("모든 글자의 획수를 입력해주세요."); return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/naming/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameHangul: nameInput,
          strokesList: strokeInputs.map(Number),
        }),
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

  // ── 입력 화면 ────────────────────────────────
  if (step === "input") {
    return (
      <main className="page">
        <div className="container" style={{ maxWidth: 480 }}>

          {/* 헤더 */}
          <div style={{ marginBottom: 28 }}>
            <Link href="/" style={{ fontSize: 13, color: "var(--text-faint)", textDecoration: "none" }}>
              ← 홈으로
            </Link>
            <h1 style={{ marginTop: 16, fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
              이름 감명
            </h1>
            <p style={{ marginTop: 6, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              성씨 포함 이름과 각 글자의 원획법 획수를 입력하면<br />
              수리성명학 기준으로 점수를 분석해드려요.
            </p>
          </div>

          {/* 이름 입력 */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              이름 입력 (성씨 포함)
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="예: 한지민"
              maxLength={4}
              style={{
                width: "100%", padding: "12px 14px", fontSize: 18,
                border: "1.5px solid var(--border)", borderRadius: 12,
                background: "var(--card-bg)", color: "var(--text-primary)",
                outline: "none", letterSpacing: 6, textAlign: "center",
              }}
            />
          </div>

          {/* 획수 입력 */}
          {nameInput.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                각 글자의 원획법 획수
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                {Array.from(nameInput).map((char, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                      {char}
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={strokeInputs[i] ?? ""}
                      onChange={(e) => {
                        const next = [...strokeInputs];
                        next[i] = e.target.value;
                        setStrokeInputs(next);
                      }}
                      placeholder="획수"
                      style={{
                        width: "100%", padding: "10px 6px", fontSize: 15,
                        border: "1.5px solid var(--border)", borderRadius: 10,
                        background: "var(--card-bg)", color: "var(--text-primary)",
                        textAlign: "center", outline: "none",
                      }}
                    />
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 8, fontSize: 12, color: "var(--text-faint)" }}>
                💡 원획법 획수는 일반 획수와 다를 수 있어요. 작명 전문 서적이나 한자 사전을 참고하세요.
              </p>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}

          {/* 분석 버튼 */}
          <button
            onClick={handleAnalyze}
            disabled={loading || nameInput.length < 2}
            style={{
              width: "100%", padding: "14px", fontSize: 16, fontWeight: 700,
              background: nameInput.length >= 2 ? "var(--text-primary)" : "var(--border)",
              color: nameInput.length >= 2 ? "var(--card-bg)" : "var(--text-faint)",
              border: "none", borderRadius: 12, cursor: nameInput.length >= 2 ? "pointer" : "not-allowed",
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "분석 중..." : "이름 분석하기"}
          </button>

          {/* 예시 안내 */}
          <div style={{
            marginTop: 24, padding: "14px 16px",
            background: "var(--section-bg)", borderRadius: 12,
            fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8,
          }}>
            <strong style={{ color: "var(--text-primary)" }}>입력 예시</strong><br />
            이름: 한지민<br />
            획수: 한(17) · 지(8) · 민(5)
          </div>

        </div>
      </main>
    );
  }

  // ── 결과 화면 ────────────────────────────────
  const score = result!.namingScore;
  const gukList = [
    { label: "원격(元格)", data: score.fourGuk.wonGuk },
    { label: "형격(亨格)", data: score.fourGuk.hyeongGuk },
    { label: "이격(利格)", data: score.fourGuk.iGuk },
    { label: "정격(貞格)", data: score.fourGuk.jeonGuk },
  ];

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 480 }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => { setStep("input"); setResult(null); }}
            style={{ fontSize: 13, color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            ← 다시 분석하기
          </button>
          <h1 style={{ marginTop: 16, fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
            {nameInput} 분석 결과
          </h1>
        </div>

        {/* 종합 등급 */}
        <div style={{
          padding: "20px", borderRadius: 16, marginBottom: 16, textAlign: "center",
          background: getRatingBg(score.overallRating),
          border: `1.5px solid ${getRatingColor(score.overallRating)}22`,
        }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>종합 평가</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: getRatingColor(score.overallRating) }}>
            {score.overallRating} {getRatingEmoji(score.overallRating)}
          </p>
        </div>

        {/* 4격 분석 */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
            4격(四格) 수리 분석
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {gukList.map(({ label, data }) => (
              <div key={label} style={{
                padding: "14px 16px", borderRadius: 12,
                background: "var(--card-bg)",
                border: `1px solid ${getRatingColor(data.rating)}33`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                    background: getRatingBg(data.rating), color: getRatingColor(data.rating),
                  }}>
                    {data.rating}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>
                  {data.strokes}획 · {data.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {data.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 발음오행 */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
            발음오행
          </h2>
          <div style={{
            display: "flex", gap: 10, padding: "16px",
            background: "var(--card-bg)", borderRadius: 12, border: "1px solid var(--border)",
          }}>
            {score.pronunciationElements.map((el, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                  {el.char}
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 700, padding: "3px 0",
                  color: ELEMENT_COLOR[el.element] ?? "#888",
                }}>
                  {el.elementKr}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 요약 */}
        <div style={{
          padding: "14px 16px", borderRadius: 12,
          background: "var(--section-bg)", marginBottom: 24,
          fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7,
        }}>
          {score.summary}
        </div>

        {/* 다시 분석 버튼 */}
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
