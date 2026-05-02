'use client';

import { useMemo, useState } from 'react';

type Factor = '외향성' | '친화성' | '성실성' | '신경증' | '개방성';

type Question = {
  id: number;
  text: string;
  factor: Factor;
  reverse?: boolean;
};

const questions: Question[] = [
  { id: 1, text: '파티의 분위기 메이커다.', factor: '외향성' },
  { id: 2, text: '타인에 대해 별로 관심이 없다.', factor: '친화성', reverse: true },
  { id: 3, text: '업무를 준비할 때 늘 철저하다.', factor: '성실성' },
  { id: 4, text: '쉽게 우울해지거나 기분이 가라앉는다.', factor: '신경증' },
  { id: 5, text: '새로운 아이디어에 관심이 많다.', factor: '개방성' },
  { id: 6, text: '말을 많이 하지 않는 편이다.', factor: '외향성', reverse: true },
  { id: 7, text: '사람들의 감정에 공감한다.', factor: '친화성' },
  { id: 8, text: '물건을 어지럽게 내버려 둔다.', factor: '성실성', reverse: true },
  { id: 9, text: '대부분의 시간 동안 편안함을 느낀다.', factor: '신경증', reverse: true },
  { id: 10, text: '추상적인 개념을 이해하는 데 어려움을 겪는다.', factor: '개방성', reverse: true },
  { id: 11, text: '사람들 사이에서 편안함을 느낀다.', factor: '외향성' },
  { id: 12, text: '사람들을 모욕하거나 비난하곤 한다.', factor: '친화성', reverse: true },
  { id: 13, text: '세부적인 사항까지 꼼꼼하게 챙긴다.', factor: '성실성' },
  { id: 14, text: '걱정이 많다.', factor: '신경증' },
  { id: 15, text: '상상력이 풍부하다.', factor: '개방성' },
  { id: 16, text: '가급적 배경에 머물러 있으려 한다(나서지 않는다).', factor: '외향성', reverse: true },
  { id: 17, text: '타인의 감정에 깊이 공감한다.', factor: '친화성' },
  { id: 18, text: '일을 엉망으로 만드는 경향이 있다.', factor: '성실성', reverse: true },
  { id: 19, text: '자주 우울함을 느낀다.', factor: '신경증' },
  { id: 20, text: '어려운 아이디어에는 관심이 없다.', factor: '개방성', reverse: true },
  { id: 21, text: '대화를 먼저 시작한다.', factor: '외향성' },
  { id: 22, text: '타인의 문제에 관심이 없다.', factor: '친화성', reverse: true },
  { id: 23, text: '집안일(또는 업무)을 바로바로 처리한다.', factor: '성실성' },
  { id: 24, text: '쉽게 화를 내거나 짜증을 낸다.', factor: '신경증' },
  { id: 25, text: '뛰어난 상상력을 가지고 있다.', factor: '개방성' },
  { id: 26, text: '별로 할 말이 없는 편이다.', factor: '외향성', reverse: true },
  { id: 27, text: '부드러운 마음(동정심)을 가지고 있다.', factor: '친화성' },
  { id: 28, text: '종종 내 물건들을 제자리에 두지 않는다.', factor: '성실성', reverse: true },
  { id: 29, text: '쉽게 속상해하거나 기분이 상한다.', factor: '신경증' },
  { id: 30, text: '추상적인 아이디어를 생각하는 것을 즐기지 않는다.', factor: '개방성', reverse: true },
  { id: 31, text: '사람들의 관심을 끄는 것을 좋아한다.', factor: '외향성' },
  { id: 32, text: '타인의 감정을 잘 이해한다.', factor: '친화성' },
  { id: 33, text: '정해진 일정에 따라 움직인다.', factor: '성실성' },
  { id: 34, text: '기분이 자주 바뀐다.', factor: '신경증' },
  { id: 35, text: '사물을 이해하는 속도가 빠르다.', factor: '개방성' },
  { id: 36, text: '타인에게 나를 드러내지 않는다.', factor: '외향성', reverse: true },
  { id: 37, text: '다른 사람들을 위해 시간을 낸다.', factor: '친화성' },
  { id: 38, text: '할 일을 자꾸 미룬다.', factor: '성실성', reverse: true },
  { id: 39, text: '감정 기복이 심하다.', factor: '신경증' },
  { id: 40, text: '어려운 단어를 사용한다.', factor: '개방성' },
  { id: 41, text: '모임에서 주목받는 것을 꺼리지 않는다.', factor: '외향성' },
  { id: 42, text: '타인의 고통을 느낀다.', factor: '친화성' },
  { id: 43, text: '항상 준비가 되어 있다.', factor: '성실성' },
  { id: 44, text: '쉽게 겁을 먹거나 당황한다.', factor: '신경증' },
  { id: 45, text: '깊이 있는 사색(명상)을 즐긴다.', factor: '개방성' },
  { id: 46, text: '낯선 사람 주변에서는 조용한 편이다.', factor: '외향성', reverse: true },
  { id: 47, text: '사람들을 편안하게 해준다.', factor: '친화성' },
  { id: 48, text: '업무(공부)를 할 때 정확성을 기한다.', factor: '성실성' },
  { id: 49, text: '자주 슬픔을 느낀다.', factor: '신경증' },
  { id: 50, text: '아이디어가 풍부하다.', factor: '개방성' },
];

const choices = [
  { value: 1, label: '전혀 아니다' },
  { value: 2, label: '아니다' },
  { value: 3, label: '보통이다' },
  { value: 4, label: '그렇다' },
  { value: 5, label: '매우 그렇다' },
];

const factorDescriptions: Record<Factor, string> = {
  외향성: '사교성, 활동성, 자기표현 성향',
  친화성: '배려, 공감, 협력 성향',
  성실성: '계획성, 책임감, 자기관리 성향',
  신경증: '불안, 예민함, 정서적 흔들림 정도',
  개방성: '호기심, 상상력, 새로운 경험 선호',
};

const factorStyles: Record<Factor, { glow: string; ring: string; card: string; chip: string; bar: string; text: string }> = {
  외향성: { glow: 'from-orange-400 via-rose-400 to-pink-500', ring: 'ring-orange-200', card: 'from-orange-50 via-rose-50 to-pink-50', chip: 'bg-orange-100 text-orange-700', bar: 'from-orange-400 via-rose-500 to-pink-500', text: 'text-orange-700' },
  친화성: { glow: 'from-sky-400 via-cyan-400 to-teal-500', ring: 'ring-cyan-200', card: 'from-sky-50 via-cyan-50 to-teal-50', chip: 'bg-cyan-100 text-cyan-700', bar: 'from-sky-400 via-cyan-500 to-teal-500', text: 'text-cyan-700' },
  성실성: { glow: 'from-violet-400 via-fuchsia-400 to-purple-500', ring: 'ring-violet-200', card: 'from-violet-50 via-fuchsia-50 to-purple-50', chip: 'bg-violet-100 text-violet-700', bar: 'from-violet-400 via-fuchsia-500 to-purple-500', text: 'text-violet-700' },
  신경증: { glow: 'from-rose-400 via-red-400 to-amber-400', ring: 'ring-rose-200', card: 'from-rose-50 via-red-50 to-amber-50', chip: 'bg-rose-100 text-rose-700', bar: 'from-rose-400 via-red-500 to-amber-400', text: 'text-rose-700' },
  개방성: { glow: 'from-emerald-400 via-lime-400 to-green-500', ring: 'ring-emerald-200', card: 'from-emerald-50 via-lime-50 to-green-50', chip: 'bg-emerald-100 text-emerald-700', bar: 'from-emerald-400 via-lime-500 to-green-500', text: 'text-emerald-700' },
};

// ── MBTI 매핑 ──
// E/I ← 외향성, N/S ← 개방성, F/T ← 친화성, J/P ← 성실성
type MBTIType = {
  type: string;
  nickname: string;
  desc: string;
  color: string;
  bg: string;
};

const mbtiData: Record<string, MBTIType> = {
  ENFJ: { type: 'ENFJ', nickname: '선도자', desc: '카리스마 있는 리더. 사람들을 이끌고 영감을 주는 것을 즐깁니다.', color: 'text-emerald-700', bg: 'from-emerald-50 to-teal-50' },
  ENFP: { type: 'ENFP', nickname: '활동가', desc: '열정적인 자유로운 영혼. 창의적이고 사교적이며 새로운 가능성을 탐구합니다.', color: 'text-orange-700', bg: 'from-orange-50 to-amber-50' },
  ENTJ: { type: 'ENTJ', nickname: '통솔자', desc: '대담한 전략가. 목표 지향적이고 효율을 중시하며 리더십이 강합니다.', color: 'text-red-700', bg: 'from-red-50 to-rose-50' },
  ENTP: { type: 'ENTP', nickname: '변론가', desc: '논쟁을 즐기는 혁신가. 아이디어가 넘치고 지적 도전을 좋아합니다.', color: 'text-blue-700', bg: 'from-blue-50 to-indigo-50' },
  ESFJ: { type: 'ESFJ', nickname: '집정관', desc: '배려심 깊은 사교가. 다른 사람을 돕고 조화를 만드는 것을 중요시합니다.', color: 'text-pink-700', bg: 'from-pink-50 to-rose-50' },
  ESFP: { type: 'ESFP', nickname: '연예인', desc: '즉흥적인 엔터테이너. 유쾌하고 활발하며 현재를 즐깁니다.', color: 'text-yellow-700', bg: 'from-yellow-50 to-orange-50' },
  ESTJ: { type: 'ESTJ', nickname: '경영자', desc: '실용적인 관리자. 규칙과 질서를 중요시하고 책임감이 강합니다.', color: 'text-slate-700', bg: 'from-slate-50 to-gray-50' },
  ESTP: { type: 'ESTP', nickname: '사업가', desc: '대담한 행동파. 현실적이고 에너지 넘치며 즉각적인 결과를 추구합니다.', color: 'text-amber-700', bg: 'from-amber-50 to-yellow-50' },
  INFJ: { type: 'INFJ', nickname: '옹호자', desc: '통찰력 있는 이상주의자. 깊은 공감 능력과 강한 신념을 가집니다.', color: 'text-purple-700', bg: 'from-purple-50 to-violet-50' },
  INFP: { type: 'INFP', nickname: '중재자', desc: '이상적인 몽상가. 진정성을 추구하고 내면의 가치를 소중히 여깁니다.', color: 'text-teal-700', bg: 'from-teal-50 to-cyan-50' },
  INTJ: { type: 'INTJ', nickname: '건축가', desc: '전략적인 사상가. 독립적이고 분석적이며 장기적 계획을 즐깁니다.', color: 'text-indigo-700', bg: 'from-indigo-50 to-blue-50' },
  INTP: { type: 'INTP', nickname: '논리술사', desc: '혁신적인 발명가. 논리와 이론을 탐구하며 깊이 있는 사고를 즐깁니다.', color: 'text-cyan-700', bg: 'from-cyan-50 to-sky-50' },
  ISFJ: { type: 'ISFJ', nickname: '수호자', desc: '헌신적인 보호자. 따뜻하고 세심하며 주변을 안정적으로 지킵니다.', color: 'text-green-700', bg: 'from-green-50 to-emerald-50' },
  ISFP: { type: 'ISFP', nickname: '모험가', desc: '유연한 예술가. 감성적이고 개방적이며 아름다움에 민감합니다.', color: 'text-lime-700', bg: 'from-lime-50 to-green-50' },
  ISTJ: { type: 'ISTJ', nickname: '현실주의자', desc: '신뢰할 수 있는 실용가. 철저하고 책임감 있으며 전통을 중시합니다.', color: 'text-stone-700', bg: 'from-stone-50 to-slate-50' },
  ISTP: { type: 'ISTP', nickname: '만능재주꾼', desc: '대담한 실험가. 논리적이고 실용적이며 문제 해결을 즐깁니다.', color: 'text-zinc-700', bg: 'from-zinc-50 to-gray-50' },
};

function getMBTI(scoreMap: Record<string, number>): MBTIType {
  const E = scoreMap['외향성'] >= 3 ? 'E' : 'I';
  const N = scoreMap['개방성'] >= 3 ? 'N' : 'S';
  const F = scoreMap['친화성'] >= 3 ? 'F' : 'T';
  const J = scoreMap['성실성'] >= 3 ? 'J' : 'P';
  const key = `${E}${N}${F}${J}`;
  return mbtiData[key] ?? { type: key, nickname: '탐색자', desc: '독특한 성향의 소유자입니다.', color: 'text-slate-700', bg: 'from-slate-50 to-gray-50' };
}

function cls(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(' ');
}

export default function BigFiveTestPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const totalAnswered = Object.keys(answers).length;
  const allAnswered = totalAnswered === questions.length;
  const progress = (totalAnswered / questions.length) * 100;

  const scores = useMemo(() => {
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
        let level = '낮음';
        if (avg >= 4) level = '매우 높음';
        else if (avg >= 3.4) level = '높음';
        else if (avg >= 2.6) level = '보통';
        else if (avg >= 1.8) level = '낮음';
        else level = '매우 낮음';
        return { factor, sum, avg, percent, count: arr.length, level };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [answers]);

  const topFactor = scores[0];

  // MBTI 계산
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
      alert(`모든 문항에 응답해주세요. (${totalAnswered}/${questions.length})`);
      return;
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.25),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.20),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(192,132,252,0.18),_transparent_24%),linear-gradient(180deg,_#fff8fb_0%,_#f5f7ff_38%,_#eefaf7_100%)]">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* 헤더 */}
        <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-8">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-fuchsia-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-slate-500 shadow-sm">
                IPIP-50 × MBTI 성향 분석
              </div>
             <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
               나의 성격 유형 찾기
               <span className="mt-2 block text-xl font-semibold text-slate-400">feat. MBTI</span>
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                50개 문항으로 Big Five 성향을 측정하고, 유사 MBTI 유형까지 도출합니다. 역문항은 자동 계산됩니다.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white/80 px-5 py-4 text-right shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Progress</div>
              <div className="mt-2 text-3xl font-black text-slate-900">{totalAnswered}<span className="text-lg text-slate-400"> / 50</span></div>
              <div className="mt-1 text-sm text-slate-500">응답 진행률 {progress.toFixed(0)}%</div>
            </div>
          </div>
          <div className="relative mt-6">
            <div className="h-5 overflow-hidden rounded-full bg-white/70 p-1 shadow-inner ring-1 ring-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 shadow-[0_8px_20px_rgba(99,102,241,0.45)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* 결과 */}
        {submitted && topFactor && (
          <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-8">
            <div className={cls('absolute inset-x-0 top-0 h-2 bg-gradient-to-r', factorStyles[topFactor.factor].glow)} />

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-lg">결과 분석 완료</div>
                <h2 className="mt-4 text-3xl font-black text-slate-900">당신의 성향 프로파일</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  가장 두드러진 성향은 <span className={cls('font-bold', factorStyles[topFactor.factor].text)}>{topFactor.factor}</span>이며,
                  현재 수준은 <span className="font-bold text-slate-900">{topFactor.level}</span>입니다.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleReset} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  다시 하기
                </button>
              </div>
            </div>

            {/* ── MBTI 카드 ── */}
            <div className={cls('mt-6 rounded-[28px] border border-white/70 bg-gradient-to-br p-6 shadow-[0_18px_45px_rgba(15,23,42,0.10)]', mbtiResult.bg)}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                    IPIP-50 기반 유사 MBTI
                  </div>
                  <div className="mt-3 flex items-end gap-4">
                    <div className={cls('text-6xl font-black tracking-tight', mbtiResult.color)}>
                      {mbtiResult.type}
                    </div>
                    <div className="mb-1">
                      <div className={cls('text-lg font-bold', mbtiResult.color)}>{mbtiResult.nickname}</div>
                      <div className="text-xs text-slate-400">유사 유형</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{mbtiResult.desc}</p>
                </div>

                {/* 4축 요약 */}
                <div className="grid grid-cols-2 gap-3 md:w-56">
                  {[
                    { label: 'E / I', left: 'E 외향', right: 'I 내향', factor: '외향성' },
                    { label: 'N / S', left: 'N 직관', right: 'S 감각', factor: '개방성' },
                    { label: 'F / T', left: 'F 감정', right: 'T 사고', factor: '친화성' },
                    { label: 'J / P', left: 'J 판단', right: 'P 인식', factor: '성실성' },
                  ].map((axis) => {
                    const s = scores.find((x) => x.factor === axis.factor);
                    const avg = s?.avg ?? 3;
                    const isLeft = avg >= 3;
                    return (
                      <div key={axis.label} className="rounded-2xl bg-white/80 p-3 shadow-sm">
                        <div className="text-[10px] font-semibold text-slate-400 mb-1">{axis.label}</div>
                        <div className={cls('text-sm font-bold', isLeft ? 'text-slate-900' : 'text-slate-400')}>
                          {isLeft ? axis.left : axis.right}
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                            style={{ width: `${((avg - 1) / 4) * 100}%` }}
                          />
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400">{avg.toFixed(1)}점</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/60 p-4 text-xs leading-6 text-slate-500">
                ※ 이 유형은 IPIP-50 점수를 기반으로 통계적으로 유사한 MBTI 유형을 도출한 것입니다. 공식 MBTI 검사 결과와 다를 수 있으며, 참고용으로만 활용해주세요.
              </div>
            </div>

            {/* Big Five 카드들 */}
            <div className="mt-6 grid gap-4 xl:grid-cols-5 md:grid-cols-2">
              {scores.map((item, index) => {
                const style = factorStyles[item.factor];
                const isTop = index === 0;
                return (
                  <div key={item.factor} className={cls('relative overflow-hidden rounded-[28px] border bg-gradient-to-br p-5 shadow-[0_18px_45px_rgba(15,23,42,0.10)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.16)]', style.card, style.ring, isTop && 'scale-[1.02]')}>
                    <div className={cls('absolute right-0 top-0 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl', style.glow)} />
                    {isTop && (
                      <div className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-slate-900 shadow-sm">TOP 1</div>
                    )}
                    <div className={cls('inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-sm', style.chip)}>{item.factor}</div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-3xl font-black text-slate-900">{item.avg.toFixed(2)}</div>
                        <div className="text-xs font-medium text-slate-500">평균 점수</div>
                      </div>
                      <div className="rounded-2xl bg-white/80 px-3 py-2 text-right shadow-sm">
                        <div className="text-sm font-bold text-slate-900">{item.level}</div>
                        <div className="text-[11px] text-slate-500">현재 수준</div>
                      </div>
                    </div>
                    <p className="mt-4 min-h-[48px] text-sm leading-6 text-slate-600">{factorDescriptions[item.factor]}</p>
                    <div className="mt-5 h-4 overflow-hidden rounded-full bg-white/80 p-1 shadow-inner">
                      <div className={cls('h-full rounded-full bg-gradient-to-r shadow-[0_8px_18px_rgba(59,130,246,0.25)]', style.bar)} style={{ width: `${item.percent}%` }} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
                        <div className="text-slate-400">합계</div>
                        <div className="mt-1 text-base font-bold text-slate-900">{item.sum} / 50</div>
                      </div>
                      <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
                        <div className="text-slate-400">환산</div>
                        <div className="mt-1 text-base font-bold text-slate-900">{item.percent.toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
                <div className="text-sm font-bold text-amber-700">해석 안내</div>
                <p className="mt-2 text-sm leading-7 text-amber-900">
                  이 결과는 참고용 자기이해 자료입니다. 의료적 진단이나 전문 심리평가를 대체하지 않으며, 응답 당시의 상태나 환경에 따라 달라질 수 있습니다.
                </p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-sm">
                <div className="text-sm font-bold text-slate-700">요약 인사이트</div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <li>• 유사 MBTI: <span className="font-bold text-slate-900">{mbtiResult.type} ({mbtiResult.nickname})</span></li>
                  <li>• 가장 두드러진 성향: <span className="font-bold text-slate-900">{topFactor.factor}</span></li>
                  <li>• 현재 최고 점수: <span className="font-bold text-slate-900">{topFactor.avg.toFixed(2)}점</span></li>
                  <li>• 역채점 문항 포함 자동 계산 적용</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* 질문 목록 */}
        <section className="space-y-5">
          {questions.map((q) => {
            const selected = answers[q.id];
            const style = factorStyles[q.factor];
            return (
              <article key={q.id} className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)] md:p-6">
                <div className={cls('absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b', style.glow)} />
                <div className="pl-2">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white shadow-sm">{q.id}번</span>
                        <span className={cls('rounded-full px-3 py-1 text-xs font-bold shadow-sm', style.chip)}>{q.factor}</span>
                        {q.reverse && <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 shadow-sm">역채점 문항</span>}
                      </div>
                      <h3 className="mt-4 text-lg font-bold leading-8 text-slate-900 md:text-xl">{q.text}</h3>
                    </div>
                    {selected && (
                      <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-center shadow-sm">
                        <div className="text-xs text-slate-400">선택한 점수</div>
                        <div className="text-xl font-black text-slate-900">{selected}</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-5">
                    {choices.map((choice) => {
                      const active = selected === choice.value;
                      return (
                        <label key={choice.value} className={cls('group cursor-pointer rounded-[24px] border px-4 py-4 text-center transition-all duration-200', active ? `border-transparent bg-gradient-to-br ${style.glow} text-white shadow-[0_14px_30px_rgba(59,130,246,0.22)] scale-[1.02]` : 'border-slate-200 bg-white/90 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md')}>
                          <input type="radio" name={`question-${q.id}`} className="sr-only" value={choice.value} checked={active} onChange={() => handleSelect(q.id, choice.value)} />
                          <div className="text-lg font-black">{choice.value}</div>
                          <div className={cls('mt-1 text-xs font-medium', active ? 'text-white/90' : 'text-slate-500')}>{choice.label}</div>
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
                <div className="text-sm font-semibold text-slate-500">현재 상태</div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  현재 <span className="text-sky-600">{totalAnswered}개</span> 문항에 응답했습니다.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleReset} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  초기화
                </button>
                <button onClick={handleSubmit} className="rounded-2xl bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(99,102,241,0.32)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">
                  결과 보기
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
