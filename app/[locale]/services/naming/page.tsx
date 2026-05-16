"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { calculateSajuSimple, lunarToSolar } from "@fullstackfamily/manseryeok";
import { ChevronDown, CalendarDays, Clock3, SunMedium } from "lucide-react";

interface HanjaOption {
  hanja: string; hangul_sound: string; strokes_original: number;
  five_elements: string; meaning: string;
  suriPreview: { strokes: number; rating: string; name: string; description: string } | null;
}
interface SelectedHanja { hanja: string; meaning: string; strokes: number; element: string; }
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
interface SajuEnergy { wood: number; fire: number; earth: number; metal: number; water: number; }

const SURNAME_STROKES: Record<string, number> = {
  김:8,이:7,박:6,최:11,정:15,강:9,조:14,윤:4,장:11,임:8,한:17,오:7,서:10,신:5,권:22,황:12,안:6,송:7,류:9,전:6,홍:9,고:10,문:4,양:11,손:10,배:14,백:5,허:11,유:9,남:9,
};
const ELEMENT_KR: Record<string, string> = { 목:"木 나무",화:"火 불",토:"土 흙",금:"金 쇠",수:"水 물" };
const ELEMENT_COLOR: Record<string, { color: string; bg: string; border: string }> = {
  목:{color:"#15803d",bg:"#f0fdf4",border:"#bbf7d0"},
  화:{color:"#b91c1c",bg:"#fef2f2",border:"#fecaca"},
  토:{color:"#b45309",bg:"#fffbeb",border:"#fde68a"},
  금:{color:"#4b5563",bg:"#f3f4f6",border:"#d1d5db"},
  수:{color:"#1d4ed8",bg:"#eff6ff",border:"#bfdbfe"},
};
const STEM_ELEMENT: Record<string,string> = { 갑:"목",을:"목",병:"화",정:"화",무:"토",기:"토",경:"금",신:"금",임:"수",계:"수" };
const BRANCH_ELEMENT: Record<string,string> = { 자:"수",축:"토",인:"목",묘:"목",진:"토",사:"화",오:"화",미:"토",신:"금",유:"금",술:"토",해:"수" };
const GUK_INFO: Record<string, { period: string; desc: string }> = {
  "원격(元格)":{period:"초년운",desc:"이름 두 글자 합산 — 유년기의 운"},
  "형격(亨格)":{period:"청년운",desc:"성씨 + 이름 첫 글자 — 사회진출기의 운"},
  "이격(利格)":{period:"장년운",desc:"성씨 + 이름 끝 글자 — 중년 성취와 가정운"},
  "정격(貞格)":{period:"총운 ✨",desc:"성씨 + 이름 전체 — 인생 전체를 관통하는 가장 중요한 운"},
};

function computeSajuEnergy(year:number,month:number,day:number,hour:number,isLunar:boolean){
  let sy=year,sm=month,sd=day;
  if(isLunar){try{const s=lunarToSolar(year,month,day,false);sy=s.solar.year;sm=s.solar.month;sd=s.solar.day;}catch{}}
  const saju=calculateSajuSimple(sy,sm,sd,hour||12);
  const energy:SajuEnergy={wood:0,fire:0,earth:0,metal:0,water:0};
  const addEl=(c:string)=>{const el=STEM_ELEMENT[c]??BRANCH_ELEMENT[c];if(el==="목")energy.wood++;else if(el==="화")energy.fire++;else if(el==="토")energy.earth++;else if(el==="금")energy.metal++;else if(el==="수")energy.water++;};
  [saju.yearPillar,saju.monthPillar,saju.dayPillar,saju.hourPillar].forEach(p=>{if(p){addEl(p[0]);addEl(p[1]);}});
  const items=[{key:"목",val:energy.wood},{key:"화",val:energy.fire},{key:"토",val:energy.earth},{key:"금",val:energy.metal},{key:"수",val:energy.water}];
  const min=Math.min(...items.map(i=>i.val));
  const weakElements=items.filter(i=>i.val<=min).map(i=>i.key).slice(0,2);
  return{energy,weakElements,pillars:`${saju.yearPillar}년 ${saju.monthPillar}월 ${saju.dayPillar}일`};
}

function getRatingStyle(r:string){
  switch(r){
    case"매우좋음":return{color:"#1d4ed8",bg:"#eff6ff",bar:"#2563eb",emoji:"🔵",chip:"bg-blue-100 text-blue-800 border-blue-200"};
    case"좋음":return{color:"#15803d",bg:"#f0fdf4",bar:"#16a34a",emoji:"🟢",chip:"bg-emerald-100 text-emerald-800 border-emerald-200"};
    case"보통":return{color:"#b45309",bg:"#fffbeb",bar:"#d97706",emoji:"🟡",chip:"bg-amber-100 text-amber-800 border-amber-200"};
    case"나쁨":return{color:"#b91c1c",bg:"#fef2f2",bar:"#dc2626",emoji:"🔴",chip:"bg-rose-100 text-rose-800 border-rose-200"};
    case"매우나쁨":return{color:"#7f1d1d",bg:"#fee2e2",bar:"#991b1b",emoji:"❌",chip:"bg-red-200 text-red-900 border-red-300"};
    default:return{color:"#6b7280",bg:"#f9fafb",bar:"#9ca3af",emoji:"⚪",chip:"bg-zinc-100 text-zinc-600 border-zinc-200"};
  }
}
function getRatingScore(r:string){return({매우좋음:100,좋음:75,보통:50,나쁨:25,매우나쁨:10} as any)[r]??50;}

function calcScore(result:AnalysisResult,selectedHanja:(SelectedHanja|null)[],nameChars:string[],weakEls:string[]){
  const guks=[result.namingScore.fourGuk.wonGuk,result.namingScore.fourGuk.hyeongGuk,result.namingScore.fourGuk.iGuk,result.namingScore.fourGuk.jeonGuk];
  const avgScore=Math.round(guks.reduce((a,d)=>a+getRatingScore(d.rating),0)/4);
  const nameElements=nameChars.slice(1).map((_,i)=>selectedHanja[i+1]?.element??"").filter(Boolean);
  const matchCount=nameElements.filter(el=>weakEls.includes(el)).length;
  const elementScore=nameElements.length>0?Math.round((matchCount/nameElements.length)*100):0;
  const veryBadCount=guks.filter(g=>g.rating==="매우나쁨").length;
  const badCount=guks.filter(g=>g.rating==="나쁨").length;
  const total=Math.max(0,Math.round(avgScore*0.6+elementScore*0.4-veryBadCount*15-badCount*5));
  return{avgScore,elementScore,matchCount,nameElements,veryBadCount,badCount,total};
}

// ── 사주 스타일 SelectField ──
function SelectField({label,value,onChange,children,icon,disabled=false}:{
  label:string;value:string;onChange:(v:string)=>void;children:React.ReactNode;icon?:React.ReactNode;disabled?:boolean;
}){
  return(
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">{icon}{label}</div>
      <div className="relative">
        <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
          className={`h-14 w-full appearance-none rounded-3xl border border-zinc-200 bg-white px-4 pr-10 text-[15px] font-semibold shadow-sm outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 ${value?"text-zinc-900":"text-zinc-400"}`}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"/>
      </div>
    </div>
  );
}

// ── StepBar ──
function StepBar({current}:{current:number}){
  const steps=["사주 입력","이름 입력","한자 선택 & 결과"];
  return(
    <div className="flex items-center mb-6">
      {steps.map((label,i)=>{
        const idx=i+1;const done=idx<current;const active=idx===current;
        return(
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${done?"bg-emerald-500 text-white":active?"bg-zinc-900 text-white":"bg-zinc-200 text-zinc-400"}`}>
                {done?"✓":idx}
              </div>
              <span className={`text-[10px] mt-1 whitespace-nowrap ${active?"font-bold text-zinc-900":"text-zinc-400"}`}>{label}</span>
            </div>
            {i<steps.length-1&&<div className={`flex-1 h-0.5 mx-1 mb-3.5 ${done?"bg-emerald-500":"bg-zinc-200"}`}/>}
          </div>
        );
      })}
    </div>
  );
}

// ── 결과 패널 ──
function ResultPanel({result,scoreData,analyzing,nameInput,selectedHanja,nameChars}:{
  result:AnalysisResult|null;scoreData:ReturnType<typeof calcScore>|null;
  analyzing:boolean;nameInput:string;selectedHanja:(SelectedHanja|null)[];nameChars:string[];
}){
  if(analyzing){
    return(
      <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100 text-center">
        <p className="text-sm text-zinc-400">⏳ 분석 중...</p>
      </div>
    );
  }
  if(!result||!scoreData)return null;

  const overallStyle=getRatingStyle(result.namingScore.overallRating);
  const hanjaName=nameChars.map((_,i)=>i===0?"":selectedHanja[i]?.hanja??"").join("");

  return(
    <div className="space-y-4">
      {/* 종합 점수 카드 */}
      <div className="rounded-[28px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1" style={{background:overallStyle.bg,ringColor:overallStyle.color+"33"}}>
        <div className="text-center mb-4">
          <span className="text-2xl font-black tracking-widest">{nameInput}</span>
          {hanjaName&&<span className="text-xl font-bold tracking-widest ml-3" style={{color:overallStyle.color}}>{hanjaName}</span>}
        </div>
        {/* 한자 뜻 태그 */}
        <div className="flex justify-center gap-2 flex-wrap mb-4">
          {nameChars.map((_,i)=>{
            if(i===0)return null;
            const sel=selectedHanja[i];
            const ec=sel?ELEMENT_COLOR[sel.element]:null;
            return sel?(
              <div key={i} className="px-3 py-1.5 rounded-2xl border" style={{background:ec?.bg,borderColor:ec?.border}}>
                <div className="text-sm font-bold">{nameChars[i]} {sel.hanja}</div>
                <div className="text-xs font-semibold" style={{color:ec?.color}}>{sel.meaning}</div>
              </div>
            ):null;
          })}
        </div>
        {/* 점수 3개 */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center py-3 bg-white rounded-2xl ring-1 ring-zinc-100">
            <p className="text-[11px] text-zinc-400 mb-1">수리성명학</p>
            <p className="text-2xl font-black" style={{color:overallStyle.color}}>{scoreData.avgScore}<span className="text-sm font-semibold">점</span></p>
          </div>
          <div className="text-center py-3 bg-white rounded-2xl ring-1 ring-zinc-100">
            <p className="text-[11px] text-zinc-400 mb-1">사주오행보완</p>
            <p className={`text-2xl font-black ${scoreData.elementScore>=50?"text-emerald-600":"text-rose-600"}`}>{scoreData.elementScore}<span className="text-sm font-semibold">점</span></p>
          </div>
          <div className={`text-center py-3 bg-white rounded-2xl ring-2 ${scoreData.total>=70?"ring-emerald-400":scoreData.total>=40?"ring-amber-400":"ring-rose-400"}`}>
            <p className="text-[11px] text-zinc-400 mb-1">종합</p>
            <p className={`text-2xl font-black ${scoreData.total>=70?"text-emerald-600":scoreData.total>=40?"text-amber-600":"text-rose-600"}`}>{scoreData.total}<span className="text-sm font-semibold">점</span></p>
          </div>
        </div>
        {/* 점수바 */}
        <div className="h-2 bg-zinc-200 rounded-full overflow-hidden mb-2">
          <div className={`h-full rounded-full transition-all duration-500 ${scoreData.total>=70?"bg-emerald-500":scoreData.total>=40?"bg-amber-500":"bg-rose-500"}`} style={{width:`${scoreData.total}%`}}/>
        </div>
        <p className="text-xs text-zinc-500 text-center">
          {scoreData.total>=70?"👍 좋은 이름이에요!":scoreData.total>=40?"😐 보통 수준이에요":"😅 한자를 바꿔보세요"}
          {scoreData.veryBadCount>0&&<span className="ml-1 text-rose-500">⚠️ 매우나쁨 {scoreData.veryBadCount}개</span>}
        </p>
      </div>

      {/* 4격 수리 분석 */}
      <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100">
        <p className="text-base font-extrabold mb-3">4격 수리 분석</p>
        <div className="space-y-3">
          {[
            {label:"원격(元格)",data:result.namingScore.fourGuk.wonGuk},
            {label:"형격(亨格)",data:result.namingScore.fourGuk.hyeongGuk},
            {label:"이격(利格)",data:result.namingScore.fourGuk.iGuk},
            {label:"정격(貞格)",data:result.namingScore.fourGuk.jeonGuk},
          ].map(({label,data})=>{
            const s=getRatingStyle(data.rating);const info=GUK_INFO[label];
            return(
              <div key={label} className={`p-4 rounded-3xl border ${s.chip}`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 font-medium">{info?.period}</span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/70">{s.emoji} {data.rating}</span>
                </div>
                <p className="text-[11px] opacity-70 mb-2">{info?.desc}</p>
                <p className="text-sm font-bold mb-2">{data.strokes}획 · {data.name}</p>
                <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${getRatingScore(data.rating)}%`,background:"currentColor",opacity:0.6}}/>
                </div>
                <p className="text-[11px] opacity-70 mt-2 leading-relaxed">{data.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 발음오행 */}
      <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100">
        <p className="text-base font-extrabold mb-3">발음오행</p>
        <div className="flex gap-3">
          {result.namingScore.pronunciationElements.map((el,i)=>{
            const ec=ELEMENT_COLOR[el.element]??{color:"#888",bg:"#f9fafb",border:"#e5e7eb"};
            return(
              <div key={i} className="flex-1 text-center py-4 rounded-3xl border" style={{background:ec.bg,borderColor:ec.border}}>
                <div className="text-2xl font-black mb-1">{el.char}</div>
                <div className="text-xs font-bold" style={{color:ec.color}}>{ELEMENT_KR[el.element]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 요약 */}
      <div className="rounded-[28px] bg-zinc-900 p-5 text-white">
        <p className="text-xs font-bold text-white/50 mb-2">요약</p>
        <p className="text-sm leading-7 text-white/90">{result.namingScore.summary}</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
export default function NamingPage(){
  const [step,setStep]=useState(1);
  const [birthYear,setBirthYear]=useState("");
  const [birthMonth,setBirthMonth]=useState("");
  const [birthDay,setBirthDay]=useState("");
  const [birthHour,setBirthHour]=useState("");
  const [isLunar,setIsLunar]=useState("solar");
  const [sajuData,setSajuData]=useState<{energy:SajuEnergy;weakElements:string[];pillars:string}|null>(null);
  const [nameInput,setNameInput]=useState("");
  const [surnameStrokes,setSurnameStrokes]=useState(0);
  const [hanjaOptions,setHanjaOptions]=useState<HanjaOption[][]>([]);
  const [selectedHanja,setSelectedHanja]=useState<(SelectedHanja|null)[]>([]);
  const [result,setResult]=useState<AnalysisResult|null>(null);
  const [analyzing,setAnalyzing]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const resultRef=useRef<HTMLDivElement>(null);

  const years=Array.from({length:2027-1930+1},(_,i)=>2027-i);
  const months=Array.from({length:12},(_,i)=>i+1);
  const days=birthYear&&birthMonth?Array.from({length:new Date(+birthYear,+birthMonth,0).getDate()},(_,i)=>i+1):[];
  const hours=Array.from({length:24},(_,i)=>i);
  const nameChars=Array.from(nameInput);
  const allSelected=nameChars.every((_,i)=>i===0||selectedHanja[i]!==null);
  const weakEls=sajuData?.weakElements??[];
  const scoreData=result&&allSelected?calcScore(result,selectedHanja,nameChars,weakEls):null;

  const analyzeAuto=useCallback(async(selected:(SelectedHanja|null)[])=>{
    const chars=Array.from(nameInput);
    const strokesList=chars.map((_,i)=>i===0?surnameStrokes:(selected[i]?.strokes??0));
    if(strokesList.some(s=>!s))return;
    setAnalyzing(true);
    try{
      const res=await fetch("/api/naming/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nameHangul:nameInput,strokesList})});
      const data=await res.json();
      if(data.ok){
        setResult(data.result);
        setTimeout(()=>resultRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),100);
      }
    }catch{}
    finally{setAnalyzing(false);}
  },[nameInput,surnameStrokes]);

  function selectHanja(idx:number,opt:HanjaOption){
    const next=[...selectedHanja];
    next[idx]={hanja:opt.hanja,meaning:opt.meaning,strokes:opt.strokes_original,element:opt.five_elements};
    setSelectedHanja(next);
    analyzeAuto(next);
  }

  function handleStep1(){
    if(!birthYear||!birthMonth||!birthDay){setError("생년월일을 모두 입력해주세요.");return;}
    try{
      const res=computeSajuEnergy(+birthYear,+birthMonth,+birthDay,birthHour?+birthHour:12,isLunar==="lunar");
      setSajuData(res);setStep(2);setError("");
    }catch{setError("사주 계산 중 오류가 발생했어요.");}
  }

  function handleNameChange(val:string){
    const t=val.replace(/\s/g,"").slice(0,3);
    setNameInput(t);setSurnameStrokes(SURNAME_STROKES[t[0]]??0);
    setSelectedHanja(Array(t.length).fill(null));setResult(null);setError("");
  }

  async function handleStep2(){
    if(nameInput.length<3){setError("성씨 포함 3글자를 입력해주세요.");return;}
    if(!surnameStrokes){setError("성씨 획수를 입력해주세요.");return;}
    setLoading(true);
    try{
      const chars=Array.from(nameInput);
      const results=await Promise.all(chars.map((char,i)=>i===0?Promise.resolve([]):fetch(`/api/naming/hanja?sound=${char}&surnameStrokes=${surnameStrokes}`).then(r=>r.json()).then(d=>d.results??[])));
      setHanjaOptions(results);setSelectedHanja(Array(chars.length).fill(null));setResult(null);setStep(3);setError("");
    }catch{setError("한자 목록을 불러오지 못했어요.");}
    finally{setLoading(false);}
  }

  function handleChangeName(){setNameInput("");setSelectedHanja([]);setResult(null);setHanjaOptions([]);setStep(2);}
  function handleReset(){setStep(1);setNameInput("");setSelectedHanja([]);setResult(null);setSajuData(null);setBirthYear("");setBirthMonth("");setBirthDay("");}

  // ────────────────────────────────────────────────
  // STEP 1
  // ────────────────────────────────────────────────
  if(step===1)return(
    <main className="min-h-screen bg-[#f6f4ef] text-zinc-900">
      <div className="mx-auto max-w-md pb-20 px-4 pt-6">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 mb-4 inline-block">← 홈으로</Link>
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">사주 맞춤 작명 & 감명 ✨</h1>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">사주의 부족한 오행을 이름으로 보완하는 <strong className="text-zinc-700">진짜 작명</strong>을 해드려요.</p>

        <StepBar current={1}/>

        {/* 안내 카드 */}
        <div className="rounded-3xl bg-blue-50 border border-blue-100 px-4 py-4 mb-5">
          <p className="text-sm font-bold text-blue-700 mb-1">💡 왜 사주가 필요한가요?</p>
          <p className="text-sm text-blue-600 leading-relaxed">사주에서 부족한 오행(목·화·토·금·수)을 이름 한자로 보완하면 더 좋은 이름이 돼요. 수리성명학만으로는 반쪽짜리 작명이에요.</p>
        </div>

        {/* 입력 카드 — 사주 스타일 */}
        <section className="rounded-[32px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100 mb-4">
          <p className="text-base font-extrabold mb-4">태어난 날짜를 입력하세요</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <SelectField label="년도" value={birthYear} onChange={v=>setBirthYear(v)} icon={<CalendarDays className="h-3.5 w-3.5"/>}>
              <option value="">선택</option>
              {years.map(y=><option key={y} value={String(y)}>{y}년</option>)}
            </SelectField>
            <SelectField label="월" value={birthMonth} onChange={v=>setBirthMonth(v)}>
              <option value="">선택</option>
              {months.map(m=><option key={m} value={String(m)}>{m}월</option>)}
            </SelectField>
            <SelectField label="일" value={birthDay} onChange={v=>setBirthDay(v)} disabled={!birthYear||!birthMonth}>
              <option value="">선택</option>
              {days.map(d=><option key={d} value={String(d)}>{d}일</option>)}
            </SelectField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="시간 (선택)" value={birthHour} onChange={v=>setBirthHour(v)} icon={<Clock3 className="h-3.5 w-3.5"/>}>
              <option value="">모름 / 선택안함</option>
              {hours.map(h=><option key={h} value={String(h)}>{String(h).padStart(2,"0")}시</option>)}
            </SelectField>
            <SelectField label="달력 기준" value={isLunar} onChange={v=>setIsLunar(v)} icon={<SunMedium className="h-3.5 w-3.5"/>}>
              <option value="solar">양력</option>
              <option value="lunar">음력</option>
            </SelectField>
          </div>

          {error&&<div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}

          <button onClick={handleStep1} disabled={!birthYear||!birthMonth||!birthDay}
            className={`mt-5 w-full rounded-[24px] px-5 py-4 text-sm font-extrabold text-white transition ${(birthYear&&birthMonth&&birthDay)?"bg-zinc-900 shadow-[0_14px_30px_rgba(0,0,0,0.16)] hover:-translate-y-px":"cursor-not-allowed bg-zinc-300"}`}>
            사주 분석 후 이름 입력하기 →
          </button>
          <p className="text-xs text-zinc-400 mt-3 text-center">시간을 모르셔도 날짜만으로 분석 가능해요.</p>
        </section>
      </div>
    </main>
  );

  // ────────────────────────────────────────────────
  // STEP 2
  // ────────────────────────────────────────────────
  if(step===2)return(
    <main className="min-h-screen bg-[#f6f4ef] text-zinc-900">
      <div className="mx-auto max-w-md pb-20 px-4 pt-6">
        <button onClick={()=>setStep(1)} className="text-sm text-zinc-400 hover:text-zinc-600 mb-4">← 생년월일 다시 입력</button>
        <StepBar current={2}/>

        {/* 사주 오행 분석 */}
        {sajuData&&(
          <section className="rounded-[32px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100 mb-4">
            <p className="text-base font-extrabold mb-1">📊 사주 오행 분석</p>
            <p className="text-xs text-zinc-400 mb-4">{sajuData.pillars}</p>
            <div className="flex gap-2 items-end h-20 mb-4">
              {[{key:"목",val:sajuData.energy.wood},{key:"화",val:sajuData.energy.fire},{key:"토",val:sajuData.energy.earth},{key:"금",val:sajuData.energy.metal},{key:"수",val:sajuData.energy.water}].map(({key,val})=>{
                const ec=ELEMENT_COLOR[key];const isWeak=weakEls.includes(key);
                return(
                  <div key={key} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className={`text-xs font-bold ${isWeak?"text-rose-600":"text-zinc-400"}`}>{val}</span>
                    <div className="w-full rounded-t-xl transition-all" style={{height:Math.max(8,val*16),background:isWeak?"#fca5a5":ec.bg,border:`1.5px solid ${isWeak?"#dc2626":ec.color}44`}}/>
                    <span className={`text-xs font-semibold ${isWeak?"text-rose-600":"text-zinc-500"}`}>{key}</span>
                    {isWeak&&<span className="text-[9px] text-rose-500 font-bold">부족</span>}
                  </div>
                );
              })}
            </div>
            <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3">
              <p className="text-sm font-bold text-rose-700 flex items-center flex-wrap gap-2">
                ⚡ 이름에서 보완 필요:
                {weakEls.map(el=><span key={el} className="bg-white border border-rose-300 text-rose-700 px-3 py-0.5 rounded-full text-xs font-bold">{el} ({ELEMENT_KR[el]})</span>)}
              </p>
            </div>
          </section>
        )}

        {/* 이름 입력 카드 */}
        <section className="rounded-[32px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100 mb-4">
          <p className="text-base font-extrabold mb-4">이름을 입력하세요</p>

          {/* 글자 미리보기 */}
          <div className="flex gap-3 mb-4">
            {[0,1,2].map(i=>{
              const char=nameInput[i]??"";
              const isDone=!!nameInput[i];
              const isCurrent=nameInput.length===i;
              return(
                <div key={i} className={`flex-1 h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border-2 transition-all
                  ${isDone?"bg-blue-50 border-blue-400":isCurrent?"bg-blue-50/50 border-blue-200":"bg-zinc-50 border-zinc-200"}`}>
                  {isDone
                    ?<span className="text-3xl font-black text-zinc-900">{char}</span>
                    :<span className="text-xs text-zinc-400 font-medium">{i===0?"성씨":i===1?"이름 1":"이름 2"}</span>}
                </div>
              );
            })}
          </div>

          {/* 실제 input */}
          <input
            type="text"
            value={nameInput}
            onChange={e=>handleNameChange(e.target.value)}
            maxLength={3}
            lang="ko"
            placeholder="홍길동"
            autoComplete="off"
            autoFocus
            className="w-full h-14 rounded-3xl border-2 border-blue-200 bg-white px-4 text-xl font-black text-center tracking-[0.3em] outline-none transition focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] caret-blue-500"
          />
          <p className="text-xs text-zinc-400 mt-2 text-center">성씨 포함 3글자 입력 (예: 홍길동)</p>

          {/* 성씨 획수 확인 */}
          {nameInput.length>0&&(
            <div className={`mt-4 rounded-2xl px-4 py-3 border ${surnameStrokes?"bg-emerald-50 border-emerald-200":"bg-amber-50 border-amber-200"}`}>
              {surnameStrokes
                ?<p className="text-sm font-semibold text-emerald-700">✅ <strong>{nameInput[0]}</strong>씨 성씨 획수 <strong>{surnameStrokes}획</strong> 자동 확인</p>
                :<div>
                  <p className="text-sm font-bold text-amber-700 mb-2">⚠️ <strong>{nameInput[0]}</strong>씨 획수를 직접 입력해주세요</p>
                  <div className="flex items-center gap-3">
                    <input type="number" min={1} max={50} value={surnameStrokes||""} onChange={e=>setSurnameStrokes(Number(e.target.value))} placeholder="획수"
                      className="w-24 h-11 rounded-2xl border-2 border-amber-300 bg-white text-center text-lg font-bold outline-none focus:border-amber-500"/>
                    <span className="text-sm text-amber-700">획 (원획법)</span>
                  </div>
                </div>}
            </div>
          )}

          {error&&<div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}

          <button onClick={handleStep2} disabled={loading||nameInput.length<3||!surnameStrokes}
            className={`mt-5 w-full rounded-[24px] px-5 py-4 text-sm font-extrabold text-white transition ${(nameInput.length>=3&&surnameStrokes)?"bg-zinc-900 shadow-[0_14px_30px_rgba(0,0,0,0.16)] hover:-translate-y-px":"cursor-not-allowed bg-zinc-300"}`}>
            {loading?"⏳ 한자 불러오는 중...":"다음 — 한자 선택하기 →"}
          </button>
        </section>
      </div>
    </main>
  );

  // ────────────────────────────────────────────────
  // STEP 3
  // ────────────────────────────────────────────────
  return(
    <main className="min-h-screen bg-[#f6f4ef] text-zinc-900">
      <div className="mx-auto max-w-md pb-20 px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleChangeName} className="text-sm text-zinc-400 hover:text-zinc-600">← 이름 바꾸기</button>
          <button onClick={handleReset} className="text-xs text-zinc-400 border border-zinc-200 rounded-xl px-3 py-1.5 hover:bg-zinc-100">처음부터</button>
        </div>
        <StepBar current={3}/>

        {/* 사주 보완 안내 */}
        {weakEls.length>0&&(
          <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3">
            <p className="text-sm font-bold text-rose-700 flex items-center flex-wrap gap-2">
              ⭐ 사주 보완 오행:
              {weakEls.map(el=><span key={el} className="bg-white border border-rose-300 text-rose-700 px-2 py-0.5 rounded-full text-xs font-bold">{el}</span>)}
              의 한자를 선택하면 좋아요
            </p>
          </div>
        )}

        {/* 한자 선택 */}
        {nameChars.map((char,charIdx)=>{
          if(charIdx===0)return null;
          const rawOptions=hanjaOptions[charIdx]??[];
          const sortedOptions=[...rawOptions].sort((a,b)=>(weakEls.includes(a.five_elements)?0:1)-(weakEls.includes(b.five_elements)?0:1));
          const sel=selectedHanja[charIdx];
          const isLastChar=charIdx===nameChars.length-1;

          return(
            <div key={charIdx}>
              {/* 한자 선택 카드 */}
              <section className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-black border-2 ${sel?"bg-emerald-50 border-emerald-400 text-emerald-700":"bg-zinc-100 border-zinc-300 text-zinc-600"}`}>{char}</div>
                  <div>
                    <p className="text-sm font-bold">"{char}" 한자 선택</p>
                    {sel&&<p className="text-xs text-emerald-600 font-semibold">✓ {sel.hanja} {sel.meaning} — {sel.element}({ELEMENT_KR[sel.element]})</p>}
                  </div>
                </div>

                {rawOptions.length===0?(
                  <div className="py-6 text-center text-sm text-zinc-400 bg-zinc-50 rounded-2xl">😅 '{char}' 한자 데이터가 없어요</div>
                ):(
                  <div className="space-y-2">
                    {sortedOptions.map((opt,oi)=>{
                      const isSelected=sel?.hanja===opt.hanja;
                      const rs=opt.suriPreview?getRatingStyle(opt.suriPreview.rating):null;
                      const ec=ELEMENT_COLOR[opt.five_elements];
                      const isGood=opt.suriPreview&&["매우좋음","좋음"].includes(opt.suriPreview.rating);
                      const isWeakMatch=weakEls.includes(opt.five_elements);
                      const showWeakLabel=isWeakMatch&&(oi===0||!weakEls.includes(sortedOptions[oi-1]?.five_elements));
                      const showOtherLabel=!isWeakMatch&&oi>0&&weakEls.includes(sortedOptions[oi-1]?.five_elements);
                      return(
                        <div key={opt.hanja}>
                          {showWeakLabel&&<p className="text-xs text-rose-500 font-bold mb-1 ml-1">⭐ 사주 보완 추천</p>}
                          {showOtherLabel&&<p className="text-xs text-zinc-400 font-semibold mt-3 mb-1 ml-1">기타 한자</p>}
                          <button onClick={()=>selectHanja(charIdx,opt)}
                            className={`flex items-center gap-3 w-full p-3.5 rounded-2xl text-left border-2 transition-all
                              ${isSelected?"bg-blue-50 border-blue-400":isWeakMatch?"bg-rose-50/50 border-rose-200":isGood?"border-emerald-200 bg-white":"border-zinc-100 bg-white hover:bg-zinc-50"}`}>
                            <div className="text-3xl font-black min-w-[44px] text-center" style={{color:isSelected?"#1d4ed8":"#1e293b"}}>{opt.hanja}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <span className="text-sm font-bold">{opt.meaning}</span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full border font-semibold" style={{background:ec?.bg,color:ec?.color,borderColor:ec?.border}}>{ELEMENT_KR[opt.five_elements]}</span>
                                {isWeakMatch&&<span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 font-bold">사주보완⭐</span>}
                              </div>
                              <p className="text-[11px] text-zinc-400">{opt.strokes_original}획{opt.suriPreview&&` · 형격 ${opt.suriPreview.strokes}획 (${opt.suriPreview.name})`}</p>
                            </div>
                            {rs&&<span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${rs.chip}`}>{rs.emoji} {opt.suriPreview?.rating}</span>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* 결과 */}
              {isLastChar&&(
                <div ref={resultRef} className="border-t-2 border-dashed border-zinc-200 pt-5 mt-2">
                  <ResultPanel result={result} scoreData={scoreData} analyzing={analyzing} nameInput={nameInput} selectedHanja={selectedHanja} nameChars={nameChars}/>
                </div>
              )}
            </div>
          );
        })}

        <div className="space-y-2 mt-4">
          <button onClick={handleChangeName} className="w-full rounded-[24px] bg-zinc-900 px-5 py-4 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)] hover:-translate-y-px transition">
            다른 이름으로 바꾸기 (사주 유지)
          </button>
          <button onClick={handleReset} className="w-full rounded-[24px] bg-white px-5 py-4 text-sm font-bold text-zinc-500 ring-1 ring-zinc-200 hover:bg-zinc-50 transition">
            처음부터 (생년월일 재입력)
          </button>
        </div>
      </div>
    </main>
  );
}
