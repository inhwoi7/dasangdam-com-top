"use client";

import { useState, useCallback } from "react";
import { useKakaoShare } from "@/lib/useKakaoShare";
import { useDrum } from "@/lib/useDrum";
import { analyzeFixed, ballColor, drawNumbers, Hexagram } from "@/lib/luckyEngine";
import styles from "./DrumMachine.module.css";

const RADIUS = 118;
const TOTAL = 45;

function getBallPos(n: number, angle: number) {
  const base = ((n - 1) / TOTAL) * 2 * Math.PI - Math.PI / 2;
  const a = base + angle;
  return {
    x: 150 + RADIUS * Math.cos(a) - 16,
    y: 150 + RADIUS * Math.sin(a) - 16,
  };
}

interface ResultBall {
  num: number;
  isFixed: boolean;
  visible: boolean;
}

const BALL_STYLES: Record<string, { background: string; color: string }> = {
  "ball-y": { background: "radial-gradient(circle at 35% 32%,#FFE97A,#C89010 70%)", color: "#3A2000" },
  "ball-b": { background: "radial-gradient(circle at 35% 32%,#7EC0F0,#1A6AA0 70%)", color: "#fff" },
  "ball-r": { background: "radial-gradient(circle at 35% 32%,#F07060,#A02020 70%)", color: "#fff" },
  "ball-s": { background: "radial-gradient(circle at 35% 32%,#8A9098,#384050 70%)", color: "#fff" },
  "ball-g": { background: "radial-gradient(circle at 35% 32%,#90CC70,#2A7020 70%)", color: "#fff" },
};

export default function DrumMachine() {
  const [fixed, setFixed] = useState<Set<number>>(new Set());
  const [resultBalls, setResultBalls] = useState<ResultBall[]>([]);
  const [hexagram, setHexagram] = useState<Hexagram | null>(null);
  const [centerMsg, setCenterMsg] = useState("구슬을 눌러\n고정 번호 선택");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [hoveredBall, setHoveredBall] = useState<number | null>(null);
  const { drumAngle, spinAndStop, startIdle } = useDrum();
  const { shareWithCapture } = useKakaoShare();

  const toggleFixed = useCallback(
    (n: number) => {
      if (isDrawing) return;
      setFixed((prev) => {
        const next = new Set(prev);
        if (next.has(n)) {
          next.delete(n);
        } else {
          if (next.size >= 5) return prev;
          next.add(n);
        }
        return next;
      });
    },
    [isDrawing]
  );

  const revealNumbers = useCallback(
    (drawn: number[], hexa: Hexagram, fixedSnap: Set<number>) => {
      const sorted = [...drawn].sort((a, b) => a - b);
      const fixedArr = [...fixedSnap].sort((a, b) => a - b);
      const randoms = drawn.filter((n) => !fixedSnap.has(n));
      const revealOrder = [...fixedArr, ...randoms];

      const initial: ResultBall[] = sorted.map((n) => ({
        num: n,
        isFixed: fixedSnap.has(n),
        visible: false,
      }));
      setResultBalls(initial);
      setHexagram(hexa);

      let delay = 0;
      revealOrder.forEach((n) => {
        const isFixed = fixedSnap.has(n);
        setTimeout(() => {
          setResultBalls((prev) =>
            prev.map((b) => (b.num === n ? { ...b, visible: true } : b))
          );
          if (navigator.vibrate) navigator.vibrate(isFixed ? [40, 0, 40] : [20]);
        }, delay);
        delay += isFixed ? 500 : 380;
      });

      setTimeout(() => {
        setIsDrawing(false);
        setIsDone(true);
        startIdle();
        setCenterMsg("번호가\n뽑혔습니다!");
      }, delay + 400);
    },
    [startIdle]
  );

  const handleDraw = useCallback(() => {
    if (isDrawing) return;
    setIsDrawing(true);
    setIsDone(false);
    setResultBalls([]);
    setHexagram(null);
    const fixedSnap = new Set(fixed);
    setCenterMsg("주역 기운\n불러오는 중...");
    spinAndStop(() => {
      const { result, hexagram: hexa } = drawNumbers(fixedSnap);
      revealNumbers(result, hexa, fixedSnap);
    });
  }, [isDrawing, fixed, spinAndStop, revealNumbers]);

  const handleReset = useCallback(() => {
    setFixed(new Set());
    setResultBalls([]);
    setHexagram(null);
    setIsDone(false);
    setIsDrawing(false);
    setCenterMsg("구슬을 눌러\n고정 번호 선택");
    startIdle();
  }, [startIdle]);

  const copyNums = useCallback(() => {
    const txt = resultBalls.map((b) => b.num).join(", ");
    navigator.clipboard.writeText(txt);
  }, [resultBalls]);

  const advisory = analyzeFixed([...fixed]);
  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className={styles.wrap}>

      {/* ── 캡처 전용 카드 (화면에 안 보임) ── */}
      <div
        id="lucky-capture"
        style={{
          position: "fixed", left: "-9999px", top: 0,
          width: "360px", padding: "32px 28px",
          background: "#F5F0E8", borderRadius: "20px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "22px", marginBottom: "6px" }}>☀</div>
          <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#A07C1A", marginBottom: "4px", fontWeight: 700 }}>
            WISE REST WITH SUNNY · 다상담
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "3px", color: "#2A1C00", marginBottom: "4px" }}>
            행운의 숫자
          </div>
          <div style={{ fontSize: "12px", color: "#8A7A62" }}>{today}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px", flexWrap: "nowrap" }}>
          {resultBalls.map((b) => {
            const bs = BALL_STYLES[ballColor(b.num)] ?? BALL_STYLES["ball-y"];
            return (
              <div key={b.num} style={{
                width: "52px", height: "52px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", fontWeight: 900,
                color: bs.color, background: bs.background,
                boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.25), 0 3px 8px rgba(0,0,0,0.2)",
              }}>
                {b.num}
              </div>
            );
          })}
        </div>

        {hexagram && (
          <div style={{
            background: "#FDFAF5", borderLeft: "3px solid #C9A84C",
            borderRadius: "0 12px 12px 0", padding: "14px 16px", marginBottom: "20px",
            border: "1px solid rgba(201,168,76,0.3)", borderLeftWidth: "3px",
          }}>
            <div style={{
              display: "inline-block", background: "#EDD97A", borderRadius: "20px",
              padding: "3px 12px", fontSize: "11px", color: "#5A3C00",
              fontWeight: 700, marginBottom: "8px",
            }}>
              {hexagram.sym} {hexagram.name}
            </div>
            <div style={{ fontSize: "14px", lineHeight: 1.8, color: "#2A1C00", fontWeight: 500 }}>
              "{hexagram.quote}"
            </div>
            <div style={{ fontSize: "11px", color: "#8A6830", marginTop: "4px" }}>{hexagram.src}</div>
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: "13px", color: "#A07C1A", letterSpacing: "0.05em", fontWeight: 600 }}>
  🔗 dasangdam.com/services/lucky
</div>
      </div>

      {/* ── 실제 화면 UI ── */}
      <header className={styles.header}>
        <div className={styles.sun}>☀</div>
        <p className={styles.eyebrow}>Wise Rest with Sunny · 다상담</p>
        <h1 className={styles.title}>행운의 숫자</h1>
        <p className={styles.sub}>드럼에서 나의 번호가 뽑힙니다</p>
      </header>

      <section className={styles.stage}>
        <span className={styles.chip}>구슬을 눌러 고정하세요 (최대 5개)</span>

        <div className={styles.drumWrap}>
          <div className={styles.drumRing}>
            <div className={styles.drumInner} />
            <div className={styles.chute} />
          </div>

          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => {
            const { x, y } = getBallPos(n, drumAngle);
            const isFixed = fixed.has(n);
            const isHovered = hoveredBall === n;

            return (
              <button
                key={n}
                onClick={() => toggleFixed(n)}
                onMouseEnter={() => setHoveredBall(n)}
                onMouseLeave={() => setHoveredBall(null)}
                onTouchStart={() => setHoveredBall(n)}
                onTouchEnd={() => setHoveredBall(null)}
                className={[
                  styles.drumBall,
                  styles[ballColor(n)],
                  isFixed ? styles.fixedSel : "",
                  isHovered ? styles.magnified : "",
                ].join(" ")}
                style={{ left: x, top: y, zIndex: isHovered ? 100 : isFixed ? 10 : 1 }}
                aria-label={`숫자 ${n}${isFixed ? " (고정됨)" : ""}`}
              >
                <span className={styles.ballNum}>{n}</span>
                {isFixed && <span className={styles.lockPip}>🔒</span>}
              </button>
            );
          })}

          {hoveredBall !== null && (() => {
            const { x, y } = getBallPos(hoveredBall, drumAngle);
            const cx = x + 16, cy = y + 16;
            const dx = 150 - cx, dy = 150 - cy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const tipX = cx + (dx / dist) * 72;
            const tipY = cy + (dy / dist) * 72;
            return (
              <div className={styles.magnifierBubble} style={{ left: tipX - 26, top: tipY - 26, pointerEvents: "none" }}>
                {hoveredBall}
              </div>
            );
          })()}

          <div className={styles.center}>
            <span className={styles.centerSym}>{hexagram?.sym ?? "☰"}</span>
            <span className={styles.centerMsg}>{centerMsg}</span>
            {fixed.size > 0 && (
              <span className={styles.centerCount}>{fixed.size} fixed · {6 - fixed.size} random</span>
            )}
          </div>
        </div>

        <p className={styles.tally}>고정 숫자 <strong>{fixed.size}</strong> / 5개</p>
        <p className={styles.advisory}>{advisory}</p>
      </section>

      <section className={styles.resultSection}>
        <span className={styles.chip}>추출 결과</span>
        <h2 className={styles.resultTitle}>오늘의 행운 번호</h2>
        <div className={styles.resultRow}>
          {resultBalls.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.emptySlot}>·</div>
              ))
            : resultBalls.map((b) => (
                <div
                  key={b.num}
                  className={[
                    styles.resBall, styles[ballColor(b.num)],
                    b.visible ? styles.pop : styles.hidden,
                    b.isFixed ? styles.fixedSel : "",
                  ].join(" ")}
                >
                  <span className={styles.ballNum}>{b.num}</span>
                  {b.isFixed && <span className={styles.lockPip}>🔒</span>}
                </div>
              ))}
        </div>

        {hexagram && isDone && (
          <div className={styles.philCard}>
            <span className={styles.hexaBadge}>{hexagram.sym} {hexagram.name}</span>
            <p className={styles.philQ}>"{hexagram.quote}"</p>
            <p className={styles.philS}>{hexagram.src}</p>
          </div>
        )}
      </section>

      <button className={styles.btnMain} onClick={handleDraw} disabled={isDrawing}>
        {isDone ? "✦ 다시 추출하기" : "✦ 나의 번호 추출하기"}
      </button>

      {isDone && (
        <>
          <button className={styles.btnSub} onClick={handleReset}>처음으로 돌아가기</button>
          <div className={styles.actions}>
            <button className={styles.btnAct} onClick={copyNums}>📋 복사</button>
            <button
              className={styles.btnAct}
              onClick={() =>
                shareWithCapture({
                  captureId: "lucky-capture",
                  title: `오늘의 행운 번호: ${resultBalls.map((b) => b.num).join(", ")}`,
                  description: hexagram
  ? `${hexagram.sym} ${hexagram.name} - "${hexagram.quote}"\n\n🔗 dasangdam.com/services/lucky`
  : "다상담에서 나의 행운 번호를 뽑아보세요!\n\n🔗 dasangdam.com/services/lucky",
                  buttonText: "나도 뽑아보기 →",
                  pageUrl: "https://dasangdam.com/services/lucky",
                })
              }
            >
              🟡 카카오 공유
            </button>
          </div>
        </>
      )}
    </div>
  );
}
