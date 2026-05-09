import Link from "next/link";
import { ArrowRightIcon, ServiceIcon, SunLogo } from "@/components/icons";
import { getArticlePosts, getFeaturedQuote } from "@/lib/notion";
import { getLocale, getTranslations } from "next-intl/server";
import LangSwitch from "@/components/LangSwitch";

export const revalidate = 0;

type ServiceItem = {
  title: string;
  description: string;
  href: string;
  icon: "saju" | "mbti" | "compatibility" | "ipip" | "lucky" | "fortune" | "ladder" | "message" | "naming" | "tarot";
};

function formatDate(dateString: string, locale: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit"
  }).format(date);
}

async function fetchData() {
  const todayPick = await getFeaturedQuote().catch(() => null);
  const articlePosts = await getArticlePosts(3).catch(() => []);
  return { todayPick, articlePosts };
}

export default async function HomePage() {
  const { todayPick, articlePosts } = await fetchData();
  const locale = await getLocale();
  const t = await getTranslations();
  const hasTodayPickLink = Boolean(todayPick?.slug);

  const SERVICES: ServiceItem[] = [
    { title: t("menu_message"), description: locale === "en" ? "Find the one sentence you need today." : "매일 나에게 꼭 필요한 한 문장을 뽑아보세요.", href: "/services/message", icon: "message" },
    { title: t("menu_tarot"), description: locale === "en" ? "Put your question into a card. Major 22 · Full 78." : "마음 속 질문을 카드에 담아보세요. 메이저 22장 · 전체 78장.", href: "/services/tarot", icon: "tarot" },
    { title: t("menu_lucky_number"), description: locale === "en" ? "Check your lucky number with a light heart." : "가벼운 마음으로 확인하는 행운의 숫자를 확인해보세요.", href: "/services/lucky", icon: "lucky" },
    { title: t("menu_saju"), description: locale === "en" ? "Explore your innate flow and current fortune." : "타고난 흐름과 현재의 운을 편안하게 살펴보세요.", href: "/services/saju", icon: "saju" },
    { title: t("menu_saju_match"), description: locale === "en" ? "Check the harmony between you two." : "우리 둘의 성향 차이와 조화를 확인해보세요.", href: "/services/chemi", icon: "compatibility" },
    { title: t("menu_mbti"), description: locale === "en" ? "Understand relationship patterns clearly." : "성향과 관계 패턴을 쉽고 명확하게 이해해보세요.", href: "/services/mbti", icon: "mbti" },
    { title: t("menu_personality"), description: locale === "en" ? "Discover your personality type scientifically." : "나의 성격 유형을 과학적으로 알아보세요.", href: "/services/ipip", icon: "ipip" },
    { title: t("menu_iching"), description: locale === "en" ? "Check today's energy lightly and comfortably." : "오늘 하루의 기운을 가볍고 편안하게 확인해보세요.", href: "https://my-iching-app-five.vercel.app", icon: "fortune" },
    { title: t("menu_ladder"), description: locale === "en" ? "Try the ladder of fate with friends!" : "운명의 사다리를 타볼까요? 친구들과 함께 즐겨보세요.", href: "/services/ladder", icon: "ladder" },
    { title: t("menu_naming"), description: locale === "en" ? "Find a good name that fits your fortune." : "사주의 기운에 맞는 좋은 이름을 찾아보세요.", href: "/services/naming", icon: "naming" },
  ];

  const displayTitle = locale === "en" && todayPick?.title_en ? todayPick.title_en : todayPick?.title;
  const displayExcerpt = locale === "en" && todayPick?.excerpt_en ? todayPick.excerpt_en : todayPick?.excerpt;

  return (
    <main className="page">
      <div className="container">
        <section className="brandSection">
          <div className="brandShell">
            <div className="brandLogo"><SunLogo /></div>
            <div className="brandText">
              <p className="brandEyebrow">WISE REST WITH SUNNY</p>
              <h1>다상담</h1>
              <p className="brandSubtitle">
                {locale === "en" ? "A wise resting place with Sunny" : "써니와 함께하는 인생의 지혜로운 쉼터"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <LangSwitch />
          </div>
        </section>

        <section className="recommendSection">
          {todayPick ? (
            <div>
              {hasTodayPickLink ? (
                <Link href={`/blog/${todayPick.slug}`} className="recommendCard">
                  <div className="recommendTop">
                    <span className="recommendMini">TODAY&apos;S PICK</span>
                    <span className="recommendMiniText">{locale === "en" ? "Today's sentence" : "오늘 마음에 머무는 문장"}</span>
                  </div>
                  <div className="recommendBody">
                    <div className="recommendCopy">
                      <h2>{displayTitle}</h2>
                      {displayExcerpt && <p>{displayExcerpt}</p>}
                    </div>
                    <div className="recommendAction">
                      <span>{t("see_detail")}</span>
                      <ArrowRightIcon />
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="recommendCard">
                  <div className="recommendTop">
                    <span className="recommendMini">TODAY&apos;S PICK</span>
                    <span className="recommendMiniText">{locale === "en" ? "Today's sentence" : "오늘 마음에 머무는 문장"}</span>
                  </div>
                  <div className="recommendBody">
                    <div className="recommendCopy">
                      <h2>{displayTitle}</h2>
                      {displayExcerpt && <p>{displayExcerpt}</p>}
                    </div>
                  </div>
                </div>
              )}
              <div style={{ textAlign: "right", marginTop: "10px" }}>
                <Link href="/blog/quotes" style={{
                  fontSize: "13px", color: "var(--text-faint)", textDecoration: "none",
                  fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px"
                }}>
                  {t("read_more")} →
                </Link>
              </div>
            </div>
          ) : (
            <div className="recommendCard">
              <div className="recommendTop">
                <span className="recommendMini">TODAY&apos;S PICK</span>
              </div>
              <div className="recommendBody">
                <div className="recommendCopy">
                  <h2>{locale === "en" ? "No quote for today yet." : "아직 등록된 오늘의 문장이 없습니다."}</h2>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="serviceSection">
          <div className="sectionHeader">
            <span className="sectionMini">{locale === "en" ? "Wise Choice" : "지혜로운 선택"}</span>
            <h2>{t("section_curious")}</h2>
          </div>
          <div className="serviceGrid">
            {SERVICES.map((service) => (
              <Link key={service.title} href={service.href} className="serviceCard">
                <div className="serviceIconBox">
                  <ServiceIcon type={service.icon as any} />
                </div>
                <div className="serviceText">
                  <strong>{service.title}</strong>
                  <p>{service.description}</p>
                </div>
                <div className="serviceArrow"><ArrowRightIcon /></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="librarySection">
          <div className="sectionHeader" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <span className="sectionMini">{locale === "en" ? "Traces of Thought" : "생각의 흔적"}</span>
              <h2>{t("section_think")}</h2>
            </div>
            <Link href="/blog" style={{
              fontSize: "13px", color: "var(--text-faint)", textDecoration: "none",
              fontWeight: "600", marginBottom: "2px", display: "inline-flex", alignItems: "center", gap: "4px"
            }}>
              {t("read_more")} →
            </Link>
          </div>
          <div className="postList">
            {articlePosts.length > 0 ? (
              articlePosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="postRow">
                  <div className="postMain">
                    <div className="postMeta">
                      {post.category && <span className="categoryTag">{post.category}</span>}
                      {post.publishedDate && <span className="postDate">{formatDate(post.publishedDate, locale)}</span>}
                    </div>
                    <h3>{locale === "en" && post.title_en ? post.title_en : post.title}</h3>
                    {(locale === "en" && post.excerpt_en ? post.excerpt_en : post.excerpt) && (
                      <p>{locale === "en" && post.excerpt_en ? post.excerpt_en : post.excerpt}</p>
                    )}
                  </div>
                  <div className="postArrow"><ArrowRightIcon /></div>
                </Link>
              ))
            ) : (
              <div className="postRow">
                <div className="postMain">
                  <h3>{locale === "en" ? "No posts yet." : "아직 등록된 서재 글이 없습니다."}</h3>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="librarySection" style={{ marginTop: "36px" }}>
          <div className="sectionHeader" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <span className="sectionMini">{locale === "en" ? "Together" : "함께하는 이야기"}</span>
              <h2>{t("section_talk")}</h2>
            </div>
            <Link href="/talk" style={{
              fontSize: "13px", color: "var(--text-faint)", textDecoration: "none",
              fontWeight: "600", marginBottom: "2px", display: "inline-flex", alignItems: "center", gap: "4px"
            }}>
              {t("read_more")} →
            </Link>
          </div>
          <Link href="/talk" className="postRow" style={{ textDecoration: "none" }}>
            <div className="postMain">
              <h3>{locale === "en" ? "A space to connect" : "소통하는 공간이에요"}</h3>
              <p>{locale === "en" ? "Feel free to leave a message. Just a nickname is enough 😊" : "편하게 글 남겨주세요. 닉네임만 있으면 돼요 😊"}</p>
            </div>
            <div className="postArrow"><ArrowRightIcon /></div>
          </Link>
        </section>
      </div>
    </main>
  );
}