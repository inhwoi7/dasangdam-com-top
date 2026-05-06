// lib/naming/engine.ts
// 작명 핵심 엔진 — 서버 전용 (Server Components / API Routes / Server Actions)
// 절대 클라이언트에서 import 하지 마십시오.

import { supabase } from "@/lib/supabase";
import {
  calcNamingScore,
  checkSuriGilhyung,
  getPronunciationElement,
  checkElementHarmony,
  normalizeSuri,
  type FiveElement,
  type Rating,
  type NamingScore,
} from "@/lib/naming-logic";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 타입 정의
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;   // 0~23
  minute: number;
  isLunar?: boolean;
  gender: "M" | "F" | "N";
}

export interface SajuData {
  yearPillar:  { cheongan: string; jiji: string };
  monthPillar: { cheongan: string; jiji: string };
  dayPillar:   { cheongan: string; jiji: string };
  hourPillar:  { cheongan: string; jiji: string };
  elementCounts: Record<FiveElement, number>;   // 사주 내 오행 분포
  yongshin: FiveElement[];                       // 용신 (보강 필요 오행)
  geukshin: FiveElement[];                       // 극신 (억제 필요 오행)
}

export interface HanjaCandidate {
  hanja: string;
  hangulSound: string;
  strokes: number;
  fiveElement: FiveElement;
  meaning: string;
}

export interface RecommendedName {
  hangul: string;           // 예: "한지민"
  hanja: string;            // 예: "韓知旻"
  score: NamingScore;
  surnameStrokes: number;
  hanjaDetails: HanjaCandidate[];
  highlight: string;        // 한 줄 추천 이유
}

export interface NamingEngineInput {
  surnameHangul: string;
  birthInfo: BirthInfo;
  excludedChars?: string[];       // 기피 한글 음절 (예: ['소','온'])
  preferredSyllables?: string[];  // 선호 한글 음절 (예: ['민','준'])
  maxResults?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. 사주 분석 엔진
// 실제 서비스에서는 만세력 라이브러리 또는 외부 API 연동 필요.
// 여기서는 천간 오행 매핑을 기반으로 한 간략화 버전을 제공합니다.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 천간(天干) → 오행 매핑
const CHEONGAN_ELEMENT: Record<string, FiveElement> = {
  갑: "목", 을: "목",
  병: "화", 정: "화",
  무: "토", 기: "토",
  경: "금", 신: "금",
  임: "수", 계: "수",
};

// 지지(地支) → 오행 매핑
const JIJI_ELEMENT: Record<string, FiveElement> = {
  인: "목", 묘: "목",
  사: "화", 오: "화",
  진: "토", 술: "토", 축: "토", 미: "토",
  신: "금", 유: "금",
  해: "수", 자: "수",
};

// 연도별 천간 계산 (간략화 - 실제는 만세력 필요)
function getYearCheongan(year: number): string {
  const list = ["경","신","임","계","갑","을","병","정","무","기"];
  return list[year % 10];
}
function getYearJiji(year: number): string {
  const list = ["신","유","술","해","자","축","인","묘","진","사","오","미"];
  return list[year % 12];
}

// 시간 → 시주 천간 (일간 기준이나 여기서는 연도 기반 간략화)
function getHourJiji(hour: number): string {
  const jijis = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
  return jijis[Math.floor(((hour + 1) % 24) / 2)];
}

export function analyzeSaju(birth: BirthInfo): SajuData {
  // ⚠️ 이 함수는 간략화된 버전입니다.
  // 실제 서비스에서는 korean-lunar-calendar + 만세력 DB 연동이 필요합니다.

  const yearCG  = getYearCheongan(birth.year);
  const yearJJ  = getYearJiji(birth.year);
  const monthCG = getYearCheongan(birth.year + birth.month); // 월간 간략화
  const monthJJ = ["인","묘","진","사","오","미","신","유","술","해","자","축"][birth.month - 1];
  const dayCG   = getYearCheongan(birth.year + birth.month + birth.day);
  const dayJJ   = getYearJiji(birth.year + birth.month + birth.day);
  const hourJJ  = getHourJiji(birth.hour);
  const hourCG  = getYearCheongan(birth.hour);

  const pillars = [
    { cg: yearCG, jj: yearJJ },
    { cg: monthCG, jj: monthJJ },
    { cg: dayCG,  jj: dayJJ },
    { cg: hourCG, jj: hourJJ },
  ];

  // 오행 분포 집계
  const elementCounts: Record<FiveElement, number> = {
    목: 0, 화: 0, 토: 0, 금: 0, 수: 0,
  };
  for (const { cg, jj } of pillars) {
    const cgEl = CHEONGAN_ELEMENT[cg];
    const jjEl = JIJI_ELEMENT[jj];
    if (cgEl) elementCounts[cgEl]++;
    if (jjEl) elementCounts[jjEl]++;
  }

  // 용신: 부족한 오행 (평균 이하)
  const avg = Object.values(elementCounts).reduce((a, b) => a + b, 0) / 5;
  const yongshin = (Object.entries(elementCounts) as [FiveElement, number][])
    .filter(([, count]) => count < avg)
    .sort(([, a], [, b]) => a - b)
    .map(([el]) => el)
    .slice(0, 2);

  // 극신: 과잉 오행 (평균 1.5배 이상)
  const geukshin = (Object.entries(elementCounts) as [FiveElement, number][])
    .filter(([, count]) => count > avg * 1.5)
    .map(([el]) => el);

  return {
    yearPillar:  { cheongan: yearCG, jiji: yearJJ },
    monthPillar: { cheongan: monthCG, jiji: monthJJ },
    dayPillar:   { cheongan: dayCG, jiji: dayJJ },
    hourPillar:  { cheongan: hourCG, jiji: hourJJ },
    elementCounts,
    yongshin,
    geukshin,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. 필터링 시스템
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Supabase에서 한자 후보 가져오기 (용신 오행 + 음절 필터) */
async function fetchHanjaCandidates(
  sound: string,
  allowedElements: FiveElement[],
  excludedChars: string[] = []
): Promise<HanjaCandidate[]> {

  const { data, error } = await supabase
    .from("naming_hanja")
    .select("hanja, hangul_sound, strokes_original, five_elements, meaning")
    .eq("hangul_sound", sound)
    .eq("is_legal_name", true)
    .eq("is_forbidden", false)
    .in("five_elements", allowedElements)
    .order("strokes_original");

  if (error) throw new Error(`한자 조회 실패: ${error.message}`);

  return (data ?? [])
    .filter((h) => !excludedChars.includes(h.hangul_sound)) // 기피 글자 제거
    .map((h) => ({
      hanja: h.hanja,
      hangulSound: h.hangul_sound,
      strokes: h.strokes_original,
      fiveElement: h.five_elements as FiveElement,
      meaning: h.meaning ?? "",
    }));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. 조합 엔진
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 81수 4격이 모두 '길' 이상인지 검증 */
function isAllGil(
  surnameStrokes: number,
  char1Strokes: number,
  char2Strokes: number
): boolean {
  const won    = checkSuriGilhyung(surnameStrokes);
  const hyeong = checkSuriGilhyung(surnameStrokes + char1Strokes);
  const i      = checkSuriGilhyung(char1Strokes + char2Strokes);
  const jeon   = checkSuriGilhyung(surnameStrokes + char1Strokes + char2Strokes);

  const BAD: Rating[] = ["나쁨", "매우나쁨"];
  return ![won, hyeong, i, jeon].some((r) => BAD.includes(r.rating));
}

/** 발음오행 상생 체크: 성씨 오행 → 이름 첫 글자 → 이름 둘째 글자 */
function isGoodPronunciation(
  surnameEl: FiveElement,
  char1El: FiveElement,
  char2El: FiveElement
): boolean {
  const result = checkElementHarmony([surnameEl, char1El, char2El]);
  return result.isHarmony;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. 메인 추천 엔진
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function generateNamingRecommendations(
  input: NamingEngineInput
): Promise<RecommendedName[]> {
  const {
    surnameHangul,
    birthInfo,
    excludedChars = [],
    preferredSyllables = [],
    maxResults = 5,
  } = input;

  // ── (1) 성씨 정보 조회 ───────────────────────
  const { data: surnameData } = await supabase
    .from("naming_surnames")
    .select("strokes_original, five_elements")
    .eq("hangul", surnameHangul)
    .single();

  if (!surnameData) throw new Error(`성씨 '${surnameHangul}'을 찾을 수 없습니다.`);

  const surnameStrokes = surnameData.strokes_original;
  const surnameElement = surnameData.five_elements as FiveElement;

  // ── (2) 사주 분석 ────────────────────────────
  const saju = analyzeSaju(birthInfo);
  const allowedElements: FiveElement[] = saju.yongshin.length > 0
    ? saju.yongshin
    : ["목", "화", "토", "금", "수"]; // 용신 없으면 전체 허용

  // ── (3) 한자 후보 수집 ───────────────────────
  // 자주 쓰이는 음절 목록 (선호 음절 우선, 그 다음 일반 목록)
  const commonSyllables = ["준", "민", "서", "지", "윤", "현", "수", "은", "아", "유",
    "진", "호", "재", "승", "우", "정", "혜", "원", "예", "나",
    "빈", "도", "하", "세", "연", "경", "태", "찬", "규", "희"];

  const syllables = preferredSyllables.length > 0
    ? [...new Set([...preferredSyllables, ...commonSyllables])]
    : commonSyllables;

  // 음절별 한자 후보 병렬 조회
  const candidateMap = new Map<string, HanjaCandidate[]>();
  await Promise.all(
    syllables.slice(0, 15).map(async (syl) => {
      const candidates = await fetchHanjaCandidates(syl, allowedElements, excludedChars);
      if (candidates.length > 0) candidateMap.set(syl, candidates);
    })
  );

  // ── (4) 조합 & 검증 ──────────────────────────
  const results: RecommendedName[] = [];
  const usedCombinations = new Set<string>();

  outerLoop:
  for (const [syl1, char1Candidates] of candidateMap) {
    for (const [syl2, char2Candidates] of candidateMap) {
      if (syl1 === syl2) continue;

      for (const c1 of char1Candidates.slice(0, 5)) {
        for (const c2 of char2Candidates.slice(0, 5)) {
          const nameKey = `${c1.hanja}${c2.hanja}`;
          if (usedCombinations.has(nameKey)) continue;

          // 81수 검증
          if (!isAllGil(surnameStrokes, c1.strokes, c2.strokes)) continue;

          // 발음오행 검증
          if (!isGoodPronunciation(surnameElement, c1.fiveElement, c2.fiveElement)) continue;

          usedCombinations.add(nameKey);

          const hangulName = `${surnameHangul}${syl1}${syl2}`;
          const hanjaName  = `${surnameData ? "" : ""}${c1.hanja}${c2.hanja}`;
          const score = calcNamingScore(hangulName, [surnameStrokes, c1.strokes, c2.strokes]);

          const highlight = buildHighlight(score, c1, c2, saju.yongshin);

          results.push({
            hangul: hangulName,
            hanja: hanjaName,
            score,
            surnameStrokes,
            hanjaDetails: [c1, c2],
            highlight,
          });

          if (results.length >= maxResults * 3) break outerLoop;
        }
      }
    }
  }

  // ── (5) 정렬: 종합 등급 우선, 정격 획수 차선 ─
  const RATING_ORDER: Record<Rating, number> = {
    매우좋음: 0, 좋음: 1, 보통: 2, 나쁨: 3, 매우나쁨: 4,
  };

  return results
    .sort((a, b) => {
      const ratingDiff = RATING_ORDER[a.score.overallRating] - RATING_ORDER[b.score.overallRating];
      if (ratingDiff !== 0) return ratingDiff;
      // 정격이 31·32·33 같은 대길수에 가까울수록 우선
      return Math.abs(a.score.fourGuk.jeonGuk.strokes - 31)
           - Math.abs(b.score.fourGuk.jeonGuk.strokes - 31);
    })
    .slice(0, maxResults);
}

/** 추천 이유 한 줄 생성 */
function buildHighlight(
  score: NamingScore,
  c1: HanjaCandidate,
  c2: HanjaCandidate,
  yongshin: FiveElement[]
): string {
  const parts: string[] = [];

  if (score.overallRating === "매우좋음") parts.push("81수 4격 모두 길");
  if (yongshin.includes(c1.fiveElement)) parts.push(`${c1.hangulSound}(${c1.fiveElement})이 용신 보강`);
  if (yongshin.includes(c2.fiveElement)) parts.push(`${c2.hangulSound}(${c2.fiveElement})이 용신 보강`);

  const harmony = checkElementHarmony(score.pronunciationElements.map((e) => e.element));
  if (harmony.isHarmony) parts.push("발음오행 상생");

  return parts.length > 0 ? parts.join(" · ") : "균형 잡힌 이름";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. 이름 감명(鑑名) — 기존 이름 점수 계산
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface GamMyeongInput {
  nameHangul: string;     // 성 포함 전체 이름 (예: "한지민")
  strokesList: number[];  // 원획법 획수 배열 (예: [17, 8, 8])
  birthInfo?: BirthInfo;  // 사주와 비교 원하면 입력
}

export interface GamMyeongResult {
  namingScore: NamingScore;
  sajuCompatibility?: {
    yongshin: FiveElement[];
    nameElements: FiveElement[];
    matchingElements: FiveElement[];
    score: number; // 0~100
  };
}

export function analyzeExistingName(input: GamMyeongInput): GamMyeongResult {
  const namingScore = calcNamingScore(input.nameHangul, input.strokesList);

  if (!input.birthInfo) return { namingScore };

  const saju = analyzeSaju(input.birthInfo);
  const nameElements = namingScore.pronunciationElements.map((e) => e.element);
  const matchingElements = nameElements.filter((el) => saju.yongshin.includes(el));

  const sajuCompatibility = {
    yongshin: saju.yongshin,
    nameElements,
    matchingElements,
    score: Math.round((matchingElements.length / Math.max(nameElements.length, 1)) * 100),
  };

  return { namingScore, sajuCompatibility };
}
