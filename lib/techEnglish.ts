// lib/techEnglish.ts
// LS전선 사내 자료 "고전압 절연·전계 완화 기술영어 치트시트"를 학습용 데이터로 옮김.
export interface TechVocab {
  en: string;
  ko: string;
}

export interface TechDay {
  id: number;
  week: number;
  vocab: TechVocab[];
  pattern_en: string;
  pattern_ko: string;
  examples: string[];
}

export interface TechDeck {
  id: string;
  title: string;
  subtitle: string;
  days: TechDay[];
}

export const DECK_FIELD_GRADING: TechDeck = {
  id: "DECK_FIELD_GRADING",
  title: "고전압 절연·전계 완화 기술영어 치트시트",
  subtitle: "글로벌 엔지니어링 미팅 & 논문 발표 핵심 표현 4주 완성 (Day 1-28)",
  days: [
  {
    id: 1,
    week: 1,
    vocab: [
      { en: "voltage", ko: "전압" },
      { en: "electric field", ko: "전계" },
      { en: "insulation", ko: "절연" },
      { en: "reliability", ko: "신뢰성" },
      { en: "performance", ko: "성능" },
      { en: "material", ko: "소재" },
      { en: "system", ko: "시스템" },
      { en: "design", ko: "설계" },
    ],
    pattern_en: "X affects Y.",
    pattern_ko: "X는 Y에 영향을 준다",
    examples: [
      "The operating voltage affects the electric field.",
      "This design affects system reliability.",
    ],
  },
  {
    id: 2,
    week: 1,
    vocab: [
      { en: "high voltage", ko: "고전압" },
      { en: "electrical stress", ko: "전기적 스트레스" },
      { en: "concentration", ko: "집중" },
      { en: "distribution", ko: "분포" },
      { en: "failure", ko: "고장" },
      { en: "degradation", ko: "열화" },
      { en: "lifetime", ko: "수명" },
      { en: "defect", ko: "결함" },
    ],
    pattern_en: "X can lead to Y.",
    pattern_ko: "X는 Y를 초래할 수 있다",
    examples: [
      "Field concentration can lead to insulation failure.",
    ],
  },
  {
    id: 3,
    week: 1,
    vocab: [
      { en: "reduce", ko: "감소" },
      { en: "increase", ko: "증가" },
      { en: "improve", ko: "개선" },
      { en: "control", ko: "제어" },
      { en: "withstand", ko: "견디다" },
      { en: "prevent", ko: "방지" },
      { en: "optimize", ko: "최적화" },
      { en: "maintain", ko: "유지" },
    ],
    pattern_en: "We need to + [V].",
    pattern_ko: "우리는 ~해야 한다",
    examples: [
      "We need to reduce the peak electric field.",
      "We need to maintain insulation performance.",
    ],
  },
  {
    id: 4,
    week: 1,
    vocab: [
      { en: "conductor", ko: "도체" },
      { en: "electrode", ko: "전극" },
      { en: "grounded screen", ko: "접지스크린" },
      { en: "interface", ko: "계면" },
      { en: "edge", ko: "모서리" },
      { en: "triple point", ko: "삼중점" },
      { en: "cable termination", ko: "종단" },
      { en: "cable joint", ko: "접속부" },
    ],
    pattern_en: "The field is concentrated at/in/near X.",
    pattern_ko: "전계가 X에 집중된다",
    examples: [
      "The electric field is concentrated near the screen cut.",
    ],
  },
  {
    id: 5,
    week: 1,
    vocab: [
      { en: "partial discharge", ko: "부분방전" },
      { en: "flashover", ko: "섬락" },
      { en: "breakdown", ko: "절연파괴" },
      { en: "space charge", ko: "공간전하" },
      { en: "electrical treeing", ko: "트리잉" },
      { en: "corona discharge", ko: "코로나" },
    ],
    pattern_en: "X occurs when Y exceeds Z.",
    pattern_ko: "Y가 Z를 초과할 때 X 발생",
    examples: [
      "Partial discharge occurs when the local field exceeds the dielectric strength.",
    ],
  },
  {
    id: 6,
    week: 1,
    vocab: [
      { en: "dielectric strength", ko: "절연강도" },
      { en: "permittivity", ko: "유전율" },
      { en: "conductivity", ko: "전도도" },
      { en: "resistivity", ko: "비저항" },
      { en: "impedance", ko: "임피던스" },
      { en: "dielectric loss", ko: "유전손실" },
    ],
    pattern_en: "X is higher/lower than Y.",
    pattern_ko: "X가 Y보다 높다/낮다",
    examples: [
      "The conductivity is higher than that of the reference sample.",
    ],
  },
  {
    id: 7,
    week: 1,
    vocab: [
      { en: "review", ko: "검토" },
      { en: "summarize", ko: "요약" },
      { en: "clarify", ko: "명확화" },
      { en: "confirm", ko: "확인" },
      { en: "discuss", ko: "논의" },
      { en: "agree", ko: "동의" },
      { en: "concern", ko: "우려" },
      { en: "action item", ko: "실행항목" },
    ],
    pattern_en: "Let me summarize the key point.",
    pattern_ko: "핵심 사항을 요약하겠습니다",
    examples: [
      "Let me summarize the key point: the field peak must be reduced.",
    ],
  },
  {
    id: 8,
    week: 2,
    vocab: [
      { en: "polymer", ko: "고분자" },
      { en: "composite", ko: "복합재" },
      { en: "matrix", ko: "모재" },
      { en: "filler", ko: "충전재" },
      { en: "particle", ko: "입자" },
      { en: "additive", ko: "첨가제" },
      { en: "resin", ko: "수지" },
      { en: "silicone rubber", ko: "실리콘고무" },
    ],
    pattern_en: "X is used as the matrix/filler.",
    pattern_ko: "X가 모재/충전재로 사용된다",
    examples: [
      "Epoxy resin is used as the matrix.",
    ],
  },
  {
    id: 9,
    week: 2,
    vocab: [
      { en: "ZnO", ko: "산화아연" },
      { en: "SiC", ko: "탄화규소" },
      { en: "carbon black", ko: "카본블랙" },
      { en: "CNT", ko: "탄소나노튜브" },
      { en: "graphene oxide", ko: "산화그래핀" },
      { en: "microvaristor", ko: "마이크로바리스터" },
    ],
    pattern_en: "We selected X because it provides Y.",
    pattern_ko: "Y를 제공하기 때문에 X를 선택함",
    examples: [
      "We selected ZnO because it provides nonlinear conductivity.",
    ],
  },
  {
    id: 10,
    week: 2,
    vocab: [
      { en: "filler concentration", ko: "농도" },
      { en: "volume fraction", ko: "체적분율" },
      { en: "weight fraction", ko: "중량분율" },
      { en: "percolation threshold", ko: "임계값" },
      { en: "conduction path", ko: "전도경로" },
    ],
    pattern_en: "As X increases, Y decreases/increases.",
    pattern_ko: "X 증가에 따라 Y 감소/증가",
    examples: [
      "As the filler concentration increases, the switching field decreases.",
    ],
  },
  {
    id: 11,
    week: 2,
    vocab: [
      { en: "particle size", ko: "입자크기" },
      { en: "grain size", ko: "결정립크기" },
      { en: "morphology", ko: "형상" },
      { en: "spherical", ko: "구형" },
      { en: "irregular", ko: "불규칙" },
      { en: "diameter", ko: "직경" },
      { en: "aspect ratio", ko: "종횡비" },
    ],
    pattern_en: "The result strongly depends on X.",
    pattern_ko: "결과는 X에 크게 의존한다",
    examples: [
      "The result strongly depends on particle size and morphology.",
    ],
  },
  {
    id: 12,
    week: 2,
    vocab: [
      { en: "nonlinear conduction", ko: "비선형전도" },
      { en: "linear", ko: "선형" },
      { en: "threshold field", ko: "임계전계" },
      { en: "switching field", ko: "스위칭전계" },
      { en: "current density", ko: "전류밀도" },
    ],
    pattern_en: "X remains constant until Y.",
    pattern_ko: "Y에 도달할 때까지 X는 일정함",
    examples: [
      "The resistivity remains constant until the switching voltage is reached.",
    ],
  },
  {
    id: 13,
    week: 2,
    vocab: [
      { en: "tunneling", ko: "터널링" },
      { en: "hopping conduction", ko: "호핑전도" },
      { en: "charge carrier", ko: "전하운반자" },
      { en: "potential barrier", ko: "퍼텐셜장벽" },
      { en: "interface barrier", ko: "계면장벽" },
    ],
    pattern_en: "When X exceeds Y, Z occurs.",
    pattern_ko: "X가 Y를 초과하면 Z 발생",
    examples: [
      "When the field exceeds the threshold, tunneling occurs.",
    ],
  },
  {
    id: 14,
    week: 2,
    vocab: [
      { en: "measurement", ko: "측정" },
      { en: "sample", ko: "시편" },
      { en: "reference sample", ko: "기준시편" },
      { en: "result", ko: "결과" },
      { en: "data", ko: "데이터" },
      { en: "curve", ko: "곡선" },
      { en: "trend", ko: "경향" },
      { en: "comparison", ko: "비교" },
    ],
    pattern_en: "The data show that [문장].",
    pattern_ko: "데이터는 ~임을 보여준다",
    examples: [
      "The data show that the composite has a lower switching field.",
    ],
  },
  {
    id: 15,
    week: 3,
    vocab: [
      { en: "cause", ko: "원인" },
      { en: "effect", ko: "영향" },
      { en: "mechanism", ko: "메커니즘" },
      { en: "factor", ko: "요인" },
      { en: "due to", ko: "~때문에" },
      { en: "result in", ko: "초래하다" },
    ],
    pattern_en: "This may be due to X.",
    pattern_ko: "이것은 X 때문일 수 있다",
    examples: [
      "This increase may be due to improved particle connectivity.",
    ],
  },
  {
    id: 16,
    week: 3,
    vocab: [
      { en: "significant", ko: "유의미한" },
      { en: "gradual", ko: "점진적" },
      { en: "dramatic", ko: "급격한" },
      { en: "slight", ko: "미세한" },
      { en: "uniform", ko: "균일한" },
      { en: "nonuniform", ko: "불균일한" },
    ],
    pattern_en: "We observed a significant / slight increase in X.",
    pattern_ko: "X에서 유의미한/미세한 증가 관찰",
    examples: [
      "We observed a significant increase in conductivity.",
    ],
  },
  {
    id: 17,
    week: 3,
    vocab: [
      { en: "maximum", ko: "최대" },
      { en: "minimum", ko: "최소" },
      { en: "peak", ko: "피크" },
      { en: "local field", ko: "국부전계" },
      { en: "critical region", ko: "위험구역" },
      { en: "hotspot", ko: "핫스팟" },
    ],
    pattern_en: "The maximum value is observed at X.",
    pattern_ko: "최대값은 X에서 관찰된다",
    examples: [
      "The maximum electric field is observed at the electrode edge.",
    ],
  },
  {
    id: 18,
    week: 3,
    vocab: [
      { en: "limitation", ko: "한계" },
      { en: "challenge", ko: "과제" },
      { en: "trade-off", ko: "상충관계" },
      { en: "overheating", ko: "과열" },
      { en: "Joule heating", ko: "줄가열" },
      { en: "thermal management", ko: "열관리" },
    ],
    pattern_en: "The main limitation is X.",
    pattern_ko: "주요 한계점은 X이다",
    examples: [
      "The main limitation is Joule heating at high conductivity.",
    ],
  },
  {
    id: 19,
    week: 3,
    vocab: [
      { en: "simulation", ko: "해석" },
      { en: "FEM", ko: "유한요소법" },
      { en: "model", ko: "모델" },
      { en: "assumption", ko: "가정" },
      { en: "boundary condition", ko: "경계조건" },
      { en: "validate", ko: "검증" },
    ],
    pattern_en: "The simulation indicates that [문장].",
    pattern_ko: "시뮬레이션은 ~임을 가리킨다",
    examples: [
      "The simulation indicates that the coating reduces the field peak.",
    ],
  },
  {
    id: 20,
    week: 3,
    vocab: [
      { en: "propose", ko: "제안" },
      { en: "recommend", ko: "권고" },
      { en: "evaluate", ko: "평가" },
      { en: "investigate", ko: "조사" },
      { en: "verify", ko: "검증" },
      { en: "modify", ko: "수정" },
    ],
    pattern_en: "We recommend that we + [V].",
    pattern_ko: "우리가 ~할 것을 권고한다",
    examples: [
      "We recommend that we evaluate both AC and DC conditions.",
    ],
  },
  {
    id: 21,
    week: 3,
    vocab: [
      { en: "uncertainty", ko: "불확실성" },
      { en: "repeatability", ko: "재현성" },
      { en: "variation", ko: "편차" },
      { en: "deviation", ko: "차이" },
      { en: "accuracy", ko: "정확도" },
      { en: "test condition", ko: "시험조건" },
    ],
    pattern_en: "Could you clarify how X was measured?",
    pattern_ko: "X가 어떻게 측정되었는지 설명 요망",
    examples: [
      "Could you clarify how the switching field was measured?",
    ],
  },
  {
    id: 22,
    week: 4,
    vocab: [
      { en: "objective", ko: "목적" },
      { en: "scope", ko: "범위" },
      { en: "requirement", ko: "요구사항" },
      { en: "target", ko: "목표" },
      { en: "specification", ko: "사양" },
      { en: "criteria", ko: "기준" },
    ],
    pattern_en: "The objective of this study is to + [V].",
    pattern_ko: "본 연구의 목적은 ~이다",
    examples: [
      "The objective of this study is to improve field grading performance.",
    ],
  },
  {
    id: 23,
    week: 4,
    vocab: [
      { en: "proposal", ko: "제안" },
      { en: "option", ko: "선택지" },
      { en: "alternative", ko: "대안" },
      { en: "approach", ko: "접근법" },
      { en: "feasibility", ko: "실현가능성" },
      { en: "implementation", ko: "구현" },
    ],
    pattern_en: "We have two options: A and B.",
    pattern_ko: "A와 B 두 가지 선택지가 있다",
    examples: [
      "We have two options: geometric grading and nonlinear resistive grading.",
    ],
  },
  {
    id: 24,
    week: 4,
    vocab: [
      { en: "advantage", ko: "장점" },
      { en: "disadvantage", ko: "단점" },
      { en: "benefit", ko: "이점" },
      { en: "risk", ko: "위험" },
      { en: "cost", ko: "비용" },
      { en: "compact design", ko: "소형설계" },
    ],
    pattern_en: "The main advantage of X is Y.",
    pattern_ko: "X의 주요 장점은 Y이다",
    examples: [
      "The main advantage of this approach is its compact design.",
    ],
  },
  {
    id: 25,
    week: 4,
    vocab: [
      { en: "align", ko: "배향하다" },
      { en: "orientation", ko: "배향" },
      { en: "anisotropic", ko: "이방성" },
      { en: "graded distribution", ko: "경사분포" },
      { en: "centrifugal force", ko: "원심력" },
    ],
    pattern_en: "X is aligned parallel to Y.",
    pattern_ko: "X는 Y와 평행하게 배향된다",
    examples: [
      "The fillers are aligned parallel to the electric field.",
    ],
  },
  {
    id: 26,
    week: 4,
    vocab: [
      { en: "cable accessory", ko: "접속재" },
      { en: "motor winding", ko: "권선" },
      { en: "stator bar", ko: "고정자바" },
      { en: "IGBT module", ko: "IGBT모듈" },
      { en: "spacer", ko: "스페이서" },
    ],
    pattern_en: "This material can be applied to X.",
    pattern_ko: "이 소재는 X에 적용될 수 있다",
    examples: [
      "This material can be applied to HVDC cable terminations.",
    ],
  },
  {
    id: 27,
    week: 4,
    vocab: [
      { en: "schedule", ko: "일정" },
      { en: "deadline", ko: "마감일" },
      { en: "owner", ko: "담당자" },
      { en: "next step", ko: "다음단계" },
      { en: "deliverable", ko: "산출물" },
      { en: "follow-up", ko: "후속조치" },
    ],
    pattern_en: "The next step is to + [V].",
    pattern_ko: "다음 단계는 ~하는 것이다",
    examples: [
      "The next step is to prepare additional samples.",
    ],
  },
  {
    id: 28,
    week: 4,
    vocab: [
      { en: "conclusion", ko: "결론" },
      { en: "key finding", ko: "핵심결과" },
      { en: "evidence", ko: "근거" },
      { en: "recommendation", ko: "권고" },
      { en: "decision", ko: "결정" },
    ],
    pattern_en: "Based on the results, we recommend X.",
    pattern_ko: "결과를 바탕으로 X를 권고함",
    examples: [
      "Based on the results, we recommend the ZnO-filled silicone composite.",
    ],
  },
  ],
};

export const DECK_SATURATION: TechDeck = {
  id: "DECK_SATURATION",
  title: "고전압 절연·전계 완화 기술영어 치트시트",
  subtitle: "비선형 포화 특성(Saturation)·저항 발열·시뮬레이션 최적화 마스터 (2주 완성 집중판, Day 1-14)",
  days: [
  {
    id: 1,
    week: 1,
    vocab: [
      { en: "saturation", ko: "포화" },
      { en: "saturated conductivity", ko: "포화전도도" },
      { en: "nonlinear conductivity", ko: "비선형전도도" },
      { en: "electric field", ko: "전계" },
      { en: "field strength", ko: "전계세기" },
    ],
    pattern_en: "X increases with Y.",
    pattern_ko: "X는 Y에 따라 증가한다",
    examples: [
      "The conductivity increases with electric field strength.",
    ],
  },
  {
    id: 2,
    week: 1,
    vocab: [
      { en: "threshold field", ko: "임계전계" },
      { en: "critical field", ko: "임계전계" },
      { en: "low-field conductivity", ko: "저전계전도도" },
      { en: "high-field region", ko: "고전계영역" },
    ],
    pattern_en: "X remains constant at low Y.",
    pattern_ko: "낮은 Y에서 X는 일정하게 유지됨",
    examples: [
      "The conductivity remains constant at low field strengths.",
    ],
  },
  {
    id: 3,
    week: 1,
    vocab: [
      { en: "saturation starts to set in", ko: "포화시작" },
      { en: "saturation knee point", ko: "무릎점" },
      { en: "critical point", ko: "임계점" },
      { en: "nonlinear regime", ko: "비선형영역" },
    ],
    pattern_en: "X starts to increase above Y.",
    pattern_ko: "Y 이상에서 X가 증가하기 시작함",
    examples: [
      "The conductivity starts to increase above the threshold field.",
    ],
  },
  {
    id: 4,
    week: 1,
    vocab: [
      { en: "resistive heating", ko: "저항발열" },
      { en: "heating density", ko: "발열밀도" },
      { en: "heat generation", ko: "열발생" },
      { en: "overheating", ko: "과열" },
      { en: "thermal runaway", ko: "열폭주" },
    ],
    pattern_en: "X results in Y.",
    pattern_ko: "X는 Y(결과)를 초래한다",
    examples: [
      "Current flow inside the FGM results in resistive heating.",
    ],
  },
  {
    id: 5,
    week: 1,
    vocab: [
      { en: "field grading", ko: "전계완화" },
      { en: "field-grading efficiency", ko: "완화효율" },
      { en: "field-stress reduction", ko: "스트레스저감" },
      { en: "peak stress", ko: "피크스트레스" },
    ],
    pattern_en: "X is used to reduce Y.",
    pattern_ko: "X는 Y를 낮추기 위해 사용된다",
    examples: [
      "FGM is used to reduce peak electrical stress.",
    ],
  },
  {
    id: 6,
    week: 1,
    vocab: [
      { en: "conductor", ko: "도체" },
      { en: "grounded conductor", ko: "접지도체" },
      { en: "voltage drop", ko: "전압강하" },
      { en: "voltage gradient", ko: "전압기울기" },
    ],
    pattern_en: "X is evenly distributed along Y.",
    pattern_ko: "X는 Y를 따라 균일하게 분포됨",
    examples: [
      "The voltage drop is evenly distributed along the FGM tube.",
    ],
  },
  {
    id: 7,
    week: 1,
    vocab: [
      { en: "flashover", ko: "섬락" },
      { en: "breakdown", ko: "절연파괴" },
      { en: "thermal breakdown", ko: "열적파괴" },
      { en: "sharp edge", ko: "날카로운 모서리" },
      { en: "vicinity", ko: "주변부" },
    ],
    pattern_en: "X may lead to Y.",
    pattern_ko: "X는 Y로 이어질 수 있다",
    examples: [
      "Excessive heating may lead to thermal breakdown.",
    ],
  },
  {
    id: 8,
    week: 2,
    vocab: [
      { en: "simulation", ko: "해석" },
      { en: "FEA", ko: "유한요소해석" },
      { en: "model", ko: "모델" },
      { en: "parameter", ko: "매개변수" },
      { en: "geometry", ko: "형상" },
    ],
    pattern_en: "We performed simulations to evaluate X.",
    pattern_ko: "X를 평가하기 위해 시뮬레이션 수행",
    examples: [
      "We performed simulations to evaluate the saturation effect.",
    ],
  },
  {
    id: 9,
    week: 2,
    vocab: [
      { en: "axisymmetric", ko: "축대칭" },
      { en: "DC bushing", ko: "직류부싱" },
      { en: "cable termination", ko: "케이블종단" },
      { en: "annular tube", ko: "환형튜브" },
    ],
    pattern_en: "The model consists of X and Y.",
    pattern_ko: "모델은 X와 Y로 구성된다",
    examples: [
      "The model consists of a DC bushing and an FGM tube.",
    ],
  },
  {
    id: 10,
    week: 2,
    vocab: [
      { en: "tangential electric field", ko: "접선전계" },
      { en: "maximum field stress", ko: "최대전계스트레스" },
      { en: "local heating density", ko: "국부발열밀도" },
    ],
    pattern_en: "The maximum value is found near X.",
    pattern_ko: "최대값은 X 근처에서 발견된다",
    examples: [
      "The maximum field stress is found near the upper electrode.",
    ],
  },
  {
    id: 11,
    week: 2,
    vocab: [
      { en: "optimize", ko: "최적화" },
      { en: "optimal value", ko: "최적값" },
      { en: "robust solution", ko: "강건한해법" },
      { en: "trade-off", ko: "상충관계" },
    ],
    pattern_en: "There is an optimal value of X at which Y is minimized.",
    pattern_ko: "Y가 최소화되는 X의 최적값이 존재",
    examples: [
      "There is an optimal value of Ec at which electric stress is minimized.",
    ],
  },
  {
    id: 12,
    week: 2,
    vocab: [
      { en: "degradation", ko: "성능저하" },
      { en: "insignificant", ko: "무시할만한" },
      { en: "significant", ko: "유의미한" },
      { en: "sensitive to", ko: "민감한" },
    ],
    pattern_en: "X becomes significant when Y.",
    pattern_ko: "Y일 때 X가 두드러지게 나타난다",
    examples: [
      "Saturation becomes significant when Es is close to Ec.",
    ],
  },
  {
    id: 13,
    week: 2,
    vocab: [
      { en: "vary independently", ko: "독립변화" },
      { en: "keep X constant", ko: "X를 일정유지" },
      { en: "comparison", ko: "비교" },
      { en: "trend", ko: "경향" },
    ],
    pattern_en: "By varying X, we can assess Y.",
    pattern_ko: "X를 변화시킴으로써 Y를 평가 가능",
    examples: [
      "By varying Ec and Es, we can assess the effect on heating.",
    ],
  },
  {
    id: 14,
    week: 2,
    vocab: [
      { en: "recommend", ko: "권고" },
      { en: "estimate", ko: "추정" },
      { en: "validate", ko: "검증" },
      { en: "application-specific", ko: "적용별" },
    ],
    pattern_en: "We recommend numerical simulations for X.",
    pattern_ko: "X를 위한 수치해석 수행을 권고함",
    examples: [
      "We recommend numerical simulations for each application.",
    ],
  },
  ],
};

export const TECH_DECKS: TechDeck[] = [DECK_FIELD_GRADING, DECK_SATURATION];

export function getTechDeck(id: string): TechDeck | undefined {
  return TECH_DECKS.find((d) => d.id === id);
}

export function getTechDay(deckId: string, dayId: number): TechDay | undefined {
  return getTechDeck(deckId)?.days.find((d) => d.id === dayId);
}

export const DECK_FIELD_GRADING_CORE_SENTENCES: string[] = [
  "The electric field is concentrated near the electrode edge. | 전계가 전극 모서리 근처에 집중됩니다.",
  "This concentration may lead to partial discharge. | 이 집중은 부분방전으로 이어질 수 있습니다.",
  "We need to reduce the maximum electric field. | 최대 전계를 낮춰야 합니다.",
  "The conductivity increases as the filler concentration increases. | 충전재 농도가 증가할수록 전도도가 증가합니다.",
  "The switching field decreases with increasing particle size. | 입자 크기가 증가할수록 스위칭 전계는 감소합니다.",
  "The result depends on the filler type, size, and distribution. | 결과는 충전재 종류, 크기, 분포에 따라 달라집니다.",
  "The simulation results are consistent with the experimental data. | 시뮬레이션 결과는 실험 데이터와 일치합니다.",
  "Could you clarify the test conditions? | 시험 조건을 설명해 주시겠습니까?",
  "We should consider the trade-off between conductivity and heating. | 전도도와 발열 간의 상충관계를 고려해야 합니다.",
  "Based on the results, this approach is suitable for field grading. | 결과에 따르면, 이 접근법은 전계 완화에 적합합니다.",
];

export const DECK_FIELD_GRADING_FORMULAS: { label: string; sentence: string }[] = [
  { label: "원인 → 결과", sentence: "Higher filler concentration leads to lower switching fields." },
  { label: "조건 → 현상", sentence: "When the electric field exceeds the threshold, tunneling occurs." },
  { label: "비교 / 대조", sentence: "The aligned composite shows higher conductivity than the random composite." },
  { label: "기술적 제안", sentence: "We recommend evaluating the material under high-temperature conditions." },
  { label: "추정 / 메커니즘", sentence: "This may be due to the formation of additional conduction paths." },
];

export const DECK_SATURATION_CORE_SENTENCES: string[] = [
  "The conductivity increases rapidly above the threshold field. | 전도도는 임계 전계 이상에서 빠르게 증가합니다.",
  "At very high fields, the material reaches conductivity saturation. | 매우 높은 전계에서 재료는 전도도 포화에 도달합니다.",
  "Early saturation can weaken the field-grading effect. | 이른 포화는 전계 완화 효과를 약화시킬 수 있습니다.",
  "FGM must provide sufficient grading without excessive heating. | FGM은 과도한 발열 없이 충분한 전계 완화 성능을 제공해야 합니다.",
  "We need to consider the trade-off between stress reduction and heating. | 전계 스트레스 저감과 발열 간의 상충관계를 고려해야 합니다.",
  "The maximum field stress occurs near the upper electrode. | 최대 전계 스트레스는 상부 전극 근처에서 발생합니다.",
  "The simulation shows a significant reduction in peak field. | 시뮬레이션은 피크 전계의 유의미한 감소를 보여줍니다.",
  "The heating density increases as the threshold field decreases. | 임계 전계가 낮아질수록 발열 밀도는 증가합니다.",
  "The result is sensitive to the ratio of Es to Ec. | 결과는 Es와 Ec의 비율에 민감합니다.",
  "This condition provides an optimal and robust solution. | 이 조건은 최적이면서 강건한 해법을 제공합니다.",
  "The conclusion depends on the geometry and applied voltage. | 결론은 형상 및 인가 전압에 따라 달라집니다.",
  "We recommend validating the design through numerical simulation. | 수치해석을 통해 설계를 검증하는 것을 권고합니다.",
];

export const DECK_SATURATION_QNA: { q_en: string; q_ko: string; a_en: string; a_ko: string }[] = [
  { q_en: "What is the main risk at high electric fields?", q_ko: "고전계에서 주요 리스크는 무엇입니까?", a_en: "The main risk is conductivity saturation and excessive resistive heating.", a_ko: "주요 리스크는 전도도 포화와 과도한 저항 발열입니다." },
  { q_en: "How does saturation affect the field-grading performance?", q_ko: "포화는 전계 완화 성능에 어떤 영향을 줍니까?", a_en: "If saturation occurs too early, the peak electric field can increase again.", a_ko: "포화가 너무 일찍 발생하면 피크 전계가 다시 상승합니다." },
  { q_en: "What is the recommended next step?", q_ko: "권장되는 다음 단계는 무엇입니까?", a_en: "We should run application-specific simulations and evaluate both electric stress and heating density.", a_ko: "애플리케이션별 시뮬레이션으로 전계와 발열을 동시 평가해야 합니다." },
];

export const DECK_SATURATION_VARS: { symbol: string; en: string; ko: string }[] = [
  { symbol: "σ0", en: "Low-field conductivity", ko: "저전계 기저 전도도" },
  { symbol: "E_c", en: "Threshold / Critical field", ko: "비선형 전도 증가 시작 전계" },
  { symbol: "E_s", en: "Saturation field", ko: "전도도 포화 시작 전계" },
  { symbol: "α", en: "Nonlinearity coefficient", ko: "비선형 전도 증가 지수(기울기)" },
  { symbol: "E_s / E_c", en: "Saturation-to-threshold ratio", ko: "포화 시작점과 임계 전계의 비율" },
];

export const DECK_SATURATION_TAKEAWAY = "E_c가 너무 낮으면 포화로 인해 피크 전계가 다시 상승함. 본 부싱 모델 기준 E_c ≈ 4×10^8 V/m 수준에 최적/강건(Robust) 조건.";
