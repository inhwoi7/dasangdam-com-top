import Link from "next/link";
import { ArrowRightIcon, ServiceIcon, SunLogo } from "@/components/icons";
import { getArticlePosts, getFeaturedQuote } from "@/lib/notion";

// 접속할 때마다 최신 데이터를 가져옴
export const revalidate = 0;

type ServiceItem = {
  title: string;
  description: string;
  href: string;
  icon: "saju" | "mbti" | "compatibility" | "ipip" | "lucky" | "fortune";
};

const SERVICES: ServiceItem[] = [
  { title: "사주",         description: "타고난 흐름과 현재의 운을 편안하게 살펴보세요.",      href: "https://my-saju-app.vercel.app/",           icon: "saju" },
  { title: "MBTI 매칭",    description: "성향과 관계 패턴을 쉽고 명확하게 이해해보세요.",     href: "https://dasangdam-mbti-sunny.vercel.app/",  icon: "mbti" },
  { title: "사주 궁합",    description: "우리 둘의 성향 차이와 조화를 확인해보세요.",          href: "https://dasangdam-chemi-app.vercel.app/",   icon: "compatibility" },
  { title: "IPIP-50 성격검사", description: "과학적인 5대 성격 요인을 정밀하게 측정합니다.", href: "https://ipip50-rho.vercel.app/",             icon: "ipip" },
  { title: "행운의 숫자",  description: "가벼운 마음으로 확인하는 행운의 숫자를 확인해보세요.", href: "/services/lotto",                          icon: "lucky" },
  { title: "오늘의 운세",  description: "오늘 하루의 기운을 가볍고 편안하게 확인해보세요.",   href: "/services/today-fortune",                   icon: "fortune" },
];

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

// ─── 데이터 fetch + 에러 메시지 캡처 ───
async function fetchData() {
  let quoteError = "";
  let articleError = "";

  const todayPick = await getFeaturedQuote().catch((e: any) => {
    quoteError = e?.message ?? "알 수 없는 오류";
    return null;
  });

  const articlePosts = await getArticlePosts(5).catch((e: any) => {
    articleError = e?.message ?? "알 수 없는 오류";
    return [];
  });

  return { todayPick, articlePosts, quoteError, articleError };
}

export default async function HomePage() {
  const { todayPick, articlePosts, quoteError, articleError } = await fetchData();
  const hasTodayPickLink = Boolean(todayPick?.slug);

  return (
    <main className="page">
      <div className="container">

        {/* ── 브랜드 ── */}
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

        {/* ── TODAY'S PICK ── */}
        <section className="recommendSection">
          {/* 에러 표시 */}
          {quoteError && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 8, fontSize: 13 }}>
              ❌ [TODAY&apos;S PICK 오류] {quoteError}
            </div>
          )}

          {todayPick ? (
            hasTodayPickLink ? (
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
                    <span>문장 보러가기</span>
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
            )
          ) : (
            <div className="recommendCard">
              <div className="recommendTop">
                <span className="recommendMini">TODAY&apos;S PICK</span>
                <span className="recommendMiniText">오늘 마음에 머무는 문장</span>
              </div>
              <div className="recommendBody">
                <div className="recommendCopy">
                  <h2>데이터가 없습니다</h2>
                  <p>Notion에서 Published=✅, Type=quote 인 글을 추가해주세요.</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── 서비스 ── */}
        <section className="serviceSection">
          <div className="sectionHeader">
            <span className="sectionMini">PLAYGROUND</span>
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

        {/* ── 서재 ── */}
        <section className="librarySection">
          <div className="sectionHeader">
            <span className="sectionMini">BLOG &amp; CONSULT</span>
            <h2>다상담 서재</h2>
          </div>

          {/* 에러 표시 */}
          {articleError && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 8, fontSize: 13 }}>
              ❌ [서재 오류] {articleError}
            </div>
          )}

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
                  <h3>데이터가 없습니다</h3>
                  <p>Notion에서 Published=✅, Type=article 인 글을 추가해주세요.</p>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
