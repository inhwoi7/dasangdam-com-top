// ============================================================
// 척전법(擲錢法) - 동전 던지기 주역 점술 알고리즘
// ============================================================

export type LineValue = 6 | 7 | 8 | 9;

export interface Line {
  value: LineValue;
  isYang: boolean;       // 양효(—) = true, 음효(- -) = false
  isChanging: boolean;   // 변효 여부 (6=노음, 9=노양)
}

export interface Hexagram {
  lines: Line[];         // 아래(index 0)부터 위(index 5)로
  binaryKey: string;     // "101010" 형태 (위→아래 순서)
  hexagramNumber: number;
}

export interface ReadingResult {
  original: Hexagram;         // 본괘
  changed: Hexagram | null;   // 지괘 (변효 있을 때만)
  hasChangingLines: boolean;
  changingLineIndices: number[];
}

// ── 동전 3개 던지기 시뮬레이션 ──────────────────────────────
// 앞면=3, 뒷면=2
// 합계: 6(노음,변), 7(소양), 8(소음), 9(노양,변)
function castOneLine(): LineValue {
  const coins = [
    Math.random() < 0.5 ? 2 : 3,
    Math.random() < 0.5 ? 2 : 3,
    Math.random() < 0.5 ? 2 : 3,
  ];
  return (coins[0] + coins[1] + coins[2]) as LineValue;
}

// ── 6효 생성 ────────────────────────────────────────────────
export function castHexagram(): Line[] {
  return Array.from({ length: 6 }, () => {
    const value = castOneLine();
    return {
      value,
      isYang: value === 7 || value === 9,
      isChanging: value === 6 || value === 9,
    };
  });
}

// ── 효 배열 → 이진 키 변환 (상괘→하괘, 위→아래) ────────────
export function linesToBinaryKey(lines: Line[], useChanged = false): string {
  return [...lines]
    .reverse()
    .map(l => {
      if (useChanged) {
        const yang = l.isChanging ? !l.isYang : l.isYang;
        return yang ? '1' : '0';
      }
      return l.isYang ? '1' : '0';
    })
    .join('');
}

// ── 삼효(trigram) 이진 → 팔괘 번호 (0~7) ────────────────────
function trigramIndex(bits: string): number {
  return parseInt(bits, 2);
}

// King Wen sequence 매핑 테이블
const KING_WEN_TABLE: Record<string, number> = {
  '0_0': 1,  '0_1': 10, '0_2': 13, '0_3': 25, '0_4': 44, '0_5': 6,  '0_6': 33, '0_7': 12,
  '1_0': 43, '1_1': 58, '1_2': 49, '1_3': 17, '1_4': 28, '1_5': 47, '1_6': 31, '1_7': 45,
  '2_0': 14, '2_1': 38, '2_2': 30, '2_3': 21, '2_4': 50, '2_5': 64, '2_6': 56, '2_7': 35,
  '3_0': 34, '3_1': 54, '3_2': 55, '3_3': 51, '3_4': 32, '3_5': 40, '3_6': 62, '3_7': 16,
  '4_0': 9,  '4_1': 61, '4_2': 37, '4_3': 42, '4_4': 57, '4_5': 59, '4_6': 53, '4_7': 20,
  '5_0': 5,  '5_1': 60, '5_2': 63, '5_3': 3,  '5_4': 48, '5_5': 29, '5_6': 39, '5_7': 8,
  '6_0': 26, '6_1': 41, '6_2': 22, '6_3': 27, '6_4': 18, '6_5': 4,  '6_6': 52, '6_7': 23,
  '7_0': 11, '7_1': 19, '7_2': 36, '7_3': 24, '7_4': 46, '7_5': 7,  '7_6': 15, '7_7': 2,
};

// ── 이진키 → 괘 번호 ─────────────────────────────────────────
export function binaryKeyToHexagramNumber(key: string): number {
  const upperBits = key.slice(0, 3);
  const lowerBits = key.slice(3, 6);
  const upper = trigramIndex(upperBits);
  const lower = trigramIndex(lowerBits);
  return KING_WEN_TABLE[`${upper}_${lower}`] ?? 1;
}

// ── 완전한 점괘 결과 생성 ────────────────────────────────────
export function generateReading(lines: Line[]): ReadingResult {
  const originalKey = linesToBinaryKey(lines, false);
  const hexagramNumber = binaryKeyToHexagramNumber(originalKey);

  const original: Hexagram = {
    lines,
    binaryKey: originalKey,
    hexagramNumber,
  };

  const changingLineIndices = lines
    .map((l, i) => (l.isChanging ? i : -1))
    .filter(i => i !== -1);

  const hasChangingLines = changingLineIndices.length > 0;

  let changed: Hexagram | null = null;
  if (hasChangingLines) {
    const changedKey = linesToBinaryKey(lines, true);
    const changedNumber = binaryKeyToHexagramNumber(changedKey);
    changed = {
      lines: lines.map(l => ({
        ...l,
        isYang: l.isChanging ? !l.isYang : l.isYang,
        isChanging: false,
      })),
      binaryKey: changedKey,
      hexagramNumber: changedNumber,
    };
  }

  return { original, changed, hasChangingLines, changingLineIndices };
}

// ── 유틸: 효 가치 → 한자 이름 ───────────────────────────────
export function lineValueName(value: LineValue): string {
  switch (value) {
    case 6: return '老陰';
    case 7: return '少陽';
    case 8: return '少陰';
    case 9: return '老陽';
  }
}
