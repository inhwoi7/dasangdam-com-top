import Link from "next/link";
import { ArrowRightIcon, ServiceIcon, SunLogo } from "@/components/icons";
import { getArticlePosts, getFeaturedQuote } from "@/lib/notion";

export const revalidate = 0;

type ServiceItem = {
  title: string;
  description: string;
  href: string;
  icon: "saju" | "mbti" | "compatibility" | "ipip" | "lucky" | "fortune" | "ladder";
};

const SERVICES: ServiceItem[] = [
  { title: "사주", description: "타고난 흐름과 현재의 운을 편안하게 살펴보세요.", href: "/services/saju", icon: "saju" },
  { title: "MBTI 매칭", description: "성향과 관계 패턴을 쉽고 명확하게 이해해보세요.", href: "/services/mbti", icon: "mbti" },
  { title: "사주 궁합", description: "우리 둘의 성향 차이와 조화를 확인해보세요.", href: "/services/chemi", icon: "compatibility" },
  { title: "IPIP-50 성격검사", description: "과학적인 5대 성격 요인을 정밀하게 측정합니다.", href: "/services/ipip", icon: "ipip" },
  { title: "행운의 숫자", description: "가벼운 마음으로 확인하는 행운의 숫자를 확인해보세요.", href: "/services/lucky", icon: "lucky" },
  { title: "주역점", description: "오늘 하루의 기운을 가볍고 편안하게 확인해보세요.", href: "https://my-iching-app-five.vercel.app", icon: "fortune" },
  { title: "사다리 게임", description: "운명의 사다리를 타볼까요? 친구들과 함께 즐겨보세요.", href: "/services/ladder", icon: "ladder" },
];

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

async function fetchData() {
  const todayPick = await getFeaturedQuote().catch(() => null);
  const articlePosts = await getArticlePosts(5).catch(() => []);
  return { todayPick, articlePosts };
}

export default async function HomePage() {
  const { todayPick, articlePosts } = await fetchData();
  const hasTodayPickLink = Boolean(todayPick?.slug);

  return (
    <main className="page">
      <div className="container">
        <section className="brandSection">
          <div className="brandShell">
            <div className="brandLogo"><SunLogo /></div>
            <div className="brandText">
              <p className="brandEyebrow">WISE REST WITH SUNNY</p>
              <h1>다상담</h1>
              <p className="brandSubtitle">써니와 함께하는 인생의 지혜로운 쉼터</p>
            </div>
          </div>
        </section>

        <section className="recommendSection">
          {todayPick ? (
            <div>
              {hasTodayPickLink ? (
                <Link href={`/blog/${todayPick.slug}`} className="recommendCard">
                  <div className="recommendTop">
                    <span className="recommendMini">TODAY&apos;S PICK</span>
                    <span className="recommendMiniText">오늘 마음에 머무는 문장</span>
                  </div>
                  <div className="recommendBody">
                    <div className="recommendCopy">
                      <h2>{todayPick.title}</h2>
                      {todayPick.excerpt && <p>{todayPick.excerpt}</p>}
                    </div>
                    <div className="recommendAction">
                      <span>자세히 보기</span>
                      <ArrowRightIcon />
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="recommendCard">
                  <div className="recommendTop">
                    <span className="recommendMini">TODAY&apos;S PICK</span>
                    <span className="recommendMiniText">오늘 마음에 머무는 문장</span>
                  </div>
                  <div className="recommendBody">
                    <div className="recommendCopy">
                      <h2>{todayPick.title}</h2>
                      {todayPick.excerpt && <p>{todayPick.excerpt}</p>}
                    </div>
                  </div>
                </div>
              )}
              <div style={{ textAlign: "right", marginTop: "10px" }}>
                <Link href="/blog/quotes" style={{
                  fontSize: "13px", color: "var(--text-faint)", textDecoration: "none",
                  fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px"
                }}>
                  전체 목록 보기 →
                </Link>
              </div>
            </div>
          ) : (
            <div className="recommendCard">
              <div className="recommendTop">
                <span className="recommendMini">TODAY&apos;S PICK</span>
                <span className="recommendMiniText">오늘 마음에 머무는 문장</span>
              </div>
              <div className="recommendBody">
                <div className="recommendCopy">
                  <h2>아직 등록된 오늘의 문장이 없습니다.</h2>
                  <p>Notion에서 Published 체크된 quote 글을 추가해주세요.</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="serviceSection">
          <div className="sectionHeader">
            <span className="sectionMini">내면의 여정</span>
            <h2>지금 나에게 필요한 게 뭘까요?</h2>
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
              <span className="sectionMini">BLOG &amp; CONSULT</span>
              <h2>써니의 다양한 생각들</h2>
            </div>
            <Link href="/blog" style={{
              fontSize: "13px", color: "var(--text-faint)", textDecoration: "none",
              fontWeight: "600", marginBottom: "2px", display: "inline-flex", alignItems: "center", gap: "4px"
            }}>
              전체 보기 →
            </Link>
          </div>
          <div className="postList">
            {articlePosts.length > 0 ? (
              articlePosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="postRow">
                  <div className="postMain">
                    <div className="postMeta">
                      {post.category && <span className="categoryTag">{post.category}</span>}
                      {post.publishedDate && <span className="postDate">{formatDate(post.publishedDate)}</span>}
                    </div>
                    <h3>{post.title}</h3>
                    {post.excerpt && <p>{post.excerpt}</p>}
                  </div>
                  <div className="postArrow"><ArrowRightIcon /></div>
                </Link>
              ))
            ) : (
              <div className="postRow">
                <div className="postMain">
                  <h3>아직 등록된 서재 글이 없습니다.</h3>
                  <p>Notion에서 Published 체크된 article 글을 추가해주세요.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
