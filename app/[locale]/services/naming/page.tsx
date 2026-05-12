"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { calculateSajuSimple, lunarToSolar } from "@fullstackfamily/manseryeok";
import { ChevronDown } from "lucide-react";

// ── 타입 ──────────────────────────────────────────
interface HanjaOption {
  hanja: string;
  hangul_sound: string;
  strokes_original: number;
  five_elements: string;
  meaning: string;
  suriPreview: { strokes: number; rating: string; name: string; description: string } | null;
}
interface SelectedHanja {
  hanja: string; meaning: string; strokes: number; element: string;
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
interface SajuEnergy {
  wood: number; fire: number; earth: number; metal: number; water: number;
}

// ── 상수 ──────────────────────────────────────────
const SURNAME_STROKES: Record<string, number> = {
  김:8, 이:7, 박:6, 최:11, 정:15, 강:9, 조:14, 윤:4,
  장:11, 임:8, 한:17, 오:7, 서:10, 신:5, 권:22, 황:12,
  안:6, 송:7, 류:9, 전:6, 홍:9, 고:10, 문:4, 양:11,
  손:10, 배:14, 백:5, 허:11, 유:9, 남:9,
};
const ELEMENT_KR: Record<string, string> = {
  목: "木 나무", 화: "火 불", 토: "土 흙", 금: "金 쇠", 수: "水 물",
};
const ELEMENT_COLOR: Record<string, { color: string; bg: string }> = {
  목: { color: "#15803d", bg: "#f0fdf4" },
  화: { color: "#b91c1c", bg: "#fef2f2" },
  토: { color: "#b45309", bg: "#fffbeb" },
  금: { color: "#4b5563", bg: "#f3f4f6" },
  수: { color: "#1d4ed8", bg: "#eff6ff" },
};
const STEM_ELEMENT: Record<string, string> = {
  갑:"목",을:"목",병:"화",정:"화",무:"토",기:"토",경:"금",신:"금",임:"수",계:"수",
};
const BRANCH_ELEMENT: Record<string, string> = {
  자:"수",축:"토",인:"목",묘:"목",진:"토",사:"화",오:"화",미:"토",신:"금",유:"금",술:"토",해:"수",
};
const GUK_INFO: Record<string, { period: string; desc: string }> = {
  "원격(元格)": { period: "초년운",  desc: "이름 두 글자 합산 — 유년기의 운" },
  "형격(亨格)": { period: "청년운",  desc: "성씨 + 이름 첫 글자 — 사회진출기의 운" },
  "이격(利格)": { period: "장년운",  desc: "성씨 + 이름 끝 글자 — 중년 성취와 가정운" },
  "정격(貞格)": { period: "총운 ✨", desc: "성씨 + 이름 전체 — 인생 전체를 관통하는 가장 중요한 운" },
};

// ── 헬퍼 함수 ──────────────────────────────────────
function computeSajuEnergy(year: number, month: number, day: number, hour: number, isLunar: boolean) {
  let sy = year, sm = month, sd = day;
  if (isLunar) {
    try { const s = lunarToSolar(year, month, day, false); sy = s.solar.year; sm = s.solar.month; sd = s.solar.day; } catch {}
  }
  const saju = calculateSajuSimple(sy, sm, sd, hour || 12);
  const energy: SajuEnergy = { wood:0, fire:0, earth:0, metal:0, water:0 };
  const addEl = (c: string) => {
    const el = STEM_ELEMENT[c] ?? BRANCH_ELEMENT[c];
    if (el==="목") energy.wood++; else if (el==="화") energy.fire++;
    else if (el==="토") energy.earth++; else if (el==="금") energy.metal++; else if (el==="수") energy.water++;
  };
  [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar].forEach(p => { if (p) { addEl(p[0]); addEl(p[1]); } });
  const items = [{ key:"목", val:energy.wood },{ key:"화", val:energy.fire },{ key:"토", val:energy.earth },{ key:"금", val:energy.metal },{ key:"수", val:energy.water }];
  const min = Math.min(...items.map(i => i.val));
  const weakElements = items.filter(i => i.val <= min).map(i => i.key).slice(0, 2);
  return { energy, weakElements, pillars: `${saju.yearPillar}년 ${saju.monthPillar}월 ${saju.dayPillar}일` };
}

function getRatingStyle(r: string) {
  switch (r) {
    case "매우좋음": return { color:"#1d4ed8", bg:"#eff6ff", bar:"#2563eb", emoji:"🔵" };
    case "좋음":     return { color:"#15803d", bg:"#f0fdf4", bar:"#16a34a", emoji:"🟢" };
    case "보통":     return { color:"#b45309", bg:"#fffbeb", bar:"#d97706", emoji:"🟡" };
    case "나쁨":     return { color:"#b91c1c", bg:"#fef2f2", bar:"#dc2626", emoji:"🔴" };
    case "매우나쁨": return { color:"#7f1d1d", bg:"#fee2e2", bar:"#991b1b", emoji:"❌" };
    default:         return { color:"#6b7280", bg:"#f9fafb", bar:"#9ca3af", emoji:"⚪" };
  }
}
function getRatingScore(r: string) {
  return ({ 매우좋음:100, 좋음:75, 보통:50, 나쁨:25, 매우나쁨:10 } as any)[r] ?? 50;
}

function SelectField({ label, value, onChange, children, disabled=false }: {
  label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div>
      <p style={{ fontSize:12, fontWeight:600, color:"var(--text-secondary)", marginBottom:6 }}>{label}</p>
      <div style={{ position:"relative" }}>
        <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
          style={{ width:"100%", padding:"12px 36px 12px 14px", fontSize:15, fontWeight:600,
            border:"1.5px solid var(--border)", borderRadius:12,
            background: disabled ? "var(--section-bg)" : "var(--card-bg)",
            color: value ? "var(--text-primary)" : "var(--text-faint)",
            appearance:"none", outline:"none", cursor: disabled ? "not-allowed" : "pointer" }}>
          {children}
        </select>
        <ChevronDown size={16} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"var(--text-faint)", pointerEvents:"none" }} />
      </div>
    </div>
  );
}

function StepBar({ current }: { current: number }) {
  const steps = ["사주 입력", "이름 입력", "한자 선택 & 결과"];
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:24 }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", flex:1 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:"0 0 auto" }}>
              <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700,
                background: done ? "#16a34a" : active ? "#1e293b" : "var(--border)", color: done||active ? "white" : "var(--text-faint)" }}>
                {done ? "✓" : idx}
              </div>
              <span style={{ fontSize:10, marginTop:3, fontWeight: active ? 700 : 400, color: active ? "var(--text-primary)" : "var(--text-faint)", whiteSpace:"nowrap" }}>{label}</span>
            </div>
            {i < steps.length-1 && <div style={{ flex:1, height:2, margin:"0 3px", marginBottom:14, background: done ? "#16a34a" : "var(--border)" }} />}
          </div>
        );
      })}
    </div>
  );
}

// ── 점수 계산 순수 함수 ────────────────────────────
function calcScore(result: AnalysisResult, selectedHanja: (SelectedHanja|null)[], nameChars: string[], weakEls: string[]) {
  const avgScore = Math.round([result.namingScore.fourGuk.wonGuk, result.namingScore.fourGuk.hyeongGuk, result.namingScore.fourGuk.iGuk, result.namingScore.fourGuk.jeonGuk]
    .reduce((a, d) => a + getRatingScore(d.rating), 0) / 4);
  const nameElements = nameChars.slice(1).map((_,i) => selectedHanja[i+1]?.element ?? "").filter(Boolean);
  const matchCount = nameElements.filter(el => weakEls.includes(el)).length;
  const elementScore = nameElements.length > 0 ? Math.round((matchCount / nameElements.length) * 100) : 0;
  const veryBadCount = [result.namingScore.fourGuk.wonGuk, result.namingScore.fourGuk.hyeongGuk, result.namingScore.fourGuk.iGuk, result.namingScore.fourGuk.jeonGuk]
    .filter(g => g.rating === "매우나쁨").length;
  const badCount = [result.namingScore.fourGuk.wonGuk, result.namingScore.fourGuk.hyeongGuk, result.namingScore.fourGuk.iGuk, result.namingScore.fourGuk.jeonGuk]
    .filter(g => g.rating === "나쁨").length;
  const total = Math.max(0, Math.round(avgScore * 0.6 + elementScore * 0.4 - veryBadCount * 15 - badCount * 5));
  return { avgScore, elementScore, matchCount, nameElements, veryBadCount, badCount, total };
}

// ════════════════════════════════════════════════
// 메인 컴포넌트
// ════════════════════════════════════════════════
export default function NamingPage() {
  const [step, setStep] = useState(1);

  // STEP 1
  const [birthYear, setBirthYear]   = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay]     = useState("");
  const [birthHour, setBirthHour]   = useState("");
  const [isLunar, setIsLunar]       = useState("solar");
  const [sajuData, setSajuData]     = useState<{ energy: SajuEnergy; weakElements: string[]; pillars: string }|null>(null);

  // STEP 2
  const [nameInput, setNameInput]           = useState("");
  const [surnameStrokes, setSurnameStrokes] = useState(0);

  // STEP 3 — 한자 선택 + 실시간 결과
  const [hanjaOptions, setHanjaOptions]     = useState<HanjaOption[][]>([]);
  const [selectedHanja, setSelectedHanja]   = useState<(SelectedHanja|null)[]>([]);
  const [result, setResult]                 = useState<AnalysisResult|null>(null);
  const [analyzing, setAnalyzing]           = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const years  = Array.from({ length: 2027-1930+1 }, (_,i) => 2027-i);
  const months = Array.from({ length: 12 }, (_,i) => i+1);
  const days   = birthYear && birthMonth ? Array.from({ length: new Date(+birthYear,+birthMonth,0).getDate() }, (_,i) => i+1) : [];
  const hours  = Array.from({ length: 24 }, (_,i) => i);

  const nameChars   = Array.from(nameInput);
  const allSelected = nameChars.every((_,i) => i===0 || selectedHanja[i] !== null);

  // 한자 선택 시 자동으로 분석 실행
  const analyzeAuto = useCallback(async (selected: (SelectedHanja|null)[]) => {
    const chars = Array.from(nameInput);
    const strokesList = chars.map((_,i) => i===0 ? surnameStrokes : (selected[i]?.strokes ?? 0));
    if (strokesList.some(s => !s)) return; // 아직 모두 선택 안 됨
    setAnalyzing(true);
    try {
      const res = await fetch("/api/naming/analyze", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ nameHangul: nameInput, strokesList }),
      });
      const data = await res.json();
      if (data.ok) setResult(data.result);
    } catch {}
    finally { setAnalyzing(false); }
  }, [nameInput, surnameStrokes]);

  function selectHanja(idx: number, opt: HanjaOption) {
    const next = [...selectedHanja];
    next[idx] = { hanja: opt.hanja, meaning: opt.meaning, strokes: opt.strokes_original, element: opt.five_elements };
    setSelectedHanja(next);
    analyzeAuto(next); // 자동 분석!
  }

  // STEP 1 완료
  function handleStep1() {
    if (!birthYear || !birthMonth || !birthDay) { setError("생년월일을 모두 입력해주세요."); return; }
    try {
      const res = computeSajuEnergy(+birthYear, +birthMonth, +birthDay, birthHour ? +birthHour : 12, isLunar==="lunar");
      setSajuData(res); setStep(2); setError("");
    } catch { setError("사주 계산 중 오류가 발생했어요."); }
  }

  // STEP 2: 이름 입력
  function handleNameChange(val: string) {
    const t = val.replace(/\s/g,"").slice(0,4);
    setNameInput(t);
    setSurnameStrokes(SURNAME_STROKES[t[0]] ?? 0);
    setSelectedHanja(Array(t.length).fill(null));
    setResult(null);
    setError("");
  }

  // STEP 2 → STEP 3
  async function handleStep2() {
    if (nameInput.length < 2) { setError("성씨 포함 2글자 이상 입력해주세요."); return; }
    if (!surnameStrokes) { setError("성씨 획수를 입력해주세요."); return; }
    setLoading(true);
    try {
      const chars = Array.from(nameInput);
      const results = await Promise.all(
        chars.map((char,i) => i===0 ? Promise.resolve([])
          : fetch(`/api/naming/hanja?sound=${char}&surnameStrokes=${surnameStrokes}`)
              .then(r => r.json()).then(d => d.results ?? []))
      );
      setHanjaOptions(results);
      setSelectedHanja(Array(chars.length).fill(null));
      setResult(null);
      setStep(3);
      setError("");
    } catch { setError("한자 목록을 불러오지 못했어요."); }
    finally { setLoading(false); }
  }

  // 이름만 바꾸기 (생년월일 유지)
  function handleChangeName() {
    setNameInput(""); setSelectedHanja([]); setResult(null); setHanjaOptions([]); setStep(2);
  }

  // 전체 처음부터
  function handleReset() {
    setStep(1); setNameInput(""); setSelectedHanja([]); setResult(null);
    setSajuData(null); setBirthYear(""); setBirthMonth(""); setBirthDay("");
  }

  const weakEls = sajuData?.weakElements ?? [];
  const scoreData = result && allSelected ? calcScore(result, selectedHanja, nameChars, weakEls) : null;

  // ════════════════════════════════════════════════
  // STEP 1 — 사주 입력
  // ════════════════════════════════════════════════
  if (step === 1) return (
    <main className="page">
      <div className="container" style={{ maxWidth:460 }}>
        <Link href="/" style={{ fontSize:13, color:"var(--text-faint)", textDecoration:"none" }}>← 홈으로</Link>
        <h1 style={{ marginTop:12, marginBottom:4, fontSize:24, fontWeight:700 }}>이름 감명 ✨</h1>
        <p style={{ fontSize:14, color:"var(--text-secondary)", marginBottom:24, lineHeight:1.6 }}>
          사주의 부족한 오행을 이름으로 보완하는 <strong>진짜 작명</strong>을 해드려요.
        </p>
        <StepBar current={1} />

        <div style={{ padding:"14px 16px", marginBottom:20, borderRadius:12, background:"#eff6ff", border:"1px solid #bfdbfe" }}>
          <p style={{ fontSize:13, color:"#1d4ed8", fontWeight:700, marginBottom:4 }}>💡 왜 사주가 필요한가요?</p>
          <p style={{ fontSize:13, color:"#1e40af", lineHeight:1.6 }}>
            사주에서 부족한 오행(목·화·토·금·수)을 이름 한자로 보완하면 더 좋은 이름이 돼요. 수리성명학만으로는 반쪽짜리 작명이에요.
          </p>
        </div>

        <div style={{ background:"var(--card-bg)", borderRadius:16, padding:"20px", border:"1px solid var(--border)", marginBottom:16 }}>
          <p style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>태어난 날짜를 입력하세요</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
            <SelectField label="년도" value={birthYear} onChange={setBirthYear}>
              <option value="">선택</option>
              {years.map(y => <option key={y} value={String(y)}>{y}년</option>)}
            </SelectField>
            <SelectField label="월" value={birthMonth} onChange={setBirthMonth}>
              <option value="">선택</option>
              {months.map(m => <option key={m} value={String(m)}>{m}월</option>)}
            </SelectField>
            <SelectField label="일" value={birthDay} onChange={setBirthDay} disabled={!birthYear||!birthMonth}>
              <option value="">선택</option>
              {days.map(d => <option key={d} value={String(d)}>{d}일</option>)}
            </SelectField>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <SelectField label="시간 (선택)" value={birthHour} onChange={setBirthHour}>
              <option value="">모름</option>
              {hours.map(h => <option key={h} value={String(h)}>{String(h).padStart(2,"0")}시</option>)}
            </SelectField>
            <SelectField label="달력 기준" value={isLunar} onChange={setIsLunar}>
              <option value="solar">양력</option>
              <option value="lunar">음력</option>
            </SelectField>
          </div>
        </div>

        {error && <p style={{ color:"#dc2626", fontSize:13, marginBottom:12 }}>{error}</p>}

        <button onClick={handleStep1} disabled={!birthYear||!birthMonth||!birthDay}
          style={{ width:"100%", padding:"16px", fontSize:17, fontWeight:700, border:"none", borderRadius:14, cursor: (birthYear&&birthMonth&&birthDay) ? "pointer" : "not-allowed",
            background: (birthYear&&birthMonth&&birthDay) ? "#1e293b" : "var(--border)",
            color: (birthYear&&birthMonth&&birthDay) ? "white" : "var(--text-faint)" }}>
          사주 분석 후 이름 입력하기 →
        </button>
        <p style={{ fontSize:12, color:"var(--text-faint)", marginTop:10, textAlign:"center" }}>시간을 모르셔도 날짜만으로 분석 가능해요.</p>
      </div>
    </main>
  );

  // ════════════════════════════════════════════════
  // STEP 2 — 이름 입력
  // ════════════════════════════════════════════════
  if (step === 2) return (
    <main className="page">
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
      <div className="container" style={{ maxWidth:460 }}>
        <button onClick={() => setStep(1)} style={{ fontSize:13, color:"var(--text-faint)", background:"none", border:"none", cursor:"pointer", padding:0, marginBottom:12 }}>
          ← 생년월일 다시 입력
        </button>
        <StepBar current={2} />

        {/* 사주 오행 요약 */}
        {sajuData && (
          <div style={{ marginBottom:20, padding:"16px", background:"var(--card-bg)", borderRadius:16, border:"1px solid var(--border)" }}>
            <p style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>📊 사주 오행 분석</p>
            <p style={{ fontSize:12, color:"var(--text-faint)", marginBottom:10 }}>{sajuData.pillars}</p>
            <div style={{ display:"flex", gap:8, alignItems:"flex-end", height:70, marginBottom:12 }}>
              {[{ key:"목",val:sajuData.energy.wood },{ key:"화",val:sajuData.energy.fire },{ key:"토",val:sajuData.energy.earth },{ key:"금",val:sajuData.energy.metal },{ key:"수",val:sajuData.energy.water }].map(({ key, val }) => {
                const ec = ELEMENT_COLOR[key];
                const isWeak = weakEls.includes(key);
                return (
                  <div key={key} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                    <span style={{ fontSize:11, color: isWeak?"#dc2626":"var(--text-faint)", fontWeight: isWeak?700:400 }}>{val}</span>
                    <div style={{ width:"100%", borderRadius:6, height: Math.max(8,val*14), background: isWeak?"#fecaca":ec.bg, border:`1.5px solid ${isWeak?"#dc2626":ec.color}44` }} />
                    <span style={{ fontSize:11, color: isWeak?"#dc2626":"var(--text-secondary)", fontWeight: isWeak?700:400 }}>{key}</span>
                    {isWeak && <span style={{ fontSize:9, color:"#dc2626", fontWeight:700 }}>부족</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ padding:"10px 14px", background:"#fef2f2", borderRadius:10, border:"1px solid #fecaca" }}>
              <p style={{ fontSize:13, color:"#b91c1c", fontWeight:700, margin:0 }}>
                ⚡ 이름에서 보완 필요:
                {weakEls.map(el => (
                  <span key={el} style={{ marginLeft:8, padding:"2px 10px", background:"white", borderRadius:20, border:"1.5px solid #dc2626", fontSize:12 }}>
                    {el} ({ELEMENT_KR[el]})
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}

        {/* 이름 입력 */}
        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>이름을 입력하세요</p>
          <div onClick={() => (document.getElementById("name-input") as HTMLInputElement)?.focus()}
            style={{ display:"flex", gap:12, justifyContent:"center", padding:"24px 20px", borderRadius:16, border:"2px solid var(--border)", background:"var(--card-bg)", cursor:"text", position:"relative" }}>
            {[0,1,2,3].map(i => {
              const char = nameInput[i];
              const isCurrent = nameInput.length === i;
              return (
                <div key={i} style={{ width:64, height:72, borderRadius:14, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2,
                  border:`2px solid ${char?"#2563eb":isCurrent?"#93c5fd":"#e5e7eb"}`,
                  background: char?"#eff6ff":isCurrent?"#f0f9ff":"#f9fafb" }}>
                  {char ? <span style={{ fontSize:28, fontWeight:800, color:"#1e293b" }}>{char}</span>
                    : <>{isCurrent && <span style={{ display:"inline-block", width:2, height:28, background:"#2563eb", borderRadius:2, animation:"blink 1s step-end infinite" }} />}
                        <span style={{ fontSize:11, color:"#9ca3af" }}>{i===0?"성씨":`${i}번째`}</span></>}
                </div>
              );
            })}
            <input id="name-input" type="text" value={nameInput} onChange={e => handleNameChange(e.target.value)} maxLength={4}
              style={{ position:"absolute", opacity:0, pointerEvents:"none", width:1, height:1, top:0, left:0 }} />
          </div>
          <p style={{ fontSize:12, color:"var(--text-faint)", marginTop:8, textAlign:"center" }}>👆 칸을 탭해서 입력 (성씨 포함 2~4글자)</p>
        </div>

        {nameInput.length > 0 && (
          <div style={{ padding:"12px 16px", marginBottom:16, borderRadius:12, background: surnameStrokes?"#f0fdf4":"#fef9c3", border:`1px solid ${surnameStrokes?"#bbf7d0":"#fde68a"}` }}>
            {surnameStrokes
              ? <p style={{ fontSize:14, color:"#15803d" }}>✅ <strong>{nameInput[0]}</strong>씨 성씨 획수 <strong>{surnameStrokes}획</strong> 자동 확인</p>
              : <div>
                  <p style={{ fontSize:13, color:"#92400e", marginBottom:8, fontWeight:600 }}>⚠️ <strong>{nameInput[0]}</strong>씨 획수를 직접 입력해주세요</p>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <input type="number" min={1} max={50} value={surnameStrokes||""} onChange={e => setSurnameStrokes(Number(e.target.value))} placeholder="획수"
                      style={{ width:90, padding:"10px", fontSize:16, fontWeight:700, border:"1.5px solid #fde68a", borderRadius:8, background:"white", textAlign:"center", outline:"none" }} />
                    <span style={{ fontSize:13, color:"#92400e" }}>획 (원획법)</span>
                  </div>
                </div>}
          </div>
        )}

        {error && <p style={{ color:"#dc2626", fontSize:13, marginBottom:12 }}>{error}</p>}

        <button onClick={handleStep2} disabled={loading||nameInput.length<2||!surnameStrokes}
          style={{ width:"100%", padding:"16px", fontSize:17, fontWeight:700, border:"none", borderRadius:14,
            cursor: (nameInput.length>=2&&surnameStrokes) ? "pointer" : "not-allowed",
            background: (nameInput.length>=2&&surnameStrokes) ? "#1e293b" : "var(--border)",
            color: (nameInput.length>=2&&surnameStrokes) ? "white" : "var(--text-faint)" }}>
          {loading ? "⏳ 한자 불러오는 중..." : "다음 — 한자 선택하기 →"}
        </button>
      </div>
    </main>
  );

  // ════════════════════════════════════════════════
  // STEP 3 — 한자 선택 + 실시간 결과 (한 화면에!)
  // ════════════════════════════════════════════════
  const hanjaName = nameChars.map((_,i) => i===0 ? "" : selectedHanja[i]?.hanja ?? "·").join("");
  const overallStyle = result ? getRatingStyle(result.namingScore.overallRating) : getRatingStyle("");

  return (
    <main className="page">
      <div className="container" style={{ maxWidth:460 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <button onClick={handleChangeName} style={{ fontSize:13, color:"var(--text-faint)", background:"none", border:"none", cursor:"pointer", padding:0 }}>
            ← 이름 바꾸기
          </button>
          <button onClick={handleReset} style={{ fontSize:12, color:"var(--text-faint)", background:"none", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer", padding:"4px 10px" }}>
            처음부터
          </button>
        </div>
        <StepBar current={3} />

        {/* ── 상단: 실시간 결과 카드 ── */}
        <div style={{ padding:"20px", borderRadius:16, marginBottom:20, textAlign:"center",
          background: result ? overallStyle.bg : "var(--card-bg)",
          border: `2px solid ${result ? overallStyle.color+"33" : "var(--border)"}`,
          transition:"all 0.3s ease" }}>
          {/* 이름 표시 */}
          <div style={{ fontSize:28, fontWeight:800, letterSpacing:6, marginBottom:4 }}>{nameInput}</div>
          <div style={{ fontSize:20, letterSpacing:8, marginBottom:12, fontWeight:700,
            color: result ? overallStyle.color : "var(--text-faint)" }}>
            {hanjaName || "· · ·"}
          </div>

          {/* 한자 뜻 태그 */}
          {result && (
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:16, flexWrap:"wrap" }}>
              {nameChars.map((_,i) => {
                if (i===0) return null;
                const sel = selectedHanja[i];
                const ec = sel ? ELEMENT_COLOR[sel.element] : null;
                return sel ? (
                  <div key={i} style={{ padding:"5px 12px", borderRadius:10, background:ec?.bg, border:`1px solid ${ec?.color}33` }}>
                    <div style={{ fontSize:13, fontWeight:700 }}>{nameChars[i]} {sel.hanja}</div>
                    <div style={{ fontSize:11, color:ec?.color, fontWeight:600 }}>{sel.meaning}</div>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {analyzing && (
            <p style={{ fontSize:13, color:"var(--text-faint)", marginBottom:8 }}>⏳ 분석 중...</p>
          )}

          {!result && !analyzing && (
            <p style={{ fontSize:13, color:"var(--text-faint)" }}>아래에서 한자를 선택하면 바로 결과가 나와요</p>
          )}

          {result && scoreData && (
            <>
              {/* 종합 점수 */}
              <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:12 }}>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:11, color:"var(--text-faint)", margin:0 }}>수리성명학</p>
                  <p style={{ fontSize:20, fontWeight:800, color:overallStyle.color, margin:0 }}>{scoreData.avgScore}점</p>
                </div>
                <div style={{ width:1, background:"var(--border)" }} />
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:11, color:"var(--text-faint)", margin:0 }}>사주오행보완</p>
                  <p style={{ fontSize:20, fontWeight:800, color: scoreData.elementScore>=50?"#15803d":"#b91c1c", margin:0 }}>{scoreData.elementScore}점</p>
                </div>
                <div style={{ width:1, background:"var(--border)" }} />
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:11, color:"var(--text-faint)", margin:0 }}>종합</p>
                  <p style={{ fontSize:20, fontWeight:800, color: scoreData.total>=70?"#15803d":scoreData.total>=40?"#b45309":"#b91c1c", margin:0 }}>{scoreData.total}점</p>
                </div>
              </div>
              <div style={{ background:"#e5e7eb", borderRadius:999, height:10, overflow:"hidden", marginBottom:6 }}>
                <div style={{ width:`${scoreData.total}%`, height:"100%", borderRadius:999, transition:"width 0.5s ease",
                  background: scoreData.total>=70?"#16a34a":scoreData.total>=40?"#d97706":"#dc2626" }} />
              </div>
              <p style={{ fontSize:12, color:"var(--text-faint)", marginBottom:0 }}>
                {scoreData.total>=70 ? "👍 좋은 이름이에요!" : scoreData.total>=40 ? "😐 보통 수준이에요" : "😅 한자를 바꿔보세요"}
                {scoreData.veryBadCount>0 && ` · ⚠️ 매우나쁨 격 ${scoreData.veryBadCount}개`}
              </p>
            </>
          )}
        </div>

        {/* ── 한자 선택 섹션 ── */}
        {weakEls.length > 0 && (
          <div style={{ marginBottom:14, padding:"10px 14px", background:"#fef2f2", borderRadius:10, border:"1px solid #fecaca" }}>
            <p style={{ fontSize:13, color:"#b91c1c", fontWeight:700, margin:0 }}>
              ⭐ 사주 보완 오행:
              {weakEls.map(el => <span key={el} style={{ marginLeft:6, padding:"1px 8px", background:"white", borderRadius:20, border:"1.5px solid #dc2626", fontSize:12 }}>{el}</span>)}
              의 한자를 선택하면 좋아요
            </p>
          </div>
        )}

        {nameChars.map((char, charIdx) => {
          if (charIdx === 0) return null;
          const rawOptions = hanjaOptions[charIdx] ?? [];
          const sortedOptions = [...rawOptions].sort((a,b) => {
            const am = weakEls.includes(a.five_elements) ? 0 : 1;
            const bm = weakEls.includes(b.five_elements) ? 0 : 1;
            return am - bm;
          });
          const sel = selectedHanja[charIdx];
          const allBad = rawOptions.length>0 && rawOptions.every(opt => ["나쁨","매우나쁨"].includes(opt.suriPreview?.rating??""));

          return (
            <div key={charIdx} style={{ marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:15, fontWeight:700, background: sel?"#f0fdf4":"var(--section-bg)",
                  border:`2px solid ${sel?"#16a34a":"var(--border)"}` }}>
                  {char}
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, margin:0 }}>"{char}" 한자 선택</p>
                  {sel && <p style={{ fontSize:12, color:"#15803d", margin:0 }}>✓ {sel.hanja} {sel.meaning} — {sel.element}({ELEMENT_KR[sel.element]})</p>}
                </div>
              </div>

              {allBad && (
                <div style={{ padding:"10px 14px", borderRadius:10, marginBottom:8, background:"#fffbeb", border:"1px solid #fde68a", fontSize:13, color:"#92400e" }}>
                  ⚠️ "{char}"은 {nameInput[0]}씨와 수리 조합이 불리해요. 다른 글자 사용을 권장해요.
                </div>
              )}

              {rawOptions.length === 0 ? (
                <div style={{ padding:"16px", background:"var(--section-bg)", borderRadius:12, textAlign:"center", fontSize:13, color:"var(--text-faint)" }}>
                  😅 '{char}' 한자 데이터가 없어요
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {sortedOptions.map((opt, oi) => {
                    const isSelected = sel?.hanja === opt.hanja;
                    const rs = opt.suriPreview ? getRatingStyle(opt.suriPreview.rating) : null;
                    const ec = ELEMENT_COLOR[opt.five_elements];
                    const isGood = opt.suriPreview && ["매우좋음","좋음"].includes(opt.suriPreview.rating);
                    const isWeakMatch = weakEls.includes(opt.five_elements);
                    const showWeakLabel = isWeakMatch && (oi===0 || !weakEls.includes(sortedOptions[oi-1]?.five_elements));
                    const showOtherLabel = !isWeakMatch && oi>0 && weakEls.includes(sortedOptions[oi-1]?.five_elements);

                    return (
                      <div key={opt.hanja}>
                        {showWeakLabel && <p style={{ fontSize:11, color:"#b91c1c", fontWeight:700, margin:"0 0 4px 4px" }}>⭐ 사주 보완 추천</p>}
                        {showOtherLabel && <p style={{ fontSize:11, color:"var(--text-faint)", margin:"8px 0 4px 4px" }}>기타 한자</p>}
                        <button onClick={() => selectHanja(charIdx, opt)}
                          style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"12px 14px", borderRadius:12, textAlign:"left",
                            border:`2px solid ${isSelected?"#2563eb":isWeakMatch?"#fca5a5":isGood?"#bbf7d0":"var(--border)"}`,
                            background: isSelected?"#eff6ff":isWeakMatch?"#fff5f5":"var(--card-bg)", cursor:"pointer" }}>
                          <div style={{ fontSize:30, fontWeight:700, minWidth:42, textAlign:"center", color: isSelected?"#1d4ed8":"var(--text-primary)" }}>
                            {opt.hanja}
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3, flexWrap:"wrap" }}>
                              <span style={{ fontSize:13, fontWeight:700 }}>{opt.meaning}</span>
                              <span style={{ fontSize:11, padding:"1px 7px", borderRadius:10, background:ec?.bg, color:ec?.color, fontWeight:600 }}>{ELEMENT_KR[opt.five_elements]}</span>
                              {isWeakMatch && <span style={{ fontSize:11, padding:"1px 7px", borderRadius:10, background:"#fee2e2", color:"#b91c1c", fontWeight:700 }}>사주보완⭐</span>}
                            </div>
                            <p style={{ fontSize:11, color:"var(--text-faint)", margin:0 }}>
                              {opt.strokes_original}획{opt.suriPreview && ` · 형격 ${opt.suriPreview.strokes}획 (${opt.suriPreview.name})`}
                            </p>
                          </div>
                          {rs && <div style={{ fontSize:12, fontWeight:700, padding:"4px 10px", borderRadius:20, background:rs.bg, color:rs.color, whiteSpace:"nowrap" }}>{rs.emoji} {opt.suriPreview?.rating}</div>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* 상세 분석 (결과 있을 때만) */}
        {result && (
          <div style={{ borderTop:"1px solid var(--border)", paddingTop:20, marginTop:8 }}>
            <h2 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>4격 수리 분석</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
              {[
                { label:"원격(元格)", data:result.namingScore.fourGuk.wonGuk },
                { label:"형격(亨格)", data:result.namingScore.fourGuk.hyeongGuk },
                { label:"이격(利格)", data:result.namingScore.fourGuk.iGuk },
                { label:"정격(貞格)", data:result.namingScore.fourGuk.jeonGuk },
              ].map(({ label, data }) => {
                const s = getRatingStyle(data.rating);
                const info = GUK_INFO[label];
                return (
                  <div key={label} style={{ padding:"14px", borderRadius:12, background:"var(--card-bg)", border:`1.5px solid ${s.color}33` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:13, fontWeight:700 }}>{label}</span>
                        <span style={{ fontSize:10, padding:"2px 6px", borderRadius:6, background:"var(--section-bg)", color:"var(--text-faint)" }}>{info?.period}</span>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:20, background:s.bg, color:s.color }}>{s.emoji} {data.rating}</span>
                    </div>
                    <p style={{ fontSize:11, color:"var(--text-faint)", marginBottom:6 }}>{info?.desc}</p>
                    <p style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{data.strokes}획 · {data.name}</p>
                    <div style={{ background:"#e5e7eb", borderRadius:999, height:4, marginBottom:4 }}>
                      <div style={{ width:`${getRatingScore(data.rating)}%`, height:"100%", background:s.bar, borderRadius:999 }} />
                    </div>
                    <p style={{ fontSize:11, color:"var(--text-secondary)", lineHeight:1.5, margin:0 }}>{data.description}</p>
                  </div>
                );
              })}
            </div>

            <h2 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>발음오행</h2>
            <div style={{ display:"flex", gap:10, marginBottom:20 }}>
              {result.namingScore.pronunciationElements.map((el,i) => {
                const ec = ELEMENT_COLOR[el.element] ?? { color:"#888", bg:"#f9fafb" };
                return (
                  <div key={i} style={{ flex:1, textAlign:"center", padding:"14px 8px", background:ec.bg, borderRadius:12, border:`1px solid ${ec.color}33` }}>
                    <div style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>{el.char}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:ec.color }}>{ELEMENT_KR[el.element]}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding:"14px", borderRadius:12, marginBottom:24, background:"var(--section-bg)", fontSize:13, color:"var(--text-secondary)", lineHeight:1.8 }}>
              <strong>요약</strong><br />{result.namingScore.summary}
            </div>
          </div>
        )}

        <button onClick={handleChangeName}
          style={{ width:"100%", padding:"14px", fontSize:15, fontWeight:700, background:"var(--text-primary)", color:"var(--card-bg)", border:"none", borderRadius:12, cursor:"pointer", marginBottom:8 }}>
          다른 이름으로 바꾸기 (사주 유지)
        </button>
        <button onClick={handleReset}
          style={{ width:"100%", padding:"12px", fontSize:14, fontWeight:600, background:"none", color:"var(--text-faint)", border:"1px solid var(--border)", borderRadius:12, cursor:"pointer" }}>
          처음부터 (생년월일 재입력)
        </button>
      </div>
    </main>
  );
}
