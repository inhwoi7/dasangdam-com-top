'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useKakaoShare } from '@/lib/useKakaoShare'
import { useLocale } from 'next-intl'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* ═══════════════════ TYPES ═══════════════════ */
interface TarotCard {
  id: number
  name_ko: string
  name_en: string
  img: string
  keywords: string[]
  meaning_up: string
  meaning_rev: string
  insight_up: string
  insight_rev: string
  meaning_up_en?: string
  meaning_rev_en?: string
  insight_up_en?: string
  insight_rev_en?: string
  keywords_en?: string[]
}

/* ═══════════════════ TRANSLATIONS ═══════════════════ */
const T = {
  ko: {
    brand: '오늘의 한 장, 타로',
    heroTitle: ['마음 속 질문을 품고', '카드를 선택해 보세요'],
    heroSub: '✦ Major Arcana 22장 ✦',
    deckSimple: '심플',
    deckSimpleSub: '메이저 22장',
    deckDeep: '심층',
    deckDeepSub: '전체 78장',
    cats: ['💜 연애', '✨ 금전', '🔮 사업', '🌙 일반'],
    placeholder: '예) 이 사람이 저를 진심으로 좋아하는 걸까요?\n솔직하게 적어주세요, 카드가 느낍니다.',
    goBtn: '카드를 섞어주세요 →',
    shuffleLabel: 'Step 2 — Shuffle',
    shuffleTitle: ['눈을 감고', '질문에 집중하세요'],
    shuffleSub: '준비되면 카드 뭉치를 터치하세요',
    back: '← 돌아가기',
    backHome: '← 처음으로',
    cues: [
      '카드를 터치해 섞어주세요',
      '다시 한 번 더...',
      '✓ 준비됐어요 — 다시 탭하면 펼칩니다',
      '카드를 펼치는 중...',
    ],
    pickLabel: 'Step 3 — Choose',
    pickTitle: ['마음이 끌리는 카드를', '한 장 선택하세요'],
    pickSub: '직관을 따르세요 — 계산하지 마세요',
    reversed: '↕ 역방향',
    keywords: 'Keywords',
    meaning: '카드의 의미',
    insight: '✦ 오늘의 통찰',
    again: '새로운 질문하기',
    share: '카카오로 공유하기',
    shareTitle: '오늘의 타로 —',
    shareBtn: '나도 타로 뽑기 →',
  },
  en: {
    brand: "Today's Tarot Card",
    heroTitle: ['Hold your question in your heart,', 'and choose a card'],
    heroSub: '✦ Major Arcana 22 Cards ✦',
    deckSimple: 'Simple',
    deckSimpleSub: 'Major Arcana 22',
    deckDeep: 'Deep',
    deckDeepSub: 'Full Deck 78',
    cats: ['💜 Love', '✨ Money', '🔮 Career', '🌙 General'],
    placeholder: 'e.g. Does this person truly like me?\nBe honest — the cards can feel it.',
    goBtn: 'Shuffle the cards →',
    shuffleLabel: 'Step 2 — Shuffle',
    shuffleTitle: ['Close your eyes,', 'and focus on your question'],
    shuffleSub: 'When ready, tap the deck',
    back: '← Back',
    backHome: '← Start over',
    cues: [
      'Tap to shuffle the cards',
      'Once more...',
      '✓ Ready — tap again to spread',
      'Spreading the cards...',
    ],
    pickLabel: 'Step 3 — Choose',
    pickTitle: ['Choose the card', "that draws you"],
    pickSub: 'Follow your intuition — don\'t overthink',
    reversed: '↕ Reversed',
    keywords: 'Keywords',
    meaning: 'Card Meaning',
    insight: '✦ Today\'s Insight',
    again: 'Ask a new question',
    share: 'Share via KakaoTalk',
    shareTitle: "Today's Tarot —",
    shareBtn: 'Try tarot →',
  },
}

/* ═══════════════════ CARD DATA ═══════════════════ */
const CARDS: TarotCard[] = [
  { id:0, name_ko:'바보', name_en:'The Fool', img:'/tarot/00-TheFool.jpg', keywords:['새시작','순수','모험','자유','무한가능성'], meaning_up:'두려움 없이 새로운 출발을 앞둔 순간.', meaning_rev:'과거의 틀에서 벗어나지 못하거나 무모한 결정을 내리고 있습니다.', insight_up:'인생은 완벽히 준비된 뒤에 시작되는 것이 아니라, 불완전함을 끌어안는 순간부터 움직이기 시작합니다.', insight_rev:'자유와 무모함은 종이 한 장 차이입니다.' },
  { id:1, name_ko:'마법사', name_en:'The Magician', img:'/tarot/01-TheMagician.jpg', keywords:['의지','실현','기술','집중','창조'], meaning_up:'당신에게 필요한 모든 도구가 이미 갖춰져 있습니다.', meaning_rev:'잠재력이 있지만 활용하지 못하고 있습니다.', insight_up:'마법은 특별한 능력이 아니라 이미 가진 것을 연결하는 힘에서 시작됩니다.', insight_rev:'능력이 없어서가 아니라 스스로를 의심하기 때문에 힘을 잃는 경우가 많습니다.' },
  { id:2, name_ko:'여사제', name_en:'The High Priestess', img:'/tarot/02-TheHighPriestess.jpg', keywords:['직관','내면의 지혜','신비','잠재의식'], meaning_up:'이성보다 직관을 믿어야 할 때입니다.', meaning_rev:'내면의 목소리를 무시하거나 비밀을 숨기고 있습니다.', insight_up:'세상에는 말로 설명되지 않는 진실도 존재합니다.', insight_rev:'머리로 이해하려 할수록 오히려 본질에서 멀어질 수 있습니다.' },
  { id:3, name_ko:'여황제', name_en:'The Empress', img:'/tarot/03-TheEmpress.jpg', keywords:['풍요','모성','창조','자연','아름다움'], meaning_up:'풍요와 창조의 에너지가 넘칩니다.', meaning_rev:'창의력 막힘, 지나친 의존 또는 과잉보호.', insight_up:'진짜 풍요는 많이 소유하는 것이 아니라, 스스로를 충분히 사랑할 수 있는 상태에서 시작됩니다.', insight_rev:'누군가를 지나치게 돌보는 동안 정작 자신의 마음은 메마르고 있을 수 있습니다.' },
  { id:4, name_ko:'황제', name_en:'The Emperor', img:'/tarot/04-TheEmperor.jpg', keywords:['권위','구조','안정','리더십','아버지'], meaning_up:'강한 리더십과 자기 통제력이 필요한 시기입니다.', meaning_rev:'독재적이거나 지나치게 통제하려 합니다.', insight_up:'흔들리지 않는 기준은 삶의 방향을 잃지 않게 해줍니다.', insight_rev:'통제는 안정감을 주지만 지나치면 두려움이 됩니다.' },
  { id:5, name_ko:'교황', name_en:'The Hierophant', img:'/tarot/05-TheHierophant.jpg', keywords:['전통','관습','가르침','믿음'], meaning_up:'검증된 방식과 전통 안에서 안정을 찾을 때입니다.', meaning_rev:'관습에 얽매여 있거나 독단적인 사고를 하고 있습니다.', insight_up:'오래된 지혜에는 시간이 증명한 가치가 담겨 있습니다.', insight_rev:'익숙한 방식만이 정답이라고 믿는 순간 시야는 좁아집니다.' },
  { id:6, name_ko:'연인', name_en:'The Lovers', img:'/tarot/06-TheLovers.jpg', keywords:['사랑','선택','조화','가치관','결합'], meaning_up:'중요한 선택의 기로에 서 있습니다.', meaning_rev:'가치관 충돌, 잘못된 선택, 또는 관계의 불균형.', insight_up:'진정한 선택은 조건보다 마음의 방향에서 시작됩니다.', insight_rev:'마음과 현실이 어긋날 때 사람은 쉽게 흔들립니다.' },
  { id:7, name_ko:'전차', name_en:'The Chariot', img:'/tarot/07-TheChariot.jpg', keywords:['승리','의지력','결단','추진력'], meaning_up:'강한 의지로 장애물을 극복하고 목표를 향해 돌진하세요.', meaning_rev:'방향성 상실, 공격적인 태도, 또는 통제력 부재.', insight_up:'목표를 향해 나아가는 힘은 외부 환경보다 내면의 의지에서 나옵니다.', insight_rev:'빠르게 달리는 것과 올바른 방향으로 가는 것은 다릅니다.' },
  { id:8, name_ko:'힘', name_en:'Strength', img:'/tarot/08-Strength.jpg', keywords:['내면의 힘','용기','인내','온화함'], meaning_up:'진정한 힘은 폭력이 아닌 온화함에서 나옵니다.', meaning_rev:'자기 의심, 내면의 두려움, 또는 억압된 감정.', insight_up:'진짜 강한 사람은 자신의 감정을 억누르는 사람이 아니라, 그것을 이해하고 다룰 줄 아는 사람입니다.', insight_rev:'겉으로는 괜찮아 보여도 마음속에서는 두려움과 불안이 커지고 있을 수 있습니다.' },
  { id:9, name_ko:'은둔자', name_en:'The Hermit', img:'/tarot/09-TheHermit.jpg', keywords:['내면탐구','고독','지혜','성찰'], meaning_up:'외부의 소음을 끄고 내면의 지혜를 찾을 시간입니다.', meaning_rev:'지나친 고립, 외로움, 또는 현실 회피.', insight_up:'혼자 있는 시간은 외로움이 아니라 자신을 깊이 이해하는 과정이 될 수 있습니다.', insight_rev:'혼자 있는 시간이 길어질수록 세상과 단절된 느낌이 커질 수 있습니다.' },
  { id:10, name_ko:'운명의 수레바퀴', name_en:'Wheel of Fortune', img:'/tarot/10-WheelOfFortune.jpg', keywords:['운명','전환점','행운','변화'], meaning_up:'모든 것이 순환합니다. 변화가 다가오고 있습니다.', meaning_rev:'불운, 저항, 또는 통제할 수 없는 상황.', insight_up:'삶은 멈춰 있는 직선이 아니라 끊임없이 움직이는 순환입니다.', insight_rev:'원하는 대로 흘러가지 않는다고 해서 모든 것이 끝난 것은 아닙니다.' },
  { id:11, name_ko:'정의', name_en:'Justice', img:'/tarot/11-Justice.jpg', keywords:['공정','진실','인과응보','균형'], meaning_up:'모든 행동에는 결과가 따릅니다.', meaning_rev:'불공정, 책임 회피, 또는 편향된 판단.', insight_up:'삶은 결국 자신이 선택한 것들의 결과와 마주하게 됩니다.', insight_rev:'자신의 잘못을 외면하거나 상황을 편하게 해석하려 하면 결국 더 큰 불균형이 찾아옵니다.' },
  { id:12, name_ko:'매달린 사람', name_en:'The Hanged Man', img:'/tarot/12-TheHangedMan.jpg', keywords:['희생','다른시각','기다림','내려놓음'], meaning_up:'멈춤이 곧 전진입니다.', meaning_rev:'희생을 거부하거나 필요 없는 순교를 하고 있습니다.', insight_up:'멈춰 있는 시간은 실패가 아니라 새로운 시각을 얻기 위한 과정일 수 있습니다.', insight_rev:'변화가 두려워 같은 자리에 머물고 있을 수 있습니다.' },
  { id:13, name_ko:'죽음', name_en:'Death', img:'/tarot/13-Death.jpg', keywords:['변환','끝과시작','놓아주기','재탄생'], meaning_up:'두려워하지 마세요. 끝은 곧 새로운 시작입니다.', meaning_rev:'변화에 저항하거나 과거에 집착하고 있습니다.', insight_up:'끝은 사라짐이 아니라 새로운 시작을 위한 정리입니다.', insight_rev:'이미 끝난 것을 붙잡고 있을수록 마음은 더 지쳐갑니다.' },
  { id:14, name_ko:'절제', name_en:'Temperance', img:'/tarot/14-Temperance.jpg', keywords:['균형','조화','인내','치유'], meaning_up:'극단을 피하고 균형을 찾는 것이 지금 가장 중요합니다.', meaning_rev:'불균형, 과잉, 또는 조급함.', insight_up:'삶은 어느 한쪽으로 치우치지 않을 때 가장 건강한 흐름을 만듭니다.', insight_rev:'지나침은 부족함만큼이나 사람을 무너뜨립니다.' },
  { id:15, name_ko:'악마', name_en:'The Devil', img:'/tarot/15-TheDevil.jpg', keywords:['속박','집착','중독','그림자자아'], meaning_up:'당신을 묶고 있는 것은 생각보다 약합니다.', meaning_rev:'중독이나 집착에서 벗어나려는 시도.', insight_up:'당신을 묶고 있는 사슬은 생각보다 단단하지 않을 수 있습니다.', insight_rev:'벗어나고 싶다는 마음이 생겼다는 것만으로도 이미 변화는 시작된 것입니다.' },
  { id:16, name_ko:'탑', name_en:'The Tower', img:'/tarot/16-TheTower.jpg', keywords:['갑작스런변화','붕괴','계시','해방'], meaning_up:'갑작스러운 충격이지만, 진실이 드러나는 중입니다.', meaning_rev:'재앙을 피하거나, 변화의 충격이 예상보다 작습니다.', insight_up:'무너짐은 때로 가장 정직한 형태의 구원입니다.', insight_rev:'변화를 미루고 문제를 덮어두면 결국 더 큰 불안으로 돌아올 수 있습니다.' },
  { id:17, name_ko:'별', name_en:'The Star', img:'/tarot/17-TheStar.jpg', keywords:['희망','영감','치유','평온','믿음'], meaning_up:'폭풍이 지나갔습니다. 이제 치유와 재생의 시간입니다.', meaning_rev:'믿음 상실, 절망, 또는 꿈을 포기하고 싶은 마음.', insight_up:'가장 어두운 밤 뒤에는 반드시 다시 빛이 찾아옵니다.', insight_rev:'희망을 잃었다고 느끼는 순간에도 마음 한편에는 아직 작은 빛이 남아 있습니다.' },
  { id:18, name_ko:'달', name_en:'The Moon', img:'/tarot/18-TheMoon.jpg', keywords:['환상','두려움','잠재의식','직관'], meaning_up:'지금 보이는 것이 전부가 아닙니다.', meaning_rev:'혼란이 걷히고 있습니다. 숨겨진 진실이 드러나는 시기입니다.', insight_up:'모든 것이 분명해 보이지 않는 시기일수록 직관은 더욱 중요해집니다.', insight_rev:'흐릿했던 감정과 상황들이 조금씩 정리되기 시작합니다.' },
  { id:19, name_ko:'태양', name_en:'The Sun', img:'/tarot/19-TheSun.jpg', keywords:['성공','기쁨','활력','자신감','긍정'], meaning_up:'밝고 따뜻한 에너지가 가득합니다. 당신은 빛나고 있습니다.', meaning_rev:'지나친 낙관주의, 또는 일시적인 기쁨.', insight_up:'태양은 있는 그대로의 자신을 사랑할 때 가장 밝게 빛난다고 말합니다.', insight_rev:'긍정적인 마음도 현실을 외면하는 순간 공허해질 수 있습니다.' },
  { id:20, name_ko:'심판', name_en:'Judgement', img:'/tarot/20-Judgement.jpg', keywords:['부활','반성','소명','해방'], meaning_up:'과거를 정직하게 돌아볼 시간입니다.', meaning_rev:'자기 비판, 또는 과거에 집착하여 앞으로 나아가지 못하고 있습니다.', insight_up:'과거를 돌아본다는 것은 후회하기 위해서가 아니라, 더 나은 자신으로 다시 태어나기 위해서입니다.', insight_rev:'스스로를 지나치게 비난하거나 과거의 실수에 붙잡혀 있을 수 있습니다.' },
  { id:21, name_ko:'세계', name_en:'The World', img:'/tarot/21-TheWorld.jpg', keywords:['완성','성취','통합','총체'], meaning_up:'하나의 사이클이 완성되었습니다.', meaning_rev:'미완성, 지연, 또는 완벽주의로 인한 마무리 실패.', insight_up:'하나의 긴 여정이 마침내 완성 단계에 도달했습니다.', insight_rev:'거의 다 왔음에도 스스로를 의심하며 마지막 문턱 앞에서 멈춰 있을 수 있습니다.' },
]

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const ROMAN = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI']

function CosmosCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.1 + 0.2, a: Math.random() * 0.45 + 0.05,
      s: Math.random() * 0.003 + 0.001, p: Math.random() * Math.PI * 2,
    }))
    function resize() { canvas!.width = window.innerWidth; canvas!.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    function draw(t: number) {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      stars.forEach(s => {
        const a = s.a * (0.6 + 0.4 * Math.sin(t * s.s + s.p))
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,210,255,${a})`; ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

type Step = 'question' | 'shuffle' | 'pick' | 'result'

export default function TarotPage() {
  const locale = useLocale()
  const t = T[locale as 'ko' | 'en'] ?? T.ko

  const [step, setStep]               = useState<Step>('question')
  const [category, setCategory]       = useState('')
  const [question, setQuestion]       = useState('')
  const [deckMode, setDeckMode]       = useState<'simple'|'deep'>('simple')
  const [shuffleCount, setShuffleCount] = useState(0)
  const [shuffling, setShuffling]     = useState(false)
  const [cards, setCards]             = useState<TarotCard[]>(CARDS)
  const [deck, setDeck]               = useState<TarotCard[]>([])
  const [pickedCard, setPickedCard]   = useState<TarotCard | null>(null)
  const [isReversed, setIsReversed]   = useState(false)
  const [flipped, setFlipped]         = useState(false)
  const [picking, setPicking]         = useState(false)

  const { shareWithCapture } = useKakaoShare()

  useEffect(() => {
    let query = supabase.from('tarot_cards').select('*').eq('is_published', true).order('id')
    if (deckMode === 'simple') query = query.eq('deck_type', 'major')
    query.then(({ data, error }) => {
      if (error || !data) return
      const mapped: TarotCard[] = data.map((c: any) => ({
        id: c.id, name_ko: c.name_ko, name_en: c.name_en, img: c.image_url,
        keywords: c.keywords ?? [], meaning_up: c.meaning_up, meaning_rev: c.meaning_rev,
        insight_up: c.insight_up, insight_rev: c.insight_rev,
        meaning_up_en: c.meaning_up_en ?? undefined,
        meaning_rev_en: c.meaning_rev_en ?? undefined,
        insight_up_en: c.insight_up_en ?? undefined,
        insight_rev_en: c.insight_rev_en ?? undefined,
        keywords_en: c.keywords_en ?? undefined,
      }))
      setCards(mapped)
    })
  }, [deckMode])

  function goTo(s: Step) {
    setFlipped(false); setPicking(false)
    if (s === 'shuffle') { setShuffleCount(0); setDeck(shuffleArr(cards)) }
    setStep(s)
  }

  function handleKakaoShare() {
    if (!pickedCard) return
    shareWithCapture({
      captureId: 'tarot-capture',
      title: `${t.shareTitle} ${locale === 'en' ? pickedCard.name_en : pickedCard.name_ko}`,
      description: `${isReversed ? '↕ ' : ''}${pickedCard.keywords.slice(0,3).join(' · ')}`,
      buttonText: t.shareBtn,
      pageUrl: 'https://dasangdam.com/services/tarot',
    })
  }

  function handleShuffle() {
    if (shuffling) return
    setShuffling(true)
    setTimeout(() => setShuffling(false), 500)
    const next = shuffleCount + 1
    setShuffleCount(next)
    if (next > 3) goTo('pick')
  }

  function handlePick(pos: number) {
    if (picking) return
    setPicking(true)
    const idx = (pos * 7 + Math.floor(Math.random() * 5)) % cards.length
    const card = deck[idx] ?? cards[idx]
    const rev  = Math.random() < 0.3
    setPickedCard(card); setIsReversed(rev)
    supabase.from('tarot_sessions').insert({
      question: question || null, category: category || null,
      deck_mode: deckMode, card_id: card.id, is_reversed: rev,
    }).then(() => {})
    setTimeout(() => { setStep('result'); setTimeout(() => setFlipped(true), 400) }, 350)
  }

  const cueText =
    shuffleCount === 0 ? t.cues[0] :
    shuffleCount < 3   ? `${t.cues[1]} (${shuffleCount}/3)` :
    shuffleCount === 3 ? t.cues[2] : t.cues[3]

  const cardName = locale === 'en' ? pickedCard?.name_en : pickedCard?.name_ko

  const css = `
    .tarot-root {
      --bg:#1e1535;--bg2:#271c42;--bg3:#32265a;--accent:#a78bfa;--accent2:#c4b5fd;
      --gold:#f0c060;--gold2:#fde68a;--text:#f0ecff;--text2:#c4b5fd;--text3:#9b8ec4;
      --border:rgba(167,139,250,.25);--border2:rgba(167,139,250,.12);
      font-family:'Noto Sans KR',sans-serif;font-weight:400;
      background:var(--bg);color:var(--text);min-height:100dvh;overflow-x:hidden;
    }
    .tarot-root * { box-sizing:border-box;margin:0;padding:0; }
    .screen { min-height:100dvh;display:flex;flex-direction:column;align-items:center;padding:0 20px; }
    .brand { font-family:'Cinzel',serif;font-size:11px;letter-spacing:5px;color:var(--accent2);text-transform:uppercase;margin-bottom:20px;animation:fadeDown .8s ease both;opacity:.85; }
    .hero-title { font-family:'Noto Serif KR',serif;font-size:clamp(22px,5.5vw,30px);font-weight:400;line-height:1.5;text-align:center;color:var(--text);margin-bottom:10px;animation:fadeDown .8s .15s ease both; }
    .hero-title em { font-style:normal;color:var(--gold2);font-weight:600; }
    .hero-sub { font-size:13px;color:var(--text2);letter-spacing:1px;margin-bottom:24px;animation:fadeDown .8s .2s ease both; }
    .cats { display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:16px;animation:fadeDown .8s .25s ease both; }
    .cat { padding:8px 18px;border-radius:24px;border:1px solid var(--border);background:rgba(167,139,250,.08);color:var(--text2);font-size:13px;font-family:'Noto Sans KR',sans-serif;cursor:pointer;transition:all .2s; }
    .cat.on,.cat:hover { border-color:var(--accent);background:rgba(167,139,250,.2);color:var(--text); }
    .q-wrap { width:100%;max-width:380px;background:rgba(255,255,255,.08);border:1.5px solid var(--border);border-radius:14px;padding:16px;margin-bottom:16px;animation:fadeDown .8s .3s ease both;transition:border-color .2s; }
    .q-wrap:focus-within { border-color:var(--accent);background:rgba(255,255,255,.11); }
    .q-wrap textarea { width:100%;height:90px;background:transparent;border:none;outline:none;color:var(--text);font-size:15px;line-height:1.7;resize:none;font-family:'Noto Sans KR',sans-serif;font-weight:400; }
    .q-wrap textarea::placeholder { color:var(--text3);font-size:14px; }
    .go-btn { width:100%;max-width:380px;padding:16px;border-radius:14px;border:none;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;font-size:16px;font-weight:500;letter-spacing:.5px;font-family:'Noto Sans KR',sans-serif;cursor:pointer;transition:all .25s;animation:fadeDown .8s .35s ease both;box-shadow:0 4px 20px rgba(124,58,237,.4); }
    .go-btn:hover { background:linear-gradient(135deg,#6d28d9,#8b5cf6);box-shadow:0 6px 28px rgba(124,58,237,.55);transform:translateY(-1px); }
    .back-btn { background:transparent;border:none;color:var(--text2);font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;display:flex;align-items:center;gap:6px;transition:color .2s;font-weight:400; }
    .back-btn:hover { color:var(--text); }
    .again-btn { width:100%;max-width:420px;padding:14px;border-radius:12px;border:1.5px solid var(--border);background:rgba(167,139,250,.08);color:var(--text2);font-size:14px;font-family:'Noto Sans KR',sans-serif;cursor:pointer;transition:all .2s;margin-top:8px;font-weight:400; }
    .again-btn:hover { border-color:var(--accent);color:var(--text);background:rgba(167,139,250,.15); }
    .s-label { font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:var(--accent2);text-transform:uppercase;margin-bottom:20px;opacity:.8; }
    .s-title { font-family:'Noto Serif KR',serif;font-size:22px;font-weight:400;text-align:center;line-height:1.5;color:var(--text);margin-bottom:8px; }
    .s-sub { font-size:14px;color:var(--text2);text-align:center;margin-bottom:32px; }
    .deck { position:relative;width:160px;height:260px;cursor:pointer;margin-bottom:36px;-webkit-tap-highlight-color:transparent; }
    .deck-card { position:absolute;width:140px;height:240px;border-radius:14px;border:1.5px solid rgba(167,139,250,.35);background:linear-gradient(160deg,#2d1f52,#1a1235);overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.4); }
    .deck-card:nth-child(1){left:16px;top:16px;transform:rotate(-10deg);}
    .deck-card:nth-child(2){left:8px;top:8px;transform:rotate(-4deg);}
    .deck-card:nth-child(3){left:0;top:0;transform:rotate(2deg);}
    .deck-inner { width:100%;height:100%;display:flex;align-items:center;justify-content:center;background-image:repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(167,139,250,.1) 6px,rgba(167,139,250,.1) 7px); }
    .deck.shuffling .deck-card:nth-child(3){animation:shuffleL .45s ease;}
    .deck.shuffling .deck-card:nth-child(2){animation:shuffleM .45s .05s ease;}
    .pulse { width:14px;height:14px;border-radius:50%;opacity:.7;animation:pulseAnim 1.5s infinite; }
    .cue-txt { font-size:15px;color:var(--text2);margin-top:14px;font-weight:400;text-align:center; }
    .prog { display:flex;gap:7px;margin-top:32px; }
    .prog-dot { width:6px;height:6px;border-radius:3px;background:rgba(167,139,250,.25);transition:all .3s; }
    .prog-dot.on { background:var(--accent);width:20px; }
    .pick-title { font-family:'Noto Serif KR',serif;font-size:22px;font-weight:400;text-align:center;color:var(--text);margin-bottom:8px; }
    .pick-sub { font-size:14px;color:var(--text2);text-align:center;margin-bottom:32px; }
    .spread { display:flex;gap:clamp(10px,3vw,20px);justify-content:center;align-items:flex-end;width:100%;margin-bottom:28px; }
    .s-card { width:clamp(90px,24vw,120px);height:calc(clamp(90px,24vw,120px)*1.75);border-radius:14px;border:1.5px solid rgba(167,139,250,.3);background:linear-gradient(160deg,#2d1f52,#1a1235);cursor:pointer;position:relative;overflow:hidden;transition:all .3s;-webkit-tap-highlight-color:transparent;box-shadow:0 6px 24px rgba(0,0,0,.35); }
    .s-card:nth-child(1){transform:rotate(-5deg);}
    .s-card:nth-child(2){transform:rotate(0deg) translateY(-8px);}
    .s-card:nth-child(3){transform:rotate(5deg);}
    .s-card:hover{transform:translateY(-18px) rotate(0deg) scale(1.04) !important;border-color:var(--accent);z-index:2;box-shadow:0 16px 48px rgba(167,139,250,.4);}
    .s-card-inner { width:100%;height:100%;background-image:repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(167,139,250,.1) 6px,rgba(167,139,250,.1) 7px);display:flex;align-items:center;justify-content:center; }
    .s-card-glow { position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,rgba(167,139,250,.3),transparent 65%);opacity:0;transition:opacity .3s; }
    .s-card:hover .s-card-glow,.s-card:active .s-card-glow{opacity:1;}
    .flip-wrap { width:140px;height:240px;margin:0 auto 24px;flex-shrink:0;position:relative; }
    .flip-inner { width:100%;height:100%;transition:opacity .4s ease; }
    .flip-front { position:absolute;inset:0;border-radius:12px;border:1px solid rgba(201,168,76,.25);background:linear-gradient(160deg,#1e1638,#12102a);display:flex;align-items:center;justify-content:center;background-image:repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(201,168,76,.07) 5px,rgba(201,168,76,.07) 6px);transition:opacity .4s ease; }
    .flip-back { position:absolute;inset:0;border-radius:12px;border:none;overflow:hidden;background:transparent;opacity:0;transition:opacity .4s ease .4s; }
    .flip-inner.flipped .flip-front{opacity:0;}
    .flip-inner.flipped .flip-back{opacity:1;}
    .flip-back img { position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:.85;display:block; }
    .flip-back-overlay { position:absolute;inset:0;background:linear-gradient(to top,rgba(14,11,24,.9) 30%,rgba(14,11,24,.2) 100%); }
    .flip-back-num { position:absolute;top:10px;left:0;right:0;text-align:center;font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.9);z-index:1;text-shadow:0 1px 4px rgba(0,0,0,.8); }
    .flip-back-name { position:absolute;bottom:28px;left:8px;right:8px;font-family:'Noto Serif KR',serif;font-size:14px;color:#fff;z-index:1;text-align:center;line-height:1.3;font-weight:500;text-shadow:0 2px 8px rgba(0,0,0,.9); }
    .flip-back-sub { position:absolute;bottom:10px;left:0;right:0;text-align:center;font-size:10px;color:rgba(255,255,255,.7);z-index:1;letter-spacing:1px;font-family:'Cinzel',serif;text-shadow:0 1px 4px rgba(0,0,0,.8); }
    .rev-badge { display:inline-flex;align-items:center;gap:5px;background:rgba(245,158,11,.15);border:1.5px solid rgba(245,158,11,.4);border-radius:12px;padding:5px 12px;font-size:12px;color:#fde68a;font-weight:500;margin-bottom:14px; }
    .result-section { width:100%;max-width:420px;background:rgba(255,255,255,.06);border:1.5px solid var(--border2);border-radius:14px;padding:18px;margin-bottom:10px; }
    .rs-label { font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;color:var(--accent2);text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px; }
    .rs-label::after { content:'';flex:1;height:1px;background:linear-gradient(to right,rgba(201,168,76,.2),transparent); }
    .rs-keywords { display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px; }
    .kw { padding:5px 12px;border-radius:20px;border:1.5px solid rgba(167,139,250,.3);font-size:12px;color:var(--accent2);background:rgba(167,139,250,.1);font-weight:500; }
    .rs-text { font-size:15px;line-height:1.8;color:var(--text);font-weight:400; }
    .sunny-box { width:100%;max-width:420px;background:linear-gradient(135deg,rgba(124,58,237,.15),rgba(167,139,250,.08));border:1.5px solid rgba(167,139,250,.35);border-radius:14px;padding:20px;margin-bottom:10px;position:relative;overflow:hidden; }
    .sunny-box::before { content:'✦';position:absolute;right:14px;top:10px;font-size:28px;color:rgba(201,168,76,.06); }
    .sunny-badge { display:inline-flex;align-items:center;gap:6px;background:rgba(167,139,250,.2);border:1.5px solid rgba(167,139,250,.4);border-radius:20px;padding:5px 14px;font-size:11px;color:var(--accent2);font-weight:600;margin-bottom:14px; }
    .sunny-text { font-family:'Noto Serif KR',serif;font-size:15px;line-height:1.9;color:var(--text);font-weight:400; }
    @keyframes fadeDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulseAnim{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.8);opacity:.15}}
    @keyframes shuffleL{0%{transform:rotate(2deg) translateX(0)}25%{transform:rotate(-25deg) translateX(-50px) translateY(-20px) scale(1.05)}60%{transform:rotate(18deg) translateX(35px) translateY(-5px)}100%{transform:rotate(2deg) translateX(0)}}
    @keyframes shuffleM{0%{transform:rotate(-4deg)}25%{transform:rotate(20deg) translateX(40px) translateY(-15px) scale(1.03)}60%{transform:rotate(-22deg) translateX(-30px) translateY(5px)}100%{transform:rotate(-4deg)}}
    .fu{animation:fadeUp .6s ease both;}.fu1{animation:fadeUp .6s .1s ease both;}.fu2{animation:fadeUp .6s .2s ease both;}.fu3{animation:fadeUp .6s .35s ease both;}.fu4{animation:fadeUp .6s .5s ease both;}
    ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#2e2448;border-radius:2px;}
  `

  return (
    <>
      <style>{css}</style>
      <div className="tarot-root" style={{ position: 'relative' }}>
        <CosmosCanvas />
        <div style={{ position: 'relative', zIndex: 1 }}>

          {step === 'question' && (
            <div className="screen" style={{ justifyContent: 'center', gap: 0 }}>
              <div style={{ height: 'clamp(40px,8vh,70px)' }} />
              <div className="brand">{t.brand}</div>
              <svg style={{ width: 72, height: 72, marginBottom: 20, animation: 'fadeDown .8s .1s ease both' }} viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(201,168,76,.25)" strokeWidth=".8"/>
                <circle cx="36" cy="36" r="18" fill="none" stroke="rgba(201,168,76,.15)" strokeWidth=".6"/>
                <path d="M36 8 L36 64 M8 36 L64 36" stroke="rgba(201,168,76,.15)" strokeWidth=".6"/>
                <path d="M36 8 L52 28 L36 22 L20 28 Z" fill="rgba(201,168,76,.12)" stroke="rgba(201,168,76,.3)" strokeWidth=".6"/>
                <circle cx="36" cy="36" r="4" fill="none" stroke="rgba(201,168,76,.4)" strokeWidth=".8"/>
                <circle cx="36" cy="20" r="1.5" fill="rgba(201,168,76,.6)"/>
                <circle cx="20" cy="44" r="1.2" fill="rgba(201,168,76,.4)"/>
                <circle cx="52" cy="44" r="1.2" fill="rgba(201,168,76,.4)"/>
              </svg>
              <h1 className="hero-title">
                {t.heroTitle[0]}<br /><em>{t.heroTitle[1]}</em>
              </h1>
              <p className="hero-sub">{t.heroSub}</p>
              <div style={{ display:'flex', gap:10, marginBottom:20, width:'100%', maxWidth:380, animation:'fadeDown .8s .18s ease both' }}>
                {(['simple', 'deep'] as const).map((mode) => (
                  <button key={mode} onClick={() => setDeckMode(mode)} style={{
                    flex:1, padding:'14px 12px', borderRadius:12,
                    border: deckMode===mode ? '2px solid #a78bfa' : '1.5px solid rgba(167,139,250,.25)',
                    background: deckMode===mode ? 'rgba(124,58,237,.25)' : 'rgba(255,255,255,.05)',
                    color: deckMode===mode ? '#f0ecff' : '#c4b5fd',
                    fontSize:14, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif',
                    transition:'all .2s', fontWeight: deckMode===mode ? 600 : 400,
                    display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                  }}>
                    <span style={{fontSize:20}}>{mode === 'simple' ? '🌙' : '🔮'}</span>
                    <span>{mode === 'simple' ? t.deckSimple : t.deckDeep}</span>
                    <span style={{fontSize:11, opacity:.7, fontWeight:400}}>{mode === 'simple' ? t.deckSimpleSub : t.deckDeepSub}</span>
                  </button>
                ))}
              </div>
              <div className="cats">
                {t.cats.map(c => (
                  <button key={c} className={`cat${category === c ? ' on' : ''}`} onClick={() => setCategory(c)}>{c}</button>
                ))}
              </div>
              <div className="q-wrap">
                <textarea placeholder={t.placeholder} value={question} onChange={(e) => setQuestion(e.target.value)} />
              </div>
              <button className="go-btn" onClick={() => goTo('shuffle')}>{t.goBtn}</button>
              <div style={{ height: 24 }} />
            </div>
          )}

          {step === 'shuffle' && (
            <div className="screen" style={{ justifyContent: 'center' }}>
              <div style={{ height: 'clamp(60px,12vh,90px)' }} />
              <button className="back-btn" style={{ marginBottom: 20 }} onClick={() => goTo('question')}>{t.back}</button>
              <div className="s-label">{t.shuffleLabel}</div>
              <h2 className="s-title">{t.shuffleTitle[0]}<br />{t.shuffleTitle[1]}</h2>
              <p className="s-sub">{t.shuffleSub}</p>
              <div className={`deck${shuffling ? ' shuffling' : ''}`} onClick={handleShuffle}>
                {[0,1,2].map(i => (
                  <div key={i} className="deck-card">
                    <div className="deck-inner">
                      {i !== 1 && (
                        <svg width="36" height="36" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(201,168,76,.2)" strokeWidth=".6"/>
                          <text x="18" y="24" textAnchor="middle" fontSize="18" fill="rgba(201,168,76,.3)">☽</text>
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pulse" style={{ background: shuffleCount >= 3 ? '#c9a84c' : '#9b8fc2' }} />
              <p className="cue-txt">{cueText}</p>
              <div className="prog">
                {[0,1,2,3].map(i => <div key={i} className={`prog-dot${i === 1 ? ' on' : ''}`} />)}
              </div>
            </div>
          )}

          {step === 'pick' && (
            <div className="screen" style={{ justifyContent: 'center', paddingTop: 20 }}>
              <div style={{ height: 'clamp(55px,10vh,75px)' }} />
              <button className="back-btn" style={{ marginBottom: 20 }} onClick={() => goTo('shuffle')}>{t.back}</button>
              <div className="s-label">{t.pickLabel}</div>
              <h2 className="pick-title">{t.pickTitle[0]}<br />{t.pickTitle[1]}</h2>
              <p className="pick-sub">{t.pickSub}</p>
              <div className="spread">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="s-card" onClick={() => handlePick(i)}>
                    <div className="s-card-inner" />
                    <div className="s-card-glow" />
                  </div>
                ))}
              </div>
              <div className="prog">
                {[0,1,2,3].map(i => <div key={i} className={`prog-dot${i === 2 ? ' on' : ''}`} />)}
              </div>
            </div>
          )}

          {step === 'result' && pickedCard && (
            <div className="screen" id="tarot-capture" style={{ justifyContent: 'flex-start', paddingTop: 16, paddingBottom: 40 }}>
              <div style={{ height: 52, flexShrink: 0 }} />
              <button className="back-btn fu" style={{ marginBottom: 16 }} onClick={() => goTo('question')}>{t.backHome}</button>
              <div className="flip-wrap fu">
                <div className={`flip-inner${flipped ? ' flipped' : ''}`}>
                  <div className="flip-front">
                    <svg width="36" height="36" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(201,168,76,.2)" strokeWidth=".6"/>
                      <text x="18" y="24" textAnchor="middle" fontSize="18" fill="rgba(201,168,76,.3)">☽</text>
                    </svg>
                  </div>
                  <div className="flip-back">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pickedCard.img} alt={pickedCard.name_en} style={{ transform: isReversed ? 'rotate(180deg)' : 'none' }} />
                    <div className="flip-back-overlay" />
                    <div className="flip-back-num">The Major Arcana · {ROMAN[pickedCard.id]}</div>
                    <div className="flip-back-name">{cardName}</div>
                    <div className="flip-back-sub">{(locale === 'en' && pickedCard.keywords_en ? pickedCard.keywords_en : pickedCard.keywords).slice(0,3).join(' · ')}</div>
                  </div>
                </div>
              </div>
              {isReversed && <div className="rev-badge fu1">{t.reversed}</div>}
              <div className="result-section fu1">
                <div className="rs-label">{t.keywords}</div>
                <div className="rs-keywords">
                  {(locale === 'en' && pickedCard.keywords_en ? pickedCard.keywords_en : pickedCard.keywords).map(k => <span key={k} className="kw">{k}</span>)}
                </div>
              </div>
              <div className="result-section fu2">
                <div className="rs-label">{t.meaning}</div>
                <p className="rs-text">{isReversed
                  ? (locale === 'en' && pickedCard.meaning_rev_en ? pickedCard.meaning_rev_en : pickedCard.meaning_rev)
                  : (locale === 'en' && pickedCard.meaning_up_en ? pickedCard.meaning_up_en : pickedCard.meaning_up)
                }</p>
              </div>
              <div className="sunny-box fu3">
                <div className="sunny-badge">{t.insight}</div>
                <p className="sunny-text">{isReversed
                  ? (locale === 'en' && pickedCard.insight_rev_en ? pickedCard.insight_rev_en : pickedCard.insight_rev)
                  : (locale === 'en' && pickedCard.insight_up_en ? pickedCard.insight_up_en : pickedCard.insight_up)
                }</p>
              </div>
              <button className="again-btn fu4" onClick={() => goTo('question')}>{t.again}</button>
              <button onClick={handleKakaoShare} className="fu4" style={{
                width:'100%', maxWidth:420, padding:'15px', borderRadius:12, border:'none',
                background:'#FEE500', color:'#3C1E1E', fontSize:15, fontWeight:700,
                fontFamily:"'Noto Sans KR',sans-serif", cursor:'pointer', transition:'all .2s',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                marginTop:8, boxShadow:'0 4px 16px rgba(254,229,0,.4)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C6.477 3 2 6.71 2 11.28c0 2.913 1.792 5.481 4.5 7.012L5.5 21l3.663-1.98C10.005 19.33 10.99 19.5 12 19.5c5.523 0 10-3.71 10-8.22C22 6.71 17.523 3 12 3z" fill="#3C1E1E" />
                </svg>
                {t.share}
              </button>
              <div style={{ height: 20, flexShrink: 0 }} />
            </div>
          )}

        </div>
      </div>
    </>
  )
}
