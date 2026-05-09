"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/* ═══════════════════ DRUM HOOK ═══════════════════ */
function useDrum() {
  const angleRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [drumAngle, setDrumAngle] = useState(0);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const startIdle = useCallback(() => {
    stopRaf();
    let last: number | null = null;
    const frame = (ts: number) => {
      if (last) angleRef.current += (ts - last) * 0.00012;
      last = ts;
      setDrumAngle(angleRef.current);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
  }, [stopRaf]);

  const spinAndStop = useCallback((onDone: () => void) => {
    stopRaf();
    const FAST_DUR = 1800;
    let startTs: number | null = null;
    let last: number | null = null;
    const slowDown = (cb: () => void) => {
      let slowStart: number | null = null, slowLast: number | null = null;
      const frame = (ts: number) => {
        if (!slowStart) slowStart = ts;
        const p = Math.min((ts - slowStart) / 900, 1);
        const speed = 0.008 * (1 - p) * (1 - p);
        if (slowLast) angleRef.current += (ts - slowLast) * speed;
        slowLast = ts;
        setDrumAngle(angleRef.current);
        if (p < 1) { rafRef.current = requestAnimationFrame(frame); } else { cb(); }
      };
      rafRef.current = requestAnimationFrame(frame);
    };
    const fastFrame = (ts: number) => {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;
      const progress = Math.min(elapsed / FAST_DUR, 1);
      const speed = 0.00012 + (0.008 - 0.00012) * Math.sin(progress * Math.PI);
      if (last) angleRef.current += (ts - last) * speed;
      last = ts;
      setDrumAngle(angleRef.current);
      if (elapsed < FAST_DUR) { rafRef.current = requestAnimationFrame(fastFrame); } else { slowDown(onDone); }
    };
    rafRef.current = requestAnimationFrame(fastFrame);
  }, [stopRaf]);

  useEffect(() => { startIdle(); return stopRaf; }, [startIdle, stopRaf]);
  return { drumAngle, startIdle, spinAndStop };
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
function getBallPos(n: number, total: number, radius: number, angle: number, center: number) {
  const base = ((n - 1) / total) * 2 * Math.PI - Math.PI / 2;
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
  const whiteDrum = useDrum();
  const pbDrum = useDrum();

  const [step, setStep] = useState<Step>("idle");
  const [whites, setWhites] = useState<number[]>([]);
  const [powerball, setPowerball] = useState<number | null>(null);
  const [visibleWhites, setVisibleWhites] = useState<Set<number>>(new Set());
  const [pbVisible, setPbVisible] = useState(false);
  const [fortune] = useState(() => FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
  const [copied, setCopied] = useState(false);
  const [hoveredW, setHoveredW] = useState<number | null>(null);
  const [hoveredP, setHoveredP] = useState<number | null>(null);

  const handleDraw = useCallback(() => {
    if (step !== "idle" && step !== "done") return;
    setStep("spinning_white");
    setWhites([]); setPowerball(null);
    setVisibleWhites(new Set()); setPbVisible(false);
    const result = generatePowerball();

    whiteDrum.spinAndStop(() => {
      setStep("white_done");
      setWhites(result.whites);
      result.whites.forEach((n, i) => {
        setTimeout(() => {
          setVisibleWhites(prev => new Set([...prev, n]));
          if (navigator.vibrate) navigator.vibrate(20);
        }, i * 350);
      });

      setTimeout(() => {
        setStep("spinning_pb");
        pbDrum.spinAndStop(() => {
          setPowerball(result.powerball);
          setTimeout(() => { setPbVisible(true); if (navigator.vibrate) navigator.vibrate([40,0,40]); }, 300);
          setTimeout(() => { setStep("done"); whiteDrum.startIdle(); pbDrum.startIdle(); }, 800);
        });
      }, result.whites.length * 350 + 600);
    });
  }, [step, whiteDrum, pbDrum]);

  const handleReset = useCallback(() => {
    setStep("idle"); setWhites([]); setPowerball(null);
    setVisibleWhites(new Set()); setPbVisible(false);
    whiteDrum.startIdle(); pbDrum.startIdle();
  }, [whiteDrum, pbDrum]);

  const copyNums = useCallback(() => {
    if (!whites.length || powerball === null) return;
    navigator.clipboard.writeText(`${whites.join(", ")} + PB ${powerball}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }, [whites, powerball]);

  const isDone = step === "done";
  const isSpinning = step === "spinning_white" || step === "white_done" || step === "spinning_pb";
  const today = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });

  const css = `
    .pb-root{font-family:'Inter',-apple-system,sans-serif;background:linear-gradient(180deg,#0f0c29,#1a1a4e,#24243e);min-height:100vh;color:#fff;max-width:480px;margin:0 auto;padding-bottom:60px;}
    .pb-ball{position:absolute;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;cursor:default;border:none;user-select:none;}
    .pb-ball::after{content:'';position:absolute;top:3px;left:5px;width:38%;height:25%;background:rgba(255,255,255,0.4);border-radius:50%;pointer-events:none;}
    .pb-w{background:radial-gradient(circle at 35% 32%,#fff,#c0c0c0 70%);color:#1a1a2e;box-shadow:inset 0 -2px 3px rgba(0,0,0,0.2),0 2px 5px rgba(200,200,200,0.35);}
    .pb-r{background:radial-gradient(circle at 35% 32%,#f07060,#a02020 70%);color:#fff;box-shadow:inset 0 -2px 3px rgba(0,0,0,0.3),0 2px 5px rgba(192,57,43,0.5);}
    .res-w{width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#1a1a2e;background:radial-gradient(circle at 35% 32%,#fff,#c0c0c0 70%);box-shadow:inset 0 -3px 6px rgba(0,0,0,0.2),0 4px 12px rgba(200,200,200,0.25);position:relative;flex-shrink:0;border:2px solid rgba(255,255,255,0.5);transition:all 0.5s cubic-bezier(0.34,1.56,0.64,1);}
    .res-w::after{content:'';position:absolute;top:6px;left:8px;width:35%;height:22%;background:rgba(255,255,255,0.6);border-radius:50%;}
    .res-pb{width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:900;color:#fff;background:radial-gradient(circle at 35% 32%,#f07060,#a02020 70%);box-shadow:inset 0 -3px 6px rgba(0,0,0,0.3),0 4px 16px rgba(192,57,43,0.5);position:relative;flex-shrink:0;border:3px solid #e74c3c;transition:all 0.6s cubic-bezier(0.34,1.56,0.64,1);}
    .res-pb::after{content:'';position:absolute;top:7px;left:10px;width:35%;height:22%;background:rgba(255,255,255,0.4);border-radius:50%;}
    .ball-hidden{opacity:0;transform:scale(0.2);}
    .ball-visible{opacity:1;transform:scale(1);}
    .bubble{position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(253,250,245,0.97);border:2.5px solid #a78bfa;box-shadow:0 4px 20px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#1a1a2e;z-index:200;animation:bPop .15s cubic-bezier(0.34,1.56,0.64,1) both;}
    .bubble-r{border-color:#e74c3c;color:#c0392b;}
    @keyframes bPop{from{transform:scale(0.4);opacity:0}to{transform:scale(1);opacity:1}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .fu{animation:fadeUp 0.5s ease both;}
    ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#2e2448;border-radius:2px;}
  `;

  const wMsg = step === "spinning_white" ? "Spinning...\nWhite Balls"
    : (step === "white_done" || step === "spinning_pb" || isDone) ? "White Balls ✓"
    : "White Balls\n1 – 69";
  const pMsg = step === "spinning_pb" ? "Spinning...\nPowerball"
    : isDone ? "Powerball ✓"
    : "Powerball\n1 – 26";

  /* drum sizes */
  const WC = 110; // white drum center
  const PC = 75;  // pb drum center

  return (
    <>
      <style>{css}</style>
      <div className="pb-root">

        {/* Header */}
        <header style={{ background:"rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.1)", padding:"18px 24px 14px", textAlign:"center" }}>
          <div style={{ fontSize:26, marginBottom:4 }}>🎱</div>
          <div style={{ fontSize:10, letterSpacing:4, color:"#a78bfa", textTransform:"uppercase", marginBottom:3, fontWeight:700 }}>WISE REST WITH SUNNY · DASANGDAM</div>
          <h1 style={{ fontSize:24, fontWeight:900, margin:0, background:"linear-gradient(135deg,#fff 0%,#a78bfa 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:2 }}>POWERBALL</h1>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>5 white balls (1–69) + 1 red Powerball (1–26)</p>
        </header>

        {/* Drums side by side */}
        <div style={{ padding:"20px 16px 0", display:"flex", gap:12, justifyContent:"center", alignItems:"flex-start" }}>

          {/* White drum */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
            <div style={{ fontSize:9, letterSpacing:3, color:"rgba(196,181,253,0.7)", fontWeight:700 }}>WHITE BALLS</div>
            <div style={{ position:"relative", width:WC*2, height:WC*2, overflow:"visible" }}>
              {/* Ring */}
              <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"conic-gradient(from 0deg,#1a1235,#2d1f52,#7c3aed,#c4b5fd,#7c3aed,#2d1f52,#1a1235)", boxShadow:"0 0 0 5px rgba(167,139,250,0.15),inset 0 0 20px rgba(0,0,0,0.55)" }} />
              <div style={{ position:"absolute", inset:16, borderRadius:"50%", background:"radial-gradient(circle at 40% 35%,#1a1200,#0d0900 70%)" }} />
              {/* Balls */}
              {Array.from({ length:69 }, (_,i) => i+1).map(n => {
                const { x, y } = getBallPos(n, 69, 90, whiteDrum.drumAngle, WC);
                return (
                  <button key={n} onMouseEnter={() => setHoveredW(n)} onMouseLeave={() => setHoveredW(null)}
                    className="pb-ball pb-w" style={{ left:x, top:y, zIndex:hoveredW===n?100:1 }}>
                    <span style={{ position:"relative", zIndex:2 }}>{n}</span>
                  </button>
                );
              })}
              {hoveredW !== null && (() => {
                const { x, y } = getBallPos(hoveredW, 69, 90, whiteDrum.drumAngle, WC);
                const cx=x+13, cy=y+13, dx=WC-cx, dy=WC-cy, d=Math.sqrt(dx*dx+dy*dy)||1;
                return <div className="bubble" style={{ left:cx+(dx/d)*56-22, top:cy+(dy/d)*56-22, pointerEvents:"none" }}>{hoveredW}</div>;
              })()}
              {/* Center */}
              <div style={{ position:"absolute", inset:16, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex:5 }}>
                <span style={{ fontSize:9, color:"rgba(196,181,253,0.8)", textAlign:"center", whiteSpace:"pre-line", lineHeight:1.5, fontWeight:600 }}>{wMsg}</span>
              </div>
            </div>
          </div>

          {/* Powerball drum */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, marginTop:30 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:"rgba(231,76,60,0.8)", fontWeight:700 }}>POWERBALL</div>
            <div style={{ position:"relative", width:PC*2, height:PC*2, overflow:"visible" }}>
              <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"conic-gradient(from 0deg,#4a0000,#8a1010,#c0392b,#f07060,#c0392b,#8a1010,#4a0000)", boxShadow:"0 0 0 4px rgba(192,57,43,0.2),inset 0 0 16px rgba(0,0,0,0.6)" }} />
              <div style={{ position:"absolute", inset:12, borderRadius:"50%", background:"radial-gradient(circle at 40% 35%,#2a0000,#0d0000 70%)" }} />
              {Array.from({ length:26 }, (_,i) => i+1).map(n => {
                const { x, y } = getBallPos(n, 26, 52, pbDrum.drumAngle, PC);
                return (
                  <button key={n} onMouseEnter={() => setHoveredP(n)} onMouseLeave={() => setHoveredP(null)}
                    className="pb-ball pb-r" style={{ left:x, top:y, zIndex:hoveredP===n?100:1 }}>
                    <span style={{ position:"relative", zIndex:2 }}>{n}</span>
                  </button>
                );
              })}
              {hoveredP !== null && (() => {
                const { x, y } = getBallPos(hoveredP, 26, 52, pbDrum.drumAngle, PC);
                const cx=x+13, cy=y+13, dx=PC-cx, dy=PC-cy, d=Math.sqrt(dx*dx+dy*dy)||1;
                return <div className="bubble bubble-r" style={{ left:cx+(dx/d)*42-22, top:cy+(dy/d)*42-22, pointerEvents:"none" }}>{hoveredP}</div>;
              })()}
              <div style={{ position:"absolute", inset:12, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex:5 }}>
                <span style={{ fontSize:9, color:"rgba(240,112,96,0.85)", textAlign:"center", whiteSpace:"pre-line", lineHeight:1.5, fontWeight:600 }}>{pMsg}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Result card */}
        <div style={{ padding:"16px 20px 0" }}>
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:18, padding:"18px 14px", textAlign:"center" }}>
            <div style={{ fontSize:9, letterSpacing:3, color:"rgba(255,255,255,0.3)", marginBottom:14, fontWeight:600 }}>YOUR LUCKY NUMBERS · {today}</div>
            {/* White results */}
            <div style={{ fontSize:9, color:"rgba(196,181,253,0.5)", marginBottom:8, letterSpacing:2 }}>WHITE BALLS</div>
            <div style={{ display:"flex", justifyContent:"center", gap:6, flexWrap:"wrap", marginBottom:10 }}>
              {whites.length > 0
                ? whites.map((n, i) => (
                    <div key={n} className={`res-w ${visibleWhites.has(n) ? "ball-visible" : "ball-hidden"}`} style={{ transitionDelay:`${i*80}ms` }}>{n}</div>
                  ))
                : Array.from({length:5}).map((_,i) => (
                    <div key={i} style={{ width:50, height:50, borderRadius:"50%", border:"2px dashed rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.12)", fontSize:18 }}>·</div>
                  ))
              }
            </div>
            <div style={{ fontSize:16, color:"rgba(255,255,255,0.18)", margin:"6px 0" }}>+</div>
            <div style={{ fontSize:9, color:"rgba(231,76,60,0.5)", marginBottom:8, letterSpacing:2, fontWeight:700 }}>POWERBALL</div>
            <div style={{ display:"flex", justifyContent:"center" }}>
              {powerball !== null
                ? <div className={`res-pb ${pbVisible ? "ball-visible" : "ball-hidden"}`}>{powerball}</div>
                : <div style={{ width:58, height:58, borderRadius:"50%", border:"2px dashed rgba(231,76,60,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(231,76,60,0.15)", fontSize:22 }}>·</div>
              }
            </div>
            {isDone && (
              <div className="fu" style={{ marginTop:14, padding:"12px 14px", background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.25)", borderRadius:12 }}>
                <div style={{ fontSize:10, color:"#a78bfa", fontWeight:700, letterSpacing:2, marginBottom:5 }}>✦ SUNNY'S MESSAGE</div>
                <p style={{ fontSize:13, lineHeight:1.7, color:"rgba(255,255,255,0.82)", margin:0, fontStyle:"italic" }}>"{fortune}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ padding:"14px 20px 0" }}>
          <button onClick={handleDraw} disabled={isSpinning} style={{
            display:"block", width:"100%", padding:"15px",
            background: isSpinning ? "rgba(255,255,255,0.07)" : "linear-gradient(135deg,#7c3aed,#a78bfa)",
            color:"#fff", border:"none", borderRadius:14, fontSize:15, fontWeight:800, letterSpacing:1,
            cursor: isSpinning ? "not-allowed" : "pointer",
            boxShadow: isSpinning ? "none" : "0 4px 20px rgba(124,58,237,0.4)", transition:"all 0.2s",
          }}>
            {step==="spinning_white" ? "🎱 Spinning white balls..." :
             step==="white_done" ? "⚪ Revealing numbers..." :
             step==="spinning_pb" ? "🔴 Spinning Powerball..." :
             isDone ? "✦ Generate New Numbers" : "✦ Generate My Lucky Numbers"}
          </button>
          {isDone && (
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <button onClick={handleReset} style={{ flex:1, padding:"11px", background:"transparent", border:"1.5px solid rgba(255,255,255,0.15)", borderRadius:12, color:"rgba(255,255,255,0.55)", fontSize:13, fontWeight:600, cursor:"pointer" }}>Reset</button>
              <button onClick={copyNums} style={{ flex:1, padding:"11px", background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.15)", borderRadius:12, color:copied?"#a78bfa":"rgba(255,255,255,0.55)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                {copied ? "✓ Copied!" : "📋 Copy Numbers"}
              </button>
            </div>
          )}
        </div>

        <div style={{ padding:"14px 20px 0", textAlign:"center" }}>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.18)", lineHeight:1.6 }}>For entertainment only. Not affiliated with Powerball or any lottery organization.</p>
        </div>
      </div>
    </>
  );
}
