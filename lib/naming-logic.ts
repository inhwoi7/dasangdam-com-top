// lib/naming-logic.ts
// 작명 핵심 알고리즘 - 서버 컴포넌트 / API Route 전용
// ⚠️  브라우저 번들에 포함되지 않도록 'use server' 또는 API Route에서만 import

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

export type Rating = "매우좋음" | "좋음" | "보통" | "나쁨" | "매우나쁨";
export type FiveElement = "목" | "화" | "토" | "금" | "수";

export interface SuriResult {
  strokes: number;       // 실제 계산에 사용된 획수 (1~81)
  rating: Rating;
  name: string;          // 격(格) 이름  예) 갱신격
  description: string;   // 한 줄 설명
}

export interface FourGuk {
  wonGuk: SuriResult;    // 원격(元格) = 성씨
  hyeongGuk: SuriResult; // 형격(亨格) = 성 + 이름 첫 글자
  iGuk: SuriResult;      // 이격(利格) = 이름 첫 글자 + 이름 둘째 글자
  jeonGuk: SuriResult;   // 정격(貞格) = 성 + 이름 전체
}

export interface PronunciationResult {
  char: string;
  initial: string;       // 초성
  element: FiveElement;
  elementKr: string;     // 예) "목(木)"
}

export interface NamingScore {
  fourGuk: FourGuk;
  pronunciationElements: PronunciationResult[];
  overallRating: Rating;
  summary: string;
}

// ─────────────────────────────────────────────
// 81수리 길흉표 (전체 1~81)
// 출처: 수리성명학 81수 길흉표 (작명학 표준)
// ─────────────────────────────────────────────

interface SuriEntry {
  name: string;
  rating: Rating;
  description: string;
}

const SURI_TABLE: Record<number, SuriEntry> = {
  1:  { name: "태초격(太初格)",  rating: "매우좋음", description: "만물의 시작, 지도자·두령운, 독립·창업에 길" },
  2:  { name: "분리격(分離格)",  rating: "매우나쁨", description: "분열·이별·고독, 협력이 어렵고 단명 암시" },
  3:  { name: "명예격(名譽格)",  rating: "매우좋음", description: "지덕 겸비, 번영·발전, 예술·문학에 특히 길" },
  4:  { name: "파멸격(破滅格)",  rating: "매우나쁨", description: "파란·고난·실패, 건강 주의, 흉수 중 최악" },
  5:  { name: "통솔격(統率格)",  rating: "매우좋음", description: "중앙에서 통솔, 안정·번영, 오복을 고루 갖춤" },
  6:  { name: "계승격(繼承格)",  rating: "좋음",     description: "덕망·인기, 선대의 유업 계승, 화목한 가정" },
  7:  { name: "독립격(獨立格)",  rating: "좋음",     description: "강인한 의지, 독자 개척, 정치·군인에 유리" },
  8:  { name: "발전격(發展格)",  rating: "좋음",     description: "착실한 노력으로 대성, 의지 굳고 인내력 강" },
  9:  { name: "궁박격(窮迫格)",  rating: "나쁨",     description: "초년 고생, 의지 있어도 결실 부족, 단명 우려" },
  10: { name: "공허격(空虛格)",  rating: "매우나쁨", description: "고독·별리, 허무한 결말, 재물·명예 무상" },
  11: { name: "갱신격(更新格)",  rating: "매우좋음", description: "유연한 지혜, 계획 성취, 만사 순조로운 발전" },
  12: { name: "박약격(薄弱格)",  rating: "나쁨",     description: "의지박약, 심신 불안정, 타인 의존 경향" },
  13: { name: "지모격(智謀格)",  rating: "매우좋음", description: "지혜·언변 우수, 재예 겸비, 학문·예술 대성" },
  14: { name: "이산격(離散格)",  rating: "매우나쁨", description: "가족 이산, 고독, 사업 실패, 건강 쇠약" },
  15: { name: "통솔격(統率格)",  rating: "매우좋음", description: "덕망으로 추대, 인망·재복, 만인에게 존경" },
  16: { name: "덕망격(德望格)",  rating: "매우좋음", description: "덕·명예·재물 삼박자, 귀인 도움, 지도자운" },
  17: { name: "건창격(建暢格)",  rating: "좋음",     description: "강인한 노력가, 역경을 극복하고 성공" },
  18: { name: "발전격(發展格)",  rating: "좋음",     description: "진취적, 실력으로 대성, 명예·재물 획득" },
  19: { name: "고난격(苦難格)",  rating: "나쁨",     description: "초년 고난, 건강 불리, 부부 인연 박약" },
  20: { name: "허망격(虛妄格)",  rating: "매우나쁨", description: "분수 모르는 야망, 실패·좌절, 병약" },
  21: { name: "두령격(頭領格)",  rating: "매우좋음", description: "두뇌 명석, 자수성가, 리더십, 사업 성공" },
  22: { name: "중절격(中折格)",  rating: "나쁨",     description: "초반 순조로우나 중도 좌절, 허약 체질" },
  23: { name: "공명격(功名格)",  rating: "매우좋음", description: "공명·명예, 총명·재예, 관직·예술에 대길" },
  24: { name: "입신격(立身格)",  rating: "매우좋음", description: "노력으로 재물 축적, 가업 번창, 실업가운" },
  25: { name: "안강격(安康格)",  rating: "좋음",     description: "독립심·자존심 강, 역경 극복, 중년 이후 대길" },
  26: { name: "영웅격(英雄格)",  rating: "보통",     description: "파란 많은 영웅운, 성공도 있으나 파란도 큼" },
  27: { name: "중절격(中折格)",  rating: "나쁨",     description: "중년에 뜻밖의 재난, 부부·자녀운 불리" },
  28: { name: "조난격(遭難格)",  rating: "나쁨",     description: "파란·풍파, 인덕 없음, 이별·고독" },
  29: { name: "공명격(功名格)",  rating: "좋음",     description: "지모·통솔력, 어려움 극복하고 성공, 권위운" },
  30: { name: "부침격(浮沈格)",  rating: "보통",     description: "성패 기복 심함, 도박·투기 주의, 용기 있으면 길" },
  31: { name: "영달격(榮達格)",  rating: "매우좋음", description: "덕망·지모, 인망·재복, 부귀영화 자연히 따름" },
  32: { name: "행운격(幸運格)",  rating: "매우좋음", description: "귀인 조력, 의외의 행운, 발전·번영 지속" },
  33: { name: "승천격(昇天格)",  rating: "매우좋음", description: "위대한 지도자운, 왕성한 활동력, 최고의 성공" },
  34: { name: "파멸격(破滅格)",  rating: "매우나쁨", description: "갑작스런 재앙, 파산·건강 악화, 극흉수" },
  35: { name: "온화격(溫和格)",  rating: "좋음",     description: "학문·예술에 적합, 온화하고 평화로운 인생" },
  36: { name: "영웅격(英雄格)",  rating: "보통",     description: "협객·의협심, 파란 많으나 명성 얻음, 고독" },
  37: { name: "인덕격(仁德格)",  rating: "매우좋음", description: "덕망·의협심, 부하 통솔, 중년 이후 대성" },
  38: { name: "문예격(文藝格)",  rating: "좋음",     description: "학문·예술 재능, 전문직에 유리, 평온한 삶" },
  39: { name: "장성격(將星格)",  rating: "매우좋음", description: "지도자·왕자운, 부귀공명, 활동력 왕성" },
  40: { name: "무상격(無常格)",  rating: "나쁨",     description: "성패 무상, 기회를 잘 포착해야 함, 방랑기" },
  41: { name: "덕수격(德秀格)",  rating: "매우좋음", description: "덕·재능·인망, 만사 순탄, 일생 행복" },
  42: { name: "고행격(苦行格)",  rating: "나쁨",     description: "노력에 비해 결실 부족, 산만한 정신, 고독" },
  43: { name: "산화격(散花格)",  rating: "나쁨",     description: "겉은 화려하나 내실 없음, 재물 손실 주의" },
  44: { name: "마장격(魔障格)",  rating: "매우나쁨", description: "재난·병고, 의외의 사고, 극흉수" },
  45: { name: "대지격(大智格)",  rating: "매우좋음", description: "대지·명철, 선견지명, 외교·정치에 대성" },
  46: { name: "고난격(苦難格)",  rating: "나쁨",     description: "고난·역경, 노력해도 결실 적음, 건강 주의" },
  47: { name: "출세격(出世格)",  rating: "매우좋음", description: "귀인 도움, 출세·성공, 가문 빛냄" },
  48: { name: "지덕격(智德格)",  rating: "매우좋음", description: "지혜·덕망, 인망 높음, 모사·참모에 최적" },
  49: { name: "변화격(變化格)",  rating: "보통",     description: "변동·변화 많음, 결단력 있으면 성공 가능" },
  50: { name: "공허격(空虛格)",  rating: "나쁨",     description: "성공과 실패 반반, 만년 고독, 주의 필요" },
  51: { name: "성패격(成敗格)",  rating: "보통",     description: "성공과 실패 교차, 인생 기복 큼" },
  52: { name: "선견격(先見格)",  rating: "좋음",     description: "선견지명, 역경에서 기회 포착, 중년 이후 길" },
  53: { name: "내허격(內虛格)",  rating: "나쁨",     description: "겉은 번창하나 속은 공허, 사업 주의" },
  54: { name: "고난격(苦難格)",  rating: "매우나쁨", description: "일생 고난, 병약, 실패 연속" },
  55: { name: "불안격(不安格)",  rating: "나쁨",     description: "불안정, 심신 피로, 계획이 용두사미" },
  56: { name: "한탄격(恨嘆格)",  rating: "나쁨",     description: "노력 무상, 만년 쇠퇴, 고독" },
  57: { name: "노력격(勞力格)",  rating: "좋음",     description: "노력 끝에 성공, 만년 안정, 인내 필요" },
  58: { name: "후발격(後發格)",  rating: "좋음",     description: "초년 고생 후 만년 대길, 노력 결실" },
  59: { name: "재난격(災難格)",  rating: "매우나쁨", description: "병약·재난, 의지 박약, 극흉수" },
  60: { name: "암흑격(暗黑格)",  rating: "매우나쁨", description: "암흑·미로, 장애 연속, 만사 불성취" },
  61: { name: "화복격(華福格)",  rating: "좋음",     description: "덕망·지혜, 명리 겸전, 만년 번영" },
  62: { name: "쇠퇴격(衰退格)",  rating: "나쁨",     description: "점진적 쇠퇴, 노력 결실 적음, 고독" },
  63: { name: "성취격(成就格)",  rating: "좋음",     description: "착실한 노력으로 성공, 만년 안정" },
  64: { name: "침체격(沈滯格)",  rating: "매우나쁨", description: "침체·실패 반복, 병약, 노력 무상" },
  65: { name: "흥성격(興盛格)",  rating: "좋음",     description: "덕망·인기, 만년 번창, 온화한 성공" },
  66: { name: "쇠락격(衰落格)",  rating: "나쁨",     description: "만년 쇠락, 고독, 건강 저하" },
  67: { name: "자립격(自立格)",  rating: "좋음",     description: "노력으로 자립 성공, 만년 안정·번영" },
  68: { name: "지모격(智謀格)",  rating: "좋음",     description: "지혜·계획력, 착실히 성공, 가정 화목" },
  69: { name: "쇠약격(衰弱格)",  rating: "나쁨",     description: "심신 쇠약, 진퇴 어려움, 건강 최우선" },
  70: { name: "공허격(空虛格)",  rating: "매우나쁨", description: "허무, 재난 반복, 일생 불안정" },
  71: { name: "성취격(成就格)",  rating: "좋음",     description: "착실한 발전, 인덕 있음, 만년 안정" },
  72: { name: "반길반흉(半吉半凶)", rating: "보통",  description: "부분적 성공·실패, 중용이 중요" },
  73: { name: "평안격(平安格)",  rating: "좋음",     description: "평온한 인생, 크게 부귀는 아니나 행복" },
  74: { name: "암흑격(暗黑格)",  rating: "나쁨",     description: "음해·장애, 진로 막힘, 만년 쇠퇴" },
  75: { name: "평안격(平安格)",  rating: "보통",     description: "평범한 인생, 안정적이나 발전 더딤" },
  76: { name: "선길후흉(先吉後凶)", rating: "나쁨",  description: "초년 순탄하나 만년 쇠퇴, 겸손 필요" },
  77: { name: "길흉혼재(吉凶混在)", rating: "보통",  description: "성패 혼재, 의지·판단력으로 극복 가능" },
  78: { name: "유동격(流動格)",  rating: "보통",     description: "변화 많음, 적응력 있으면 성공 가능" },
  79: { name: "불안격(不安格)",  rating: "나쁨",     description: "심신 불안, 재난 주의, 건강 저하" },
  80: { name: "공허격(空虛格)",  rating: "나쁨",     description: "허무·이산, 말년 고독, 도전 신중히" },
  81: { name: "환원격(還元格)",  rating: "매우좋음", description: "1획과 동일한 태초운, 순환·완성의 최길수" },
};

// ─────────────────────────────────────────────
// 발음오행표 (초성 기준)
// 목(木): ㄱ,ㅋ   화(火): ㄴ,ㄷ,ㄹ,ㅌ
// 토(土): ㅇ,ㅎ   금(金): ㅅ,ㅈ,ㅊ
// 수(水): ㅁ,ㅂ,ㅍ
// ─────────────────────────────────────────────

const INITIAL_CONSONANTS: Record<string, FiveElement> = {
  ㄱ: "목", ㅋ: "목",
  ㄴ: "화", ㄷ: "화", ㄹ: "화", ㅌ: "화",
  ㅇ: "토", ㅎ: "토",
  ㅅ: "금", ㅈ: "금", ㅊ: "금",
  ㅁ: "수", ㅂ: "수", ㅍ: "수",
  // ㄲ,ㄸ,ㅃ,ㅆ,ㅉ — 쌍자음은 원자음으로 귀속
  ㄲ: "목",
  ㄸ: "화",
  ㅃ: "수",
  ㅆ: "금",
  ㅉ: "금",
};

const ELEMENT_KR: Record<FiveElement, string> = {
  목: "목(木)", 화: "화(火)", 토: "토(土)", 금: "금(金)", 수: "수(水)",
};

// 한글 초성 분리 (유니코드 기준)
const HANGUL_INITIALS = [
  "ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ",
  "ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ",
];

function getInitialConsonant(char: string): string | null {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return null; // 한글 음절 범위 밖
  const offset = code - 0xAC00;
  const initialIndex = Math.floor(offset / (21 * 28));
  return HANGUL_INITIALS[initialIndex];
}

// ─────────────────────────────────────────────
// 공개 API 함수들
// ─────────────────────────────────────────────

/**
 * 획수를 1~81 범위로 정규화
 * 82 이상은 81을 뺀 값으로 순환 (81수 이론 기준)
 */
export function normalizeSuri(totalStrokes: number): number {
  if (totalStrokes <= 0) return 1;
  if (totalStrokes <= 81) return totalStrokes;
  // 81 초과: 81 단위로 순환
  const normalized = totalStrokes % 81;
  return normalized === 0 ? 81 : normalized;
}

/**
 * 특정 획수의 81수리 길흉 반환
 */
export function checkSuriGilhyung(totalStrokes: number): SuriResult {
  const normalized = normalizeSuri(totalStrokes);
  const entry = SURI_TABLE[normalized];
  return {
    strokes: normalized,
    rating: entry.rating,
    name: entry.name,
    description: entry.description,
  };
}

/**
 * 한글 글자의 발음오행 반환
 * @param char 단일 한글 글자 (예: "민")
 */
export function getPronunciationElement(char: string): PronunciationResult | null {
  const initial = getInitialConsonant(char);
  if (!initial) return null;
  const element = INITIAL_CONSONANTS[initial];
  if (!element) return null;
  return {
    char,
    initial,
    element,
    elementKr: ELEMENT_KR[element],
  };
}

/**
 * 원형이정(元亨利貞) 4격 계산
 * @param familyStrokes   성씨 획수 (원획법)
 * @param nameChar1Strokes 이름 첫 글자 획수 (외자 이름이면 0)
 * @param nameChar2Strokes 이름 둘째 글자 획수
 */
export function calcFourGuk(
  familyStrokes: number,
  nameChar1Strokes: number,
  nameChar2Strokes: number
): FourGuk {
  const won   = familyStrokes;
  const hyeong = familyStrokes + nameChar1Strokes;
  const i     = nameChar1Strokes + nameChar2Strokes;
  const jeon  = familyStrokes + nameChar1Strokes + nameChar2Strokes;

  return {
    wonGuk:    checkSuriGilhyung(won),
    hyeongGuk: checkSuriGilhyung(hyeong),
    iGuk:      checkSuriGilhyung(i),
    jeonGuk:   checkSuriGilhyung(jeon),
  };
}

/**
 * 발음 오행 배열의 상생/상극 평가
 * 상생 순서: 목→화→토→금→수→목
 */
export function checkElementHarmony(elements: FiveElement[]): {
  isHarmony: boolean;
  detail: string;
} {
  const CYCLE: FiveElement[] = ["목", "화", "토", "금", "수"];
  const GENERATE_MAP: Record<FiveElement, FiveElement> = {
    목: "화", 화: "토", 토: "금", 금: "수", 수: "목",
  };
  const DESTROY_MAP: Record<FiveElement, FiveElement> = {
    목: "토", 화: "금", 토: "수", 금: "목", 수: "화",
  };

  if (elements.length < 2) return { isHarmony: true, detail: "단일 오행" };

  const conflicts: string[] = [];
  const harmonies: string[] = [];

  for (let i = 0; i < elements.length - 1; i++) {
    const from = elements[i];
    const to   = elements[i + 1];
    if (GENERATE_MAP[from] === to) {
      harmonies.push(`${from}→${to} 상생`);
    } else if (DESTROY_MAP[from] === to) {
      conflicts.push(`${from}→${to} 상극`);
    }
  }

  return {
    isHarmony: conflicts.length === 0,
    detail: conflicts.length > 0
      ? `상극 관계 있음: ${conflicts.join(", ")}`
      : harmonies.length > 0
        ? `상생 관계: ${harmonies.join(", ")}`
        : "중립 관계",
  };
}

/**
 * 통합 작명 점수 계산
 * @param name 한글 이름 전체 (성씨 포함, 예: "한지민")
 * @param strokesList 각 글자별 원획법 획수 배열 (예: [17, 8, 8])
 */
export function calcNamingScore(
  name: string,
  strokesList: number[]
): NamingScore {
  if (name.length < 2 || strokesList.length !== name.length) {
    throw new Error("이름과 획수 배열의 길이가 맞지 않습니다.");
  }

  const is2char = name.length === 2; // 성 + 외자 이름

  const familyStrokes  = strokesList[0];
  const nameChar1      = is2char ? strokesList[1] : strokesList[1];
  const nameChar2      = is2char ? 0 : strokesList[2];

  const fourGuk = calcFourGuk(familyStrokes, nameChar1, nameChar2);

  // 발음오행
  const pronunciationElements = Array.from(name)
    .map(getPronunciationElement)
    .filter((r): r is PronunciationResult => r !== null);

  const harmony = checkElementHarmony(
    pronunciationElements.map((r) => r.element)
  );

  // 종합 등급: 4격 중 나쁨/매우나쁨 비율로 판단
  const ratings = [
    fourGuk.wonGuk.rating,
    fourGuk.hyeongGuk.rating,
    fourGuk.iGuk.rating,
    fourGuk.jeonGuk.rating,
  ];
  const badCount = ratings.filter(
    (r) => r === "나쁨" || r === "매우나쁨"
  ).length;
  const greatCount = ratings.filter((r) => r === "매우좋음").length;

  let overallRating: Rating;
  if (badCount === 0 && greatCount >= 3) overallRating = "매우좋음";
  else if (badCount === 0) overallRating = "좋음";
  else if (badCount === 1) overallRating = "보통";
  else if (badCount === 2) overallRating = "나쁨";
  else overallRating = "매우나쁨";

  const summary = [
    `정격(총획) ${fourGuk.jeonGuk.strokes}수: ${fourGuk.jeonGuk.name} — ${fourGuk.jeonGuk.description}`,
    harmony.detail,
  ].join(" / ");

  return { fourGuk, pronunciationElements, overallRating, summary };
}

// ─────────────────────────────────────────────
// 유틸: 길흉 등급별 라벨 / 색상 (UI 연동용)
// ─────────────────────────────────────────────

export const RATING_LABEL: Record<Rating, string> = {
  매우좋음: "매우좋음 ★★★",
  좋음:     "좋음 ★★",
  보통:     "보통 ★",
  나쁨:     "나쁨 ✕",
  매우나쁨: "매우나쁨 ✕✕",
};

export const RATING_COLOR: Record<Rating, string> = {
  매우좋음: "#2563eb", // 파랑
  좋음:     "#16a34a", // 초록
  보통:     "#d97706", // 주황
  나쁨:     "#dc2626", // 빨강
  매우나쁨: "#7f1d1d", // 진한 빨강
};
