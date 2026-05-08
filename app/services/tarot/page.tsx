'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

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
}

/* ═══════════════════ CARD DATA (Supabase fallback) ═══════════════════ */
const CARDS: TarotCard[] = [
  { id:0, name_ko:'바보', name_en:'The Fool',
    img:'/tarot/00-TheFool.jpg',
    keywords:['새시작','순수','모험','자유','무한가능성'],
    meaning_up:'두려움 없이 새로운 출발을 앞둔 순간. 아무것도 없는 것이 아니라 모든 것이 가능한 상태입니다.',
    meaning_rev:'과거의 틀에서 벗어나지 못하거나 무모한 결정을 내리고 있습니다. 두려움 또는 경솔함을 점검하세요.',
    insight_up:'인생은 완벽히 준비된 뒤에 시작되는 것이 아니라, 불완전함을 끌어안는 순간부터 움직이기 시작합니다. 바보 카드는 계산보다 용기를 말합니다. 실패할 가능성보다 가능성 자체를 믿는 태도, 그것이 새로운 세계의 문을 여는 힘입니다.',
    insight_rev:'자유와 무모함은 종이 한 장 차이입니다. 두려움 없이 나아가는 것도 중요하지만, 현실을 외면한 채 충동만 따를 때 같은 실수를 반복하게 됩니다. 지금 필요한 것은 도전 자체보다 \'왜 이 길을 가려 하는가\'에 대한 진짜 질문입니다.' },
  { id:1, name_ko:'마법사', name_en:'The Magician',
    img:'/tarot/01-TheMagician.jpg',
    keywords:['의지','실현','기술','집중','창조'],
    meaning_up:'당신에게 필요한 모든 도구가 이미 갖춰져 있습니다. 의지와 집중력으로 원하는 것을 현실로 만드세요.',
    meaning_rev:'잠재력이 있지만 활용하지 못하고 있거나, 재능을 잘못된 방향에 쓰고 있을 수 있습니다.',
    insight_up:'마법은 특별한 능력이 아니라 이미 가진 것을 연결하는 힘에서 시작됩니다. 당신 안에는 생각보다 더 많은 재능과 가능성이 존재합니다. 중요한 것은 부족함을 찾는 것이 아니라, 지금 손에 쥔 도구를 믿고 현실로 옮기는 실행력입니다.',
    insight_rev:'능력이 없어서가 아니라 스스로를 의심하기 때문에 힘을 잃는 경우가 많습니다. 재능을 남과 비교하거나 보여주기 위한 수단으로 사용할수록 본래의 방향을 잃게 됩니다. 진짜 힘은 타인을 속이는 기술이 아니라 자신에게 솔직해지는 데서 나옵니다.' },
  { id:2, name_ko:'여사제', name_en:'The High Priestess',
    img:'/tarot/02-TheHighPriestess.jpg',
    keywords:['직관','내면의 지혜','신비','잠재의식'],
    meaning_up:'이성보다 직관을 믿어야 할 때입니다. 아직 드러나지 않은 진실이 있으니 서두르지 마세요.',
    meaning_rev:'내면의 목소리를 무시하거나 비밀을 숨기고 있습니다. 자신의 직관을 더 신뢰하세요.',
    insight_up:'세상에는 말로 설명되지 않는 진실도 존재합니다. 여사제는 조용한 직관의 언어를 듣게 합니다. 모든 답을 서둘러 찾으려 하기보다 침묵 속에서 스스로를 바라볼 때, 감춰져 있던 통찰과 흐름이 자연스럽게 드러나기 시작합니다.',
    insight_rev:'머리로 이해하려 할수록 오히려 본질에서 멀어질 수 있습니다. 직감을 무시하거나 감정을 억누르면 내면은 점점 혼란스러워집니다. 지금 필요한 것은 더 많은 정보가 아니라, 스스로의 마음을 조용히 믿어주는 시간입니다.' },
  { id:3, name_ko:'여황제', name_en:'The Empress',
    img:'/tarot/03-TheEmpress.jpg',
    keywords:['풍요','모성','창조','자연','아름다움'],
    meaning_up:'풍요와 창조의 에너지가 넘칩니다. 씨앗을 심은 것들이 꽃을 피울 준비가 되었습니다.',
    meaning_rev:'창의력 막힘, 지나친 의존 또는 과잉보호. 스스로 성장할 공간을 만드세요.',
    insight_up:'진짜 풍요는 많이 소유하는 것이 아니라, 스스로를 충분히 사랑할 수 있는 상태에서 시작됩니다. 여황제는 돌봄과 창조의 힘을 상징합니다. 당신이 정성껏 키운 마음과 관계, 노력들은 결국 가장 아름다운 형태로 열매 맺게 됩니다.',
    insight_rev:'누군가를 지나치게 돌보는 동안 정작 자신의 마음은 메마르고 있을 수 있습니다. 사랑도 균형이 필요합니다. 과잉보호와 의존은 성장 대신 숨막힘을 만들기도 합니다. 이제는 타인을 채우기 전에 자신의 감정을 먼저 돌봐야 합니다.' },
  { id:4, name_ko:'황제', name_en:'The Emperor',
    img:'/tarot/04-TheEmperor.jpg',
    keywords:['권위','구조','안정','리더십','아버지'],
    meaning_up:'강한 리더십과 자기 통제력이 필요한 시기입니다. 체계를 세우고 흔들리지 마세요.',
    meaning_rev:'독재적이거나 지나치게 통제하려 합니다. 또는 권위에 지나치게 의존하고 있습니다.',
    insight_up:'흔들리지 않는 기준은 삶의 방향을 잃지 않게 해줍니다. 황제 카드는 책임감과 질서의 힘을 말합니다. 감정에 휘둘리지 않고 자신의 세계를 단단히 세울 때, 비로소 타인도 안심하고 당신을 신뢰하게 됩니다.',
    insight_rev:'통제는 안정감을 주지만 지나치면 두려움이 됩니다. 모든 것을 자신의 기준 안에 가두려 할수록 관계와 삶은 점점 경직됩니다. 강함은 억누르는 힘이 아니라 유연함 속에서도 중심을 잃지 않는 태도에서 완성됩니다.' },
  { id:5, name_ko:'교황', name_en:'The Hierophant',
    img:'/tarot/05-TheHierophant.jpg',
    keywords:['전통','관습','가르침','믿음'],
    meaning_up:'검증된 방식과 전통 안에서 안정을 찾을 때입니다. 멘토나 스승의 조언에 귀 기울이세요.',
    meaning_rev:'관습에 얽매여 있거나 독단적인 사고를 하고 있습니다. 새로운 관점도 열어두세요.',
    insight_up:'오래된 지혜에는 시간이 증명한 가치가 담겨 있습니다. 교황 카드는 전통과 배움의 의미를 말합니다. 혼자 모든 답을 찾으려 하기보다, 이미 길을 걸어본 사람의 경험과 가르침 속에서 더 빠른 깨달음을 얻을 수 있습니다.',
    insight_rev:'익숙한 방식만이 정답이라고 믿는 순간 시야는 좁아집니다. 전통은 방향이 될 수 있지만 절대적인 기준은 아닙니다. 지금은 남들이 정한 답보다, 스스로 납득할 수 있는 가치와 신념을 다시 세워야 할 때입니다.' },
  { id:6, name_ko:'연인', name_en:'The Lovers',
    img:'/tarot/06-TheLovers.jpg',
    keywords:['사랑','선택','조화','가치관','결합'],
    meaning_up:'중요한 선택의 기로에 서 있습니다. 머리가 아닌 진심이 원하는 방향을 따르세요.',
    meaning_rev:'가치관 충돌, 잘못된 선택, 또는 관계의 불균형. 진정한 자신의 욕구를 점검하세요.',
    insight_up:'진정한 선택은 조건보다 마음의 방향에서 시작됩니다. 연인 카드는 사랑뿐 아니라 가치관의 조화를 의미합니다. 무엇을 선택하느냐보다 왜 그것을 원하는지가 더 중요합니다. 자신의 진심과 연결될 때 관계도 삶도 자연스럽게 깊어집니다.',
    insight_rev:'마음과 현실이 어긋날 때 사람은 쉽게 흔들립니다. 타인의 기대에 맞춘 선택은 결국 자신을 지치게 만듭니다. 지금 필요한 것은 누군가와의 관계를 유지하는 것보다, 스스로의 욕구와 감정을 솔직하게 인정하는 용기입니다.' },
  { id:7, name_ko:'전차', name_en:'The Chariot',
    img:'/tarot/07-TheChariot.jpg',
    keywords:['승리','의지력','결단','추진력'],
    meaning_up:'강한 의지로 장애물을 극복하고 목표를 향해 돌진하세요. 멈추지 않는 추진력이 승리를 가져옵니다.',
    meaning_rev:'방향성 상실, 공격적인 태도, 또는 통제력 부재. 속도를 늦추고 방향을 재정비하세요.',
    insight_up:'목표를 향해 나아가는 힘은 외부 환경보다 내면의 의지에서 나옵니다. 전차 카드는 흔들리는 감정들을 하나로 모아 앞으로 돌진하는 에너지를 상징합니다. 방향이 분명한 사람은 결국 장애물조차 자신의 추진력으로 바꿔냅니다.',
    insight_rev:'빠르게 달리는 것과 올바른 방향으로 가는 것은 다릅니다. 조급함 속에서 스스로를 몰아붙이면 결국 중심을 잃게 됩니다. 지금은 무작정 전진하기보다 잠시 속도를 늦추고, 진짜 원하는 목적지를 다시 확인해야 합니다.' },
  { id:8, name_ko:'힘', name_en:'Strength',
    img:'/tarot/08-Strength.jpg',
    keywords:['내면의 힘','용기','인내','온화함'],
    meaning_up:'진정한 힘은 폭력이 아닌 온화함에서 나옵니다. 자신의 본능을 두려워하지 말고 사랑으로 다스리세요.',
    meaning_rev:'자기 의심, 내면의 두려움, 또는 억압된 감정. 자신의 강인함을 믿으세요.',
    insight_up:'진짜 강한 사람은 자신의 감정을 억누르는 사람이 아니라, 그것을 이해하고 다룰 줄 아는 사람입니다. 힘 카드는 온화함 속에 숨은 용기를 말합니다. 부드러움은 약함이 아니라 가장 깊은 자기 통제의 형태일 수 있습니다.',
    insight_rev:'겉으로는 괜찮아 보여도 마음속에서는 두려움과 불안이 커지고 있을 수 있습니다. 자신을 믿지 못하면 작은 문제도 크게 흔들립니다. 지금 필요한 것은 완벽함이 아니라, 불안한 자신까지도 인정해주는 따뜻한 시선입니다.' },
  { id:9, name_ko:'은둔자', name_en:'The Hermit',
    img:'/tarot/09-TheHermit.jpg',
    keywords:['내면탐구','고독','지혜','성찰'],
    meaning_up:'외부의 소음을 끄고 내면의 지혜를 찾을 시간입니다. 혼자만의 성찰이 진짜 답을 줍니다.',
    meaning_rev:'지나친 고립, 외로움, 또는 현실 회피. 언제쯤 세상으로 나올 준비가 될까요?',
    insight_up:'혼자 있는 시간은 외로움이 아니라 자신을 깊이 이해하는 과정이 될 수 있습니다. 은둔자는 세상의 소음에서 잠시 멀어져 내면의 목소리를 듣게 합니다. 답은 밖이 아니라 이미 당신 안에서 조용히 빛나고 있습니다.',
    insight_rev:'혼자 있는 시간이 길어질수록 세상과 단절된 느낌이 커질 수 있습니다. 스스로를 지키기 위해 만든 벽이 오히려 고립이 되지는 않았는지 돌아보세요. 때로는 누군가와 마음을 나누는 것 또한 중요한 용기입니다.' },
  { id:10, name_ko:'운명의 수레바퀴', name_en:'Wheel of Fortune',
    img:'/tarot/10-WheelOfFortune.jpg',
    keywords:['운명','전환점','행운','변화'],
    meaning_up:'모든 것이 순환합니다. 지금 상황이 어떻든, 변화가 다가오고 있습니다. 흐름에 올라타세요.',
    meaning_rev:'불운, 저항, 또는 통제할 수 없는 상황. 변화를 거부하면 더 힘들어집니다.',
    insight_up:'삶은 멈춰 있는 직선이 아니라 끊임없이 움직이는 순환입니다. 좋은 시절도, 어려운 시절도 영원하지 않습니다. 변화는 두려움의 대상이 아니라 새로운 흐름으로 이동하기 위한 자연스러운 과정임을 이 카드는 알려줍니다.',
    insight_rev:'원하는 대로 흘러가지 않는다고 해서 모든 것이 끝난 것은 아닙니다. 흐름을 억지로 붙잡으려 할수록 더 큰 피로만 남게 됩니다. 지금은 상황을 통제하려 하기보다, 변화 속에서 배울 수 있는 의미를 발견해야 합니다.' },
  { id:11, name_ko:'정의', name_en:'Justice',
    img:'/tarot/11-Justice.jpg',
    keywords:['공정','진실','인과응보','균형'],
    meaning_up:'모든 행동에는 결과가 따릅니다. 지금 상황은 과거의 선택에 대한 공정한 결과입니다.',
    meaning_rev:'불공정, 책임 회피, 또는 편향된 판단. 진실에서 눈을 돌리지 마세요.',
    insight_up:'삶은 결국 자신이 선택한 것들의 결과와 마주하게 됩니다. 정의 카드는 냉정한 심판이 아니라 균형의 원리를 의미합니다. 감정에 치우치지 않고 스스로를 정직하게 바라볼 때, 비로소 가장 공정한 답에 가까워질 수 있습니다.',
    insight_rev:'자신의 잘못을 외면하거나 상황을 편하게 해석하려 하면 결국 더 큰 불균형이 찾아옵니다. 진실은 잠시 피할 수는 있어도 완전히 사라지지 않습니다. 지금 필요한 것은 변명이 아니라 책임을 인정하는 태도입니다.' },
  { id:12, name_ko:'매달린 사람', name_en:'The Hanged Man',
    img:'/tarot/12-TheHangedMan.jpg',
    keywords:['희생','다른시각','기다림','내려놓음'],
    meaning_up:'멈춤이 곧 전진입니다. 지금 당장 행동하지 않고 기다리는 것이 더 현명한 선택일 수 있습니다.',
    meaning_rev:'희생을 거부하거나 필요 없는 순교를 하고 있습니다. 무엇을 위해 기다리는지 점검하세요.',
    insight_up:'멈춰 있는 시간은 실패가 아니라 새로운 시각을 얻기 위한 과정일 수 있습니다. 때로는 억지로 앞으로 나아가기보다 잠시 내려놓을 때 더 중요한 깨달음이 찾아옵니다. 지금의 기다림은 헛된 시간이 아닙니다.',
    insight_rev:'변화가 두려워 같은 자리에 머물고 있을 수 있습니다. 희생이라는 이름 아래 자신을 지나치게 억누르지는 않았는지도 돌아보세요. 지금 필요한 것은 무조건 참는 것이 아니라, 무엇을 놓아야 하는지 분명히 아는 용기입니다.' },
  { id:13, name_ko:'죽음', name_en:'Death',
    img:'/tarot/13-Death.jpg',
    keywords:['변환','끝과시작','놓아주기','재탄생'],
    meaning_up:'두려워하지 마세요. 끝은 곧 새로운 시작입니다. 더 이상 필요하지 않은 것을 기꺼이 내려놓으세요.',
    meaning_rev:'변화에 저항하거나 과거에 집착하고 있습니다. 끝이 나야 새로운 문이 열립니다.',
    insight_up:'끝은 사라짐이 아니라 새로운 시작을 위한 정리입니다. 죽음 카드는 반드시 필요한 변화와 전환을 상징합니다. 오래된 관계와 감정, 방식들을 내려놓을 때 비로소 새로운 가능성과 삶의 흐름이 들어올 공간이 생깁니다.',
    insight_rev:'이미 끝난 것을 붙잡고 있을수록 마음은 더 지쳐갑니다. 변화는 고통스럽지만 피한다고 멈추지 않습니다. 지금은 과거를 지키려 하기보다, 새로운 삶을 맞이하기 위해 무엇을 떠나보내야 하는지 받아들여야 합니다.' },
  { id:14, name_ko:'절제', name_en:'Temperance',
    img:'/tarot/14-Temperance.jpg',
    keywords:['균형','조화','인내','치유'],
    meaning_up:'극단을 피하고 균형을 찾는 것이 지금 가장 중요합니다. 서두르지 않아도 됩니다.',
    meaning_rev:'불균형, 과잉, 또는 조급함. 무언가를 너무 많이 또는 너무 적게 하고 있습니다.',
    insight_up:'삶은 어느 한쪽으로 치우치지 않을 때 가장 건강한 흐름을 만듭니다. 절제 카드는 조화와 균형의 지혜를 말합니다. 서로 다른 감정과 상황을 부드럽게 섞어내는 힘이 결국 마음의 평온과 지속 가능한 행복을 가져옵니다.',
    insight_rev:'지나침은 부족함만큼이나 사람을 무너뜨립니다. 감정, 관계, 일 어느 하나에 과하게 몰입하면 결국 균형을 잃게 됩니다. 지금은 속도를 줄이고 자신의 생활과 감정을 차분히 조율할 필요가 있습니다.' },
  { id:15, name_ko:'악마', name_en:'The Devil',
    img:'/tarot/15-TheDevil.jpg',
    keywords:['속박','집착','중독','그림자자아'],
    meaning_up:'당신을 묶고 있는 것은 생각보다 약합니다. 사슬은 스스로 풀 수 있어요. 무엇이 두렵나요?',
    meaning_rev:'중독이나 집착에서 벗어나려는 시도. 하지만 완전한 해방까지는 시간이 필요합니다.',
    insight_up:'당신을 묶고 있는 사슬은 생각보다 단단하지 않을 수 있습니다. 악마 카드는 욕망과 집착, 두려움을 직면하게 합니다. 문제의 핵심은 상황 자체보다 그것에 끌려다니는 마음일지도 모릅니다. 진실을 보는 순간 해방은 시작됩니다.',
    insight_rev:'벗어나고 싶다는 마음이 생겼다는 것만으로도 이미 변화는 시작된 것입니다. 오래된 중독과 관계, 집착에서 천천히 거리를 두고 있습니다. 완전한 자유는 하루아침에 오지 않지만, 당신은 분명 이전과 다른 방향으로 움직이고 있습니다.' },
  { id:16, name_ko:'탑', name_en:'The Tower',
    img:'/tarot/16-TheTower.jpg',
    keywords:['갑작스런변화','붕괴','계시','해방'],
    meaning_up:'갑작스러운 충격이지만, 무너진 것은 사실 거짓된 토대 위에 있었습니다. 진실이 드러나는 중입니다.',
    meaning_rev:'재앙을 피하거나, 변화의 충격이 예상보다 작습니다. 하지만 경각심은 늦추지 마세요.',
    insight_up:'무너짐은 때로 가장 정직한 형태의 구원입니다. 탑 카드는 거짓된 믿음과 불안정한 기반이 깨지는 순간을 의미합니다. 충격은 크지만, 그 과정 끝에는 더 이상 속이지 않아도 되는 자유와 진실이 기다리고 있습니다.',
    insight_rev:'변화를 미루고 문제를 덮어두면 결국 더 큰 불안으로 돌아올 수 있습니다. 지금의 흔들림은 경고일 수도 있습니다. 완전히 무너지기 전에 무엇이 잘못된 기반 위에 세워져 있었는지 스스로 인정해야 합니다.' },
  { id:17, name_ko:'별', name_en:'The Star',
    img:'/tarot/17-TheStar.jpg',
    keywords:['희망','영감','치유','평온','믿음'],
    meaning_up:'폭풍이 지나갔습니다. 이제 치유와 재생의 시간입니다. 희망을 잃지 마세요.',
    meaning_rev:'믿음 상실, 절망, 또는 꿈을 포기하고 싶은 마음. 하지만 별은 항상 거기 있습니다.',
    insight_up:'가장 어두운 밤 뒤에는 반드시 다시 빛이 찾아옵니다. 별 카드는 희망과 치유의 에너지를 상징합니다. 완벽하지 않아도 괜찮습니다. 상처 입은 마음조차도 결국 당신을 더 깊고 따뜻한 사람으로 성장시키고 있습니다.',
    insight_rev:'희망을 잃었다고 느끼는 순간에도 마음 한편에는 아직 작은 빛이 남아 있습니다. 지금은 결과보다 회복이 먼저입니다. 자신을 지나치게 몰아붙이지 말고, 천천히 다시 믿음을 회복할 시간을 허락해 주세요.' },
  { id:18, name_ko:'달', name_en:'The Moon',
    img:'/tarot/18-TheMoon.jpg',
    keywords:['환상','두려움','잠재의식','직관'],
    meaning_up:'지금 보이는 것이 전부가 아닙니다. 두려움과 환상을 구분하고 직관을 따르세요.',
    meaning_rev:'혼란이 걷히고 있습니다. 숨겨진 진실이 드러나거나, 두려움에서 벗어나는 시기입니다.',
    insight_up:'모든 것이 분명해 보이지 않는 시기일수록 직관은 더욱 중요해집니다. 달 카드는 불안과 환상 속에서도 스스로의 내면을 탐색하게 만듭니다. 두려움을 무조건 피하지 말고 바라보세요. 그 안에 진짜 감정과 진실이 숨어 있습니다.',
    insight_rev:'흐릿했던 감정과 상황들이 조금씩 정리되기 시작합니다. 막연한 불안의 정체를 알게 되면 마음은 생각보다 빠르게 안정됩니다. 이제는 환상보다 현실을 직면할 준비가 되어가고 있습니다.' },
  { id:19, name_ko:'태양', name_en:'The Sun',
    img:'/tarot/19-TheSun.jpg',
    keywords:['성공','기쁨','활력','자신감','긍정'],
    meaning_up:'밝고 따뜻한 에너지가 가득합니다. 지금 이 순간을 온전히 즐기세요. 당신은 빛나고 있습니다.',
    meaning_rev:'지나친 낙관주의, 또는 일시적인 기쁨. 긍정적이되 현실도 놓치지 마세요.',
    insight_up:'태양은 있는 그대로의 자신을 사랑할 때 가장 밝게 빛난다고 말합니다. 억지로 꾸미지 않아도 당신의 에너지와 진심은 주변에 따뜻한 영향을 줍니다. 지금은 기쁨을 미루지 말고 현재의 행복을 충분히 누려도 되는 시간입니다.',
    insight_rev:'긍정적인 마음도 현실을 외면하는 순간 공허해질 수 있습니다. 괜찮은 척 웃고 있지만 마음 한편에는 피로와 불안이 남아 있을지도 모릅니다. 진짜 행복은 억지 낙관이 아니라 솔직함 위에서 오래 지속됩니다.' },
  { id:20, name_ko:'심판', name_en:'Judgement',
    img:'/tarot/20-Judgement.jpg',
    keywords:['부활','반성','소명','해방'],
    meaning_up:'과거를 정직하게 돌아볼 시간입니다. 진정한 자신의 소명을 듣고 새로운 차원으로 나아가세요.',
    meaning_rev:'자기 비판, 또는 과거에 집착하여 앞으로 나아가지 못하고 있습니다.',
    insight_up:'과거를 돌아본다는 것은 후회하기 위해서가 아니라, 더 나은 자신으로 다시 태어나기 위해서입니다. 심판 카드는 삶의 중요한 깨달음과 각성을 의미합니다. 이제는 오래된 후회보다 앞으로 나아갈 이유에 집중해야 합니다.',
    insight_rev:'스스로를 지나치게 비난하거나 과거의 실수에 붙잡혀 있을 수 있습니다. 하지만 변화는 완벽한 사람이 되어야만 가능한 것이 아닙니다. 지금 필요한 것은 자기 처벌이 아니라, 자신을 다시 믿어보려는 선택입니다.' },
  { id:21, name_ko:'세계', name_en:'The World',
    img:'/tarot/21-TheWorld.jpg',
    keywords:['완성','성취','통합','총체'],
    meaning_up:'하나의 사이클이 완성되었습니다. 당신이 이룬 것을 축하하고, 다음 여정을 준비하세요.',
    meaning_rev:'미완성, 지연, 또는 완벽주의로 인한 마무리 실패. 조금만 더 가면 됩니다.',
    insight_up:'하나의 긴 여정이 마침내 완성 단계에 도달했습니다. 세계 카드는 성취와 통합, 그리고 새로운 시작 직전의 충만함을 의미합니다. 당신이 지나온 모든 경험은 결국 지금의 자신을 완성하기 위한 과정이었습니다.',
    insight_rev:'거의 다 왔음에도 스스로를 의심하며 마지막 문턱 앞에서 멈춰 있을 수 있습니다. 완벽해야만 끝낼 수 있다는 생각은 오히려 흐름을 지연시킵니다. 부족함이 있어도 마무리할 용기를 낼 때 다음 세계가 열립니다.' },
]

/* ═══════════════════ HELPERS ═══════════════════ */
function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const ROMAN = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X',
               'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI']

/* ═══════════════════ COSMOS CANVAS ═══════════════════ */
function CosmosCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.45 + 0.05,
      s: Math.random() * 0.003 + 0.001,
      p: Math.random() * Math.PI * 2,
    }))

    function resize() {
      canvas!.width  = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function draw(t: number) {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      stars.forEach(s => {
        const a = s.a * (0.6 + 0.4 * Math.sin(t * s.s + s.p))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,210,255,${a})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */
type Step = 'question' | 'shuffle' | 'pick' | 'result'

export default function TarotPage() {
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

  /* Google Fonts */
  useEffect(() => {
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600&family=Cinzel:wght@400;600&family=Noto+Sans+KR:wght@300;400&display=swap'
    document.head.appendChild(link)
  }, [])

  /* Supabase에서 카드 데이터 불러오기 */
  useEffect(() => {
    let query = supabase
      .from('tarot_cards')
      .select('*')
      .eq('is_published', true)
      .order('id')

    if (deckMode === 'simple') {
      query = query.eq('deck_type', 'major')
    }

    query.then(({ data, error }) => {
      if (error || !data) return
      const mapped: TarotCard[] = data.map((c: any) => ({
        id: c.id,
        name_ko: c.name_ko,
        name_en: c.name_en,
        img: c.image_url,
        keywords: c.keywords ?? [],
        meaning_up: c.meaning_up,
        meaning_rev: c.meaning_rev,
        insight_up: c.insight_up,
        insight_rev: c.insight_rev,
      }))
      setCards(mapped)
    })
  }, [deckMode])

  function goTo(s: Step) {
    setFlipped(false)
    setPicking(false)
    if (s === 'shuffle') {
      setShuffleCount(0)
      setDeck(shuffleArr(cards))
    }
    setStep(s)
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
    setPickedCard(card)
    setIsReversed(rev)

    /* Supabase에 세션 로그 저장 */
    supabase.from('tarot_sessions').insert({
      question: question || null,
      category: category || null,
      deck_mode: deckMode,
      card_id: card.id,
      is_reversed: rev,
    }).then(() => {})

    setTimeout(() => {
      setStep('result')
      setTimeout(() => setFlipped(true), 400)
    }, 350)
  }

  const cueText =
    shuffleCount === 0 ? '카드를 터치해 섞어주세요' :
    shuffleCount < 3   ? `다시 한 번 더... (${shuffleCount}/3)` :
    shuffleCount === 3 ? '✓ 준비됐어요 — 다시 탭하면 펼칩니다' :
                         '카드를 펼치는 중...'

  /* ── STYLES ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600&family=Cinzel:wght@400;600&family=Noto+Sans+KR:wght@300;400&display=swap');

    .tarot-root {
      --bg:      #1e1535;
      --bg2:     #271c42;
      --bg3:     #32265a;
      --accent:  #a78bfa;
      --accent2: #c4b5fd;
      --gold:    #f0c060;
      --gold2:   #fde68a;
      --text:    #f0ecff;
      --text2:   #c4b5fd;
      --text3:   #9b8ec4;
      --border:  rgba(167,139,250,.25);
      --border2: rgba(167,139,250,.12);
      font-family:'Noto Sans KR',sans-serif; font-weight:400;
      background:var(--bg); color:var(--text);
      min-height:100dvh; overflow-x:hidden;
    }
    .tarot-root * { box-sizing:border-box; margin:0; padding:0; }

    .screen { min-height:100dvh; display:flex; flex-direction:column; align-items:center; padding:0 20px; }

    /* -- brand -- */
    .brand { font-family:'Cinzel',serif; font-size:11px; letter-spacing:5px; color:var(--accent2); text-transform:uppercase; margin-bottom:20px; animation:fadeDown .8s ease both; opacity:.85; }
    .hero-title { font-family:'Noto Serif KR',serif; font-size:clamp(22px,5.5vw,30px); font-weight:400; line-height:1.5; text-align:center; color:var(--text); margin-bottom:10px; animation:fadeDown .8s .15s ease both; }
    .hero-title em { font-style:normal; color:var(--gold2); font-weight:600; }
    .hero-sub { font-size:13px; color:var(--text2); letter-spacing:1px; margin-bottom:24px; animation:fadeDown .8s .2s ease both; }

    /* cats */
    .cats { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-bottom:16px; animation:fadeDown .8s .25s ease both; }
    .cat { padding:8px 18px; border-radius:24px; border:1px solid var(--border); background:rgba(167,139,250,.08); color:var(--text2); font-size:13px; font-family:'Noto Sans KR',sans-serif; cursor:pointer; transition:all .2s; }
    .cat.on,.cat:hover { border-color:var(--accent); background:rgba(167,139,250,.2); color:var(--text); }

    /* textarea */
    .q-wrap { width:100%; max-width:380px; background:rgba(255,255,255,.08); border:1.5px solid var(--border); border-radius:14px; padding:16px; margin-bottom:16px; animation:fadeDown .8s .3s ease both; transition:border-color .2s; }
    .q-wrap:focus-within { border-color:var(--accent); background:rgba(255,255,255,.11); }
    .q-wrap textarea { width:100%; height:90px; background:transparent; border:none; outline:none; color:var(--text); font-size:15px; line-height:1.7; resize:none; font-family:'Noto Sans KR',sans-serif; font-weight:400; }
    .q-wrap textarea::placeholder { color:var(--text3); font-size:14px; }

    /* buttons */
    .go-btn { width:100%; max-width:380px; padding:16px; border-radius:14px; border:none; background:linear-gradient(135deg,#7c3aed,#a78bfa); color:#fff; font-size:16px; font-weight:500; letter-spacing:.5px; font-family:'Noto Sans KR',sans-serif; cursor:pointer; transition:all .25s; animation:fadeDown .8s .35s ease both; box-shadow:0 4px 20px rgba(124,58,237,.4); }
    .go-btn:hover { background:linear-gradient(135deg,#6d28d9,#8b5cf6); box-shadow:0 6px 28px rgba(124,58,237,.55); transform:translateY(-1px); }
    .back-btn { background:transparent; border:none; color:var(--text2); font-size:13px; cursor:pointer; font-family:'Noto Sans KR',sans-serif; display:flex; align-items:center; gap:6px; transition:color .2s; font-weight:400; }
    .back-btn:hover { color:var(--text); }
    .again-btn { width:100%; max-width:420px; padding:14px; border-radius:12px; border:1.5px solid var(--border); background:rgba(167,139,250,.08); color:var(--text2); font-size:14px; font-family:'Noto Sans KR',sans-serif; cursor:pointer; transition:all .2s; margin-top:8px; font-weight:400; }
    .again-btn:hover { border-color:var(--accent); color:var(--text); background:rgba(167,139,250,.15); }

    /* shuffle screen */
    .s-label { font-family:'Cinzel',serif; font-size:11px; letter-spacing:3px; color:var(--accent2); text-transform:uppercase; margin-bottom:20px; opacity:.8; }
    .s-title { font-family:'Noto Serif KR',serif; font-size:22px; font-weight:400; text-align:center; line-height:1.5; color:var(--text); margin-bottom:8px; }
    .s-sub { font-size:14px; color:var(--text2); text-align:center; margin-bottom:32px; }

    /* deck */
    .deck { position:relative; width:160px; height:260px; cursor:pointer; margin-bottom:36px; -webkit-tap-highlight-color:transparent; }
    .deck-card { position:absolute; width:140px; height:240px; border-radius:14px; border:1.5px solid rgba(167,139,250,.35); background:linear-gradient(160deg,#2d1f52,#1a1235); overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,.4); }
    .deck-card:nth-child(1) { left:16px; top:16px; transform:rotate(-10deg); }
    .deck-card:nth-child(2) { left:8px; top:8px; transform:rotate(-4deg); }
    .deck-card:nth-child(3) { left:0; top:0; transform:rotate(2deg); }
    .deck-inner { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background-image:repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(167,139,250,.1) 6px,rgba(167,139,250,.1) 7px); }
    .deck.shuffling .deck-card:nth-child(3) { animation:shuffleL .45s ease; }
    .deck.shuffling .deck-card:nth-child(2) { animation:shuffleM .45s .05s ease; }

    /* pulse */
    .pulse { width:14px; height:14px; border-radius:50%; opacity:.7; animation:pulseAnim 1.5s infinite; }
    .cue-txt { font-size:15px; color:var(--text2); margin-top:14px; font-weight:400; text-align:center; }

    /* progress dots */
    .prog { display:flex; gap:7px; margin-top:32px; }
    .prog-dot { width:6px; height:6px; border-radius:3px; background:rgba(167,139,250,.25); transition:all .3s; }
    .prog-dot.on { background:var(--accent); width:20px; }

    /* pick screen */
    .pick-title { font-family:'Noto Serif KR',serif; font-size:22px; font-weight:400; text-align:center; color:var(--text); margin-bottom:8px; }
    .pick-sub { font-size:14px; color:var(--text2); text-align:center; margin-bottom:32px; }
    .spread { display:flex; gap:clamp(10px,3vw,20px); justify-content:center; align-items:flex-end; width:100%; margin-bottom:28px; }
    .s-card { width:clamp(90px,24vw,120px); height:calc(clamp(90px,24vw,120px)*1.75); border-radius:14px; border:1.5px solid rgba(167,139,250,.3); background:linear-gradient(160deg,#2d1f52,#1a1235); cursor:pointer; position:relative; overflow:hidden; transition:all .3s; -webkit-tap-highlight-color:transparent; box-shadow:0 6px 24px rgba(0,0,0,.35); }
    .s-card:nth-child(1) { transform:rotate(-5deg); }
    .s-card:nth-child(2) { transform:rotate(0deg) translateY(-8px); }
    .s-card:nth-child(3) { transform:rotate(5deg); }
    .s-card:hover { transform:translateY(-18px) rotate(0deg) scale(1.04) !important; border-color:var(--accent); z-index:2; box-shadow:0 16px 48px rgba(167,139,250,.4); }
    .s-card-inner { width:100%; height:100%; background-image:repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(167,139,250,.1) 6px,rgba(167,139,250,.1) 7px); display:flex; align-items:center; justify-content:center; }
    .s-card-glow { position:absolute; inset:0; background:radial-gradient(ellipse at 50% 30%,rgba(167,139,250,.3),transparent 65%); opacity:0; transition:opacity .3s; }
    .s-card:hover .s-card-glow,.s-card:active .s-card-glow { opacity:1; }
    .s-card-pos { position:absolute; bottom:7px; left:0; right:0; text-align:center; font-size:9px; color:rgba(201,168,76,.5); letter-spacing:1.5px; font-family:'Cinzel',serif; }

    /* flip */
    .flip-wrap { width:140px; height:240px; margin:0 auto 24px; flex-shrink:0; position:relative; }
    .flip-inner { width:100%; height:100%; transition:opacity .4s ease; }
    .flip-front { position:absolute; inset:0; border-radius:12px; border:1px solid rgba(201,168,76,.25); background:linear-gradient(160deg,#1e1638,#12102a); display:flex; align-items:center; justify-content:center; background-image:repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(201,168,76,.07) 5px,rgba(201,168,76,.07) 6px); transition:opacity .4s ease; }
    .flip-back { position:absolute; inset:0; border-radius:12px; border:none; overflow:hidden; background:transparent; opacity:0; transition:opacity .4s ease .4s; }
    .flip-inner.flipped .flip-front { opacity:0; }
    .flip-inner.flipped .flip-back { opacity:1; }
    .flip-back img { position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; opacity:.85; display:block; }
    .flip-back-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(14,11,24,.9) 30%,rgba(14,11,24,.2) 100%); }
    .flip-back-num { position:absolute; top:10px; left:0; right:0; text-align:center; font-family:'Cinzel',serif; font-size:9px; letter-spacing:2px; color:rgba(255,255,255,.9); z-index:1; text-shadow:0 1px 4px rgba(0,0,0,.8); }
    .flip-back-name { position:absolute; bottom:28px; left:8px; right:8px; font-family:'Noto Serif KR',serif; font-size:14px; color:#fff; z-index:1; text-align:center; line-height:1.3; font-weight:500; text-shadow:0 2px 8px rgba(0,0,0,.9); }
    .flip-back-sub { position:absolute; bottom:10px; left:0; right:0; text-align:center; font-size:10px; color:rgba(255,255,255,.7); z-index:1; letter-spacing:1px; font-family:'Cinzel',serif; text-shadow:0 1px 4px rgba(0,0,0,.8); }

    /* result sections */
    .rev-badge { display:inline-flex; align-items:center; gap:5px; background:rgba(245,158,11,.15); border:1.5px solid rgba(245,158,11,.4); border-radius:12px; padding:5px 12px; font-size:12px; color:#fde68a; font-weight:500; margin-bottom:14px; }
    .result-section { width:100%; max-width:420px; background:rgba(255,255,255,.06); border:1.5px solid var(--border2); border-radius:14px; padding:18px; margin-bottom:10px; }
    .rs-label { font-family:'Cinzel',serif; font-size:10px; letter-spacing:2px; color:var(--accent2); text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
    .rs-label::after { content:''; flex:1; height:1px; background:linear-gradient(to right,rgba(201,168,76,.2),transparent); }
    .rs-keywords { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; }
    .kw { padding:5px 12px; border-radius:20px; border:1.5px solid rgba(167,139,250,.3); font-size:12px; color:var(--accent2); background:rgba(167,139,250,.1); font-weight:500; }
    .rs-text { font-size:15px; line-height:1.8; color:var(--text); font-weight:400; }
    .sunny-box { width:100%; max-width:420px; background:linear-gradient(135deg,rgba(124,58,237,.15),rgba(167,139,250,.08)); border:1.5px solid rgba(167,139,250,.35); border-radius:14px; padding:20px; margin-bottom:10px; position:relative; overflow:hidden; }
    .sunny-box::before { content:'✦'; position:absolute; right:14px; top:10px; font-size:28px; color:rgba(201,168,76,.06); }
    .sunny-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(167,139,250,.2); border:1.5px solid rgba(167,139,250,.4); border-radius:20px; padding:5px 14px; font-size:11px; color:var(--accent2); font-weight:600; margin-bottom:14px; }
    .sunny-text { font-family:'Noto Serif KR',serif; font-size:15px; line-height:1.9; color:var(--text); font-weight:400; }

    /* animations */
    @keyframes fadeDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
    @keyframes pulseAnim { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.8);opacity:.15} }
    @keyframes shuffleL { 0%{transform:rotate(2deg) translateX(0)} 25%{transform:rotate(-25deg) translateX(-50px) translateY(-20px) scale(1.05)} 60%{transform:rotate(18deg) translateX(35px) translateY(-5px)} 100%{transform:rotate(2deg) translateX(0)} }
    @keyframes shuffleM { 0%{transform:rotate(-4deg)} 25%{transform:rotate(20deg) translateX(40px) translateY(-15px) scale(1.03)} 60%{transform:rotate(-22deg) translateX(-30px) translateY(5px)} 100%{transform:rotate(-4deg)} }
    .fu  { animation:fadeUp .6s ease both; }
    .fu1 { animation:fadeUp .6s .1s ease both; }
    .fu2 { animation:fadeUp .6s .2s ease both; }
    .fu3 { animation:fadeUp .6s .35s ease both; }
    .fu4 { animation:fadeUp .6s .5s ease both; }

    ::-webkit-scrollbar { width:3px; }
    ::-webkit-scrollbar-thumb { background:#2e2448; border-radius:2px; }
  `

  return (
    <>
      <style>{css}</style>
      <div className="tarot-root" style={{ position: 'relative' }}>
        <CosmosCanvas />
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ══════════ S1: QUESTION ══════════ */}
          {step === 'question' && (
            <div className="screen" style={{ justifyContent: 'center', gap: 0 }}>
              <div style={{ height: 'clamp(40px,8vh,70px)' }} />

              <div className="brand">오늘의 한 장, 타로</div>

              {/* sigil */}
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

              <h1 className="hero-title">마음 속 질문을 품고<br /><em>카드를 선택</em>해 보세요</h1>
              <p className="hero-sub">✦ &nbsp; Major Arcana 22장 &nbsp; ✦</p>

              {/* 덱 선택 */}
              <div style={{ display:'flex', gap:10, marginBottom:20, width:'100%', maxWidth:380, animation:'fadeDown .8s .18s ease both' }}>
                <button
                  onClick={() => setDeckMode('simple')}
                  style={{
                    flex:1, padding:'14px 12px', borderRadius:12,
                    border: deckMode==='simple' ? '2px solid #a78bfa' : '1.5px solid rgba(167,139,250,.25)',
                    background: deckMode==='simple' ? 'rgba(124,58,237,.25)' : 'rgba(255,255,255,.05)',
                    color: deckMode==='simple' ? '#f0ecff' : '#c4b5fd',
                    fontSize:14, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif',
                    transition:'all .2s', fontWeight: deckMode==='simple' ? 600 : 400,
                    display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                  }}>
                  <span style={{fontSize:20}}>🌙</span>
                  <span>심플</span>
                  <span style={{fontSize:11, opacity:.7, fontWeight:400}}>메이저 22장</span>
                </button>
                <button
                  onClick={() => setDeckMode('deep')}
                  style={{
                    flex:1, padding:'14px 12px', borderRadius:12,
                    border: deckMode==='deep' ? '2px solid #a78bfa' : '1.5px solid rgba(167,139,250,.25)',
                    background: deckMode==='deep' ? 'rgba(124,58,237,.25)' : 'rgba(255,255,255,.05)',
                    color: deckMode==='deep' ? '#f0ecff' : '#c4b5fd',
                    fontSize:14, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif',
                    transition:'all .2s', fontWeight: deckMode==='deep' ? 600 : 400,
                    display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                  }}>
                  <span style={{fontSize:20}}>🔮</span>
                  <span>심층</span>
                  <span style={{fontSize:11, opacity:.7, fontWeight:400}}>전체 78장</span>
                </button>
              </div>

              <div className="cats">
                {['💜 연애','✨ 금전','🔮 사업','🌙 일반'].map(c => (
                  <button key={c} className={`cat${category === c ? ' on' : ''}`}
                    onClick={() => setCategory(c)}>{c}</button>
                ))}
              </div>

              <div className="q-wrap">
                <textarea
                  placeholder={'고민을 솔직하게 적어주세요, 카드가 느낍니다.\n예) 이 사람이 저를 진심으로 좋아하는 걸까요?'}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <button className="go-btn" onClick={() => goTo('shuffle')}>
                카드를 섞어주세요 &nbsp;→
              </button>
              <div style={{ height: 24 }} />
            </div>
          )}

          {/* ══════════ S2: SHUFFLE ══════════ */}
          {step === 'shuffle' && (
            <div className="screen" style={{ justifyContent: 'center' }}>
              <div style={{ height: 'clamp(60px,12vh,90px)' }} />

              <button className="back-btn" style={{ marginBottom: 20 }} onClick={() => goTo('question')}>
                ← 돌아가기
              </button>

              <div className="s-label">Step 2 — Shuffle</div>
              <h2 className="s-title">눈을 감고<br />질문에 집중하세요</h2>
              <p className="s-sub">준비되면 카드 뭉치를 터치하세요</p>

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
                {[0,1,2,3].map(i => (
                  <div key={i} className={`prog-dot${i === 1 ? ' on' : ''}`} />
                ))}
              </div>
            </div>
          )}

          {/* ══════════ S3: PICK ══════════ */}
          {step === 'pick' && (
            <div className="screen" style={{ justifyContent: 'center', paddingTop: 20 }}>
              <div style={{ height: 'clamp(55px,10vh,75px)' }} />

              <button className="back-btn" style={{ marginBottom: 20 }} onClick={() => goTo('shuffle')}>
                ← 돌아가기
              </button>

              <div className="s-label">Step 3 — Choose</div>
              <h2 className="pick-title">마음이 끌리는 카드를<br />한 장 선택하세요</h2>
              <p className="pick-sub">직관을 따르세요 — 계산하지 마세요</p>

              <div className="spread">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="s-card" onClick={() => handlePick(i)}>
                    <div className="s-card-inner" />
                    <div className="s-card-glow" />
                  </div>
                ))}
              </div>

              <div className="prog">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`prog-dot${i === 2 ? ' on' : ''}`} />
                ))}
              </div>
            </div>
          )}

          {/* ══════════ S4: RESULT ══════════ */}
          {step === 'result' && pickedCard && (
            <div className="screen" style={{ justifyContent: 'flex-start', paddingTop: 16, paddingBottom: 40 }}>
              <div style={{ height: 52, flexShrink: 0 }} />

              <button className="back-btn fu" style={{ marginBottom: 16 }} onClick={() => goTo('question')}>
                ← 처음으로
              </button>

              {/* flip card */}
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
                    <img
                      src={pickedCard.img}
                      alt={pickedCard.name_en}
                      style={{ transform: isReversed ? 'rotate(180deg)' : 'none' }}
                    />
                    <div className="flip-back-overlay" />
                    <div className="flip-back-num">The Major Arcana · {ROMAN[pickedCard.id]}</div>
                    <div className="flip-back-name">{pickedCard.name_ko}<br />{pickedCard.name_en}</div>
                    <div className="flip-back-sub">{pickedCard.keywords.slice(0,3).join(' · ')}</div>
                  </div>
                </div>
              </div>

              {/* reversed badge */}
              {isReversed && (
                <div className="rev-badge fu1">↕ 역방향</div>
              )}

              {/* keywords */}
              <div className="result-section fu1">
                <div className="rs-label">Keywords</div>
                <div className="rs-keywords">
                  {pickedCard.keywords.map(k => (
                    <span key={k} className="kw">{k}</span>
                  ))}
                </div>
              </div>

              {/* meaning */}
              <div className="result-section fu2">
                <div className="rs-label">카드의 의미</div>
                <p className="rs-text">
                  {isReversed ? pickedCard.meaning_rev : pickedCard.meaning_up}
                </p>
              </div>

              {/* sunny insight */}
              <div className="sunny-box fu3">
                <div className="sunny-badge">✦ 오늘의 통찰</div>
                <p className="sunny-text">
                  {isReversed ? pickedCard.insight_rev : pickedCard.insight_up}
                </p>
              </div>

              <button className="again-btn fu4" onClick={() => goTo('question')}>
                새로운 질문하기
              </button>
              <div style={{ height: 20, flexShrink: 0 }} />
            </div>
          )}

        </div>
      </div>
    </>
  )
}
