'use client';

import { useCallback, useMemo, useState } from 'react';
import { useKakaoShare } from '@/lib/useKakaoShare';
import { useLocale } from 'next-intl';

// ── 언어 타입 ─────────────────────────────────────────────
type Lang = 'ko' | 'en';

// ── 번역 텍스트 ───────────────────────────────────────────
const T = {
  ko: {
    badge: 'IPIP × MBTI 성향 분석',
    title: '나의 성격 유형 찾기',
    subtitle: 'feat. MBTI',
    selectPrompt: '검사 방식을 선택해주세요',
    quickBadge: '⚡ 추천',
    quickTitle: '빠른 검사',
    quickSub: '20문항 · 약 3분',
    quickDesc: '학술적으로 검증된 Mini-IPIP 문항으로 구성된 빠른 검사예요. 각 요인당 4문항(정방향 2 + 역방향 2)으로 신뢰도 높은 결과를 드립니다.',
    quickTags: ['외향성 4문항', '친화성 4문항', '성실성 4문항', '신경증 4문항', '개방성 4문항'],
    fullBadge: '🔬 정밀',
    fullTitle: '정밀 검사',
    fullSub: '50문항 · 약 10분',
    fullDesc: 'IPIP-50 전체 문항으로 더 정확하고 상세한 성격 분석 결과를 확인하세요. 각 요인별 세밀한 점수를 제공합니다.',
    fullTags: ['외향성 10문항', '친화성 10문항', '성실성 10문항', '신경증 10문항', '개방성 10문항'],
    notice: '※ IPIP는 공개된 학술 검사도구이며, 결과는 참고용입니다.\n빠른 검사는 Mini-IPIP (Donnellan et al., 2006) 기반입니다.',
    backBtn: '← 검사 선택으로',
    quickMode: '⚡ 빠른 검사 (20문항)',
    fullMode: '🔬 정밀 검사 (50문항)',
    progress: 'Progress',
    progressLabel: '진행률',
    answered: (a: number, t: number) => `${a}개 / ${t}개 응답 완료`,
    currentState: '현재 상태',
    answeredCount: (a: number) => `${a}개`,
    reset: '처음으로',
    submit: '결과 보기',
    resultComplete: '결과 분석 완료',
    resultTitle: '당신의 성향 프로파일',
    doAgain: '다시 하기',
    mbtiBase: 'IPIP 기반 유사 MBTI',
    similarType: '유사 유형',
    upgradeTitle: '🔬 더 정확한 결과가 궁금하다면?',
    upgradeDesc: '50문항 정밀 검사로 각 성향의 세밀한 점수와 더 신뢰도 높은 유형을 확인해보세요.',
    upgradeBtn: '정밀 검사 하기 →',
    avgScore: '평균 점수',
    currentLevel: '현재 수준',
    mbtiNotice: '※ 이 유형은 IPIP 점수를 기반으로 유사한 MBTI 유형을 도출한 것입니다. 공식 MBTI 결과와 다를 수 있으며, 참고용으로만 활용해주세요.',
    kakaoShare: '카카오톡으로 공유하기',
    credit: '다상담',
    questionNum: (n: number) => `${n}번`,
    reverseTag: '역채점',
    selectedScore: '선택 점수',
    choices: ['전혀 아니다', '아니다', '보통이다', '그렇다', '매우 그렇다'],
    alertMsg: (a: number, t: number) => `모든 문항에 응답해주세요. (${a}/${t})`,
    top1: 'TOP 1',
    axisLabels: {
      EI: { label: 'E / I', left: 'E 외향', right: 'I 내향' },
      NS: { label: 'N / S', left: 'N 직관', right: 'S 감각' },
      FT: { label: 'F / T', left: 'F 감정', right: 'T 사고' },
      JP: { label: 'J / P', left: 'J 판단', right: 'P 인식' },
    },
    levels: { vhigh: '매우 높음', high: '높음', mid: '보통', low: '낮음', vlow: '매우 낮음' },
    kakaoTitle: (type: string, nick: string) => `나의 성격 유형 ${type} · ${nick}`,
    kakaoDesc: (desc: string, mode: string) => `${desc} · ${mode} 결과`,
    kakaoModeQ: '빠른 검사(20문항)',
    kakaoModeF: '정밀 검사(50문항)',
    kakaoBtn: '나도 검사하기 →',
    kakaoPage: 'https://dasangdam.com/services/ipip',
    factorDescriptions: {
      외향성: '사교성, 활동성, 자기표현 성향',
      친화성: '배려, 공감, 협력 성향',
      성실성: '계획성, 책임감, 자기관리 성향',
      신경증: '불안, 예민함, 정서적 흔들림 정도',
      개방성: '호기심, 상상력, 새로운 경험 선호',
    },
  },
  en: {
    badge: 'IPIP × MBTI Personality Analysis',
    title: 'Find Your Personality Type',
    subtitle: 'feat. MBTI',
    selectPrompt: 'Choose your test type',
    quickBadge: '⚡ Recommended',
    quickTitle: 'Quick Test',
    quickSub: '20 questions · ~3 min',
    quickDesc: 'A fast test based on the academically validated Mini-IPIP. Each trait is measured by 4 items (2 forward + 2 reverse) for reliable results.',
    quickTags: ['Extraversion ×4', 'Agreeableness ×4', 'Conscientiousness ×4', 'Neuroticism ×4', 'Openness ×4'],
    fullBadge: '🔬 Detailed',
    fullTitle: 'Full Test',
    fullSub: '50 questions · ~10 min',
    fullDesc: 'Take the full IPIP-50 for a more accurate and detailed personality analysis with fine-grained scores for each trait.',
    fullTags: ['Extraversion ×10', 'Agreeableness ×10', 'Conscientiousness ×10', 'Neuroticism ×10', 'Openness ×10'],
    notice: '※ IPIP is an open-access academic assessment tool. Results are for reference only.\nQuick Test is based on Mini-IPIP (Donnellan et al., 2006).',
    backBtn: '← Back to selection',
    quickMode: '⚡ Quick Test (20 items)',
    fullMode: '🔬 Full Test (50 items)',
    progress: 'Progress',
    progressLabel: 'Completed',
    answered: (a: number, t: number) => `${a} / ${t} answered`,
    currentState: 'Status',
    answeredCount: (a: number) => `${a}`,
    reset: 'Start Over',
    submit: 'See Results',
    resultComplete: 'Analysis Complete',
    resultTitle: 'Your Personality Profile',
    doAgain: 'Try Again',
    mbtiBase: 'IPIP-based MBTI Estimate',
    similarType: 'Estimated Type',
    upgradeTitle: '🔬 Want a more accurate result?',
    upgradeDesc: 'Try the full 50-item test for detailed trait scores and a more reliable type estimate.',
    upgradeBtn: 'Take Full Test →',
    avgScore: 'Avg. Score',
    currentLevel: 'Level',
    mbtiNotice: '※ This type is estimated from IPIP scores and may differ from an official MBTI assessment. Use for reference only.',
    kakaoShare: 'Share on KakaoTalk',
    credit: 'Dasangdam',
    questionNum: (n: number) => `Q${n}`,
    reverseTag: 'Reverse',
    selectedScore: 'Score',
    choices: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    alertMsg: (a: number, t: number) => `Please answer all questions. (${a}/${t})`,
    top1: 'TOP 1',
    axisLabels: {
      EI: { label: 'E / I', left: 'E Extravert', right: 'I Introvert' },
      NS: { label: 'N / S', left: 'N Intuitive', right: 'S Sensing' },
      FT: { label: 'F / T', left: 'F Feeling', right: 'T Thinking' },
      JP: { label: 'J / P', left: 'J Judging', right: 'P Perceiving' },
    },
    levels: { vhigh: 'Very High', high: 'High', mid: 'Moderate', low: 'Low', vlow: 'Very Low' },
    kakaoTitle: (type: string, nick: string) => `My Personality Type: ${type} · ${nick}`,
    kakaoDesc: (desc: string, mode: string) => `${desc} · ${mode} result`,
    kakaoModeQ: 'Quick Test (20 items)',
    kakaoModeF: 'Full Test (50 items)',
    kakaoBtn: 'Take the test →',
    kakaoPage: 'https://dasangdam.com/en/services/ipip',
    factorDescriptions: {
      외향성: 'Sociability, assertiveness, positive emotions',
      친화성: 'Compassion, cooperation, trust',
      성실성: 'Organization, dependability, self-discipline',
      신경증: 'Anxiety, emotional instability, moodiness',
      개방성: 'Curiosity, imagination, openness to experience',
    },
  },
} as const;

// ── 타입 정의 ─────────────────────────────────────────────
type Factor = '외향성' | '친화성' | '성실성' | '신경증' | '개방성';
type Mode = 'select' | 'quick' | 'full';

type Question = {
  id: number;
  textKo: string;
  textEn: string;
  factor: Factor;
  reverse?: boolean;
};

// ── 문항 데이터 (한/영 병행) ──────────────────────────────
const allQuestions: Question[] = [
  { id: 1, textKo: '파티의 분위기 메이커다.', textEn: 'I am the life of the party.', factor: '외향성' },
  { id: 2, textKo: '타인에 대해 별로 관심이 없다.', textEn: "I don't talk a lot about other people.", factor: '친화성', reverse: true },
  { id: 3, textKo: '업무를 준비할 때 늘 철저하다.', textEn: 'I am always prepared.', factor: '성실성' },
  { id: 4, textKo: '쉽게 우울해지거나 기분이 가라앉는다.', textEn: 'I get stressed out easily.', factor: '신경증' },
  { id: 5, textKo: '새로운 아이디어에 관심이 많다.', textEn: 'I have a rich vocabulary.', factor: '개방성' },
  { id: 6, textKo: '말을 많이 하지 않는 편이다.', textEn: "I don't talk a lot.", factor: '외향성', reverse: true },
  { id: 7, textKo: '사람들의 감정에 공감한다.', textEn: "I am interested in people.", factor: '친화성' },
  { id: 8, textKo: '물건을 어지럽게 내버려 둔다.', textEn: 'I leave my belongings around.', factor: '성실성', reverse: true },
  { id: 9, textKo: '대부분의 시간 동안 편안함을 느낀다.', textEn: 'I am relaxed most of the time.', factor: '신경증', reverse: true },
  { id: 10, textKo: '추상적인 개념을 이해하는 데 어려움을 겪는다.', textEn: 'I have difficulty understanding abstract ideas.', factor: '개방성', reverse: true },
  { id: 11, textKo: '사람들 사이에서 편안함을 느낀다.', textEn: 'I feel comfortable around people.', factor: '외향성' },
  { id: 12, textKo: '사람들을 모욕하거나 비난하곤 한다.', textEn: 'I insult people.', factor: '친화성', reverse: true },
  { id: 13, textKo: '세부적인 사항까지 꼼꼼하게 챙긴다.', textEn: 'I pay attention to details.', factor: '성실성' },
  { id: 14, textKo: '걱정이 많다.', textEn: 'I worry about things.', factor: '신경증' },
  { id: 15, textKo: '상상력이 풍부하다.', textEn: 'I have a vivid imagination.', factor: '개방성' },
  { id: 16, textKo: '가급적 배경에 머물러 있으려 한다(나서지 않는다).', textEn: 'I keep in the background.', factor: '외향성', reverse: true },
  { id: 17, textKo: '타인의 감정에 깊이 공감한다.', textEn: "I sympathize with others' feelings.", factor: '친화성' },
  { id: 18, textKo: '일을 엉망으로 만드는 경향이 있다.', textEn: 'I make a mess of things.', factor: '성실성', reverse: true },
  { id: 19, textKo: '자주 우울함을 느낀다.', textEn: 'I often feel blue.', factor: '신경증' },
  { id: 20, textKo: '어려운 아이디어에는 관심이 없다.', textEn: 'I am not interested in abstract ideas.', factor: '개방성', reverse: true },
  { id: 21, textKo: '대화를 먼저 시작한다.', textEn: 'I start conversations.', factor: '외향성' },
  { id: 22, textKo: '타인의 문제에 관심이 없다.', textEn: "I am not interested in other people's problems.", factor: '친화성', reverse: true },
  { id: 23, textKo: '집안일(또는 업무)을 바로바로 처리한다.', textEn: 'I get chores done right away.', factor: '성실성' },
  { id: 24, textKo: '쉽게 화를 내거나 짜증을 낸다.', textEn: 'I get irritated easily.', factor: '신경증' },
  { id: 25, textKo: '뛰어난 상상력을 가지고 있다.', textEn: 'I have excellent ideas.', factor: '개방성' },
  { id: 26, textKo: '별로 할 말이 없는 편이다.', textEn: 'I have little to say.', factor: '외향성', reverse: true },
  { id: 27, textKo: '부드러운 마음(동정심)을 가지고 있다.', textEn: 'I have a soft heart.', factor: '친화성' },
  { id: 28, textKo: '종종 내 물건들을 제자리에 두지 않는다.', textEn: 'I often forget to put things back in their proper place.', factor: '성실성', reverse: true },
  { id: 29, textKo: '쉽게 속상해하거나 기분이 상한다.', textEn: 'I get upset easily.', factor: '신경증' },
  { id: 30, textKo: '추상적인 아이디어를 생각하는 것을 즐기지 않는다.', textEn: 'I do not have a good imagination.', factor: '개방성', reverse: true },
  { id: 31, textKo: '사람들의 관심을 끄는 것을 좋아한다.', textEn: 'I talk to a lot of different people at parties.', factor: '외향성' },
  { id: 32, textKo: '타인의 감정을 잘 이해한다.', textEn: "I feel others' emotions.", factor: '친화성' },
  { id: 33, textKo: '정해진 일정에 따라 움직인다.', textEn: 'I follow a schedule.', factor: '성실성' },
  { id: 34, textKo: '기분이 자주 바뀐다.', textEn: 'I have frequent mood swings.', factor: '신경증' },
  { id: 35, textKo: '사물을 이해하는 속도가 빠르다.', textEn: 'I am quick to understand things.', factor: '개방성' },
  { id: 36, textKo: '타인에게 나를 드러내지 않는다.', textEn: "I don't like to draw attention to myself.", factor: '외향성', reverse: true },
  { id: 37, textKo: '다른 사람들을 위해 시간을 낸다.', textEn: 'I take time out for others.', factor: '친화성' },
  { id: 38, textKo: '할 일을 자꾸 미룬다.', textEn: 'I shirk my duties.', factor: '성실성', reverse: true },
  { id: 39, textKo: '감정 기복이 심하다.', textEn: 'I am easily disturbed.', factor: '신경증' },
  { id: 40, textKo: '어려운 단어를 사용한다.', textEn: 'I use difficult words.', factor: '개방성' },
  { id: 41, textKo: '모임에서 주목받는 것을 꺼리지 않는다.', textEn: "I don't mind being the center of attention.", factor: '외향성' },
  { id: 42, textKo: '타인의 고통을 느낀다.', textEn: "I make people feel at ease.", factor: '친화성' },
  { id: 43, textKo: '항상 준비가 되어 있다.', textEn: 'I am exacting in my work.', factor: '성실성' },
  { id: 44, textKo: '쉽게 겁을 먹거나 당황한다.', textEn: 'I am easily frightened.', factor: '신경증' },
  { id: 45, textKo: '깊이 있는 사색(명상)을 즐긴다.', textEn: 'I spend time reflecting on things.', factor: '개방성' },
  { id: 46, textKo: '낯선 사람 주변에서는 조용한 편이다.', textEn: 'I am quiet around strangers.', factor: '외향성', reverse: true },
  { id: 47, textKo: '사람들을 편안하게 해준다.', textEn: 'I make people feel comfortable.', factor: '친화성' },
  { id: 48, textKo: '업무(공부)를 할 때 정확성을 기한다.', textEn: 'I carry out my plans.', factor: '성실성' },
  { id: 49, textKo: '자주 슬픔을 느낀다.', textEn: 'I feel threatened easily.', factor: '신경증' },
  { id: 50, textKo: '아이디어가 풍부하다.', textEn: 'I am full of ideas.', factor: '개방성' },
];

const quickQuestions: Question[] = [
  { id: 101, textKo: '나는 파티에서 분위기를 주도한다.', textEn: 'I am the life of the party.', factor: '외향성' },
  { id: 102, textKo: '나는 모임에서 많은 사람들과 대화한다.', textEn: 'I talk to a lot of different people at parties.', factor: '외향성' },
  { id: 103, textKo: '나는 말을 많이 하지 않는 편이다.', textEn: "I don't talk a lot.", factor: '외향성', reverse: true },
  { id: 104, textKo: '나는 가급적 뒤에 있으려 한다(나서지 않는다).', textEn: 'I keep in the background.', factor: '외향성', reverse: true },
  { id: 105, textKo: '나는 다른 사람들의 감정에 공감한다.', textEn: "I sympathize with others' feelings.", factor: '친화성' },
  { id: 106, textKo: '나는 타인의 감정을 함께 느낀다.', textEn: "I feel others' emotions.", factor: '친화성' },
  { id: 107, textKo: '나는 다른 사람들에게 별로 관심이 없다.', textEn: "I am not interested in other people.", factor: '친화성', reverse: true },
  { id: 108, textKo: '나는 타인의 문제에 관심이 없다.', textEn: "I am not interested in other people's problems.", factor: '친화성', reverse: true },
  { id: 109, textKo: '나는 집안일이나 할 일을 바로바로 처리한다.', textEn: 'I get chores done right away.', factor: '성실성' },
  { id: 110, textKo: '나는 질서와 정돈을 좋아한다.', textEn: 'I like order.', factor: '성실성' },
  { id: 111, textKo: '나는 물건을 제자리에 두지 않는 편이다.', textEn: 'I often forget to put things back in their proper place.', factor: '성실성', reverse: true },
  { id: 112, textKo: '나는 일을 엉망으로 만드는 경향이 있다.', textEn: 'I make a mess of things.', factor: '성실성', reverse: true },
  { id: 113, textKo: '나는 기분이 자주 바뀐다.', textEn: 'I have frequent mood swings.', factor: '신경증' },
  { id: 114, textKo: '나는 쉽게 속상해하거나 기분이 상한다.', textEn: 'I get upset easily.', factor: '신경증' },
  { id: 115, textKo: '나는 대부분의 시간 동안 편안함을 느낀다.', textEn: 'I am relaxed most of the time.', factor: '신경증', reverse: true },
  { id: 116, textKo: '나는 우울함을 잘 느끼지 않는다.', textEn: 'I seldom feel blue.', factor: '신경증', reverse: true },
  { id: 117, textKo: '나는 상상력이 풍부하다.', textEn: 'I have a vivid imagination.', factor: '개방성' },
  { id: 118, textKo: '나는 어려운 개념이나 추상적인 아이디어를 즐긴다.', textEn: 'I have a rich vocabulary.', factor: '개방성' },
  { id: 119, textKo: '나는 추상적인 개념을 이해하는 데 어려움을 겪는다.', textEn: 'I have difficulty understanding abstract ideas.', factor: '개방성', reverse: true },
  { id: 120, textKo: '나는 새로운 아이디어에 별로 관심이 없다.', textEn: 'I am not interested in abstract ideas.', factor: '개방성', reverse: true },
];

// ── MBTI 데이터 ──────────────────────────────────────────
const mbtiData: Record<string, {
  type: string; nicknameKo: string; nicknameEn: string;
  descKo: string; descEn: string; color: string; bg: string;
}> = {
  ENFJ: { type: 'ENFJ', nicknameKo: '선도자', nicknameEn: 'Protagonist', descKo: '카리스마 있는 리더. 사람들을 이끌고 영감을 주는 것을 즐깁니다.', descEn: 'A charismatic leader who enjoys inspiring and guiding others.', color: 'text-emerald-700', bg: 'from-emerald-50 to-teal-50' },
  ENFP: { type: 'ENFP', nicknameKo: '활동가', nicknameEn: 'Campaigner', descKo: '열정적인 자유로운 영혼. 창의적이고 사교적이며 새로운 가능성을 탐구합니다.', descEn: 'An enthusiastic, creative free spirit who explores new possibilities.', color: 'text-orange-700', bg: 'from-orange-50 to-amber-50' },
  ENTJ: { type: 'ENTJ', nicknameKo: '통솔자', nicknameEn: 'Commander', descKo: '대담한 전략가. 목표 지향적이고 효율을 중시하며 리더십이 강합니다.', descEn: 'A bold strategist who values efficiency and strong leadership.', color: 'text-red-700', bg: 'from-red-50 to-rose-50' },
  ENTP: { type: 'ENTP', nicknameKo: '변론가', nicknameEn: 'Debater', descKo: '논쟁을 즐기는 혁신가. 아이디어가 넘치고 지적 도전을 좋아합니다.', descEn: 'An innovative thinker who loves intellectual challenges and debate.', color: 'text-blue-700', bg: 'from-blue-50 to-indigo-50' },
  ESFJ: { type: 'ESFJ', nicknameKo: '집정관', nicknameEn: 'Consul', descKo: '배려심 깊은 사교가. 다른 사람을 돕고 조화를 만드는 것을 중요시합니다.', descEn: 'A caring, sociable person who values harmony and helping others.', color: 'text-pink-700', bg: 'from-pink-50 to-rose-50' },
  ESFP: { type: 'ESFP', nicknameKo: '연예인', nicknameEn: 'Entertainer', descKo: '즉흥적인 엔터테이너. 유쾌하고 활발하며 현재를 즐깁니다.', descEn: 'A spontaneous entertainer who is fun-loving and lives in the moment.', color: 'text-yellow-700', bg: 'from-yellow-50 to-orange-50' },
  ESTJ: { type: 'ESTJ', nicknameKo: '경영자', nicknameEn: 'Executive', descKo: '실용적인 관리자. 규칙과 질서를 중요시하고 책임감이 강합니다.', descEn: 'A practical administrator who values order, rules, and responsibility.', color: 'text-slate-700', bg: 'from-slate-50 to-gray-50' },
  ESTP: { type: 'ESTP', nicknameKo: '사업가', nicknameEn: 'Entrepreneur', descKo: '대담한 행동파. 현실적이고 에너지 넘치며 즉각적인 결과를 추구합니다.', descEn: 'An energetic risk-taker who pursues immediate, real-world results.', color: 'text-amber-700', bg: 'from-amber-50 to-yellow-50' },
  INFJ: { type: 'INFJ', nicknameKo: '옹호자', nicknameEn: 'Advocate', descKo: '통찰력 있는 이상주의자. 깊은 공감 능력과 강한 신념을 가집니다.', descEn: 'An insightful idealist with deep empathy and strong convictions.', color: 'text-purple-700', bg: 'from-purple-50 to-violet-50' },
  INFP: { type: 'INFP', nicknameKo: '중재자', nicknameEn: 'Mediator', descKo: '이상적인 몽상가. 진정성을 추구하고 내면의 가치를 소중히 여깁니다.', descEn: 'An idealistic dreamer who seeks authenticity and inner values.', color: 'text-teal-700', bg: 'from-teal-50 to-cyan-50' },
  INTJ: { type: 'INTJ', nicknameKo: '건축가', nicknameEn: 'Architect', descKo: '전략적인 사상가. 독립적이고 분석적이며 장기적 계획을 즐깁니다.', descEn: 'A strategic thinker who is independent, analytical, and long-term focused.', color: 'text-indigo-700', bg: 'from-indigo-50 to-blue-50' },
  INTP: { type: 'INTP', nicknameKo: '논리술사', nicknameEn: 'Logician', descKo: '혁신적인 발명가. 논리와 이론을 탐구하며 깊이 있는 사고를 즐깁니다.', descEn: 'An innovative inventor who loves logic, theory, and deep thinking.', color: 'text-cyan-700', bg: 'from-cyan-50 to-sky-50' },
  ISFJ: { type: 'ISFJ', nicknameKo: '수호자', nicknameEn: 'Defender', descKo: '헌신적인 보호자. 따뜻하고 세심하며 주변을 안정적으로 지킵니다.', descEn: 'A dedicated protector who is warm, attentive, and reliably supportive.', color: 'text-green-700', bg: 'from-green-50 to-emerald-50' },
  ISFP: { type: 'ISFP', nicknameKo: '모험가', nicknameEn: 'Adventurer', descKo: '유연한 예술가. 감성적이고 개방적이며 아름다움에 민감합니다.', descEn: 'A flexible artist who is sensitive, open, and attuned to beauty.', color: 'text-lime-700', bg: 'from-lime-50 to-green-50' },
  ISTJ: { type: 'ISTJ', nicknameKo: '현실주의자', nicknameEn: 'Logistician', descKo: '신뢰할 수 있는 실용가. 철저하고 책임감 있으며 전통을 중시합니다.', descEn: 'A reliable, thorough, and responsible person who values tradition.', color: 'text-stone-700', bg: 'from-stone-50 to-slate-50' },
  ISTP: { type: 'ISTP', nicknameKo: '만능재주꾼', nicknameEn: 'Virtuoso', descKo: '대담한 실험가. 논리적이고 실용적이며 문제 해결을 즐깁니다.', descEn: 'A bold experimenter who is logical, practical, and loves problem-solving.', color: 'text-zinc-700', bg: 'from-zinc-50 to-gray-50' },
};

// ── 스타일 ────────────────────────────────────────────────
const factorStyles: Record<Factor, { glow: string; ring: string; card: string; chip: string; bar: string; text: string }> = {
  외향성: { glow: 'from-orange-400 via-rose-400 to-pink-500', ring: 'ring-orange-200', card: 'from-orange-50 via-rose-50 to-pink-50', chip: 'bg-orange-100 text-orange-700', bar: 'from-orange-400 via-rose-500 to-pink-500', text: 'text-orange-700' },
  친화성: { glow: 'from-sky-400 via-cyan-400 to-teal-500', ring: 'ring-cyan-200', card: 'from-sky-50 via-cyan-50 to-teal-50', chip: 'bg-cyan-100 text-cyan-700', bar: 'from-sky-400 via-cyan-500 to-teal-500', text: 'text-cyan-700' },
  성실성: { glow: 'from-violet-400 via-fuchsia-400 to-purple-500', ring: 'ring-violet-200', card: 'from-violet-50 via-fuchsia-50 to-purple-50', chip: 'bg-violet-100 text-violet-700', bar: 'from-violet-400 via-fuchsia-500 to-purple-500', text: 'text-violet-700' },
  신경증: { glow: 'from-rose-400 via-red-400 to-amber-400', ring: 'ring-rose-200', card: 'from-rose-50 via-red-50 to-amber-50', chip: 'bg-rose-100 text-rose-700', bar: 'from-rose-400 via-red-500 to-amber-400', text: 'text-rose-700' },
  개방성: { glow: 'from-emerald-400 via-lime-400 to-green-500', ring: 'ring-emerald-200', card: 'from-emerald-50 via-lime-50 to-green-50', chip: 'bg-emerald-100 text-emerald-700', bar: 'from-emerald-400 via-lime-500 to-green-500', text: 'text-emerald-700' },
};

// 영문 요인명
const FACTOR_LABEL_EN: Record<Factor, string> = {
  외향성: 'Extraversion', 친화성: 'Agreeableness', 성실성: 'Conscientiousness', 신경증: 'Neuroticism', 개방성: 'Openness',
};

function getMBTI(scoreMap: Record<string, number>) {
  const E = scoreMap['외향성'] >= 3 ? 'E' : 'I';
  const N = scoreMap['개방성'] >= 3 ? 'N' : 'S';
  const F = scoreMap['친화성'] >= 3 ? 'F' : 'T';
  const J = scoreMap['성실성'] >= 3 ? 'J' : 'P';
  const key = `${E}${N}${F}${J}`;
  return mbtiData[key] ?? { type: key, nicknameKo: '탐색자', nicknameEn: 'Explorer', descKo: '독특한 성향의 소유자입니다.', descEn: 'A unique personality type all your own.', color: 'text-slate-700', bg: 'from-slate-50 to-gray-50' };
}

function cls(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(' ');
}

function computeScores(answers: Record<number, number>, questions: Question[], t: typeof T['ko'] | typeof T['en']) {
  const grouped: Record<Factor, number[]> = { 외향성: [], 친화성: [], 성실성: [], 신경증: [], 개방성: [] };
  questions.forEach((q) => {
    const raw = answers[q.id];
    if (!raw) return;
    const scored = q.reverse ? 6 - raw : raw;
    grouped[q.factor].push(scored);
  });
  return (Object.entries(grouped) as Array<[Factor, number[]]>)
    .map(([factor, arr]) => {
      const sum = arr.reduce((a, b) => a + b, 0);
      const avg = arr.length ? sum / arr.length : 0;
      const percent = avg ? ((avg - 1) / 4) * 100 : 0;
      const lvls: Record<string, string> = { ...t.levels };
      let level: string = lvls.low;
      if (avg >= 4) level = lvls.vhigh;
      else if (avg >= 3.4) level = lvls.high;
      else if (avg >= 2.6) level = lvls.mid;
      else if (avg >= 1.8) level = lvls.low;
      else level = lvls.vlow;
      return { factor, sum, avg, percent, level };
    })
    .sort((a, b) => b.avg - a.avg);
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function IpipPage() {
  const locale = useLocale();
  const lang: Lang = locale === 'en' ? 'en' : 'ko';
  const t = T[lang];
  const isEn = lang === 'en';

  const [mode, setMode] = useState<Mode>('select');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const { shareWithCapture } = useKakaoShare();

  const questions = mode === 'quick' ? quickQuestions : allQuestions;
  const totalAnswered = Object.keys(answers).filter(id => questions.find(q => q.id === Number(id))).length;
  const allAnswered = totalAnswered === questions.length;
  const progress = (totalAnswered / questions.length) * 100;

  const scores = useMemo(() => computeScores(answers, questions, t), [answers, questions, t]);
  const topFactor = scores[0];
  const mbtiResult = useMemo(() => {
    const scoreMap: Record<string, number> = {};
    scores.forEach((s) => { scoreMap[s.factor] = s.avg; });
    return getMBTI(scoreMap);
  }, [scores]);

  const handleSelect = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (!allAnswered) {
      alert(t.alertMsg(totalAnswered, questions.length));
      return;
    }
    setSubmitted(true);
    setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 100);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setMode('select');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpgrade = () => {
    setAnswers({});
    setSubmitted(false);
    setMode('full');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKakaoShare = useCallback(() => {
    if (!mbtiResult || !topFactor) return;
    const nick = isEn ? mbtiResult.nicknameEn : mbtiResult.nicknameKo;
    const desc = isEn ? mbtiResult.descEn : mbtiResult.descKo;
    const modeLabel = mode === 'quick' ? t.kakaoModeQ : t.kakaoModeF;
    shareWithCapture({
      captureId: 'ipip-capture',
      title: t.kakaoTitle(mbtiResult.type, nick),
      description: t.kakaoDesc(desc, modeLabel),
      buttonText: t.kakaoBtn,
      pageUrl: t.kakaoPage,
    });
  }, [mbtiResult, topFactor, mode, shareWithCapture, t, isEn]);

  // ── 모드 선택 화면 ──────────────────────────────────────
  if (mode === 'select') {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.25),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.20),_transparent_24%),linear-gradient(180deg,_#fff8fb_0%,_#f5f7ff_38%,_#eefaf7_100%)]">
        <div className="mx-auto max-w-2xl px-4 py-16 space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-slate-500 shadow-sm mb-4">
              {t.badge}
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">{t.title}</h1>
            <p className="mt-2 text-xl font-semibold text-slate-400">{t.subtitle}</p>
            <p className="mt-4 text-sm leading-7 text-slate-500">{t.selectPrompt}</p>
          </div>

          {/* 빠른 검사 카드 */}
          <button onClick={() => setMode('quick')} className="w-full text-left rounded-[28px] border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)] hover:border-orange-300">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 mb-3">{t.quickBadge}</div>
                <h2 className="text-2xl font-black text-slate-900">{t.quickTitle}</h2>
                <p className="mt-1 text-sm font-semibold text-orange-600">{t.quickSub}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{t.quickDesc}</p>
              </div>
              <div className="text-4xl">⚡</div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {t.quickTags.map(tag => (
                <span key={tag} className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">{tag}</span>
              ))}
            </div>
          </button>

          {/* 정밀 검사 카드 */}
          <button onClick={() => setMode('full')} className="w-full text-left rounded-[28px] border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)] hover:border-violet-300">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 mb-3">{t.fullBadge}</div>
                <h2 className="text-2xl font-black text-slate-900">{t.fullTitle}</h2>
                <p className="mt-1 text-sm font-semibold text-violet-600">{t.fullSub}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{t.fullDesc}</p>
              </div>
              <div className="text-4xl">🔬</div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {t.fullTags.map(tag => (
                <span key={tag} className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">{tag}</span>
              ))}
            </div>
          </button>

          <p className="text-center text-xs text-slate-400 whitespace-pre-line">{t.notice}</p>
        </div>
      </main>
    );
  }

  // ── 검사 & 결과 화면 ────────────────────────────────────
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.25),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.20),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(192,132,252,0.18),_transparent_24%),linear-gradient(180deg,_#fff8fb_0%,_#f5f7ff_38%,_#eefaf7_100%)]">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* 헤더 */}
        <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-8">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-fuchsia-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={handleReset} className="text-xs text-slate-400 hover:text-slate-600 transition">{t.backBtn}</button>
                <span className={cls('inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-sm', mode === 'quick' ? 'bg-orange-100 text-orange-700' : 'bg-violet-100 text-violet-700')}>
                  {mode === 'quick' ? t.quickMode : t.fullMode}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                {t.title}
                <span className="mt-1 block text-lg font-semibold text-slate-400">{t.subtitle}</span>
              </h1>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white/80 px-5 py-4 text-right shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t.progress}</div>
              <div className="mt-2 text-3xl font-black text-slate-900">{totalAnswered}<span className="text-lg text-slate-400"> / {questions.length}</span></div>
              <div className="mt-1 text-sm text-slate-500">{t.progressLabel} {progress.toFixed(0)}%</div>
            </div>
          </div>
          <div className="relative mt-6">
            <div className="h-5 overflow-hidden rounded-full bg-white/70 p-1 shadow-inner ring-1 ring-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 shadow-[0_8px_20px_rgba(99,102,241,0.45)] transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        {/* 결과 */}
        {submitted && topFactor && (
          <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-8">
            <div className={cls('absolute inset-x-0 top-0 h-2 bg-gradient-to-r', factorStyles[topFactor.factor].glow)} />

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-lg">{t.resultComplete}</div>
                <h2 className="mt-4 text-3xl font-black text-slate-900">{t.resultTitle}</h2>
              </div>
              <button onClick={handleReset} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                {t.doAgain}
              </button>
            </div>

            {/* MBTI 카드 */}
            <div className={cls('mt-6 rounded-[28px] border border-white/70 bg-gradient-to-br p-6 shadow-[0_18px_45px_rgba(15,23,42,0.10)]', mbtiResult.bg)}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">{t.mbtiBase}</div>
                  <div className="mt-3 flex items-end gap-4">
                    <div className={cls('text-6xl font-black tracking-tight', mbtiResult.color)}>{mbtiResult.type}</div>
                    <div className="mb-1">
                      <div className={cls('text-lg font-bold', mbtiResult.color)}>{isEn ? mbtiResult.nicknameEn : mbtiResult.nicknameKo}</div>
                      <div className="text-xs text-slate-400">{t.similarType}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{isEn ? mbtiResult.descEn : mbtiResult.descKo}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:w-56">
                  {[
                    { ...t.axisLabels.EI, factor: '외향성' },
                    { ...t.axisLabels.NS, factor: '개방성' },
                    { ...t.axisLabels.FT, factor: '친화성' },
                    { ...t.axisLabels.JP, factor: '성실성' },
                  ].map((axis) => {
                    const s = scores.find((x) => x.factor === axis.factor);
                    const avg = s?.avg ?? 3;
                    const isLeft = avg >= 3;
                    return (
                      <div key={axis.label} className="rounded-2xl bg-white/80 p-3 shadow-sm">
                        <div className="text-[10px] font-semibold text-slate-400 mb-1">{axis.label}</div>
                        <div className={cls('text-sm font-bold', isLeft ? 'text-slate-900' : 'text-slate-400')}>{isLeft ? axis.left : axis.right}</div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400" style={{ width: `${((avg - 1) / 4) * 100}%` }} />
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400">{avg.toFixed(1)}pt</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-white/60 p-4 text-xs leading-6 text-slate-500">
                {t.mbtiNotice}
              </div>
            </div>

            {/* 빠른 → 정밀 유도 */}
            {mode === 'quick' && (
              <div className="mt-6 rounded-[24px] border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm font-bold text-violet-700">{t.upgradeTitle}</div>
                  <p className="mt-1 text-sm text-slate-600">{t.upgradeDesc}</p>
                </div>
                <button onClick={handleUpgrade} className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(139,92,246,0.35)] transition hover:-translate-y-0.5 whitespace-nowrap">
                  {t.upgradeBtn}
                </button>
              </div>
            )}

            {/* Big Five 카드 */}
            <div className="mt-6 grid gap-4 xl:grid-cols-5 md:grid-cols-2">
              {scores.map((item, index) => {
                const style = factorStyles[item.factor];
                const isTop = index === 0;
                const factorLabel = isEn ? FACTOR_LABEL_EN[item.factor] : item.factor;
                const factorDesc = t.factorDescriptions[item.factor];
                return (
                  <div key={item.factor} className={cls('relative overflow-hidden rounded-[28px] border bg-gradient-to-br p-5 shadow-[0_18px_45px_rgba(15,23,42,0.10)] transition hover:-translate-y-1', style.card, style.ring, isTop && 'scale-[1.02]')}>
                    <div className={cls('absolute right-0 top-0 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl', style.glow)} />
                    {isTop && <div className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-slate-900 shadow-sm">{t.top1}</div>}
                    <div className={cls('inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-sm', style.chip)}>{factorLabel}</div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-3xl font-black text-slate-900">{item.avg.toFixed(2)}</div>
                        <div className="text-xs font-medium text-slate-500">{t.avgScore}</div>
                      </div>
                      <div className="rounded-2xl bg-white/80 px-3 py-2 text-right shadow-sm">
                        <div className="text-sm font-bold text-slate-900">{item.level}</div>
                        <div className="text-[11px] text-slate-500">{t.currentLevel}</div>
                      </div>
                    </div>
                    <p className="mt-4 min-h-[48px] text-sm leading-6 text-slate-600">{factorDesc}</p>
                    <div className="mt-5 h-4 overflow-hidden rounded-full bg-white/80 p-1 shadow-inner">
                      <div className={cls('h-full rounded-full bg-gradient-to-r', style.bar)} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 카카오 공유 */}
            <button onClick={handleKakaoShare}
              className="mt-6 w-full rounded-[24px] bg-[#FEE500] px-5 py-4 text-sm font-extrabold text-zinc-900 shadow-[0_8px_24px_rgba(254,229,0,0.4)] transition hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C6.477 3 2 6.71 2 11.28c0 2.913 1.792 5.481 4.5 7.012L5.5 21l3.663-1.98C10.005 19.33 10.99 19.5 12 19.5c5.523 0 10-3.71 10-8.22C22 6.71 17.523 3 12 3z" fill="#3C1E1E" />
              </svg>
              {t.kakaoShare}
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">
              {t.credit}{' '}
              <a href="https://dasangdam.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">dasangdam.com</a>
            </p>
          </section>
        )}

        {/* 질문 목록 */}
        <section className="space-y-5">
          {questions.map((q) => {
            const selected = answers[q.id];
            const style = factorStyles[q.factor];
            const factorLabel = isEn ? FACTOR_LABEL_EN[q.factor] : q.factor;
            const questionText = isEn ? q.textEn : q.textKo;
            const qNum = questions.indexOf(q) + 1;
            return (
              <article key={q.id} className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 md:p-6">
                <div className={cls('absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b', style.glow)} />
                <div className="pl-2">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white shadow-sm">{t.questionNum(qNum)}</span>
                        <span className={cls('rounded-full px-3 py-1 text-xs font-bold shadow-sm', style.chip)}>{factorLabel}</span>
                        {q.reverse && <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 shadow-sm">{t.reverseTag}</span>}
                      </div>
                      <h3 className="mt-4 text-lg font-bold leading-8 text-slate-900 md:text-xl">{questionText}</h3>
                    </div>
                    {selected && (
                      <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-center shadow-sm">
                        <div className="text-xs text-slate-400">{t.selectedScore}</div>
                        <div className="text-xl font-black text-slate-900">{selected}</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-5">
                    {t.choices.map((label, idx) => {
                      const val = idx + 1;
                      const active = selected === val;
                      return (
                        <label key={val} className={cls('group cursor-pointer rounded-[24px] border px-4 py-4 text-center transition-all duration-200', active ? `border-transparent bg-gradient-to-br ${style.glow} text-white shadow-[0_14px_30px_rgba(59,130,246,0.22)] scale-[1.02]` : 'border-slate-200 bg-white/90 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md')}>
                          <input type="radio" name={`question-${q.id}`} className="sr-only" value={val} checked={active} onChange={() => handleSelect(q.id, val)} />
                          <div className="text-lg font-black">{val}</div>
                          <div className={cls('mt-1 text-xs font-medium leading-tight', active ? 'text-white/90' : 'text-slate-500')}>{label}</div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* 하단 제출 바 */}
        <section className="sticky bottom-4 z-20">
          <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.14)] backdrop-blur-xl md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-500">{t.currentState}</div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  <span className="text-sky-600">{t.answeredCount(totalAnswered)}</span> / {questions.length} {isEn ? 'answered' : '응답 완료'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleReset} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  {t.reset}
                </button>
                <button onClick={handleSubmit} disabled={submitted} className="rounded-2xl bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(99,102,241,0.32)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">
                  {t.submit}
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
