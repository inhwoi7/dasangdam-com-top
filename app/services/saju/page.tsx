"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Info,
  CalendarDays,
  Clock3,
  MoonStar,
  SunMedium,
  X,
  Sparkles,
} from "lucide-react";
import { calculateSajuSimple, lunarToSolar } from "@fullstackfamily/manseryeok";
import { useKakaoShare } from "@/lib/useKakaoShare"; // ✅ 추가

// ── 타입 정의 (기존 동일) ───────────────────────────────────────
type EnergyType = {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
};

type PillarItem = {
  label: string;
  gan: string;
  ji: string;
  ganElement: string;
  jiElement: string;
};

type ResultType = {
  pillars: PillarItem[];
  energy: EnergyType;
  dayMaster: string;
  dayBranch: string;
  dominantElement: string;
  solarDateText: string;
  inputDateText: string;
  basisText: string;
  summaryText: string;
  yearPillarText: string;
  monthPillarText: string;
  dayPillarText: string;
  hourPillarText: string;
};

type BirthDataType = {
  year: string;
  month: string;
  day: string;
  hour: string;
  isLunar: "" | "solar" | "lunar";
  isLeapMonth: "" | "false" | "true";
  unknownTime: "" | "false" | "true";
};

// ── 상수 (기존 동일) ────────────────────────────────────────────
const ELEMENT_META: Record<
  string,
  {
    label: string;
    hanja: string;
    emoji: string;
    chipClass: string;
    barClass: string;
    softClass: string;
  }
> = {
  목: {
    label: "목",
    hanja: "木",
    emoji: "🌿",
    chipClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    barClass: "bg-emerald-500",
    softClass: "bg-emerald-50",
  },
  화: {
    label: "화",
    hanja: "火",
    emoji: "🔥",
    chipClass: "bg-rose-100 text-rose-800 border-rose-200",
    barClass: "bg-rose-500",
    softClass: "bg-rose-50",
  },
  토: {
    label: "토",
    hanja: "土",
    emoji: "🌏",
    chipClass: "bg-amber-100 text-amber-800 border-amber-200",
    barClass: "bg-amber-500",
    softClass: "bg-amber-50",
  },
  금: {
    label: "금",
    hanja: "金",
    emoji: "⚔️",
    chipClass: "bg-zinc-200 text-zinc-800 border-zinc-300",
    barClass: "bg-zinc-500",
    softClass: "bg-zinc-50",
  },
  수: {
    label: "수",
    hanja: "水",
    emoji: "💧",
    chipClass: "bg-blue-100 text-blue-800 border-blue-200",
    barClass: "bg-blue-500",
    softClass: "bg-blue-50",
  },
};

const BRANCH_ANIMALS: Record<string, { label: string; emoji: string }> = {
  자: { label: "쥐", emoji: "🐭" },
  축: { label: "소", emoji: "🐮" },
  인: { label: "호랑이", emoji: "🐯" },
  묘: { label: "토끼", emoji: "🐰" },
  진: { label: "용", emoji: "🐲" },
  사: { label: "뱀", emoji: "🐍" },
  오: { label: "말", emoji: "🐴" },
  미: { label: "양", emoji: "🐑" },
  신: { label: "원숭이", emoji: "🐵" },
  유: { label: "닭", emoji: "🐔" },
  술: { label: "개", emoji: "🐶" },
  해: { label: "돼지", emoji: "🐷" },
};

const STEM_ELEMENT_MAP: Record<string, string> = {
  갑: "목", 을: "목", 병: "화", 정: "화",
  무: "토", 기: "토", 경: "금", 신: "금",
  임: "수", 계: "수",
};

const BRANCH_ELEMENT_MAP: Record<string, string> = {
  자: "수", 축: "토", 인: "목", 묘: "목",
  진: "토", 사: "화", 오: "화", 미: "토",
  신: "금", 유: "금", 술: "토", 해: "수",
};

// ── 오행 색상 (캡처 카드용 인라인 스타일) ───────────────────────
const ELEMENT_CARD_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  목: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  화: { bg: "#FFF1F2", text: "#9F1239", border: "#FECDD3" },
  토: { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  금: { bg: "#F4F4F5", text: "#3F3F46", border: "#D4D4D8" },
  수: { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  "-": { bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB" },
};

function getElementCardStyle(char: string) {
  if ("갑을인묘".includes(char)) return ELEMENT_CARD_COLOR["목"];
  if ("병정사오".includes(char)) return ELEMENT_CARD_COLOR["화"];
  if ("무기진술축미".includes(char)) return ELEMENT_CARD_COLOR["토"];
  if ("경신유".includes(char)) return ELEMENT_CARD_COLOR["금"];
  if ("임계해자".includes(char)) return ELEMENT_CARD_COLOR["수"];
  return ELEMENT_CARD_COLOR["-"];
}

// ── 기존 헬퍼 함수들 (변경 없음) ────────────────────────────────
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
    case "목": energy.wood += 1; break;
    case "화": energy.fire += 1; break;
    case "토": energy.earth += 1; break;
    case "금": energy.metal += 1; break;
    case "수": energy.water += 1; break;
  }
}

function getDominantElement(energy: EnergyType) {
  const list = [
    { key: "목", value: energy.wood },
    { key: "화", value: energy.fire },
    { key: "토", value: energy.earth },
    { key: "금", value: energy.metal },
    { key: "수", value: energy.water },
  ];
  list.sort((a, b) => b.value - a.value);
  return list[0]?.key ?? "수";
}

function getDaysInMonth(year: number, month: number, isLunar: boolean) {
  if (isLunar) return Array.from({ length: 30 }, (_, i) => i + 1);
  const lastDay = new Date(year, month, 0).getDate();
  return Array.from({ length: lastDay }, (_, i) => i + 1);
}

function pillarTextToItem(label: string, pillarText?: string | null): PillarItem {
  const safeText = pillarText ?? "--";
  const [gan = "-", ji = "-"] = safeText.split("");
  return {
    label,
    gan,
    ji,
    ganElement: STEM_ELEMENT_MAP[gan] || "-",
    jiElement: BRANCH_ELEMENT_MAP[ji] || "-",
  };
}

function getWeakElements(energy: EnergyType) {
  const items = [
    { key: "목", value: energy.wood },
    { key: "화", value: energy.fire },
    { key: "토", value: energy.earth },
    { key: "금", value: energy.metal },
    { key: "수", value: energy.water },
  ];
  const min = Math.min(...items.map((item) => item.value));
  return items.filter((item) => item.value === min).map((item) => item.key);
}

function getZeroElements(energy: EnergyType) {
  const items = [
    { key: "목", value: energy.wood },
    { key: "화", value: energy.fire },
    { key: "토", value: energy.earth },
    { key: "금", value: energy.metal },
    { key: "수", value: energy.water },
  ];
  return items.filter((item) => item.value === 0).map((item) => item.key);
}

function getFortuneContent(result: ResultType) {
  const dayMasterElement = STEM_ELEMENT_MAP[result.dayMaster] || "-";
  const weakElements = getWeakElements(result.energy);
  const zeroElements = getZeroElements(result.energy);

  const personalityMap: Record<string, string> = {
    목: "일간이 목 기운에 놓여 있으면 기본적으로 성장과 확장을 중요하게 보는 편입니다. 정체된 분위기보다는 앞으로 나아가는 흐름에서 힘을 얻고, 사람이나 일의 가능성을 먼저 보는 장점이 있습니다. 다만 생각이 넓게 퍼지는 대신 한 번에 너무 많은 일을 끌어안으면 피로가 빨리 올 수 있어, 방향을 정한 뒤 속도를 조절하는 것이 중요합니다.",
    화: "일간이 화 기운에 놓여 있으면 표현력과 추진력이 살아나는 편입니다. 분위기를 밝히거나 존재감을 드러내는 능력이 좋고, 마음이 움직일 때 실행으로 연결되는 힘도 강한 편입니다. 반면 열정이 큰 만큼 에너지 소모도 빨라질 수 있으니, 중요한 일일수록 리듬을 유지하는 습관이 도움이 됩니다.",
    토: "일간이 토 기운에 놓여 있으면 중심감과 현실감각이 비교적 분명합니다. 급하게 흔들리기보다는 상황을 정리하고 안정시키는 역할에 강점이 있고, 주변에서 신뢰를 받기 쉬운 구조입니다. 다만 안정이 지나치면 변화 대응이 느려질 수 있으므로, 새로운 제안에 대한 유연함을 의식적으로 확보하면 더 좋습니다.",
    금: "일간이 금 기운에 놓여 있으면 판단 기준이 뚜렷하고, 정리·분석·선별 능력이 잘 드러나는 편입니다. 핵심과 비핵심을 가르는 감각이 좋고, 불필요한 감정 소모를 줄이며 일의 선을 정하는 데 강점이 있습니다. 다만 기준이 분명한 만큼 스스로도 엄격해질 수 있으니, 완벽함보다 지속 가능성을 함께 보는 것이 좋습니다.",
    수: "일간이 수 기운에 놓여 있으면 흐름을 읽고 유연하게 반응하는 감각이 좋습니다. 직접 밀어붙이기보다 상황과 사람을 파악한 뒤 움직이는 능력이 살아 있으며, 적응력과 연결 감각이 장점으로 작용할 가능성이 큽니다. 다만 마음속에서 생각이 오래 순환하면 결정을 늦출 수 있으니, 어느 시점에는 방향을 확정하는 습관이 필요합니다.",
  };

  const strengthMap: Record<string, string> = {
    목: "대표 오행이 목이라는 것은 현재 구조 안에서 기획, 확장, 배움, 관계의 넓힘 같은 테마가 비교적 잘 살아 있다는 뜻으로 볼 수 있습니다. 새로운 것을 익히거나 흐름을 키워가는 일에서 장점이 드러나기 쉽습니다.",
    화: "대표 오행이 화라는 것은 표현, 실행, 대외 활동, 존재감, 추진력과 관련된 에너지가 비교적 잘 모인다는 뜻으로 볼 수 있습니다. 눈에 보이는 성과나 반응을 만들어내는 방향에서 강점이 살아날 수 있습니다.",
    토: "대표 오행이 토라는 것은 관리, 유지, 조율, 실무 운영, 안정적인 기반 만들기 쪽의 힘이 잘 드러날 가능성을 의미합니다. 단단하게 쌓아가는 방식이 잘 맞는 구조입니다.",
    금: "대표 오행이 금이라는 것은 판단, 선별, 정리, 결단, 기준 설정 능력이 구조상 비교적 돋보일 수 있음을 뜻합니다. 복잡한 것을 정리해 핵심으로 모으는 힘이 강점이 됩니다.",
    수: "대표 오행이 수라는 것은 정보 파악, 흐름 읽기, 대응력, 관계 조율, 상황 해석 쪽의 감각이 좋게 작동할 가능성을 의미합니다. 급하게 밀기보다 타이밍을 읽는 방식에 장점이 있습니다.",
  };

  const workMap: Record<string, string> = {
    목: "일과 진로에서는 성장 가능성이 보이는 분야, 꾸준히 넓혀갈 수 있는 환경, 기획·교육·콘텐츠·브랜딩처럼 아이디어를 확장하는 성격의 업무와 잘 맞을 수 있습니다. 시작만 많아지지 않도록 우선순위를 선명하게 두는 것이 중요합니다.",
    화: "일에서는 발표, 소통, 영업, 마케팅, 퍼포먼스, 리더십처럼 외부와 맞닿는 영역에서 힘을 쓰기 쉬운 편입니다. 다만 성과 압박이 클수록 감정 소모가 늘 수 있어 회복 루틴을 함께 가져가는 것이 좋습니다.",
    토: "일에서는 운영, 관리, 실무 총괄, 상담, 조정, 재무·행정처럼 안정성과 축적이 필요한 영역과 잘 맞을 수 있습니다. 성실함이 강점으로 보이지만 변화가 필요한 시점을 놓치지 않는 것이 관건입니다.",
    금: "일에서는 기획 정리, 문서화, 재무, 품질 관리, 법무, 분석, 디테일 조정처럼 정확도와 기준이 중요한 영역에서 강점이 드러나기 쉽습니다. 다만 스스로 기대치가 높아 과부하가 오지 않도록 속도 조절이 필요합니다.",
    수: "일에서는 연구, 분석, 데이터, 컨설팅, 조율, 기획 보조, 커뮤니케이션처럼 흐름을 읽고 연결하는 영역과 잘 맞을 수 있습니다. 결정을 늦추기보다 마감 시점을 스스로 정해두면 안정적으로 성과를 내기 좋습니다.",
  };

  const relationshipMap: Record<string, string> = {
    목: "대인관계에서는 상대의 가능성을 보고 먼저 마음을 열어주는 편일 수 있습니다. 다만 기대치가 커질수록 서운함도 커질 수 있으니, 관계의 속도를 천천히 맞추는 것이 좋습니다.",
    화: "관계에서는 표현이 분명하고 따뜻하게 다가가는 힘이 있습니다. 분위기를 밝히는 장점이 있지만 감정 기복이 커질 때 말이 앞서지 않도록 한 템포 쉬는 습관이 도움이 됩니다.",
    토: "관계에서는 신뢰와 안정감을 주는 편입니다. 한 번 가까워진 사람에게는 오래 책임감을 갖는 성향이 강할 수 있으나, 마음이 무거워질 때는 혼자 감당하지 말고 적절히 나누는 것이 좋습니다.",
    금: "관계에서는 기준과 예의를 중요하게 보는 편입니다. 깔끔하고 선명한 관계를 선호할 가능성이 높지만, 너무 정답 중심으로 흐르면 거리감이 생길 수 있어 부드러운 표현을 함께 가져가면 좋습니다.",
    수: "관계에서는 상대의 기분과 흐름을 잘 읽는 장점이 있습니다. 다만 스스로의 속마음을 늦게 드러내는 경향이 있을 수 있어, 중요한 관계일수록 생각을 말로 정리해 전달하는 것이 좋습니다.",
  };

  const weakAdviceMap: Record<string, string> = {
    목: "목 기운 보완에는 몸과 마음이 앞으로 뻗는 감각이 중요합니다. 산책, 스트레칭, 새로운 공부 시작, 공간에 초록 계열을 두는 방식이 도움이 될 수 있습니다.",
    화: "화 기운 보완에는 체온, 활력, 표현성이 중요합니다. 햇빛을 받는 시간, 가벼운 운동, 감정을 말이나 글로 표현하는 습관이 도움이 됩니다.",
    토: "토 기운 보완에는 리듬과 안정감이 중요합니다. 식사 시간 일정하게 유지하기, 생활 공간 정리, 해야 할 일을 작게 나눠 쌓는 방식이 잘 맞습니다.",
    금: "금 기운 보완에는 정리와 기준 세우기가 중요합니다. 물건을 줄이거나, 업무 순서를 명확히 하거나, 하루 루틴을 일정한 틀로 잡는 것이 도움이 됩니다.",
    수: "수 기운 보완에는 휴식과 순환이 중요합니다. 수면 리듬, 수분 섭취, 혼자 생각을 정리하는 시간, 과도한 과열을 식혀주는 환경이 도움이 됩니다.",
  };

  const balanceText =
    zeroElements.length > 0
      ? `${zeroElements.join(", ")} 기운이 현재 분포에서 비어 있거나 매우 약하게 나타납니다. 그래서 잘하는 것을 더 강하게 밀어붙이는 방식도 좋지만, 장기적으로는 부족한 기운이 담당하는 생활 리듬과 환경을 조금씩 보완하는 것이 전체 균형에 도움이 됩니다.`
      : `${weakElements.join(", ")} 기운이 상대적으로 약한 편이므로, 생활 방식에서 그 기운이 맡는 역할을 의식적으로 채워주는 것이 좋습니다. 부족함을 억지로 크게 바꾸기보다는, 이미 강한 기운을 안정적으로 쓰면서 약한 부분을 보완하는 접근이 훨씬 자연스럽습니다.`;

  const lifestyleTips = weakElements.slice(0, 3).map((item) => weakAdviceMap[item]);

  return {
    overview:
      `이 사주는 일간 ${result.dayMaster}를 중심으로 볼 때 ${dayMasterElement}의 성향이 바탕을 이루고, 전체적으로는 ${result.dominantElement} 기운이 비교적 두드러지는 구조입니다. ` +
      `즉, 기본 성향과 실제로 밖으로 드러나는 힘이 어느 정도 연결되어 작동할 가능성이 있으며, 강한 기운을 어떻게 안정적으로 쓰느냐가 전체 흐름의 핵심이 됩니다.`,
    personality: personalityMap[dayMasterElement] || "일간 기준 성향 해석을 불러오지 못했습니다.",
    strength: strengthMap[result.dominantElement] || "대표 오행 중심의 강점 해석을 불러오지 못했습니다.",
    work: workMap[result.dominantElement] || "일과 진로 흐름 해석을 불러오지 못했습니다.",
    relationship: relationshipMap[dayMasterElement] || "관계 흐름 해석을 불러오지 못했습니다.",
    balance: balanceText,
    lifestyleTips,
    closing:
      "정리하면, 이 구조는 자신의 강점을 억누르기보다 제대로 활용하는 쪽에서 힘이 납니다. 다만 오행 분포상 약한 부분을 생활 습관으로 천천히 보완해주면, 성향의 장점은 살리고 피로도는 줄이는 방향으로 흐름을 만들기 좋습니다.",
  };
}

// ── 서브 컴포넌트 (기존 동일) ────────────────────────────────────
function SelectField({
  label, value, onChange, children, icon, disabled = false,
}: {
  label: string; value: string; onChange: (value: string) => void;
  children: React.ReactNode; icon?: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
        {icon}{label}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`h-14 w-full appearance-none rounded-3xl border border-zinc-200 bg-white px-4 pr-10 text-[15px] font-semibold shadow-sm outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 ${
            value ? "text-zinc-900" : "text-zinc-400"
          }`}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, sub }: {
  icon: React.ReactNode; title: string; value: string; sub: string;
}) {
  return (
    <div className="rounded-[28px] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] ring-1 ring-zinc-100">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-lg text-white">
        {icon}
      </div>
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
      <div className={`mb-2 flex h-16 w-16 items-center justify-center rounded-3xl border text-3xl font-bold shadow-sm ${getElementStyles(item.gan)}`}>
        {item.gan}
      </div>
      <div className="mb-3 text-[11px] font-medium text-zinc-500">{item.ganElement || "-"}</div>
      <div className={`mb-2 flex h-16 w-16 items-center justify-center rounded-3xl border text-3xl font-bold shadow-sm ${getElementStyles(item.ji)}`}>
        {item.ji}
      </div>
      <div className="text-[11px] font-medium text-zinc-500">{item.jiElement || "-"}</div>
    </div>
  );
}

// ── 캡처 카드 컴포넌트 ✅ 신규 추가 ─────────────────────────────
function SajuCaptureCard({ result }: { result: ResultType }) {
  const dominantMeta = ELEMENT_META[result.dominantElement] ?? ELEMENT_META["수"];
  const animal = BRANCH_ANIMALS[result.dayBranch] ?? { label: "미상", emoji: "✨" };
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
  });

  const energyItems = [
    { label: "목", hanja: "木", value: result.energy.wood },
    { label: "화", hanja: "火", value: result.energy.fire },
    { label: "토", hanja: "土", value: result.energy.earth },
    { label: "금", hanja: "金", value: result.energy.metal },
    { label: "수", hanja: "水", value: result.energy.water },
  ];
  const maxEnergy = Math.max(...energyItems.map((e) => e.value), 1);

  return (
    <div
      id="saju-capture"
      style={{
        position: "fixed",
        left: "-9999px",
        top: 0,
        width: "400px",
        background: "#F6F4EF",
        borderRadius: "24px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 헤더 */}
      <div style={{ padding: "28px 28px 20px", background: "#F6F4EF" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#71717A", fontWeight: 700, marginBottom: "6px" }}>
            WISE REST WITH SUNNY · 다상담
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#18181B", letterSpacing: "2px", marginBottom: "4px" }}>
            정통사주
          </div>
          <div style={{ fontSize: "12px", color: "#A1A1AA" }}>{today}</div>
        </div>

        {/* 사주 4주 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "8px",
          marginBottom: "16px",
        }}>
          {result.pillars.map((item) => {
            const ganStyle = getElementCardStyle(item.gan);
            const jiStyle = getElementCardStyle(item.ji);
            return (
              <div key={item.label} style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                padding: "12px 8px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
                <div style={{ fontSize: "10px", color: "#A1A1AA", fontWeight: 600, marginBottom: "8px" }}>
                  {item.label}
                </div>
                {/* 천간 */}
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px", margin: "0 auto 4px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", fontWeight: 900,
                  background: ganStyle.bg, color: ganStyle.text,
                  border: `1px solid ${ganStyle.border}`,
                }}>
                  {item.gan}
                </div>
                <div style={{ fontSize: "10px", color: "#A1A1AA", marginBottom: "6px" }}>
                  {item.ganElement}
                </div>
                {/* 지지 */}
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px", margin: "0 auto 4px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", fontWeight: 900,
                  background: jiStyle.bg, color: jiStyle.text,
                  border: `1px solid ${jiStyle.border}`,
                }}>
                  {item.ji}
                </div>
                <div style={{ fontSize: "10px", color: "#A1A1AA" }}>
                  {item.jiElement}
                </div>
              </div>
            );
          })}
        </div>

        {/* 요약 배지 행 */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{
            background: "#18181B", color: "#FFFFFF",
            borderRadius: "20px", padding: "6px 14px",
            fontSize: "12px", fontWeight: 700,
          }}>
            일간 {result.dayMaster}
          </div>
          <div style={{
            background: "#FFFFFF", color: "#18181B",
            borderRadius: "20px", padding: "6px 14px",
            fontSize: "12px", fontWeight: 700,
            border: "1px solid #E4E4E7",
          }}>
            {dominantMeta.emoji} 대표오행 {dominantMeta.label}
          </div>
          <div style={{
            background: "#FFFFFF", color: "#18181B",
            borderRadius: "20px", padding: "6px 14px",
            fontSize: "12px", fontWeight: 700,
            border: "1px solid #E4E4E7",
          }}>
            {animal.emoji} {animal.label}띠
          </div>
        </div>
      </div>

      {/* 오행 분포 바 */}
      <div style={{
        background: "#FFFFFF",
        margin: "0 16px",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#A1A1AA", marginBottom: "12px" }}>
          오행 에너지 분포
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {energyItems.map((item) => {
            const meta = ELEMENT_META[item.label];
            const barColors: Record<string, string> = {
              목: "#10B981", 화: "#F43F5E", 토: "#F59E0B", 금: "#71717A", 수: "#3B82F6",
            };
            const pct = Math.round((item.value / maxEnergy) * 100);
            return (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "24px", fontSize: "13px", fontWeight: 700, color: "#52525B" }}>
                  {item.hanja}
                </div>
                <div style={{ flex: 1, height: "8px", background: "#F4F4F5", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: barColors[item.label],
                    borderRadius: "99px",
                    minWidth: item.value > 0 ? "8px" : "0",
                  }} />
                </div>
                <div style={{ width: "16px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#71717A" }}>
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 푸터 */}
      <div style={{
        padding: "16px 28px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 800, color: "#18181B" }}>다상담</div>
        <div style={{ fontSize: "11px", color: "#A1A1AA", fontWeight: 600 }}>
          🔗 dasangdam.com/services/saju
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 ─────────────────────────────────────────────────
export default function Page() {
  const years = useMemo(
    () => Array.from({ length: 2040 - 1930 + 1 }, (_, i) => 1930 + i),
    []
  );
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const [birthData, setBirthData] = useState<BirthDataType>({
    year: "", month: "", day: "", hour: "",
    isLunar: "", isLeapMonth: "", unknownTime: "",
  });

  const [result, setResult] = useState<ResultType | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [openedPanel, setOpenedPanel] = useState<"manseryeok" | "fortune" | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  // ✅ 카카오 공유 훅
  const { shareWithCapture } = useKakaoShare();

  const isLunar = birthData.isLunar === "lunar";
  const unknownTime = birthData.unknownTime === "true" || !birthData.hour;

  const days = useMemo(() => {
    if (!birthData.year || !birthData.month) return [];
    return getDaysInMonth(
      parseInt(birthData.year, 10),
      parseInt(birthData.month, 10),
      isLunar
    );
  }, [birthData.year, birthData.month, isLunar]);

  useEffect(() => {
    if (!birthData.day || days.length === 0) return;
    const selectedDay = parseInt(birthData.day, 10);
    const maxDay = days[days.length - 1] ?? 1;
    if (selectedDay > maxDay) {
      setBirthData((prev) => ({ ...prev, day: String(maxDay) }));
    }
  }, [days, birthData.day]);

  useEffect(() => {
    setResult(null);
    setErrorMessage("");
    setOpenedPanel(null);
  }, [
    birthData.year, birthData.month, birthData.day, birthData.hour,
    birthData.isLunar, birthData.isLeapMonth, birthData.unknownTime,
  ]);

  const canCalculate =
    !!birthData.year && !!birthData.month && !!birthData.day && !!birthData.isLunar &&
    (birthData.isLunar === "solar" || !!birthData.isLeapMonth);

  const handleCalculate = useCallback(() => {
    try {
      setErrorMessage("");
      if (!canCalculate) {
        setResult(null);
        setOpenedPanel(null);
        setErrorMessage("출생 정보를 모두 선택해주세요.");
        return;
      }

      const year = parseInt(birthData.year, 10);
      const month = parseInt(birthData.month, 10);
      const day = parseInt(birthData.day, 10);
      const hour = birthData.hour ? parseInt(birthData.hour, 10) : 12;
      const isLeapMonth = birthData.isLeapMonth === "true";

      let solarYear = year, solarMonth = month, solarDay = day;
      if (isLunar) {
        const solar = lunarToSolar(year, month, day, isLeapMonth);
        solarYear = solar.solar.year;
        solarMonth = solar.solar.month;
        solarDay = solar.solar.day;
      }

      const saju = calculateSajuSimple(solarYear, solarMonth, solarDay, unknownTime ? 12 : hour);

      const yearPillarText = saju.yearPillar ?? "--";
      const monthPillarText = saju.monthPillar ?? "--";
      const dayPillarText = saju.dayPillar ?? "--";
      const safeHourPillar = saju.hourPillar ?? "--";
      const hourPillarText = unknownTime ? "시간 모름" : safeHourPillar;

      const pillars: PillarItem[] = [
        pillarTextToItem("년주", yearPillarText),
        pillarTextToItem("월주", monthPillarText),
        pillarTextToItem("일주", dayPillarText),
        pillarTextToItem("시주", unknownTime ? "--" : safeHourPillar),
      ];

      const energy: EnergyType = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
      pillars.forEach((item) => {
        if (item.gan !== "-") addElementCount(energy, item.ganElement);
        if (item.ji !== "-") addElementCount(energy, item.jiElement);
      });

      const dominantElement = getDominantElement(energy);
      const inputDateText = `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} ${isLunar ? "(음력)" : "(양력)"}`;
      const solarDateText = `${solarYear}년 ${solarMonth}월 ${solarDay}일`;
      const basisText = isLunar
        ? "음력 입력값을 양력으로 변환한 뒤 사주를 계산했어요"
        : "입력한 양력 기준으로 사주를 계산했어요";
      const dayMaster = dayPillarText[0] ?? "-";
      const dayBranch = dayPillarText[1] ?? "-";
      const summaryText = `${yearPillarText}년 · ${monthPillarText}월 · ${dayPillarText}일${
        unknownTime ? " · 시주 미입력" : ` · ${hourPillarText}시`
      }`;

      setOpenedPanel(null);
      setResult({
        pillars, energy, dayMaster, dayBranch, dominantElement,
        solarDateText, inputDateText, basisText, summaryText,
        yearPillarText, monthPillarText, dayPillarText, hourPillarText,
      });
    } catch (error) {
      console.error(error);
      setResult(null);
      setOpenedPanel(null);
      setErrorMessage("계산 중 오류가 발생했습니다. 날짜 또는 음력/윤달 입력값을 다시 확인해주세요.");
    }
  }, [birthData, canCalculate, isLunar, unknownTime]);

  const handleBack = () => {
    if (typeof window !== "undefined") window.history.back();
  };

  // ✅ 카카오 공유 핸들러 (기존 handleShare 대체)
  const handleKakaoShare = useCallback(() => {
    if (!result) return;
    const dominantMeta = ELEMENT_META[result.dominantElement] ?? ELEMENT_META["수"];
    const animal = BRANCH_ANIMALS[result.dayBranch] ?? { label: "미상", emoji: "✨" };

    shareWithCapture({
      captureId: "saju-capture",
      title: `나의 사주 — 일간 ${result.dayMaster} · ${dominantMeta.emoji} ${dominantMeta.label}`,
      description: `${animal.emoji} ${animal.label}띠 · ${result.summaryText}\n다상담에서 나의 사주를 확인해보세요!`,
      buttonText: "나도 사주 보기 →",
      pageUrl: "https://dasangdam.com/services/saju",
    });
  }, [result, shareWithCapture]);

  const dominantMeta = result ? ELEMENT_META[result.dominantElement] : ELEMENT_META["수"];
  const animal = result ? BRANCH_ANIMALS[result.dayBranch] : BRANCH_ANIMALS["해"];
  const fortuneContent = result ? getFortuneContent(result) : null;

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-zinc-900">

      {/* ✅ 캡처 카드 — 화면 밖 렌더링, result 있을 때만 */}
      {result && <SajuCaptureCard result={result} />}

      <div className="mx-auto max-w-md pb-28">
        <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f6f4ef]/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="text-lg font-extrabold tracking-tight">정통사주</div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInfoOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200"
                aria-label="안내"
              >
                <Info className="h-5 w-5" />
              </button>
              {/* ✅ 카카오 공유 버튼 — result 없으면 비활성화 */}
              <button
                type="button"
                onClick={handleKakaoShare}
                disabled={!result}
                className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-1 transition ${
                  result
                    ? "bg-[#FEE500] ring-[#F0D800] hover:scale-105"
                    : "bg-zinc-100 ring-zinc-200 opacity-40 cursor-not-allowed"
                }`}
                aria-label="카카오 공유"
              >
                {/* 카카오 말풍선 아이콘 */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3C6.477 3 2 6.71 2 11.28c0 2.913 1.792 5.481 4.5 7.012L5.5 21l3.663-1.98C10.005 19.33 10.99 19.5 12 19.5c5.523 0 10-3.71 10-8.22C22 6.71 17.523 3 12 3z"
                    fill="#3C1E1E"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="px-4 pt-4">
          {/* 입력 섹션 (기존 동일) */}
          <section className="rounded-[32px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold">출생 정보</div>
                <div className="mt-1 text-sm leading-relaxed text-zinc-500">
                  태어난 시간을 모르셔도 괜찮아요
                </div>
              </div>
              <div className="rounded-full bg-yellow-300 px-4 py-2 text-xs font-extrabold text-zinc-900">
                변경
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <SelectField
                label="태어난 년" value={birthData.year}
                onChange={(value) => setBirthData((prev) => ({ ...prev, year: value, day: "" }))}
                icon={<CalendarDays className="h-3.5 w-3.5" />}
              >
                <option value="">선택</option>
                {years.map((y) => <option key={y} value={String(y)}>{y}년</option>)}
              </SelectField>

              <SelectField
                label="태어난 월" value={birthData.month}
                onChange={(value) => setBirthData((prev) => ({ ...prev, month: value, day: "" }))}
              >
                <option value="">선택</option>
                {months.map((m) => <option key={m} value={String(m)}>{m}월</option>)}
              </SelectField>

              <SelectField
                label="태어난 일" value={birthData.day}
                onChange={(value) => setBirthData((prev) => ({ ...prev, day: value }))}
                disabled={!birthData.year || !birthData.month}
              >
                <option value="">선택</option>
                {days.map((d) => <option key={d} value={String(d)}>{d}일</option>)}
              </SelectField>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <SelectField
                label="태어난 시간 (선택)" value={birthData.hour}
                onChange={(value) => setBirthData((prev) => ({ ...prev, hour: value, unknownTime: "false" }))}
                icon={<Clock3 className="h-3.5 w-3.5" />}
              >
                <option value="">모름 / 선택안함</option>
                {hours.map((h) => <option key={h} value={String(h)}>{String(h).padStart(2, "0")}시</option>)}
              </SelectField>

              <SelectField
                label="달력 기준" value={birthData.isLunar}
                onChange={(value) =>
                  setBirthData((prev) => ({
                    ...prev,
                    isLunar: value as "" | "solar" | "lunar",
                    isLeapMonth: "",
                  }))
                }
                icon={
                  birthData.isLunar === "solar" ? <SunMedium className="h-3.5 w-3.5" /> :
                  birthData.isLunar === "lunar" ? <MoonStar className="h-3.5 w-3.5" /> :
                  <CalendarDays className="h-3.5 w-3.5" />
                }
              >
                <option value="">선택</option>
                <option value="solar">양력</option>
                <option value="lunar">음력</option>
              </SelectField>
            </div>

            <div className="mt-4">
              {birthData.isLunar === "lunar" ? (
                <SelectField
                  label="윤달 여부" value={birthData.isLeapMonth}
                  onChange={(value) =>
                    setBirthData((prev) => ({ ...prev, isLeapMonth: value as "" | "false" | "true" }))
                  }
                >
                  <option value="">선택</option>
                  <option value="false">일반월</option>
                  <option value="true">윤달</option>
                </SelectField>
              ) : birthData.isLunar === "solar" ? null : (
                <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-4">
                  <div className="text-sm font-semibold leading-relaxed text-zinc-500">
                    달력 기준(양력/음력)을 선택해주세요
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleCalculate}
              disabled={!canCalculate}
              className={`mt-5 w-full rounded-[24px] px-5 py-4 text-sm font-extrabold text-white transition ${
                canCalculate
                  ? "bg-zinc-900 shadow-[0_14px_30px_rgba(0,0,0,0.16)] hover:translate-y-[-1px]"
                  : "cursor-not-allowed bg-zinc-300 shadow-none"
              }`}
            >
              사주 분석하기
            </button>
          </section>

          {result && (
            <>
              <section className="mt-4 rounded-[28px] bg-gradient-to-br from-blue-50 to-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-blue-100">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-zinc-900">기준 안내</div>
                    <div className="mt-1 text-sm leading-relaxed text-zinc-600">
                      입력: {result.inputDateText}<br />
                      기준 양력: {result.solarDateText}<br />
                      {result.basisText}
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-4 grid grid-cols-3 gap-3">
                <SummaryCard
                  icon={<span className="text-xl">{dominantMeta.hanja}</span>}
                  value={dominantMeta.label}
                  title="대표 오행"
                  sub="전체 기운 분포 기준"
                />
                <SummaryCard
                  icon={<span className="text-2xl">{animal.emoji}</span>}
                  value={animal.label}
                  title="일지 동물"
                  sub={`${result.dayPillarText} 기준`}
                />
                <SummaryCard
                  icon={<span className="text-lg font-black">{result.yearPillarText}</span>}
                  value={result.yearPillarText}
                  title="년주"
                  sub="입춘 기준 계산"
                />
              </section>

              <section className="mt-4 rounded-[32px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100">
                <div className="text-lg font-extrabold">사주 구조</div>
                <div className="mt-1 text-sm leading-relaxed text-zinc-500">{result.summaryText}</div>
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {result.pillars.map((item) => <PillarBlock key={item.label} item={item} />)}
                </div>
                <div className="mt-5 rounded-3xl bg-zinc-50 p-4">
                  <div className="text-xs font-bold text-zinc-400">한 줄 요약</div>
                  <div className="mt-2 text-sm leading-relaxed text-zinc-700">
                    이 사주는{" "}
                    <span className="font-extrabold">{result.yearPillarText}년주</span>,{" "}
                    <span className="font-extrabold">{result.monthPillarText}월주</span>,{" "}
                    <span className="font-extrabold">{result.dayPillarText}일주</span>,{" "}
                    <span className="font-extrabold">
                      {result.hourPillarText === "시간 모름" ? "시주 미입력" : `${result.hourPillarText}시주`}
                    </span>
                    로 구성됩니다.
                  </div>
                </div>
              </section>

              <section className="mt-4 rounded-[32px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100">
                <div className="text-lg font-extrabold">오행 에너지</div>
                <div className="mt-1 text-sm text-zinc-500">네 기둥의 천간·지지 기준 단순 분포</div>
                <div className="mt-6 flex h-44 items-end justify-between gap-3 rounded-3xl bg-zinc-50 px-4 pb-4 pt-6">
                  {[
                    { label: "목", value: result.energy.wood },
                    { label: "화", value: result.energy.fire },
                    { label: "토", value: result.energy.earth },
                    { label: "금", value: result.energy.metal },
                    { label: "수", value: result.energy.water },
                  ].map((item) => {
                    const meta = ELEMENT_META[item.label];
                    return (
                      <div key={item.label} className="flex w-full flex-col items-center justify-end gap-2">
                        <div className="text-[11px] font-bold text-zinc-500">{item.value}</div>
                        <div
                          className={`w-9 rounded-t-2xl ${meta.barClass}`}
                          style={{ height: `${Math.max(10, item.value * 22)}px` }}
                        />
                        <div className="text-[11px] font-semibold text-zinc-500">{item.label}</div>
                      </div>
                    );
                  })}
                </div>
                <div className={`mt-4 rounded-3xl border p-4 ${dominantMeta.chipClass}`}>
                  <div className="text-xs font-bold opacity-70">가장 강한 기운</div>
                  <div className="mt-1 text-base font-extrabold">
                    {dominantMeta.emoji} {dominantMeta.label} 기운이 가장 두드러집니다
                  </div>
                </div>
              </section>

              {/* ✅ 카카오 공유 배너 버튼 (결과 섹션 내) */}
              <button
                type="button"
                onClick={handleKakaoShare}
                className="mt-4 w-full rounded-[24px] bg-[#FEE500] px-5 py-4 text-sm font-extrabold text-zinc-900 shadow-[0_8px_24px_rgba(254,229,0,0.4)] transition hover:translate-y-[-1px] flex items-center justify-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3C6.477 3 2 6.71 2 11.28c0 2.913 1.792 5.481 4.5 7.012L5.5 21l3.663-1.98C10.005 19.33 10.99 19.5 12 19.5c5.523 0 10-3.71 10-8.22C22 6.71 17.523 3 12 3z"
                    fill="#3C1E1E"
                  />
                </svg>
                카카오톡으로 공유하기
              </button>

              <section className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setOpenedPanel((prev) => prev === "manseryeok" ? null : "manseryeok")}
                  className="w-full rounded-[24px] bg-white px-5 py-4 text-sm font-bold text-zinc-900 shadow-[0_8px_24px_rgba(0,0,0,0.05)] ring-1 ring-zinc-100 transition hover:translate-y-[-1px]"
                >
                  {openedPanel === "manseryeok" ? "만세력 닫기" : "만세력 보기"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenedPanel((prev) => prev === "fortune" ? null : "fortune")}
                  className="w-full rounded-[24px] bg-zinc-900 px-5 py-4 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)] transition hover:translate-y-[-1px]"
                >
                  {openedPanel === "fortune" ? "운세 풀이 닫기" : "운세 풀이 보기"}
                </button>
              </section>

              {openedPanel === "manseryeok" && (
                <section className="mt-4 rounded-[32px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-extrabold">만세력 상세</div>
                      <div className="mt-1 text-sm text-zinc-500">사주 원국을 표 형태로 한눈에 볼 수 있어요</div>
                    </div>
                    <div className="rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-bold text-zinc-600">
                      {result.summaryText}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <div className="text-[11px] font-bold text-zinc-400">입력일</div>
                      <div className="mt-1 text-sm font-bold text-zinc-900">{result.inputDateText}</div>
                    </div>
                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <div className="text-[11px] font-bold text-zinc-400">기준 양력</div>
                      <div className="mt-1 text-sm font-bold text-zinc-900">{result.solarDateText}</div>
                    </div>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-center">
                        <thead className="bg-zinc-50">
                          <tr>
                            <th className="px-3 py-3 text-[11px] font-bold text-zinc-400">구분</th>
                            {result.pillars.map((item) => (
                              <th key={item.label} className="px-3 py-3 text-[11px] font-bold text-zinc-500">{item.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-zinc-100">
                            <td className="bg-zinc-50 px-3 py-3 text-[11px] font-bold text-zinc-400">천간</td>
                            {result.pillars.map((item) => (
                              <td key={`${item.label}-gan`} className="px-3 py-3">
                                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border text-xl font-black ${getElementStyles(item.gan)}`}>
                                  {item.gan}
                                </span>
                              </td>
                            ))}
                          </tr>
                          <tr className="border-t border-zinc-100">
                            <td className="bg-zinc-50 px-3 py-3 text-[11px] font-bold text-zinc-400">천간 오행</td>
                            {result.pillars.map((item) => (
                              <td key={`${item.label}-gan-element`} className="px-3 py-3 text-sm font-semibold text-zinc-700">{item.ganElement}</td>
                            ))}
                          </tr>
                          <tr className="border-t border-zinc-100">
                            <td className="bg-zinc-50 px-3 py-3 text-[11px] font-bold text-zinc-400">지지</td>
                            {result.pillars.map((item) => (
                              <td key={`${item.label}-ji`} className="px-3 py-3">
                                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border text-xl font-black ${getElementStyles(item.ji)}`}>
                                  {item.ji}
                                </span>
                              </td>
                            ))}
                          </tr>
                          <tr className="border-t border-zinc-100">
                            <td className="bg-zinc-50 px-3 py-3 text-[11px] font-bold text-zinc-400">지지 오행</td>
                            {result.pillars.map((item) => (
                              <td key={`${item.label}-ji-element`} className="px-3 py-3 text-sm font-semibold text-zinc-700">{item.jiElement}</td>
                            ))}
                          </tr>
                          <tr className="border-t border-zinc-100">
                            <td className="bg-zinc-50 px-3 py-3 text-[11px] font-bold text-zinc-400">기둥</td>
                            {result.pillars.map((item) => (
                              <td key={`${item.label}-full`} className="px-3 py-3 text-base font-extrabold text-zinc-900">{item.gan}{item.ji}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                      <div className="text-[11px] font-bold text-blue-400">일간</div>
                      <div className="mt-1 text-base font-extrabold text-zinc-900">{result.dayMaster}</div>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
                      <div className="text-[11px] font-bold text-amber-500">일지</div>
                      <div className="mt-1 text-base font-extrabold text-zinc-900">{result.dayBranch} {animal.emoji} {animal.label}</div>
                    </div>
                  </div>
                </section>
              )}

              {openedPanel === "fortune" && fortuneContent && (
                <section className="mt-4 rounded-[32px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100">
                  <div className="text-lg font-extrabold">운세 풀이</div>
                  <div className="mt-1 text-sm text-zinc-500">
                    일간과 오행 분포를 바탕으로 성향과 흐름을 자연스럽게 풀어봤어요
                  </div>
                  <div className={`mt-4 rounded-3xl border p-4 ${dominantMeta.chipClass}`}>
                    <div className="text-xs font-bold opacity-70">전체 흐름 요약</div>
                    <div className="mt-2 text-sm leading-relaxed">{fortuneContent.overview}</div>
                  </div>
                  <div className="mt-3 rounded-3xl bg-zinc-50 p-4">
                    <div className="text-[11px] font-bold text-zinc-400">기본 성향</div>
                    <div className="mt-2 text-sm leading-7 text-zinc-700">{fortuneContent.personality}</div>
                  </div>
                  <div className="mt-3 rounded-3xl bg-zinc-50 p-4">
                    <div className="text-[11px] font-bold text-zinc-400">강하게 드러나는 장점</div>
                    <div className="mt-2 text-sm leading-7 text-zinc-700">{fortuneContent.strength}</div>
                  </div>
                  <div className="mt-3 rounded-3xl bg-zinc-50 p-4">
                    <div className="text-[11px] font-bold text-zinc-400">일과 관계 흐름</div>
                    <div className="mt-2 space-y-3 text-sm leading-7 text-zinc-700">
                      <p>{fortuneContent.work}</p>
                      <p>{fortuneContent.relationship}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-3xl bg-zinc-50 p-4">
                    <div className="text-[11px] font-bold text-zinc-400">균형과 보완 포인트</div>
                    <div className="mt-2 text-sm leading-7 text-zinc-700">{fortuneContent.balance}</div>
                  </div>
                  <div className="mt-3 rounded-3xl bg-white p-4 ring-1 ring-zinc-100">
                    <div className="text-[11px] font-bold text-zinc-400">생활 속 보완 힌트</div>
                    <div className="mt-3 space-y-2.5">
                      {fortuneContent.lifestyleTips.map((tip, index) => (
                        <div key={`${tip}-${index}`} className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-700">
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 rounded-3xl bg-zinc-900 p-4 text-white">
                    <div className="text-xs font-bold text-white/60">마무리 해석</div>
                    <div className="mt-2 text-sm leading-7 text-white/90">{fortuneContent.closing}</div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      {/* 안내 모달 (기존 동일) */}
      {infoOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 px-4 py-6" onClick={() => setInfoOpen(false)}>
          <div
            className="mx-auto mt-10 max-w-md rounded-[32px] bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold text-zinc-900">이용 안내</div>
                <div className="mt-1 text-sm text-zinc-500">입력 전 알아두면 좋은 기준을 정리했어요</div>
              </div>
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-3xl bg-zinc-50 p-4">
                <div className="text-sm font-extrabold text-zinc-900">달력 기준</div>
                <div className="mt-1 text-sm leading-6 text-zinc-600">양력은 입력한 날짜 그대로 계산하고, 음력은 먼저 양력으로 변환한 뒤 계산합니다.</div>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <div className="text-sm font-extrabold text-zinc-900">출생 시간</div>
                <div className="mt-1 text-sm leading-6 text-zinc-600">시간을 모르면 시주는 제외한 흐름으로 보고, 시간을 알면 시주까지 포함해 계산합니다.</div>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <div className="text-sm font-extrabold text-zinc-900">결과 해석 기준</div>
                <div className="mt-1 text-sm leading-6 text-zinc-600">만세력은 연·월·일·시 기둥과 오행 분포를 보여주고, 운세 풀이는 그 구조를 바탕으로 성향과 흐름을 읽기 쉽게 정리한 요약 해석입니다.</div>
              </div>
              <div className="rounded-3xl bg-blue-50 p-4 ring-1 ring-blue-100">
                <div className="text-sm font-extrabold text-zinc-900">입력 팁</div>
                <div className="mt-1 text-sm leading-6 text-zinc-600">년, 월, 일을 먼저 고른 뒤 달력 기준을 선택하면 바로 분석할 수 있어요. 시간은 알면 입력하고, 몰라도 괜찮아요.</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInfoOpen(false)}
              className="mt-4 w-full rounded-[22px] bg-zinc-900 px-5 py-4 text-sm font-extrabold text-white"
            >
              확인했어요
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
