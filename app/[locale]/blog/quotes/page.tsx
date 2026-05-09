import Link from "next/link";
import { getQuotePosts } from "@/lib/notion";

export const revalidate = 0;

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export default async function QuotesPage() {
  const posts = await getQuotePosts(100).catch(() => []);

  return (
    <main className="page">
      <div className="container">
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div className="sectionHeader" style={{ marginBottom: "24px" }}>
            <Link href="/" style={{ fontSize: "13px", color: "var(--text-faint)", textDecoration: "none", display: "inline-block", marginBottom: "12px" }}>
              ← 홈으로
            </Link>
            <br />
            <span className="sectionMini">TODAY&apos;S PICK</span>
            <h1 style={{ margin: "0", fontSize: "28px", lineHeight: "1.25", letterSpacing: "-0.04em", fontWeight: "800" }}>
              마음에 머무는 문장들
            </h1>
            <p style={{ margin: "8px 0 0", color: "var(--text-soft)", fontSize: "15px" }}>
              써니가 고른 오늘의 문장 모음
            </p>
          </div>

          <div className="postList">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="postRow">
                  <div className="postMain">
                    <div className="postMeta">
                      {post.category && <span className="categoryTag">{post.category}</span>}
                      {post.publishedDate && <span className="postDate">{formatDate(post.publishedDate)}</span>}
                    </div>
                    <h3>{post.title}</h3>
                    {post.excerpt && <p>{post.excerpt}</p>}
                  </div>
                  <div className="postArrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))
            ) : (
              <div className="postRow">
                <div className="postMain">
                  <h3>아직 등록된 문장이 없습니다.</h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
