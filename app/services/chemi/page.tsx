"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Clock3,
  HeartHandshake,
  Info,
  MoonStar,
  Sparkles,
  SunMedium,
  Users,
  X,
} from "lucide-react";
import { calculateSajuSimple, lunarToSolar } from "@fullstackfamily/manseryeok";
import { useKakaoShare } from "@/lib/useKakaoShare"; // ✅ 추가

type EnergyType = {
  wood: number; fire: number; earth: number; metal: number; water: number;
};
type PillarItem = {
  label: string; gan: string; ji: string; ganElement: string; jiElement: string;
};
type ResultType = {
  pillars: PillarItem[]; energy: EnergyType; dayMaster: string; dayBranch: string;
  dominantElement: string; solarDateText: string; inputDateText: string; basisText: string;
  summaryText: string; yearPillarText: string; monthPillarText: string;
  dayPillarText: string; hourPillarText: string; unknownTime: boolean;
};
type BirthDataType = {
  year: string; month: string; day: string; hour: string;
  isLunar: "" | "solar" | "lunar"; isLeapMonth: "" | "false" | "true";
};
type CompatibilityType = {
  score: number; grade: string; relationLabel: string; confidenceLabel: string;
  summary: string; dayMasterChemistry: string; dayBranchChemistry: string;
  energyChemistry: string; caution: string; advice: string[];
  combinedEnergy: EnergyType;
};

const EMPTY_BIRTH_DATA: BirthDataType = { year: "", month: "", day: "", hour: "", isLunar: "", isLeapMonth: "" };

const ELEMENT_META: Record<string, { label: string; hanja: string; emoji: string; chipClass: string; barClass: string; softClass: string }> = {
  목: { label: "목", hanja: "木", emoji: "🌿", chipClass: "bg-emerald-100 text-emerald-800 border-emerald-200", barClass: "bg-emerald-500", softClass: "bg-emerald-50" },
  화: { label: "화", hanja: "火", emoji: "🔥", chipClass: "bg-rose-100 text-rose-800 border-rose-200", barClass: "bg-rose-500", softClass: "bg-rose-50" },
  토: { label: "토", hanja: "土", emoji: "🌏", chipClass: "bg-amber-100 text-amber-800 border-amber-200", barClass: "bg-amber-500", softClass: "bg-amber-50" },
  금: { label: "금", hanja: "金", emoji: "⚔️", chipClass: "bg-zinc-200 text-zinc-800 border-zinc-300", barClass: "bg-zinc-500", softClass: "bg-zinc-50" },
  수: { label: "수", hanja: "Water", emoji: "💧", chipClass: "bg-blue-100 text-blue-800 border-blue-200", barClass: "bg-blue-500", softClass: "bg-blue-50" },
};
const BRANCH_ANIMALS: Record<string, { label: string; emoji: string }> = {
  자: { label: "쥐", emoji: "🐭" }, 축: { label: "소", emoji: "🐮" }, 인: { label: "호랑이", emoji: "🐯" },
  묘: { label: "토끼", emoji: "🐰" }, 진: { label: "용", emoji: "🐲" }, 사: { label: "뱀", emoji: "🐍" },
  오: { label: "말", emoji: "🐴" }, 미: { label: "양", emoji: "🐑" }, 신: { label: "원숭이", emoji: "🐵" },
  유: { label: "닭", emoji: "🐔" }, 술: { label: "개", emoji: "🐶" }, 해: { label: "돼지", emoji: "🐷" },
};
const STEM_ELEMENT_MAP: Record<string, string> = {
  갑: "목", 을: "목", 병: "화", 정: "화", 무: "토", 기: "토", 경: "금", 신: "금", 임: "수", 계: "수",
};
const BRANCH_ELEMENT_MAP: Record<string, string> = {
  자: "수", 축: "토", 인: "목", 묘: "목", 진: "토", 사: "화", 오: "화", 미: "토", 신: "금", 유: "금", 술: "토", 해: "수",
};
const GENERATES: Record<string, string> = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
const CONTROLS: Record<string, string> = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" };
const BRANCH_HARMONY: Record<string, string> = {
  자: "축", 축: "자", 인: "해", 해: "인", 묘: "술", 술: "묘",
  진: "유", 유: "진", 사: "신", 신: "사", 오: "미", 미: "오",
};
const BRANCH_CLASH: Record<string, string> = {
  자: "오", 오: "자", 축: "미", 미: "축", 인: "신", 신: "인",
  묘: "유", 유: "묘", 진: "술", 술: "진", 사: "해", 해: "사",
};

function getElementStyles(char: string) {
  if ("갑을인묘".includes(char)) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if ("병정사오".includes(char)) return "bg-rose-50 text-rose-700 border-rose-200";
  if ("무기진술축미".includes(char)) return "bg-amber-50 text-amber-700 border-amber-200";
  if ("경신유".includes(char)) return "bg-zinc-100 text-zinc-700 border-zinc-200";
  if ("임계해자".includes(char)) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-white text-zinc-700 border-zinc-200";
}
function addElementCount(energy: EnergyType, element?: string) {
  switch (element) {
    case "목": energy.wood += 1; break; case "화": energy.fire += 1; break;
    case "토": energy.earth += 1; break; case "금": energy.metal += 1; break; case "수": energy.water += 1; break;
  }
}
function getDominantElement(energy: EnergyType) {
  const list = [{ key: "목", value: energy.wood }, { key: "화", value: energy.fire }, { key: "토", value: energy.earth }, { key: "금", value: energy.metal }, { key: "수", value: energy.water }];
  list.sort((a, b) => b.value - a.value);
  return list[0]?.key ?? "수";
}
function getDaysInMonth(year: number, month: number, isLunar: boolean) {
  if (isLunar) return Array.from({ length: 30 }, (_, i) => i + 1);
  return Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1);
}
function pillarTextToItem(label: string, pillarText?: string | null): PillarItem {
  const safeText = pillarText ?? "--";
  const [gan = "-", ji = "-"] = safeText.split("");
  return { label, gan, ji, ganElement: STEM_ELEMENT_MAP[gan] || "-", jiElement: BRANCH_ELEMENT_MAP[ji] || "-" };
}
function getWeakElements(energy: EnergyType) {
  const items = [{ key: "목", value: energy.wood }, { key: "화", value: energy.fire }, { key: "토", value: energy.earth }, { key: "금", value: energy.metal }, { key: "수", value: energy.water }];
  const min = Math.min(...items.map((i) => i.value));
  return items.filter((i) => i.value === min).map((i) => i.key);
}
function getZeroElements(energy: EnergyType) {
  const items = [{ key: "목", value: energy.wood }, { key: "화", value: energy.fire }, { key: "토", value: energy.earth }, { key: "금", value: energy.metal }, { key: "수", value: energy.water }];
  return items.filter((i) => i.value === 0).map((i) => i.key);
}
function canCalculateBirthData(birthData: BirthDataType) {
  return !!birthData.year && !!birthData.month && !!birthData.day && !!birthData.isLunar && (birthData.isLunar === "solar" || !!birthData.isLeapMonth);
}
function calculatePersonResult(birthData: BirthDataType): ResultType {
  const isLunar = birthData.isLunar === "lunar";
  const unknownTime = !birthData.hour;
  const year = parseInt(birthData.year, 10);
  const month = parseInt(birthData.month, 10);
  const day = parseInt(birthData.day, 10);
  const hour = birthData.hour ? parseInt(birthData.hour, 10) : 12;
  const isLeapMonth = birthData.isLeapMonth === "true";
  let solarYear = year, solarMonth = month, solarDay = day;
  if (isLunar) {
    const solar = lunarToSolar(year, month, day, isLeapMonth);
    solarYear = solar.solar.year; solarMonth = solar.solar.month; solarDay = solar.solar.day;
  }
  const saju = calculateSajuSimple(solarYear, solarMonth, solarDay, unknownTime ? 12 : hour);
  const yearPillarText = saju.yearPillar ?? "--";
  const monthPillarText = saju.monthPillar ?? "--";
  const dayPillarText = saju.dayPillar ?? "--";
  const safeHourPillar = saju.hourPillar ?? "--";
  const hourPillarText = unknownTime ? "시간 모름" : safeHourPillar;
  const pillars: PillarItem[] = [
    pillarTextToItem("년주", yearPillarText), pillarTextToItem("월주", monthPillarText),
    pillarTextToItem("일주", dayPillarText), pillarTextToItem("시주", unknownTime ? "--" : safeHourPillar),
  ];
  const energy: EnergyType = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  pillars.forEach((item) => {
    if (item.gan !== "-") addElementCount(energy, item.ganElement);
    if (item.ji !== "-") addElementCount(energy, item.jiElement);
  });
  const dominantElement = getDominantElement(energy);
  const inputDateText = `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} ${isLunar ? "(음력)" : "(양력)"}`;
  const solarDateText = `${solarYear}년 ${solarMonth}월 ${solarDay}일`;
  const basisText = isLunar ? `음력 입력값을 양력으로 변환한 뒤 계산했어요${unknownTime ? " · 시간 미입력으로 시주는 제외했어요" : ""}` : `입력한 양력 기준으로 계산했어요${unknownTime ? " · 시간 미입력으로 시주는 제외했어요" : ""}`;
  const dayMaster = dayPillarText[0] ?? "-";
  const dayBranch = dayPillarText[1] ?? "-";
  const summaryText = `${yearPillarText}년 · ${monthPillarText}월 · ${dayPillarText}일${unknownTime ? " · 시주 미입력" : ` · ${hourPillarText}시`}`;
  return { pillars, energy, dayMaster, dayBranch, dominantElement, solarDateText, inputDateText, basisText, summaryText, yearPillarText, monthPillarText, dayPillarText, hourPillarText, unknownTime };
}
function mergeEnergy(a: EnergyType, b: EnergyType): EnergyType {
  return { wood: a.wood + b.wood, fire: a.fire + b.fire, earth: a.earth + b.earth, metal: a.metal + b.metal, water: a.water + b.water };
}
function getElementRelation(a: string, b: string) {
  if (!a || !b || a === "-" || b === "-") return { type: "neutral", score: 0, label: "판단 보류" };
  if (a === b) return { type: "same", score: 12, label: "같은 결" };
  if (GENERATES[a] === b) return { type: "a-generates-b", score: 18, label: `${a} → ${b} 상생` };
  if (GENERATES[b] === a) return { type: "b-generates-a", score: 18, label: `${b} → ${a} 상생` };
  if (CONTROLS[a] === b) return { type: "a-controls-b", score: -8, label: `${a} → ${b} 상극` };
  if (CONTROLS[b] === a) return { type: "b-controls-a", score: -8, label: `${b} → ${a} 상극` };
  return { type: "neutral", score: 0, label: "중립" };
}
function getBranchRelation(a: string, b: string) {
  if (!a || !b || a === "-" || b === "-") return { type: "neutral", score: 0, label: "판단 보류" };
  if (a === b) return { type: "same", score: 8, label: "같은 일지" };
  if (BRANCH_HARMONY[a] === b) return { type: "harmony", score: 15, label: "육합 성향" };
  if (BRANCH_CLASH[a] === b) return { type: "clash", score: -15, label: "충 성향" };
  return { type: "neutral", score: 0, label: "무난한 편" };
}
function getScoreGrade(score: number) {
  if (score >= 85) return { grade: "A+", label: "아주 잘 맞는 궁합" };
  if (score >= 75) return { grade: "A", label: "좋은 궁합" };
  if (score >= 65) return { grade: "B+", label: "상당히 괜찮은 궁합" };
  if (score >= 55) return { grade: "B", label: "무난한 궁합" };
  if (score >= 45) return { grade: "C", label: "조율이 필요한 궁합" };
  return { grade: "D", label: "차이를 크게 느낄 수 있는 궁합" };
}
function getCompatibilityContent(a: ResultType, b: ResultType): CompatibilityType {
  const aDayElement = STEM_ELEMENT_MAP[a.dayMaster] || "-";
  const bDayElement = STEM_ELEMENT_MAP[b.dayMaster] || "-";
  const dayMasterRelation = getElementRelation(aDayElement, bDayElement);
  const dominantRelation = getElementRelation(a.dominantElement, b.dominantElement);
  const dayBranchRelation = getBranchRelation(a.dayBranch, b.dayBranch);
  const aWeak = [...getWeakElements(a.energy), ...getZeroElements(a.energy)];
  const bWeak = [...getWeakElements(b.energy), ...getZeroElements(b.energy)];
  let complementScore = 0;
  if (aWeak.includes(b.dominantElement)) complementScore += 7;
  if (bWeak.includes(a.dominantElement)) complementScore += 7;
  const combinedEnergy = mergeEnergy(a.energy, b.energy);
  const combinedValues = Object.values(combinedEnergy);
  const gap = Math.max(...combinedValues) - Math.min(...combinedValues);
  let balanceScore = 0;
  if (gap <= 1) balanceScore = 10; else if (gap <= 2) balanceScore = 8;
  else if (gap <= 3) balanceScore = 5; else if (gap <= 4) balanceScore = 2;
  let score = 50 + dayMasterRelation.score + dominantRelation.score + dayBranchRelation.score + complementScore + balanceScore;
  if (a.dayMaster === b.dayMaster) score += 3;
  if (a.unknownTime || b.unknownTime) score -= 3;
  if (a.unknownTime && b.unknownTime) score -= 2;
  score = Math.max(0, Math.min(100, score));
  const gradeInfo = getScoreGrade(score);
  const confidenceLabel = a.unknownTime && b.unknownTime ? "보통 이하 · 두 사람 모두 시주 제외" : a.unknownTime || b.unknownTime ? "보통 · 한 사람 시주 제외" : "높음 · 시주 포함";
  const summary = score >= 75 ? "기본 결이 서로 잘 이어지고, 관계를 오래 가져갈수록 장점이 드러나기 쉬운 궁합입니다." : score >= 55 ? "잘 맞는 부분과 조율이 필요한 부분이 함께 보이는 궁합입니다. 서로의 차이를 이해하면 충분히 안정적으로 흐를 수 있습니다." : "서로의 생활 리듬이나 감정 표현 방식에서 차이를 크게 느낄 수 있는 궁합입니다. 하지만 차이를 명확히 알고 맞추면 관계의 밀도를 높일 여지는 있습니다.";
  const dayMasterChemistryMap: Record<string, string> = {
    same: `두 사람의 일간 오행이 모두 ${aDayElement} 계열이라 기본 결이 비슷합니다. 서로를 이해하는 속도는 빠를 수 있지만, 비슷한 약점도 함께 드러날 수 있어 역할 분담이 중요합니다.`,
    "a-generates-b": `A의 일간 오행인 ${aDayElement}이 B의 ${bDayElement}을 살리는 상생 흐름입니다. A가 먼저 방향을 잡아주거나 기운을 북돋아주는 쪽으로 관계가 흘러가기 쉽습니다.`,
    "b-generates-a": `B의 일간 오행인 ${bDayElement}이 A의 ${aDayElement}을 살리는 상생 흐름입니다. B가 감정적 지지나 실질적 도움을 주는 구조로 이어지기 쉽습니다.`,
    "a-controls-b": `A의 ${aDayElement}과 B의 ${bDayElement} 사이에는 상극 기운이 있어 기준 충돌이 생길 수 있습니다. 서로를 고치려 하기보다 역할 차이로 받아들이는 태도가 중요합니다.`,
    "b-controls-a": `B의 ${bDayElement}과 A의 ${aDayElement} 사이에는 상극 기운이 있어 의견 대립이 반복될 수 있습니다. 감정이 아니라 방식의 차이라는 점을 인식하면 마찰을 줄일 수 있습니다.`,
    neutral: "일간 기준으로는 강한 상생이나 상극보다 무난한 흐름에 가깝습니다. 결국 관계의 질은 대화 방식과 생활 리듬 조율에 더 크게 좌우됩니다.",
  };
  const dayBranchChemistryMap: Record<string, string> = {
    same: "일지가 같아 생활 감각이나 친밀감의 결이 비슷하게 맞아들어갈 가능성이 큽니다. 익숙함과 안정감이 장점이 되기 쉽습니다.",
    harmony: "일지 사이에 합 성향이 있어 일상적인 호흡, 정서적 친밀감, 함께 있을 때의 편안함이 잘 만들어질 수 있습니다.",
    clash: "일지 사이에 충 성향이 있어 가까워질수록 생활 습관, 감정 반응, 거리감 조절에서 부딪힘이 생길 수 있습니다. 대신 서로에게 강한 자극과 끌림으로 작용할 가능성도 있습니다.",
    neutral: "일지 기준으로는 특별히 강한 합이나 충보다는 무난한 흐름입니다. 관계의 핵심은 다른 요소에서 더 많이 결정됩니다.",
  };
  let energyChemistry = "";
  if (complementScore >= 10) energyChemistry = "오행 분포를 보면 한쪽의 강한 기운이 다른 쪽의 약한 부분을 채워주는 보완성이 비교적 잘 보입니다. 함께 있을 때 서로에게 없는 리듬을 공급하는 구조로 작동할 수 있습니다.";
  else if (dominantRelation.type === "same") energyChemistry = `두 사람 모두 ${a.dominantElement} 기운이 강해 관계의 추진 방식이 비슷할 가능성이 큽니다. 함께 움직일 때는 빠르지만, 한쪽으로 과하게 쏠리지 않도록 균형을 잡는 것이 중요합니다.`;
  else if (dominantRelation.type === "a-generates-b" || dominantRelation.type === "b-generates-a") energyChemistry = "대표 오행이 상생 관계라 함께 있을 때 흐름이 부드럽게 이어질 가능성이 큽니다. 서로의 강점을 자연스럽게 살려주면 관계 효율이 높아집니다.";
  else if (dominantRelation.type === "a-controls-b" || dominantRelation.type === "b-controls-a") energyChemistry = "대표 오행 사이에 상극 흐름이 있어 결정 방식이나 우선순위에서 긴장감이 생길 수 있습니다. 한 사람이 주도권을 독점하면 피로가 커질 수 있으니, 번갈아 리드하는 구조가 좋습니다.";
  else energyChemistry = "대표 오행 기준으로는 강한 보완이나 강한 충돌보다 중간 흐름에 가깝습니다. 관계의 안정성은 감정 표현과 실질적인 생활 조율에 달려 있습니다.";
  let caution = "";
  if (dayBranchRelation.type === "clash") caution = "가까워질수록 사소한 생활 방식, 연락 빈도, 감정 표현 속도에서 부딪힐 수 있습니다. 문제의 원인을 성격 탓으로만 보지 말고 리듬 차이로 이해하는 것이 중요합니다.";
  else if (dayMasterRelation.type === "a-controls-b" || dayMasterRelation.type === "b-controls-a") caution = "한쪽이 상대를 이끌거나 교정하려는 흐름이 강해지면 관계 피로가 빨리 쌓일 수 있습니다. 조언과 통제를 구분하는 태도가 필요합니다.";
  else caution = "기본적으로 무난한 흐름이더라도 오래 가는 관계는 결국 대화 습관과 현실적인 배려에서 차이가 납니다. 잘 맞는 부분만 믿기보다 생활 속 합을 만들어가는 태도가 중요합니다.";
  const advice: string[] = [];
  if (dayMasterRelation.type === "a-generates-b" || dayMasterRelation.type === "b-generates-a") advice.push("한쪽이 주는 에너지와 다른 한쪽이 받는 에너지의 흐름이 좋으니, 고마움 표현을 자주 해주는 것이 관계 안정에 도움이 됩니다.");
  if (dayMasterRelation.type === "a-controls-b" || dayMasterRelation.type === "b-controls-a") advice.push("의견 차이가 생길 때는 누가 맞는지보다 어떤 방식이 더 편한지부터 확인하면 갈등이 줄어듭니다.");
  if (dayBranchRelation.type === "harmony") advice.push("함께 보내는 시간을 규칙적으로 확보하면 정서적 친밀감이 더 빠르게 쌓일 수 있습니다.");
  if (dayBranchRelation.type === "clash") advice.push("연락 주기, 혼자 있는 시간, 소비 습관처럼 일상 규칙을 미리 맞춰두는 것이 좋습니다.");
  if (aWeak.includes(b.dominantElement) || bWeak.includes(a.dominantElement)) advice.push("서로의 강점이 상대의 빈 부분을 채워주는 면이 있으니, 바꾸려 하기보다 맡기고 기대는 구조를 만드는 것이 좋습니다.");
  if (a.unknownTime || b.unknownTime) advice.push("태어난 시간을 모르는 쪽은 시주를 제외해 해석했으므로, 세부 생활 성향보다는 큰 결의 궁합 중심으로 보는 것이 자연스럽습니다.");
  if (advice.length === 0) advice.push("궁합은 기본적으로 나쁘지 않지만, 실제 만족도는 관계 운영 방식에 더 크게 좌우됩니다.");
  return {
    score, grade: gradeInfo.grade, relationLabel: gradeInfo.label, confidenceLabel, summary,
    dayMasterChemistry: dayMasterChemistryMap[dayMasterRelation.type] || dayMasterChemistryMap.neutral,
    dayBranchChemistry: dayBranchChemistryMap[dayBranchRelation.type] || dayBranchChemistryMap.neutral,
    energyChemistry, caution, advice, combinedEnergy,
  };
}

function SelectField({ label, value, onChange, children, icon, disabled = false }: {
  label: string; value: string; onChange: (value: string) => void;
  children: React.ReactNode; icon?: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">{icon}{label}</div>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
          className={`h-14 w-full appearance-none rounded-3xl border border-zinc-200 bg-white px-4 pr-10 text-[15px] font-semibold shadow-sm outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 ${value ? "text-zinc-900" : "text-zinc-400"}`}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, sub }: { icon: React.ReactNode; title: string; value: string; sub: string }) {
  return (
    <div className="rounded-[28px] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] ring-1 ring-zinc-100">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-lg text-white">{icon}</div>
      <div className="text-base font-bold text-zinc-900">{value}</div>
      <div className="mt-1 text-sm text-zinc-600">{title}</div>
      <div className="mt-1 text-[11px] text-zinc-400">{sub}</div>
    </div>
  );
}

function PillarBlock({ item }: { item: PillarItem }) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-xs font-semibold text-zinc-400">{item.label}</div>
      <div className={`mb-2 flex h-14 w-14 items-center justify-center rounded-3xl border text-2xl font-bold shadow-sm ${getElementStyles(item.gan)}`}>{item.gan}</div>
      <div className="mb-3 text-[11px] font-medium text-zinc-500">{item.ganElement || "-"}</div>
      <div className={`mb-2 flex h-14 w-14 items-center justify-center rounded-3xl border text-2xl font-bold shadow-sm ${getElementStyles(item.ji)}`}>{item.ji}</div>
      <div className="text-[11px] font-medium text-zinc-500">{item.jiElement || "-"}</div>
    </div>
  );
}

function BirthFormCard({ title, birthData, setBirthData, years, months, hours }: {
  title: string; birthData: BirthDataType;
  setBirthData: React.Dispatch<React.SetStateAction<BirthDataType>>;
  years: number[]; months: number[]; hours: number[];
}) {
  const isLunar = birthData.isLunar === "lunar";
  const days = useMemo(() => {
    if (!birthData.year || !birthData.month) return [];
    return getDaysInMonth(parseInt(birthData.year, 10), parseInt(birthData.month, 10), isLunar);
  }, [birthData.year, birthData.month, isLunar]);

  useEffect(() => {
    if (!birthData.day || days.length === 0) return;
    const selectedDay = parseInt(birthData.day, 10);
    const maxDay = days[days.length - 1] ?? 1;
    if (selectedDay > maxDay) setBirthData((prev) => ({ ...prev, day: String(maxDay) }));
  }, [days, birthData.day, setBirthData]);

  return (
    <section className="rounded-[32px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-extrabold">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-zinc-500">태어난 시간을 모르셔도 괜찮아요</div>
        </div>
        <div className="rounded-full bg-yellow-300 px-4 py-2 text-xs font-extrabold text-zinc-900">입력</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="태어난 년" value={birthData.year} onChange={(value) => setBirthData((prev) => ({ ...prev, year: value, day: "" }))} icon={<CalendarDays className="h-3.5 w-3.5" />}>
          <option value="">선택</option>
          {years.map((y) => <option key={y} value={String(y)}>{y}년</option>)}
        </SelectField>
        <SelectField label="태어난 월" value={birthData.month} onChange={(value) => setBirthData((prev) => ({ ...prev, month: value, day: "" }))}>
          <option value="">선택</option>
          {months.map((m) => <option key={m} value={String(m)}>{m}월</option>)}
        </SelectField>
        <SelectField label="태어난 일" value={birthData.day} onChange={(value) => setBirthData((prev) => ({ ...prev, day: value }))} disabled={!birthData.year || !birthData.month}>
          <option value="">선택</option>
          {days.map((d) => <option key={d} value={String(d)}>{d}일</option>)}
        </SelectField>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <SelectField label="태어난 시간 (선택)" value={birthData.hour} onChange={(value) => setBirthData((prev) => ({ ...prev, hour: value }))} icon={<Clock3 className="h-3.5 w-3.5" />}>
          <option value="">모름 / 선택안함</option>
          {hours.map((h) => <option key={h} value={String(h)}>{String(h).padStart(2, "0")}시</option>)}
        </SelectField>
        <SelectField label="달력 기준" value={birthData.isLunar} onChange={(value) => setBirthData((prev) => ({ ...prev, isLunar: value as "" | "solar" | "lunar", isLeapMonth: "" }))}
          icon={birthData.isLunar === "solar" ? <SunMedium className="h-3.5 w-3.5" /> : birthData.isLunar === "lunar" ? <MoonStar className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}>
          <option value="">선택</option>
          <option value="solar">양력</option>
          <option value="lunar">음력</option>
        </SelectField>
      </div>
      <div className="mt-4">
        {birthData.isLunar === "lunar" ? (
          <SelectField label="윤달 여부" value={birthData.isLeapMonth} onChange={(value) => setBirthData((prev) => ({ ...prev, isLeapMonth: value as "" | "false" | "true" }))}>
            <option value="">선택</option>
            <option value="false">일반월</option>
            <option value="true">윤달</option>
          </SelectField>
        ) : birthData.isLunar === "solar" ? null : (
          <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-4">
            <div className="text-sm font-semibold leading-relaxed text-zinc-500">달력 기준(양력/음력)을 선택해주세요</div>
          </div>
        )}
      </div>
    </section>
  );
}

function PersonResultCard({ title, result }: { title: string; result: ResultType }) {
  const dominantMeta = ELEMENT_META[result.dominantElement];
  const animal = BRANCH_ANIMALS[result.dayBranch] || { label: "-", emoji: "•" };
  return (
    <section className="rounded-[32px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-extrabold">{title}</div>
          <div className="mt-1 text-sm text-zinc-500">{result.summaryText}</div>
        </div>
        <div className={`rounded-full border px-3 py-1.5 text-xs font-bold ${dominantMeta.chipClass}`}>{dominantMeta.emoji} {dominantMeta.label}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-zinc-50 p-4"><div className="text-[11px] font-bold text-zinc-400">입력일</div><div className="mt-1 text-sm font-bold text-zinc-900">{result.inputDateText}</div></div>
        <div className="rounded-2xl bg-zinc-50 p-4"><div className="text-[11px] font-bold text-zinc-400">기준 양력</div><div className="mt-1 text-sm font-bold text-zinc-900">{result.solarDateText}</div></div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {result.pillars.map((item) => <PillarBlock key={`${title}-${item.label}`} item={item} />)}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100"><div className="text-[11px] font-bold text-blue-400">일간</div><div className="mt-1 text-base font-extrabold text-zinc-900">{result.dayMaster}</div></div>
        <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100"><div className="text-[11px] font-bold text-amber-500">일지</div><div className="mt-1 text-base font-extrabold text-zinc-900">{result.dayBranch} {animal.emoji} {animal.label}</div></div>
        <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100"><div className="text-[11px] font-bold text-emerald-500">대표 오행</div><div className="mt-1 text-base font-extrabold text-zinc-900">{dominantMeta.emoji} {result.dominantElement}</div></div>
      </div>
      <div className="mt-4 rounded-3xl bg-zinc-50 p-4">
        <div className="text-[11px] font-bold text-zinc-400">기준 안내</div>
        <div className="mt-2 text-sm leading-6 text-zinc-700">{result.basisText}</div>
      </div>
    </section>
  );
}

function EnergyCompareSection({ a, b, combined }: { a: ResultType; b: ResultType; combined: CompatibilityType["combinedEnergy"] }) {
  const rows = [
    { label: "목", aValue: a.energy.wood, bValue: b.energy.wood, sum: combined.wood },
    { label: "화", aValue: a.energy.fire, bValue: b.energy.fire, sum: combined.fire },
    { label: "토", aValue: a.energy.earth, bValue: b.energy.earth, sum: combined.earth },
    { label: "금", aValue: a.energy.metal, bValue: b.energy.metal, sum: combined.metal },
    { label: "수", aValue: a.energy.water, bValue: b.energy.water, sum: combined.water },
  ];
  return (
    <section className="rounded-[32px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100">
      <div className="text-lg font-extrabold">오행 궁합 비교</div>
      <div className="mt-1 text-sm text-zinc-500">두 사람의 오행 분포와 합친 에너지를 함께 봅니다</div>
      <div className="mt-5 space-y-3">
        {rows.map((row) => {
          const meta = ELEMENT_META[row.label];
          return (
            <div key={row.label} className={`rounded-3xl p-4 ${meta.softClass}`}>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-extrabold text-zinc-900">{meta.emoji} {row.label}</div>
                <div className="text-xs font-bold text-zinc-500">합계 {row.sum}</div>
              </div>
              <div className="grid grid-cols-[48px_1fr_48px] items-center gap-3">
                <div className="text-xs font-bold text-zinc-500">A {row.aValue}</div>
                <div className="h-3 overflow-hidden rounded-full bg-white/80">
                  <div className={`h-full rounded-full ${meta.barClass}`} style={{ width: `${Math.min(100, row.sum * 10)}%` }} />
                </div>
                <div className="text-right text-xs font-bold text-zinc-500">B {row.bValue}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Page() {
  const years = useMemo(() => Array.from({ length: 2040 - 1930 + 1 }, (_, i) => 1930 + i), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const [personA, setPersonA] = useState<BirthDataType>(EMPTY_BIRTH_DATA);
  const [personB, setPersonB] = useState<BirthDataType>(EMPTY_BIRTH_DATA);
  const [resultA, setResultA] = useState<ResultType | null>(null);
  const [resultB, setResultB] = useState<ResultType | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityType | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);

  const { shareWithCapture } = useKakaoShare(); // ✅ 훅

  useEffect(() => {
    setResultA(null); setResultB(null); setCompatibility(null); setErrorMessage("");
  }, [personA, personB]);

  const canCalculate = canCalculateBirthData(personA) && canCalculateBirthData(personB);

  const handleCalculate = useCallback(() => {
    try {
      setErrorMessage("");
      if (!canCalculate) {
        setResultA(null); setResultB(null); setCompatibility(null);
        setErrorMessage("두 사람의 출생 정보를 모두 선택해주세요.");
        return;
      }
      const calculatedA = calculatePersonResult(personA);
      const calculatedB = calculatePersonResult(personB);
      const calculatedCompatibility = getCompatibilityContent(calculatedA, calculatedB);
      setResultA(calculatedA); setResultB(calculatedB); setCompatibility(calculatedCompatibility);
    } catch (error) {
      console.error(error);
      setResultA(null); setResultB(null); setCompatibility(null);
      setErrorMessage("계산 중 오류가 발생했습니다. 날짜 또는 음력/윤달 입력값을 다시 확인해주세요.");
    }
  }, [canCalculate, personA, personB]);

  const handleBack = () => { if (typeof window !== "undefined") window.history.back(); };

  // ✅ 카카오 공유 핸들러
  const handleKakaoShare = useCallback(() => {
    if (!compatibility || !resultA || !resultB) return;
    shareWithCapture({
      captureId: "chemi-capture",
      title: `사주 궁합 ${compatibility.score}점 · ${compatibility.grade} ${compatibility.relationLabel}`,
      description: compatibility.summary,
      buttonText: "우리 궁합 보기 →",
      pageUrl: "https://dasangdam.com/services/chemi",
    });
  }, [compatibility, resultA, resultB, shareWithCapture]);

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-zinc-900">
      <div className="mx-auto max-w-md pb-28">
        <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f6f4ef]/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4">
            <button type="button" onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-lg font-extrabold tracking-tight">사주 궁합</div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setInfoOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200" aria-label="안내">
                <Info className="h-5 w-5" />
              </button>
              {/* ✅ 헤더 카카오 공유 버튼 */}
              <button type="button" onClick={handleKakaoShare} disabled={!compatibility}
                className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-1 transition ${compatibility ? "bg-[#FEE500] ring-[#F0D800] hover:scale-105" : "bg-zinc-100 ring-zinc-200 opacity-40 cursor-not-allowed"}`}
                aria-label="카카오 공유">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C6.477 3 2 6.71 2 11.28c0 2.913 1.792 5.481 4.5 7.012L5.5 21l3.663-1.98C10.005 19.33 10.99 19.5 12 19.5c5.523 0 10-3.71 10-8.22C22 6.71 17.523 3 12 3z" fill="#3C1E1E" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-4 px-4 pt-4">
          <BirthFormCard title="본인" birthData={personA} setBirthData={setPersonA} years={years} months={months} hours={hours} />
          <BirthFormCard title="상대방" birthData={personB} setBirthData={setPersonB} years={years} months={months} hours={hours} />

          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{errorMessage}</div>
          )}

          <button type="button" onClick={handleCalculate} disabled={!canCalculate}
            className={`w-full rounded-[24px] px-5 py-4 text-sm font-extrabold text-white transition ${canCalculate ? "bg-zinc-900 shadow-[0_14px_30px_rgba(0,0,0,0.16)] hover:translate-y-[-1px]" : "cursor-not-allowed bg-zinc-300 shadow-none"}`}>
            궁합 분석하기
          </button>

          {compatibility && resultA && resultB && (
            <>
              <section className="rounded-[32px] bg-gradient-to-br from-rose-50 via-white to-amber-50 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-rose-100">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white">
                    <HeartHandshake className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-extrabold text-zinc-900">궁합 총평</div>
                    <div className="mt-1 text-3xl font-black tracking-tight text-zinc-900">{compatibility.score}점</div>
                    <div className="mt-1 text-sm font-bold text-rose-600">{compatibility.relationLabel} · {compatibility.grade}</div>
                    <div className="mt-2 text-sm leading-6 text-zinc-600">{compatibility.summary}</div>
                    <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-zinc-600 ring-1 ring-zinc-200">
                      해석 신뢰도: {compatibility.confidenceLabel}
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-3 gap-3">
                <SummaryCard icon={<Users className="h-5 w-5" />} value={`${compatibility.score}점`} title="궁합 점수" sub="일간 · 일지 · 오행 기준" />
                <SummaryCard icon={<Sparkles className="h-5 w-5" />} value={compatibility.grade} title="등급" sub={compatibility.relationLabel} />
                <SummaryCard icon={<Info className="h-5 w-5" />} value={compatibility.confidenceLabel.split(" · ")[0]} title="해석 신뢰도" sub={compatibility.confidenceLabel} />
              </section>

              <PersonResultCard title="본인 원국" result={resultA} />
              <PersonResultCard title="상대방 원국" result={resultB} />
              <EnergyCompareSection a={resultA} b={resultB} combined={compatibility.combinedEnergy} />

              <section className="rounded-[32px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100">
                <div className="text-lg font-extrabold">궁합 풀이</div>
                <div className="mt-1 text-sm text-zinc-500">일간, 일지, 대표 오행과 전체 분포를 기준으로 자연스럽게 읽은 해석입니다</div>
                <div className="mt-4 rounded-3xl bg-rose-50 p-4 ring-1 ring-rose-100">
                  <div className="text-[11px] font-bold text-rose-500">일간 궁합</div>
                  <div className="mt-2 text-sm leading-7 text-zinc-700">{compatibility.dayMasterChemistry}</div>
                </div>
                <div className="mt-3 rounded-3xl bg-amber-50 p-4 ring-1 ring-amber-100">
                  <div className="text-[11px] font-bold text-amber-500">일지 궁합</div>
                  <div className="mt-2 text-sm leading-7 text-zinc-700">{compatibility.dayBranchChemistry}</div>
                </div>
                <div className="mt-3 rounded-3xl bg-blue-50 p-4 ring-1 ring-blue-100">
                  <div className="text-[11px] font-bold text-blue-500">오행 보완 관계</div>
                  <div className="mt-2 text-sm leading-7 text-zinc-700">{compatibility.energyChemistry}</div>
                </div>
                <div className="mt-3 rounded-3xl bg-zinc-50 p-4">
                  <div className="text-[11px] font-bold text-zinc-400">주의 포인트</div>
                  <div className="mt-2 text-sm leading-7 text-zinc-700">{compatibility.caution}</div>
                </div>
                <div className="mt-3 rounded-3xl bg-white p-4 ring-1 ring-zinc-100">
                  <div className="text-[11px] font-bold text-zinc-400">관계 운영 팁</div>
                  <div className="mt-3 space-y-2.5">
                    {compatibility.advice.map((tip, index) => (
                      <div key={`${tip}-${index}`} className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-700">{tip}</div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ✅ 카카오 공유 버튼 */}
              <button type="button" onClick={handleKakaoShare}
                className="w-full rounded-[24px] bg-[#FEE500] px-5 py-4 text-sm font-extrabold text-zinc-900 shadow-[0_8px_24px_rgba(254,229,0,0.4)] transition hover:translate-y-[-1px] flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C6.477 3 2 6.71 2 11.28c0 2.913 1.792 5.481 4.5 7.012L5.5 21l3.663-1.98C10.005 19.33 10.99 19.5 12 19.5c5.523 0 10-3.71 10-8.22C22 6.71 17.523 3 12 3z" fill="#3C1E1E" />
                </svg>
                카카오톡으로 공유하기
              </button>

              {/* ✅ 다상담 링크 */}
              <p className="text-center text-xs text-zinc-400">
                다상담{" "}
                <a href="https://dasangdam.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">dasangdam.com</a>
              </p>
            </>
          )}
        </div>
      </div>

      {infoOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 px-4 py-6" onClick={() => setInfoOpen(false)}>
          <div className="mx-auto mt-10 max-w-md rounded-[32px] bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold text-zinc-900">이용 안내</div>
                <div className="mt-1 text-sm text-zinc-500">궁합 해석 전에 알아두면 좋은 기준입니다</div>
              </div>
              <button type="button" onClick={() => setInfoOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-3xl bg-zinc-50 p-4">
                <div className="text-sm font-extrabold text-zinc-900">기본 안내</div>
                <div className="mt-2 text-sm leading-7 text-zinc-700">사주 궁합은 두 사람의 기운 흐름과 조화를 참고용으로 해석한 내용입니다. 실제 관계는 서로의 배려와 대화 방식, 생활 습관에 따라 더 크게 달라질 수 있습니다.</div>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <div className="text-sm font-extrabold text-zinc-900">시간 미입력 안내</div>
                <div className="mt-2 text-sm leading-7 text-zinc-700">태어난 시간을 모르면 시주를 제외하고 계산합니다. 이 경우 세부 성향보다는 큰 흐름 중심의 해석으로 보는 것이 자연스럽습니다.</div>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <div className="text-sm font-extrabold text-zinc-900">음력 입력 안내</div>
                <div className="mt-2 text-sm leading-7 text-zinc-700">음력 날짜를 입력한 경우에는 양력으로 변환한 뒤 사주를 계산합니다. 윤달 여부까지 정확하게 선택해야 결과가 달라지지 않습니다.</div>
              </div>
              <button type="button" onClick={() => setInfoOpen(false)} className="mt-2 w-full rounded-[24px] bg-zinc-900 px-5 py-4 text-sm font-extrabold text-white">닫기</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
