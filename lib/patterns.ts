// lib/patterns.ts
// 책 "필수회화구문 140" 목차/구문을 사진에서 직접 옮긴 데이터 (1~140 전체)
export interface Dialogue {
  speaker: "E" | "K";
  text_en: string;
  text_ko: string;
}

export interface PatternData {
  id: number;
  chapter_num: number;
  chapter_title: string;
  pattern_ko: string;
  pattern_en: string;
  example_dialogue: Dialogue[];
}

export const CHAPTER_TITLES: Record<number, string> = {
  1: "자주 보지만 막상 말하려면 생각이 안 나는 동사관련 구문",
  2: "자주 보지만 막상 말하려면 생각이 안 나는 기타 구문",
  3: "영어식으로 발상이 안 되기 때문에 사용하기 어려운 구문",
  4: "12가지 특수 구문",
  5: "기본 단어만 알면 쉽게 사용할 수 있는 구문",
  6: "실수할까 봐 두려운 구문 & 문법은 맞지만 아무도 그렇게 말하지 않는 구문",
  7: "관용적으로 외워두면 좋은 구문과 표현",
};

export const PATTERNS: PatternData[] = [
  {
    id: 1,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~일 것 같다",
    pattern_en: "be likely to ~",
    example_dialogue: [
      { speaker: "E", text_en: "It's likely to rain this afternoon.", text_ko: "오후에 비가 올 것 같아." },
      { speaker: "K", text_en: "Then let's take an umbrella.", text_ko: "그럼 우산을 챙기자." },
    ],
  },
  {
    id: 2,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "계속 ~하다",
    pattern_en: "keep -ing",
    example_dialogue: [
      { speaker: "E", text_en: "Don't give up. Keep trying!", text_ko: "포기하지 마. 계속 노력해!" },
      { speaker: "K", text_en: "Okay, I'll keep trying.", text_ko: "알겠어, 계속 해 볼게." },
    ],
  },
  {
    id: 3,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~를 하려고 한다",
    pattern_en: "intend to ~",
    example_dialogue: [
      { speaker: "E", text_en: "What do you intend to do after graduation?", text_ko: "졸업 후에 뭐 할 작정이야?" },
      { speaker: "K", text_en: "I intend to study abroad.", text_ko: "유학 갈 생각이야." },
    ],
  },
  {
    id: 4,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "주저 말고 ~하세요",
    pattern_en: "feel free to ~",
    example_dialogue: [
      { speaker: "E", text_en: "Feel free to ask me anything.", text_ko: "뭐든 편하게 물어보세요." },
      { speaker: "K", text_en: "Thank you, that's very kind.", text_ko: "감사합니다, 정말 친절하시네요." },
    ],
  },
  {
    id: 5,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "…이거나 ~이다",
    pattern_en: "either … or ~",
    example_dialogue: [
      { speaker: "E", text_en: "You can have either coffee or tea.", text_ko: "커피나 차 중에 드시면 돼요." },
      { speaker: "K", text_en: "I'll take coffee, please.", text_ko: "커피로 할게요." },
    ],
  },
  {
    id: 6,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "빨리 ~하고 싶어",
    pattern_en: "can't wait to ~",
    example_dialogue: [
      { speaker: "E", text_en: "I can't wait to see the new movie.", text_ko: "새 영화 빨리 보고 싶어." },
      { speaker: "K", text_en: "Me too! Let's go this weekend.", text_ko: "나도! 이번 주말에 가자." },
    ],
  },
  {
    id: 7,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "…하느니 차라리 ~하겠다",
    pattern_en: "would rather ~ than …",
    example_dialogue: [
      { speaker: "E", text_en: "I would rather stay home than go out.", text_ko: "나가느니 차라리 집에 있겠어." },
      { speaker: "K", text_en: "Same here. I'm tired.", text_ko: "나도 그래. 피곤해." },
    ],
  },
  {
    id: 8,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "꼭 ~해라",
    pattern_en: "be sure to ~",
    example_dialogue: [
      { speaker: "E", text_en: "Be sure to lock the door.", text_ko: "꼭 문을 잠가." },
      { speaker: "K", text_en: "Don't worry, I will.", text_ko: "걱정 마, 그럴게." },
    ],
  },
  {
    id: 9,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~했어야 했는데",
    pattern_en: "should have + PP",
    example_dialogue: [
      { speaker: "E", text_en: "I should have studied harder.", text_ko: "더 열심히 공부했어야 했는데." },
      { speaker: "K", text_en: "It's not too late to start now.", text_ko: "지금 시작해도 늦지 않았어." },
    ],
  },
  {
    id: 10,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~할 자격이 없다",
    pattern_en: "not deserve ~",
    example_dialogue: [
      { speaker: "E", text_en: "He doesn't deserve such praise.", text_ko: "그는 그런 칭찬을 받을 자격이 없어." },
      { speaker: "K", text_en: "I agree, he didn't do much.", text_ko: "맞아, 한 게 별로 없잖아." },
    ],
  },
  {
    id: 11,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "내가 ~해줄게",
    pattern_en: "Let me ~",
    example_dialogue: [
      { speaker: "E", text_en: "Let me help you with that.", text_ko: "내가 그거 도와줄게." },
      { speaker: "K", text_en: "Thanks, I appreciate it.", text_ko: "고마워, 정말 고마워." },
    ],
  },
  {
    id: 12,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~의 가치가 있다",
    pattern_en: "be worth ~",
    example_dialogue: [
      { speaker: "E", text_en: "This book is worth reading.", text_ko: "이 책은 읽을 가치가 있어." },
      { speaker: "K", text_en: "Then I'll borrow it.", text_ko: "그럼 빌려야겠다." },
    ],
  },
  {
    id: 13,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "우연히 ~하게 되다",
    pattern_en: "happen to ~",
    example_dialogue: [
      { speaker: "E", text_en: "I happened to meet her at the store.", text_ko: "우연히 가게에서 그녀를 만났어." },
      { speaker: "K", text_en: "What a coincidence!", text_ko: "정말 우연이네!" },
    ],
  },
  {
    id: 14,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~인지 모르겠어요?",
    pattern_en: "Can't you see ~?",
    example_dialogue: [
      { speaker: "E", text_en: "Can't you see I'm busy?", text_ko: "나 바쁜 거 안 보여?" },
      { speaker: "K", text_en: "Sorry, I'll come back later.", text_ko: "미안, 나중에 올게." },
    ],
  },
  {
    id: 15,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "점점 ~해진다",
    pattern_en: "be getting ~",
    example_dialogue: [
      { speaker: "E", text_en: "It's getting colder these days.", text_ko: "요즘 점점 추워지고 있어." },
      { speaker: "K", text_en: "Yeah, winter is coming.", text_ko: "응, 겨울이 오고 있어." },
    ],
  },
  {
    id: 16,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~한 것으로 판명되다",
    pattern_en: "It turned out (that) ~",
    example_dialogue: [
      { speaker: "E", text_en: "It turned out that he was right.", text_ko: "그가 옳았던 것으로 판명됐어." },
      { speaker: "K", text_en: "Really? I didn't expect that.", text_ko: "정말? 예상 못 했네." },
    ],
  },
  {
    id: 17,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~한 것이 마음에 걸리다",
    pattern_en: "I feel bad (that) ~",
    example_dialogue: [
      { speaker: "E", text_en: "I feel bad that I forgot your birthday.", text_ko: "네 생일을 잊은 게 마음에 걸려." },
      { speaker: "K", text_en: "It's okay, don't worry about it.", text_ko: "괜찮아, 신경 쓰지 마." },
    ],
  },
  {
    id: 18,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~할 돈이 없다",
    pattern_en: "can't afford to ~",
    example_dialogue: [
      { speaker: "E", text_en: "I can't afford to buy a new car.", text_ko: "새 차를 살 돈이 없어." },
      { speaker: "K", text_en: "Maybe a used one, then?", text_ko: "그럼 중고차는 어때?" },
    ],
  },
  {
    id: 19,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~하기로 되어 있다",
    pattern_en: "be supposed to ~",
    example_dialogue: [
      { speaker: "E", text_en: "You're supposed to be here at nine.", text_ko: "너 9시까지 오기로 되어 있잖아." },
      { speaker: "K", text_en: "Sorry, I overslept.", text_ko: "미안, 늦잠 잤어." },
    ],
  },
  {
    id: 20,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~한지 봅시다",
    pattern_en: "see ~",
    example_dialogue: [
      { speaker: "E", text_en: "Let's see how it goes.", text_ko: "어떻게 되는지 봅시다." },
      { speaker: "K", text_en: "Okay, we'll wait and see.", text_ko: "그래, 두고 보자." },
    ],
  },
  {
    id: 21,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~하면서 …했다",
    pattern_en: "did …, doing ~",
    example_dialogue: [
      { speaker: "E", text_en: "I hurt my hand cooking dinner.", text_ko: "저녁을 하면서 손을 다쳤어." },
      { speaker: "K", text_en: "Are you okay?", text_ko: "괜찮아?" },
    ],
  },
  {
    id: 22,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~인 채로 두다",
    pattern_en: "leave + 목적어 + ~",
    example_dialogue: [
      { speaker: "E", text_en: "Please leave the door open.", text_ko: "문을 열어둔 채로 둬." },
      { speaker: "K", text_en: "Sure, no problem.", text_ko: "알겠어." },
    ],
  },
  {
    id: 23,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~한 것 같진 않아",
    pattern_en: "I doubt (that) ~",
    example_dialogue: [
      { speaker: "E", text_en: "I doubt that he'll come.", text_ko: "그가 올 것 같진 않아." },
      { speaker: "K", text_en: "Let's wait a bit more.", text_ko: "조금 더 기다려보자." },
    ],
  },
  {
    id: 24,
    chapter_num: 1,
    chapter_title: CHAPTER_TITLES[1],
    pattern_ko: "~처럼 보인다",
    pattern_en: "It appears (that) ~",
    example_dialogue: [
      { speaker: "E", text_en: "It appears that they're closed.", text_ko: "문을 닫은 것처럼 보여." },
      { speaker: "K", text_en: "Let's try another place.", text_ko: "다른 데 가보자." },
    ],
  },
  {
    id: 25,
    chapter_num: 2,
    chapter_title: CHAPTER_TITLES[2],
    pattern_ko: "그렇지 않으면 ~",
    pattern_en: "otherwise ~",
    example_dialogue: [
      { speaker: "E", text_en: "Hurry up, otherwise we'll be late.", text_ko: "서둘러, 그렇지 않으면 늦어." },
      { speaker: "K", text_en: "Okay, I'm coming.", text_ko: "알겠어, 가고 있어." },
    ],
  },
  {
    id: 26,
    chapter_num: 2,
    chapter_title: CHAPTER_TITLES[2],
    pattern_ko: "…한 게 아니라 ~한 거다",
    pattern_en: "It's not that …, it's just that ~",
    example_dialogue: [
      { speaker: "E", text_en: "It's not that I don't like it, it's just that I'm full.", text_ko: "싫어서가 아니라 그냥 배불러서 그래." },
      { speaker: "K", text_en: "I see, no worries.", text_ko: "그렇구나, 괜찮아." },
    ],
  },
  {
    id: 27,
    chapter_num: 2,
    chapter_title: CHAPTER_TITLES[2],
    pattern_ko: "~해 주시면 감사하겠습니다",
    pattern_en: "I'd appreciate it if S + would ~",
    example_dialogue: [
      { speaker: "E", text_en: "I'd appreciate it if you would help me.", text_ko: "도와주시면 감사하겠습니다." },
      { speaker: "K", text_en: "Of course, gladly.", text_ko: "물론이죠, 기꺼이요." },
    ],
  },
  {
    id: 28,
    chapter_num: 2,
    chapter_title: CHAPTER_TITLES[2],
    pattern_ko: "~라고 가정해 봐",
    pattern_en: "suppose S + V",
    example_dialogue: [
      { speaker: "E", text_en: "Suppose you won the lottery.", text_ko: "네가 복권에 당첨됐다고 가정해 봐." },
      { speaker: "K", text_en: "I'd travel the world!", text_ko: "세계 여행을 할 거야!" },
    ],
  },
  {
    id: 29,
    chapter_num: 2,
    chapter_title: CHAPTER_TITLES[2],
    pattern_ko: "…할 수 있도록 ~하다",
    pattern_en: "~ so that S can …",
    example_dialogue: [
      { speaker: "E", text_en: "Speak slowly so that I can understand.", text_ko: "알아들을 수 있도록 천천히 말해줘." },
      { speaker: "K", text_en: "Sure, is this better?", text_ko: "그래, 이게 나아?" },
    ],
  },
  {
    id: 30,
    chapter_num: 2,
    chapter_title: CHAPTER_TITLES[2],
    pattern_ko: "…한 것 중에 가장 ~한 것이다",
    pattern_en: "the -est ~ I've ever + PP",
    example_dialogue: [
      { speaker: "E", text_en: "This is the best meal I've ever had.", text_ko: "이건 내가 먹어본 것 중 최고야." },
      { speaker: "K", text_en: "I'm glad you like it.", text_ko: "마음에 든다니 다행이야." },
    ],
  },
  {
    id: 31,
    chapter_num: 2,
    chapter_title: CHAPTER_TITLES[2],
    pattern_ko: "~가 어떻게 됐어?",
    pattern_en: "How did ~ go?",
    example_dialogue: [
      { speaker: "E", text_en: "How did your interview go?", text_ko: "면접 어떻게 됐어?" },
      { speaker: "K", text_en: "It went really well!", text_ko: "정말 잘됐어!" },
    ],
  },
  {
    id: 32,
    chapter_num: 2,
    chapter_title: CHAPTER_TITLES[2],
    pattern_ko: "…한 것은 ~이다",
    pattern_en: "What S + V is ~",
    example_dialogue: [
      { speaker: "E", text_en: "What I need is a little rest.", text_ko: "내게 필요한 건 약간의 휴식이야." },
      { speaker: "K", text_en: "You deserve it.", text_ko: "그럴 자격 있어." },
    ],
  },
  {
    id: 33,
    chapter_num: 2,
    chapter_title: CHAPTER_TITLES[2],
    pattern_ko: "(단지) …라고는 ~뿐이다",
    pattern_en: "All S + V is ~",
    example_dialogue: [
      { speaker: "E", text_en: "All I want is some peace.", text_ko: "내가 바라는 건 평온함뿐이야." },
      { speaker: "K", text_en: "I understand.", text_ko: "이해해." },
    ],
  },
  {
    id: 34,
    chapter_num: 2,
    chapter_title: CHAPTER_TITLES[2],
    pattern_ko: "~일지도 모르니까",
    pattern_en: "In case S + V",
    example_dialogue: [
      { speaker: "E", text_en: "Take an umbrella in case it rains.", text_ko: "비가 올지도 모르니까 우산 챙겨." },
      { speaker: "K", text_en: "Good idea.", text_ko: "좋은 생각이야." },
    ],
  },
  {
    id: 35,
    chapter_num: 3,
    chapter_title: CHAPTER_TITLES[3],
    pattern_ko: "~하게 되다",
    pattern_en: "get + 형용사/PP",
    example_dialogue: [
      { speaker: "E", text_en: "Don't get angry.", text_ko: "화내지 마." },
      { speaker: "K", text_en: "I'm not, I'm just tired.", text_ko: "화난 거 아니야, 그냥 피곤해." },
    ],
  },
  {
    id: 36,
    chapter_num: 3,
    chapter_title: CHAPTER_TITLES[3],
    pattern_ko: "~라고 들었어요",
    pattern_en: "I was told (that) ~",
    example_dialogue: [
      { speaker: "E", text_en: "I was told that the store is closed.", text_ko: "가게가 문을 닫았다고 들었어요." },
      { speaker: "K", text_en: "Yes, it closed last week.", text_ko: "네, 지난주에 닫았어요." },
    ],
  },
  {
    id: 37,
    chapter_num: 3,
    chapter_title: CHAPTER_TITLES[3],
    pattern_ko: "왜 ~?",
    pattern_en: "What makes ~?",
    example_dialogue: [
      { speaker: "E", text_en: "What makes you say that?", text_ko: "왜 그렇게 말하는 거야?" },
      { speaker: "K", text_en: "Just a feeling.", text_ko: "그냥 느낌이야." },
    ],
  },
  {
    id: 38,
    chapter_num: 3,
    chapter_title: CHAPTER_TITLES[3],
    pattern_ko: "~한지 얼마나 됐어요?",
    pattern_en: "How long have S + PP?",
    example_dialogue: [
      { speaker: "E", text_en: "How long have you lived here?", text_ko: "여기 산 지 얼마나 됐어요?" },
      { speaker: "K", text_en: "About five years.", text_ko: "5년쯤 됐어요." },
    ],
  },
  {
    id: 39,
    chapter_num: 3,
    chapter_title: CHAPTER_TITLES[3],
    pattern_ko: "꼭 ~할게요",
    pattern_en: "I promise ~",
    example_dialogue: [
      { speaker: "E", text_en: "I promise I'll be on time.", text_ko: "꼭 제시간에 갈게요." },
      { speaker: "K", text_en: "I'll hold you to that.", text_ko: "약속 지켜요." },
    ],
  },
  {
    id: 40,
    chapter_num: 3,
    chapter_title: CHAPTER_TITLES[3],
    pattern_ko: "~해서야 비로소 …했다",
    pattern_en: "not … until ~",
    example_dialogue: [
      { speaker: "E", text_en: "I didn't sleep until midnight.", text_ko: "자정이 돼서야 비로소 잤어." },
      { speaker: "K", text_en: "You must be exhausted.", text_ko: "정말 피곤하겠다." },
    ],
  },
  {
    id: 41,
    chapter_num: 3,
    chapter_title: CHAPTER_TITLES[3],
    pattern_ko: "~에 가본 적이 있다",
    pattern_en: "have been to ~",
    example_dialogue: [
      { speaker: "E", text_en: "Have you been to Japan?", text_ko: "일본에 가본 적 있어?" },
      { speaker: "K", text_en: "Yes, twice.", text_ko: "응, 두 번." },
    ],
  },
  {
    id: 42,
    chapter_num: 3,
    chapter_title: CHAPTER_TITLES[3],
    pattern_ko: "~라고 쓰여 있다",
    pattern_en: "It says ~",
    example_dialogue: [
      { speaker: "E", text_en: "The sign says no parking.", text_ko: "표지판에 주차 금지라고 쓰여 있어." },
      { speaker: "K", text_en: "Let's park elsewhere.", text_ko: "다른 데 주차하자." },
    ],
  },
  {
    id: 43,
    chapter_num: 3,
    chapter_title: CHAPTER_TITLES[3],
    pattern_ko: "~를 가진 사람",
    pattern_en: "a person with ~",
    example_dialogue: [
      { speaker: "E", text_en: "She's a person with great patience.", text_ko: "그녀는 인내심을 가진 사람이야." },
      { speaker: "K", text_en: "That's a rare quality.", text_ko: "드문 장점이지." },
    ],
  },
  {
    id: 44,
    chapter_num: 3,
    chapter_title: CHAPTER_TITLES[3],
    pattern_ko: "내가 ~하기에는",
    pattern_en: "My ~ is to/that …",
    example_dialogue: [
      { speaker: "E", text_en: "My point is that we need more time.", text_ko: "내 말은 시간이 더 필요하다는 거야." },
      { speaker: "K", text_en: "I agree completely.", text_ko: "전적으로 동의해." },
    ],
  },
  {
    id: 45,
    chapter_num: 3,
    chapter_title: CHAPTER_TITLES[3],
    pattern_ko: "~에 의하면",
    pattern_en: "From what ~",
    example_dialogue: [
      { speaker: "E", text_en: "From what I heard, the plan changed.", text_ko: "내가 들은 바에 의하면 계획이 바뀌었어." },
      { speaker: "K", text_en: "When did that happen?", text_ko: "언제 그랬대?" },
    ],
  },
  {
    id: 46,
    chapter_num: 4,
    chapter_title: CHAPTER_TITLES[4],
    pattern_ko: "만약 ~라면",
    pattern_en: "If S + V(과거), S + would ~",
    example_dialogue: [
      { speaker: "E", text_en: "If I had time, I would help you.", text_ko: "시간이 있다면 도와줄 텐데." },
      { speaker: "K", text_en: "That's okay, I understand.", text_ko: "괜찮아, 이해해." },
    ],
  },
  {
    id: 47,
    chapter_num: 4,
    chapter_title: CHAPTER_TITLES[4],
    pattern_ko: "만약 ~했더라면",
    pattern_en: "If S + had + PP, S + would have + PP",
    example_dialogue: [
      { speaker: "E", text_en: "If I had known, I would have called.", text_ko: "알았더라면 전화했을 텐데." },
      { speaker: "K", text_en: "It's fine, really.", text_ko: "정말 괜찮아." },
    ],
  },
  {
    id: 48,
    chapter_num: 4,
    chapter_title: CHAPTER_TITLES[4],
    pattern_ko: "만약 ~했더라면",
    pattern_en: "If S + had + PP, S + would + V",
    example_dialogue: [
      { speaker: "E", text_en: "If I had saved money, I would be rich now.", text_ko: "돈을 모았더라면 지금 부자일 텐데." },
      { speaker: "K", text_en: "It's never too late.", text_ko: "늦지 않았어." },
    ],
  },
  {
    id: 49,
    chapter_num: 4,
    chapter_title: CHAPTER_TITLES[4],
    pattern_ko: "~하면",
    pattern_en: "If ~",
    example_dialogue: [
      { speaker: "E", text_en: "If you need anything, let me know.", text_ko: "필요한 게 있으면 알려줘." },
      { speaker: "K", text_en: "Thanks, I will.", text_ko: "고마워, 그럴게." },
    ],
  },
  {
    id: 50,
    chapter_num: 4,
    chapter_title: CHAPTER_TITLES[4],
    pattern_ko: "틀림없이 ~했을 거야",
    pattern_en: "must have + PP",
    example_dialogue: [
      { speaker: "E", text_en: "He must have left already.", text_ko: "그는 틀림없이 벌써 떠났을 거야." },
      { speaker: "K", text_en: "Let's call him.", text_ko: "전화해 보자." },
    ],
  },
  {
    id: 51,
    chapter_num: 4,
    chapter_title: CHAPTER_TITLES[4],
    pattern_ko: "~한 것",
    pattern_en: "the thing that ~",
    example_dialogue: [
      { speaker: "E", text_en: "The thing that bothers me is the noise.", text_ko: "날 괴롭히는 건 소음이야." },
      { speaker: "K", text_en: "Let's close the window.", text_ko: "창문을 닫자." },
    ],
  },
  {
    id: 52,
    chapter_num: 4,
    chapter_title: CHAPTER_TITLES[4],
    pattern_ko: "~하는 사람",
    pattern_en: "a person who ~",
    example_dialogue: [
      { speaker: "E", text_en: "She's a person who never gives up.", text_ko: "그녀는 절대 포기하지 않는 사람이야." },
      { speaker: "K", text_en: "I admire that.", text_ko: "존경스러워." },
    ],
  },
  {
    id: 53,
    chapter_num: 4,
    chapter_title: CHAPTER_TITLES[4],
    pattern_ko: "~조차 하지 않다",
    pattern_en: "not even ~",
    example_dialogue: [
      { speaker: "E", text_en: "He didn't even say goodbye.", text_ko: "그는 작별 인사조차 하지 않았어." },
      { speaker: "K", text_en: "That's rude.", text_ko: "무례하네." },
    ],
  },
  {
    id: 54,
    chapter_num: 4,
    chapter_title: CHAPTER_TITLES[4],
    pattern_ko: "단지 ~하다",
    pattern_en: "just ~",
    example_dialogue: [
      { speaker: "E", text_en: "I just want to relax today.", text_ko: "오늘은 그냥 쉬고 싶어." },
      { speaker: "K", text_en: "You deserve a break.", text_ko: "좀 쉬어도 돼." },
    ],
  },
  {
    id: 55,
    chapter_num: 4,
    chapter_title: CHAPTER_TITLES[4],
    pattern_ko: "~할 리 없다",
    pattern_en: "There is no reason (that) ~",
    example_dialogue: [
      { speaker: "E", text_en: "There is no reason to worry.", text_ko: "걱정할 리 없어." },
      { speaker: "K", text_en: "You're right, I'll calm down.", text_ko: "맞아, 진정할게." },
    ],
  },
  {
    id: 56,
    chapter_num: 4,
    chapter_title: CHAPTER_TITLES[4],
    pattern_ko: "~가 있을 예정이다",
    pattern_en: "There is going to be ~",
    example_dialogue: [
      { speaker: "E", text_en: "There is going to be a meeting tomorrow.", text_ko: "내일 회의가 있을 예정이야." },
      { speaker: "K", text_en: "What time?", text_ko: "몇 시에?" },
    ],
  },
  {
    id: 57,
    chapter_num: 4,
    chapter_title: CHAPTER_TITLES[4],
    pattern_ko: "~가 있는 것 같다",
    pattern_en: "There seems to be ~",
    example_dialogue: [
      { speaker: "E", text_en: "There seems to be a problem.", text_ko: "문제가 있는 것 같아." },
      { speaker: "K", text_en: "Let me check it.", text_ko: "내가 확인해 볼게." },
    ],
  },
  {
    id: 58,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~라고 확신하다",
    pattern_en: "I'm sure (that) ~",
    example_dialogue: [
      { speaker: "E", text_en: "I'm sure that you'll do great.", text_ko: "네가 잘할 거라고 확신해." },
      { speaker: "K", text_en: "Thanks for the support.", text_ko: "응원 고마워." },
    ],
  },
  {
    id: 59,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~라던데 정말 그런가요?",
    pattern_en: "I heard (that) ~, is that so?",
    example_dialogue: [
      { speaker: "E", text_en: "I heard you're moving, is that so?", text_ko: "이사 간다던데 정말 그래요?" },
      { speaker: "K", text_en: "Yes, next month.", text_ko: "네, 다음 달에요." },
    ],
  },
  {
    id: 60,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "그건 ~에 달려 있다",
    pattern_en: "It depends on ~",
    example_dialogue: [
      { speaker: "E", text_en: "It depends on the weather.", text_ko: "그건 날씨에 달려 있어." },
      { speaker: "K", text_en: "Let's hope it's sunny.", text_ko: "맑길 바라자." },
    ],
  },
  {
    id: 61,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "난 ~할까 생각중이야",
    pattern_en: "I'm thinking of ~",
    example_dialogue: [
      { speaker: "E", text_en: "I'm thinking of changing jobs.", text_ko: "난 이직할까 생각 중이야." },
      { speaker: "K", text_en: "Really? Why?", text_ko: "정말? 왜?" },
    ],
  },
  {
    id: 62,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~인지 아세요?",
    pattern_en: "Do you know ~?",
    example_dialogue: [
      { speaker: "E", text_en: "Do you know where the station is?", text_ko: "역이 어디인지 아세요?" },
      { speaker: "K", text_en: "Yes, it's that way.", text_ko: "네, 저쪽이에요." },
    ],
  },
  {
    id: 63,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~이 궁금하군",
    pattern_en: "I wonder ~",
    example_dialogue: [
      { speaker: "E", text_en: "I wonder if she's okay.", text_ko: "그녀가 괜찮은지 궁금하군." },
      { speaker: "K", text_en: "Let's give her a call.", text_ko: "전화해 보자." },
    ],
  },
  {
    id: 64,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~때문에 전화 드렸습니다",
    pattern_en: "I'm calling about ~",
    example_dialogue: [
      { speaker: "E", text_en: "I'm calling about the apartment.", text_ko: "아파트 때문에 전화 드렸습니다." },
      { speaker: "K", text_en: "Sure, how can I help?", text_ko: "네, 무엇을 도와드릴까요?" },
    ],
  },
  {
    id: 65,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~하려고 한 건 아니다",
    pattern_en: "I didn't mean to ~",
    example_dialogue: [
      { speaker: "E", text_en: "I didn't mean to hurt you.", text_ko: "너에게 상처 주려던 건 아니었어." },
      { speaker: "K", text_en: "It's okay, I know.", text_ko: "괜찮아, 알아." },
    ],
  },
  {
    id: 66,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "내가 ~하려면",
    pattern_en: "If I'm going to ~",
    example_dialogue: [
      { speaker: "E", text_en: "If I'm going to do this, I'll do it right.", text_ko: "내가 이걸 하려면 제대로 할 거야." },
      { speaker: "K", text_en: "That's the spirit.", text_ko: "바로 그거야." },
    ],
  },
  {
    id: 67,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~인 척하다",
    pattern_en: "pretend ~",
    example_dialogue: [
      { speaker: "E", text_en: "He pretended not to hear me.", text_ko: "그는 내 말을 못 들은 척했어." },
      { speaker: "K", text_en: "That's frustrating.", text_ko: "답답하네." },
    ],
  },
  {
    id: 68,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~하려고 하다",
    pattern_en: "try to ~",
    example_dialogue: [
      { speaker: "E", text_en: "I'll try to finish it today.", text_ko: "오늘 끝내려고 해볼게." },
      { speaker: "K", text_en: "Take your time.", text_ko: "천천히 해." },
    ],
  },
  {
    id: 69,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~이라니 믿을 수가 없어",
    pattern_en: "I can't believe (that) ~",
    example_dialogue: [
      { speaker: "E", text_en: "I can't believe we won!", text_ko: "우리가 이겼다니 믿을 수가 없어!" },
      { speaker: "K", text_en: "It's amazing!", text_ko: "정말 대단해!" },
    ],
  },
  {
    id: 70,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "비록 …이라도 얼마나 ~하겠니?",
    pattern_en: "Even though …, how ~?",
    example_dialogue: [
      { speaker: "E", text_en: "Even though he's busy, how kind he is!", text_ko: "비록 바빠도 그는 얼마나 친절한지!" },
      { speaker: "K", text_en: "He really is.", text_ko: "정말 그래." },
    ],
  },
  {
    id: 71,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~이라면 얼마나 좋을까?",
    pattern_en: "How wonderful it would be if ~?",
    example_dialogue: [
      { speaker: "E", text_en: "How wonderful it would be if we could fly!", text_ko: "날 수 있다면 얼마나 좋을까!" },
      { speaker: "K", text_en: "Like a dream.", text_ko: "꿈만 같지." },
    ],
  },
  {
    id: 72,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~할 때마다",
    pattern_en: "Every time ~",
    example_dialogue: [
      { speaker: "E", text_en: "Every time I see her, she smiles.", text_ko: "그녀를 볼 때마다 미소를 지어." },
      { speaker: "K", text_en: "She's so cheerful.", text_ko: "정말 밝다." },
    ],
  },
  {
    id: 73,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~일까 봐 무섭다",
    pattern_en: "I'm scared (that) ~",
    example_dialogue: [
      { speaker: "E", text_en: "I'm scared that I'll fail.", text_ko: "떨어질까 봐 무서워." },
      { speaker: "K", text_en: "You'll be fine, trust me.", text_ko: "잘될 거야, 믿어." },
    ],
  },
  {
    id: 74,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "…할까 봐 ~했다",
    pattern_en: "I was afraid (that) …, so ~",
    example_dialogue: [
      { speaker: "E", text_en: "I was afraid it would rain, so I brought an umbrella.", text_ko: "비가 올까 봐 우산을 가져왔어." },
      { speaker: "K", text_en: "Smart move.", text_ko: "잘했네." },
    ],
  },
  {
    id: 75,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~든 상관 안 한다",
    pattern_en: "I don't care ~",
    example_dialogue: [
      { speaker: "E", text_en: "I don't care what they think.", text_ko: "그들이 뭐라 생각하든 상관 안 해." },
      { speaker: "K", text_en: "Good for you.", text_ko: "멋지다." },
    ],
  },
  {
    id: 76,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "…하는 이유는 ~때문이다",
    pattern_en: "The reason … is that ~",
    example_dialogue: [
      { speaker: "E", text_en: "The reason I'm late is that I missed the bus.", text_ko: "늦은 이유는 버스를 놓쳤기 때문이야." },
      { speaker: "K", text_en: "I see, no problem.", text_ko: "그렇구나, 괜찮아." },
    ],
  },
  {
    id: 77,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~부터 …하고 있다",
    pattern_en: "have been -ing since ~",
    example_dialogue: [
      { speaker: "E", text_en: "I've been waiting since noon.", text_ko: "정오부터 기다리고 있어." },
      { speaker: "K", text_en: "Sorry I'm so late!", text_ko: "늦어서 정말 미안!" },
    ],
  },
  {
    id: 78,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~한 게 있다면",
    pattern_en: "If there is anything ~",
    example_dialogue: [
      { speaker: "E", text_en: "If there is anything you need, ask me.", text_ko: "필요한 게 있다면 물어봐." },
      { speaker: "K", text_en: "Thank you so much.", text_ko: "정말 고마워." },
    ],
  },
  {
    id: 79,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "여기 ~한 게 있다",
    pattern_en: "Here's what ~",
    example_dialogue: [
      { speaker: "E", text_en: "Here's what we'll do.", text_ko: "여기 우리가 할 게 있어." },
      { speaker: "K", text_en: "I'm listening.", text_ko: "듣고 있어." },
    ],
  },
  {
    id: 80,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~같은",
    pattern_en: "such as ~",
    example_dialogue: [
      { speaker: "E", text_en: "I like fruits such as apples and pears.", text_ko: "사과나 배 같은 과일을 좋아해." },
      { speaker: "K", text_en: "Me too.", text_ko: "나도." },
    ],
  },
  {
    id: 81,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~처럼/~같은",
    pattern_en: "like ~",
    example_dialogue: [
      { speaker: "E", text_en: "She sings like a professional.", text_ko: "그녀는 전문가처럼 노래해." },
      { speaker: "K", text_en: "She's talented.", text_ko: "재능 있네." },
    ],
  },
  {
    id: 82,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "~이라는 감이 오다",
    pattern_en: "I have a feeling (that) ~",
    example_dialogue: [
      { speaker: "E", text_en: "I have a feeling it'll be a great day.", text_ko: "좋은 날이 될 것 같은 감이 와." },
      { speaker: "K", text_en: "I hope so!", text_ko: "그러길 바라!" },
    ],
  },
  {
    id: 83,
    chapter_num: 5,
    chapter_title: CHAPTER_TITLES[5],
    pattern_ko: "그게 바로 ~한 것이다",
    pattern_en: "That's what ~",
    example_dialogue: [
      { speaker: "E", text_en: "That's what I was thinking.", text_ko: "그게 바로 내가 생각한 거야." },
      { speaker: "K", text_en: "Great minds think alike.", text_ko: "통했네." },
    ],
  },
  {
    id: 84,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "~을 못 참겠다",
    pattern_en: "I can't stand ~",
    example_dialogue: [
      { speaker: "E", text_en: "I can't stand this noise.", text_ko: "이 소음을 못 참겠어." },
      { speaker: "K", text_en: "Let's go somewhere quiet.", text_ko: "조용한 데로 가자." },
    ],
  },
  {
    id: 85,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "A에게 ~라고 말해주다",
    pattern_en: "tell A (that) ~",
    example_dialogue: [
      { speaker: "E", text_en: "Tell him that I'll be late.", text_ko: "그에게 늦는다고 말해줘." },
      { speaker: "K", text_en: "Okay, I'll let him know.", text_ko: "알겠어, 전할게." },
    ],
  },
  {
    id: 86,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "A가 ~하는 걸 도와주다",
    pattern_en: "help A (to) ~",
    example_dialogue: [
      { speaker: "E", text_en: "Can you help me move this?", text_ko: "이거 옮기는 거 도와줄래?" },
      { speaker: "K", text_en: "Sure, no problem.", text_ko: "그럼, 문제없어." },
    ],
  },
  {
    id: 87,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "…배 ~한",
    pattern_en: "… times as ~ as",
    example_dialogue: [
      { speaker: "E", text_en: "This is three times as big as that.", text_ko: "이건 저것보다 세 배 커." },
      { speaker: "K", text_en: "Wow, that's huge.", text_ko: "와, 엄청 크다." },
    ],
  },
  {
    id: 88,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "A를 ~하게 하다",
    pattern_en: "make A ~",
    example_dialogue: [
      { speaker: "E", text_en: "That makes me happy.", text_ko: "그건 날 행복하게 해." },
      { speaker: "K", text_en: "I'm glad.", text_ko: "다행이야." },
    ],
  },
  {
    id: 89,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "A더러 ~하도록 시키다",
    pattern_en: "have[get] A ~ [to ~]",
    example_dialogue: [
      { speaker: "E", text_en: "I'll have him call you back.", text_ko: "그에게 다시 전화하도록 할게요." },
      { speaker: "K", text_en: "Thank you.", text_ko: "감사합니다." },
    ],
  },
  {
    id: 90,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "내가 처음 ~했을때",
    pattern_en: "When I first ~",
    example_dialogue: [
      { speaker: "E", text_en: "When I first met her, I was nervous.", text_ko: "그녀를 처음 만났을 때 긴장했어." },
      { speaker: "K", text_en: "That's cute.", text_ko: "귀엽다." },
    ],
  },
  {
    id: 91,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "A가 ~하기를 원하다",
    pattern_en: "want A to ~",
    example_dialogue: [
      { speaker: "E", text_en: "I want you to be happy.", text_ko: "네가 행복하길 원해." },
      { speaker: "K", text_en: "That's sweet.", text_ko: "다정하네." },
    ],
  },
  {
    id: 92,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "A가 ~하는 것을/~된 것을 보다",
    pattern_en: "see A -ing/PP",
    example_dialogue: [
      { speaker: "E", text_en: "I saw him running this morning.", text_ko: "오늘 아침 그가 뛰는 걸 봤어." },
      { speaker: "K", text_en: "He exercises a lot.", text_ko: "운동 많이 하네." },
    ],
  },
  {
    id: 93,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "…하나 ~하나 마찬가지다",
    pattern_en: "It's the same whether … or ~",
    example_dialogue: [
      { speaker: "E", text_en: "It's the same whether we go now or later.", text_ko: "지금 가나 나중에 가나 마찬가지야." },
      { speaker: "K", text_en: "Then let's go now.", text_ko: "그럼 지금 가자." },
    ],
  },
  {
    id: 94,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "A가 ~되도록 하다",
    pattern_en: "get A ~",
    example_dialogue: [
      { speaker: "E", text_en: "I'll get the report done by noon.", text_ko: "보고서를 정오까지 되도록 할게요." },
      { speaker: "K", text_en: "Great, thanks.", text_ko: "좋아요, 고마워요." },
    ],
  },
  {
    id: 95,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "~에 익숙하다",
    pattern_en: "be used to ~",
    example_dialogue: [
      { speaker: "E", text_en: "I'm used to waking up early.", text_ko: "일찍 일어나는 데 익숙해." },
      { speaker: "K", text_en: "I could never do that.", text_ko: "난 절대 못 해." },
    ],
  },
  {
    id: 96,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "~하는 식으로",
    pattern_en: "the way ~",
    example_dialogue: [
      { speaker: "E", text_en: "I like the way you think.", text_ko: "네가 생각하는 방식이 좋아." },
      { speaker: "K", text_en: "Thank you.", text_ko: "고마워." },
    ],
  },
  {
    id: 97,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "그렇게 ~한 건 처음 봤어",
    pattern_en: "I've never seen such a[an] ~",
    example_dialogue: [
      { speaker: "E", text_en: "I've never seen such a beautiful view.", text_ko: "그렇게 아름다운 풍경은 처음 봤어." },
      { speaker: "K", text_en: "It's breathtaking.", text_ko: "숨 막히게 멋지지." },
    ],
  },
  {
    id: 98,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "A가 ~하기를/되기를 바라다",
    pattern_en: "want A ~",
    example_dialogue: [
      { speaker: "E", text_en: "I want this finished today.", text_ko: "이게 오늘 끝나기를 바라." },
      { speaker: "K", text_en: "We'll do our best.", text_ko: "최선을 다할게요." },
    ],
  },
  {
    id: 99,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "~처럼 들리다",
    pattern_en: "sound like ~",
    example_dialogue: [
      { speaker: "E", text_en: "That sounds like a great idea.", text_ko: "그거 좋은 생각처럼 들려." },
      { speaker: "K", text_en: "Let's do it.", text_ko: "그렇게 하자." },
    ],
  },
  {
    id: 100,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "~처럼 보이다",
    pattern_en: "look like ~",
    example_dialogue: [
      { speaker: "E", text_en: "It looks like rain.", text_ko: "비가 올 것처럼 보여." },
      { speaker: "K", text_en: "Let's stay in.", text_ko: "그냥 집에 있자." },
    ],
  },
  {
    id: 101,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "A가 ~하도록 허락하다",
    pattern_en: "let A ~",
    example_dialogue: [
      { speaker: "E", text_en: "Let me explain.", text_ko: "내가 설명하게 해줘." },
      { speaker: "K", text_en: "Go ahead.", text_ko: "말해 봐." },
    ],
  },
  {
    id: 102,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "A를 권해서 ~하게 하다",
    pattern_en: "encourage A to ~",
    example_dialogue: [
      { speaker: "E", text_en: "My teacher encouraged me to try.", text_ko: "선생님이 날 권해서 도전하게 했어." },
      { speaker: "K", text_en: "That's wonderful.", text_ko: "멋지다." },
    ],
  },
  {
    id: 103,
    chapter_num: 6,
    chapter_title: CHAPTER_TITLES[6],
    pattern_ko: "~인지 아닌지",
    pattern_en: "whether ~ or not",
    example_dialogue: [
      { speaker: "E", text_en: "I'm going whether you come or not.", text_ko: "네가 오든 안 오든 난 갈 거야." },
      { speaker: "K", text_en: "Then I'll come.", text_ko: "그럼 나도 갈게." },
    ],
  },
  {
    id: 104,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "무엇을 ~하더라도",
    pattern_en: "No matter what ~",
    example_dialogue: [
      { speaker: "E", text_en: "No matter what happens, I'll support you.", text_ko: "무슨 일이 있어도 널 응원할게." },
      { speaker: "K", text_en: "Thank you, that means a lot.", text_ko: "고마워, 큰 힘이 돼." },
    ],
  },
  {
    id: 105,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~얘기가 나와서 말인데",
    pattern_en: "Speaking of ~",
    example_dialogue: [
      { speaker: "E", text_en: "Speaking of food, I'm hungry.", text_ko: "음식 얘기가 나와서 말인데, 나 배고파." },
      { speaker: "K", text_en: "Let's grab lunch.", text_ko: "점심 먹으러 가자." },
    ],
  },
  {
    id: 106,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "A가 ~하다시피",
    pattern_en: "As A ~",
    example_dialogue: [
      { speaker: "E", text_en: "As you know, the deadline is tomorrow.", text_ko: "너도 알다시피 마감이 내일이야." },
      { speaker: "K", text_en: "I'm almost done.", text_ko: "거의 다 했어." },
    ],
  },
  {
    id: 107,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~에도 불구하고",
    pattern_en: "In spite of ~",
    example_dialogue: [
      { speaker: "E", text_en: "In spite of the rain, we went out.", text_ko: "비에도 불구하고 우리는 나갔어." },
      { speaker: "K", text_en: "That's dedication.", text_ko: "대단한 의지네." },
    ],
  },
  {
    id: 108,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~하기만 하다면",
    pattern_en: "As long as ~",
    example_dialogue: [
      { speaker: "E", text_en: "As long as you're happy, I'm happy.", text_ko: "네가 행복하기만 하면 나도 행복해." },
      { speaker: "K", text_en: "That's kind of you.", text_ko: "다정하네." },
    ],
  },
  {
    id: 109,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~에 비해서",
    pattern_en: "Compared to ~",
    example_dialogue: [
      { speaker: "E", text_en: "Compared to last year, sales are up.", text_ko: "작년에 비해서 매출이 올랐어." },
      { speaker: "K", text_en: "Great news!", text_ko: "좋은 소식이네!" },
    ],
  },
  {
    id: 110,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~에 관한 한",
    pattern_en: "As far as ~ is concerned",
    example_dialogue: [
      { speaker: "E", text_en: "As far as I'm concerned, it's fine.", text_ko: "내가 보기에는 괜찮아." },
      { speaker: "K", text_en: "Good to hear.", text_ko: "다행이다." },
    ],
  },
  {
    id: 111,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~하기는커녕",
    pattern_en: "Far from ~",
    example_dialogue: [
      { speaker: "E", text_en: "He's far from lazy.", text_ko: "그는 게으르기는커녕 부지런해." },
      { speaker: "K", text_en: "I noticed that.", text_ko: "나도 느꼈어." },
    ],
  },
  {
    id: 112,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "마치 ~인 것처럼",
    pattern_en: "as if ~",
    example_dialogue: [
      { speaker: "E", text_en: "He acts as if he knows everything.", text_ko: "그는 마치 모든 걸 아는 것처럼 행동해." },
      { speaker: "K", text_en: "That's annoying.", text_ko: "짜증 나네." },
    ],
  },
  {
    id: 113,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~에 관한 한",
    pattern_en: "When it comes to ~",
    example_dialogue: [
      { speaker: "E", text_en: "When it comes to cooking, she's the best.", text_ko: "요리에 관한 한 그녀가 최고야." },
      { speaker: "K", text_en: "I'd love to taste it.", text_ko: "맛보고 싶다." },
    ],
  },
  {
    id: 114,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~하지 그래?",
    pattern_en: "Why don't you ~?",
    example_dialogue: [
      { speaker: "E", text_en: "Why don't you take a break?", text_ko: "좀 쉬지 그래?" },
      { speaker: "K", text_en: "Good idea, I will.", text_ko: "좋은 생각이야, 그럴게." },
    ],
  },
  {
    id: 115,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~하자/~할까?",
    pattern_en: "Why don't we ~?",
    example_dialogue: [
      { speaker: "E", text_en: "Why don't we go for a walk?", text_ko: "우리 산책하자." },
      { speaker: "K", text_en: "Sure, let's go.", text_ko: "좋아, 가자." },
    ],
  },
  {
    id: 116,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~대신에",
    pattern_en: "instead of ~",
    example_dialogue: [
      { speaker: "E", text_en: "Let's walk instead of driving.", text_ko: "운전하는 대신에 걷자." },
      { speaker: "K", text_en: "Good, it's a nice day.", text_ko: "좋아, 날씨 좋아." },
    ],
  },
  {
    id: 117,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "아마 ~일 거다",
    pattern_en: "Chances are ~",
    example_dialogue: [
      { speaker: "E", text_en: "Chances are he's already home.", text_ko: "아마 그는 벌써 집에 있을 거야." },
      { speaker: "K", text_en: "Let's call to check.", text_ko: "전화해 보자." },
    ],
  },
  {
    id: 118,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~도 당연하다/어쩐지 ~하더라",
    pattern_en: "No wonder ~",
    example_dialogue: [
      { speaker: "E", text_en: "No wonder you're tired.", text_ko: "어쩐지 네가 피곤하더라." },
      { speaker: "K", text_en: "I barely slept.", text_ko: "거의 못 잤어." },
    ],
  },
  {
    id: 119,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~가는[오는] 길에",
    pattern_en: "on the way to ~",
    example_dialogue: [
      { speaker: "E", text_en: "I'll buy milk on the way home.", text_ko: "집에 가는 길에 우유 살게." },
      { speaker: "K", text_en: "Thanks!", text_ko: "고마워!" },
    ],
  },
  {
    id: 120,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~하는 데 얼마나 걸립니까?",
    pattern_en: "How long does it take to ~?",
    example_dialogue: [
      { speaker: "E", text_en: "How long does it take to get there?", text_ko: "거기 가는 데 얼마나 걸려?" },
      { speaker: "K", text_en: "About thirty minutes.", text_ko: "30분쯤." },
    ],
  },
  {
    id: 121,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "제가 ~해도 괜찮을까요?",
    pattern_en: "Do you mind if I ~?",
    example_dialogue: [
      { speaker: "E", text_en: "Do you mind if I sit here?", text_ko: "제가 여기 앉아도 괜찮을까요?" },
      { speaker: "K", text_en: "Not at all.", text_ko: "그럼요, 앉으세요." },
    ],
  },
  {
    id: 122,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "네 말은 ~라는 거니?",
    pattern_en: "You mean ~?",
    example_dialogue: [
      { speaker: "E", text_en: "You mean we're leaving now?", text_ko: "네 말은 지금 떠난다는 거니?" },
      { speaker: "K", text_en: "Yes, right now.", text_ko: "응, 지금 바로." },
    ],
  },
  {
    id: 123,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~하는 버릇이 있다",
    pattern_en: "have a habit of -ing",
    example_dialogue: [
      { speaker: "E", text_en: "I have a habit of biting my nails.", text_ko: "손톱을 깨무는 버릇이 있어." },
      { speaker: "K", text_en: "Try to stop it.", text_ko: "고쳐 보도록 해." },
    ],
  },
  {
    id: 124,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~하느라 힘들다",
    pattern_en: "have a hard time -ing",
    example_dialogue: [
      { speaker: "E", text_en: "I have a hard time waking up early.", text_ko: "일찍 일어나느라 힘들어." },
      { speaker: "K", text_en: "Set more alarms.", text_ko: "알람을 더 맞춰." },
    ],
  },
  {
    id: 125,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "막 ~하려고 하다",
    pattern_en: "be about to ~",
    example_dialogue: [
      { speaker: "E", text_en: "I was about to call you.", text_ko: "막 너한테 전화하려던 참이었어." },
      { speaker: "K", text_en: "Great timing!", text_ko: "타이밍 좋네!" },
    ],
  },
  {
    id: 126,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "예전에 ~했었다",
    pattern_en: "used to ~",
    example_dialogue: [
      { speaker: "E", text_en: "I used to play the piano.", text_ko: "예전에 피아노를 쳤었어." },
      { speaker: "K", text_en: "You should start again.", text_ko: "다시 시작해 봐." },
    ],
  },
  {
    id: 127,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~에 질리다",
    pattern_en: "be sick of ~",
    example_dialogue: [
      { speaker: "E", text_en: "I'm sick of this rainy weather.", text_ko: "이 비 오는 날씨에 질렸어." },
      { speaker: "K", text_en: "Me too, I miss the sun.", text_ko: "나도, 햇빛이 그리워." },
    ],
  },
  {
    id: 128,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "기꺼이 ~할 마음이 있다",
    pattern_en: "be willing to ~",
    example_dialogue: [
      { speaker: "E", text_en: "I'm willing to help anytime.", text_ko: "언제든 기꺼이 도울 마음이 있어." },
      { speaker: "K", text_en: "You're a good friend.", text_ko: "좋은 친구야." },
    ],
  },
  {
    id: 129,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~을 걱정하다",
    pattern_en: "be worried (that)/about",
    example_dialogue: [
      { speaker: "E", text_en: "I'm worried about the exam.", text_ko: "시험이 걱정돼." },
      { speaker: "K", text_en: "You'll do fine.", text_ko: "잘할 거야." },
    ],
  },
  {
    id: 130,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~을 어떻게 해 드릴까요?",
    pattern_en: "How would you like your ~?",
    example_dialogue: [
      { speaker: "E", text_en: "How would you like your steak?", text_ko: "스테이크를 어떻게 해 드릴까요?" },
      { speaker: "K", text_en: "Medium, please.", text_ko: "미디엄으로요." },
    ],
  },
  {
    id: 131,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "내가 장담하는데 ~일 거다",
    pattern_en: "I bet ~",
    example_dialogue: [
      { speaker: "E", text_en: "I bet you'll pass the test.", text_ko: "내가 장담하는데 너 시험 붙을 거야." },
      { speaker: "K", text_en: "I hope you're right.", text_ko: "그러길 바라." },
    ],
  },
  {
    id: 132,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "(감히) 네가 어떻게 ~할 수 있니?",
    pattern_en: "How dare you ~?",
    example_dialogue: [
      { speaker: "E", text_en: "How dare you say that!", text_ko: "네가 어떻게 그런 말을 할 수 있니!" },
      { speaker: "K", text_en: "I'm sorry, I went too far.", text_ko: "미안, 너무했어." },
    ],
  },
  {
    id: 133,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~와 아무 관련이 없다",
    pattern_en: "have nothing to do with ~",
    example_dialogue: [
      { speaker: "E", text_en: "I have nothing to do with this.", text_ko: "난 이 일과 아무 관련이 없어." },
      { speaker: "K", text_en: "Okay, I believe you.", text_ko: "알겠어, 믿어." },
    ],
  },
  {
    id: 134,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~만큼 …하지는 않은",
    pattern_en: "not as … as ~",
    example_dialogue: [
      { speaker: "E", text_en: "This isn't as hard as it looks.", text_ko: "이건 보기만큼 어렵지 않아." },
      { speaker: "K", text_en: "That's a relief.", text_ko: "다행이다." },
    ],
  },
  {
    id: 135,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~하면 어쩌지?",
    pattern_en: "What if ~?",
    example_dialogue: [
      { speaker: "E", text_en: "What if it doesn't work?", text_ko: "안 되면 어쩌지?" },
      { speaker: "K", text_en: "Then we'll try again.", text_ko: "그럼 다시 해보지." },
    ],
  },
  {
    id: 136,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~라는 걸 인정해야겠군요",
    pattern_en: "I must admit (that) ~",
    example_dialogue: [
      { speaker: "E", text_en: "I must admit that you were right.", text_ko: "네 말이 맞았다는 걸 인정해야겠어." },
      { speaker: "K", text_en: "Thank you for saying so.", text_ko: "그렇게 말해줘서 고마워." },
    ],
  },
  {
    id: 137,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~하기에 충분히 …한",
    pattern_en: "… enough to ~",
    example_dialogue: [
      { speaker: "E", text_en: "She's old enough to drive.", text_ko: "그녀는 운전할 만큼 충분히 나이가 들었어." },
      { speaker: "K", text_en: "Time flies.", text_ko: "세월 빠르다." },
    ],
  },
  {
    id: 138,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "~하고 싶은 기분이 든다",
    pattern_en: "be in the mood for ~",
    example_dialogue: [
      { speaker: "E", text_en: "I'm in the mood for some coffee.", text_ko: "커피 한잔 하고 싶은 기분이야." },
      { speaker: "K", text_en: "Let's get some.", text_ko: "마시러 가자." },
    ],
  },
  {
    id: 139,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "A에게 ~만큼 빚지다",
    pattern_en: "owe A ~",
    example_dialogue: [
      { speaker: "E", text_en: "I owe you a big favor.", text_ko: "너에게 큰 신세를 졌어." },
      { speaker: "K", text_en: "Don't mention it.", text_ko: "별말씀을." },
    ],
  },
  {
    id: 140,
    chapter_num: 7,
    chapter_title: CHAPTER_TITLES[7],
    pattern_ko: "…라고 해서 반드시~인 것은 아니다",
    pattern_en: "Just because …, it doesn't follow (that) ~",
    example_dialogue: [
      { speaker: "E", text_en: "Just because he's rich, it doesn't follow that he's happy.", text_ko: "그가 부자라고 해서 반드시 행복한 것은 아니야." },
      { speaker: "K", text_en: "That's very true.", text_ko: "정말 맞는 말이야." },
    ],
  },
];

export const ORDERED_PATTERNS = [...PATTERNS].sort((a, b) => a.id - b.id);

export function getPatternById(id: number): PatternData | undefined {
  return PATTERNS.find((p) => p.id === id);
}

export function getAdjacentPatterns(id: number): {
  prev: PatternData | null;
  next: PatternData | null;
} {
  const idx = ORDERED_PATTERNS.findIndex((p) => p.id === id);
  return {
    prev: idx > 0 ? ORDERED_PATTERNS[idx - 1] : null,
    next:
      idx >= 0 && idx < ORDERED_PATTERNS.length - 1
        ? ORDERED_PATTERNS[idx + 1]
        : null,
  };
}

export function formatNo(id: number): string {
  return String(id).padStart(3, "0");
}
