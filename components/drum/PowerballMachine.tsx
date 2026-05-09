"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/* ═══════════════════ 공유 RAF HOOK (드럼 2개를 1개 루프로) ═══════════════════ */
function useSharedDrums() {
  const angleRef = useRef({ w: 0, p: 0 });
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const modeRef = useRef<"idle" | "spin_w" | "slow_w" | "spin_p" | "slow_p">("idle");
  const spinDataRef = useRef({ startTs: 0, slowStart: 0 });
  const callbackRef = useRef<(() => void) | null>(null);
  const [angles, setAngles] = useState({ w: 0, p: 0 });

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const tick = useCallback((ts: number) => {
    const dt = lastRef.current ? ts - lastRef.current : 0;
    lastRef.current = ts;
    const a = angleRef.current;
    const mode = modeRef.current;

    if (mode === "idle") {
      a.w += dt * 0.00012;
      a.p += dt * 0.00015;
    } else if (mode === "spin_w") {
      const elapsed = ts - spinDataRef.current.startTs;
      const FAST = 1800;
      const progress = Math.min(elapsed / FAST, 1);
      const speed = 0.00012 + (0.009 - 0.00012) * Math.sin(progress * Math.PI);
      a.w += dt * speed;
      a.p += dt * 0.00015; // pb는 계속 idle
      if (elapsed >= FAST) { modeRef.current = "slow_w"; spinDataRef.current.slowStart = ts; }
    } else if (mode === "slow_w") {
      const p = Math.min((ts - spinDataRef.current.slowStart) / 900, 1);
      const speed = 0.009 * (1 - p) * (1 - p);
      a.w += dt * speed;
      a.p += dt * 0.00015;
      if (p >= 1) { modeRef.current = "idle"; callbackRef.current?.(); callbackRef.current = null; }
    } else if (mode === "spin_p") {
      const elapsed = ts - spinDataRef.current.startTs;
      const FAST = 1800;
      const progress = Math.min(elapsed / FAST, 1);
      const speed = 0.00015 + (0.009 - 0.00015) * Math.sin(progress * Math.PI);
      a.p += dt * speed;
      a.w += dt * 0.00012;
      if (elapsed >= FAST) { modeRef.current = "slow_p"; spinDataRef.current.slowStart = ts; }
    } else if (mode === "slow_p") {
      const p = Math.min((ts - spinDataRef.current.slowStart) / 900, 1);
      const speed = 0.009 * (1 - p) * (1 - p);
      a.p += dt * speed;
      a.w += dt * 0.00012;
      if (p >= 1) { modeRef.current = "idle"; callbackRef.current?.(); callbackRef.current = null; }
    }

    setAngles({ w: a.w, p: a.p });
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return stopRaf;
  }, [tick, stopRaf]);

  const spinWhite = useCallback((onDone: () => void) => {
    modeRef.current = "spin_w";
    spinDataRef.current.startTs = performance.now();
    lastRef.current = null;
    callbackRef.current = onDone;
  }, []);

  const spinPb = useCallback((onDone: () => void) => {
    modeRef.current = "spin_p";
    spinDataRef.current.startTs = performance.now();
    lastRef.current = null;
    callbackRef.current = onDone;
  }, []);

  return { angles, spinWhite, spinPb };
}

/* ═══════════════════ HELPERS ═══════════════════ */
function getRandom(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generatePowerball() {
  const whites = new Set<number>();
  while (whites.size < 5) whites.add(getRandom(1, 69));
  return { whites: [...whites].sort((a, b) => a - b), powerball: getRandom(1, 26) };
}

// 드럼에 표시할 공 개수 줄임 (시각적으로 충분, GPU 부하 ↓)
const WHITE_DISPLAY = 30; // 실제 69개 중 45개만 표시
const PB_DISPLAY = 16;    // 실제 26개 중 16개만 표시

function getBallPos(idx: number, total: number, radius: number, angle: number, center: number) {
  const base = (idx / total) * 2 * Math.PI - Math.PI / 2;
  const a = base + angle;
  return { x: center + radius * Math.cos(a) - 13, y: center + radius * Math.sin(a) - 13 };
}

const FORTUNES = [
  "The universe conspires in your favor today.",
  "Every dream deserves a chance. Play yours.",
  "Fortune favors the bold — and those who believe.",
  "Luck is where preparation meets opportunity.",
  "Today's numbers carry the energy of new beginnings.",
  "The stars aligned to bring you these numbers.",
  "Your intuition guided you here. Trust it fully.",
];

type Step = "idle" | "spinning_white" | "white_done" | "spinning_pb" | "done";

export default function PowerballMachine() {
  const { angles, spinWhite, spinPb } = useSharedDrums();

  const [step, setStep] = useState<Step>("idle");
  const [whites, setWhites] = useState<number[]>([]);
  const [powerball, setPowerball] = useState<number | null>(null);
  const [visibleWhites, setVisibleWhites] = useState<Set<number>>(new Set());
  const [pbVisible, setPbVisible] = useState(false);
  const [fortune] = useState(() => FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
  const [copied, setCopied] = useState(false);

  const handleDraw = useCallback(() => {
    if (step !== "idle" && step !== "done") return;
    setStep("spinning_white");
    setWhites([]); setPowerball(null);
    setVisibleWhites(new Set()); setPbVisible(false);
    const result = generatePowerball();

    spinWhite(() => {
      setStep("white_done");
      setWhites(result.whites);
      result.whites.forEach((n, i) => {
        setTimeout(() => {
          setVisibleWhites(prev => new Set([...prev, n]));
          if (navigator.vibrate) navigator.vibrate(20);
        }, i * 300);
      });

      setTimeout(() => {
        setStep("spinning_pb");
        spinPb(() => {
          setPowerball(result.powerball);
          setTimeout(() => { setPbVisible(true); if (navigator.vibrate) navigator.vibrate([40, 0, 40]); }, 300);
          setTimeout(() => { setStep("done"); }, 700);
        });
      }, result.whites.length * 300 + 500);
    });
  }, [step, spinWhite, spinPb]);

  const handleReset = useCallback(() => {
    setStep("idle"); setWhites([]); setPowerball(null);
    setVisibleWhites(new Set()); setPbVisible(false);
  }, []);

  const copyNums = useCallback(() => {
    if (!whites.length || powerball === null) return;
    navigator.clipboard.writeText(`${whites.join(", ")} + PB ${powerball}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }, [whites, powerball]);

  const isDone = step === "done";
  const isSpinning = step !== "idle" && step !== "done";
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // 드럼 크기 — 모바일에 맞게 축소
  const WC = 95;  // white drum center (반지름)
  const PC = 62;  // pb drum center

  const wMsg = step === "spinning_white" ? "Spinning..." :
    (step === "white_done" || step === "spinning_pb" || isDone) ? "White ✓" :
    "1 – 69";
  const pMsg = step === "spinning_pb" ? "Spinning..." :
    isDone ? "PB ✓" : "1 – 26";

  const css = `
    .pb-root{font-family:'Inter',-apple-system,sans-serif;background:linear-gradient(180deg,#0f0c29,#1a1a4e,#24243e);min-height:100vh;color:#fff;max-width:480px;margin:0 auto;padding-bottom:60px;}
    .pb-ball{position:absolute;width:24px;height:24px;border-radius:50%;cursor:default;border:none;user-select:none;will-change:transform;}
    .pb-ball::after{content:'';position:absolute;top:3px;left:4px;width:36%;height:24%;background:rgba(255,255,255,0.38);border-radius:50%;pointer-events:none;}
    .pb-w{background:radial-gradient(circle at 35% 32%,#fff,#c0c0c0 70%);color:#1a1a2e;box-shadow:inset 0 -2px 3px rgba(0,0,0,0.2),0 1px 4px rgba(200,200,200,0.3);}
    .pb-r{background:radial-gradient(circle at 35% 32%,#f07060,#a02020 70%);color:#fff;box-shadow:inset 0 -2px 3px rgba(0,0,0,0.3),0 1px 4px rgba(192,57,43,0.4);}
    .res-w{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#1a1a2e;background:radial-gradient(circle at 35% 32%,#fff,#c0c0c0 70%);box-shadow:inset 0 -3px 6px rgba(0,0,0,0.2),0 4px 12px rgba(200,200,200,0.25);position:relative;flex-shrink:0;border:2px solid rgba(255,255,255,0.5);transition:all 0.5s cubic-bezier(0.34,1.56,0.64,1);}
    .res-w::after{content:'';position:absolute;top:6px;left:7px;width:34%;height:22%;background:rgba(255,255,255,0.6);border-radius:50%;}
    .res-pb{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#fff;background:radial-gradient(circle at 35% 32%,#f07060,#a02020 70%);box-shadow:inset 0 -3px 6px rgba(0,0,0,0.3),0 4px 16px rgba(192,57,43,0.5);position:relative;flex-shrink:0;border:3px solid #e74c3c;transition:all 0.6s cubic-bezier(0.34,1.56,0.64,1);}
    .res-pb::after{content:'';position:absolute;top:6px;left:9px;width:34%;height:22%;background:rgba(255,255,255,0.4);border-radius:50%;}
    .ball-hidden{opacity:0;transform:scale(0.2);}
    .ball-visible{opacity:1;transform:scale(1);}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .fu{animation:fadeUp 0.5s ease both;}
    ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#2e2448;border-radius:2px;}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="pb-root">

        {/* Header */}
        <header style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "16px 24px 12px", textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>🎱</div>
          <div style={{ fontSize: 9, letterSpacing: 4, color: "#a78bfa", textTransform: "uppercase", marginBottom: 3, fontWeight: 700 }}>WISE REST WITH SUNNY · DASANGDAM</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, background: "linear-gradient(135deg,#fff 0%,#a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 2 }}>POWERBALL</h1>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "3px 0 0" }}>5 white balls (1–69) + 1 red Powerball (1–26)</p>
        </header>

        {/* Drums */}
        <div style={{ padding: "18px 16px 0", display: "flex", gap: 10, justifyContent: "center", alignItems: "flex-start" }}>

          {/* White drum */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(196,181,253,0.7)", fontWeight: 700 }}>WHITE BALLS</div>
            <div style={{ position: "relative", width: WC * 2, height: WC * 2, overflow: "visible" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg,#1a1235,#2d1f52,#7c3aed,#c4b5fd,#7c3aed,#2d1f52,#1a1235)", boxShadow: "0 0 0 4px rgba(167,139,250,0.15),inset 0 0 18px rgba(0,0,0,0.55)" }} />
              <div style={{ position: "absolute", inset: 14, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%,#1a1200,#0d0900 70%)" }} />
              {/* 공 45개만 표시 */}
              {Array.from({ length: WHITE_DISPLAY }, (_, i) => i).map(idx => {
                const { x, y } = getBallPos(idx, WHITE_DISPLAY, WC - 14, angles.w, WC);
                return (
                  <div key={idx} className="pb-ball pb-w" style={{ left: x, top: y }} />
                );
              })}
              <div style={{ position: "absolute", inset: 14, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 5 }}>
                <span style={{ fontSize: 9, color: "rgba(196,181,253,0.85)", textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.5, fontWeight: 700 }}>{wMsg}</span>
              </div>
            </div>
          </div>

          {/* Powerball drum */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, marginTop: 24 }}>
            <div style={{ fontSize: 8, letterSpacing: 2, color: "rgba(231,76,60,0.85)", fontWeight: 700 }}>POWERBALL</div>
            <div style={{ position: "relative", width: PC * 2, height: PC * 2, overflow: "visible" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg,#4a0000,#8a1010,#c0392b,#f07060,#c0392b,#8a1010,#4a0000)", boxShadow: "0 0 0 3px rgba(192,57,43,0.2),inset 0 0 14px rgba(0,0,0,0.6)" }} />
              <div style={{ position: "absolute", inset: 10, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%,#2a0000,#0d0000 70%)" }} />
              {Array.from({ length: PB_DISPLAY }, (_, i) => i).map(idx => {
                const { x, y } = getBallPos(idx, PB_DISPLAY, PC - 12, angles.p, PC);
                return (
                  <div key={idx} className="pb-ball pb-r" style={{ left: x, top: y }} />
                );
              })}
              <div style={{ position: "absolute", inset: 10, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 5 }}>
                <span style={{ fontSize: 9, color: "rgba(240,112,96,0.9)", textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.5, fontWeight: 700 }}>{pMsg}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Result card */}
        <div style={{ padding: "14px 16px 0" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "16px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginBottom: 12, fontWeight: 600 }}>YOUR LUCKY NUMBERS · {today}</div>
            <div style={{ fontSize: 8, color: "rgba(196,181,253,0.5)", marginBottom: 8, letterSpacing: 2 }}>WHITE BALLS</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
              {whites.length > 0
                ? whites.map((n, i) => (
                    <div key={n} className={`res-w ${visibleWhites.has(n) ? "ball-visible" : "ball-hidden"}`} style={{ transitionDelay: `${i * 80}ms` }}>{n}</div>
                  ))
                : Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ width: 46, height: 46, borderRadius: "50%", border: "2px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", fontSize: 16 }}>·</div>
                  ))
              }
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.18)", margin: "4px 0" }}>+</div>
            <div style={{ fontSize: 8, color: "rgba(231,76,60,0.5)", marginBottom: 8, letterSpacing: 2, fontWeight: 700 }}>POWERBALL</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {powerball !== null
                ? <div className={`res-pb ${pbVisible ? "ball-visible" : "ball-hidden"}`}>{powerball}</div>
                : <div style={{ width: 54, height: 54, borderRadius: "50%", border: "2px dashed rgba(231,76,60,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(231,76,60,0.15)", fontSize: 20 }}>·</div>
              }
            </div>
            {isDone && (
              <div className="fu" style={{ marginTop: 12, padding: "10px 12px", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 10 }}>
                <div style={{ fontSize: 9, color: "#a78bfa", fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>✦ SUNNY'S MESSAGE</div>
                <p style={{ fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.82)", margin: 0, fontStyle: "italic" }}>"{fortune}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ padding: "12px 16px 0" }}>
          <button onClick={handleDraw} disabled={isSpinning} style={{
            display: "block", width: "100%", padding: "14px",
            background: isSpinning ? "rgba(255,255,255,0.07)" : "linear-gradient(135deg,#7c3aed,#a78bfa)",
            color: "#fff", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 800, letterSpacing: 1,
            cursor: isSpinning ? "not-allowed" : "pointer",
            boxShadow: isSpinning ? "none" : "0 4px 20px rgba(124,58,237,0.4)", transition: "all 0.2s",
          }}>
            {step === "spinning_white" ? "🎱 Spinning white balls..." :
             step === "white_done" ? "⚪ Revealing numbers..." :
             step === "spinning_pb" ? "🔴 Spinning Powerball..." :
             isDone ? "✦ Generate New Numbers" : "✦ Generate My Lucky Numbers"}
          </button>
          {isDone && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={handleReset} style={{ flex: 1, padding: "10px", background: "transparent", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Reset</button>
              <button onClick={copyNums} style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 12, color: copied ? "#a78bfa" : "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {copied ? "✓ Copied!" : "📋 Copy Numbers"}
              </button>
            </div>
          )}
        </div>

        <div style={{ padding: "12px 16px 0", textAlign: "center" }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", lineHeight: 1.6 }}>For entertainment only. Not affiliated with Powerball or any lottery organization.</p>
        </div>
      </div>
    </>
  );
}
