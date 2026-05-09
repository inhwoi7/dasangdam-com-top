import Link from "next/link";
import { getArticlePostsPaginated } from "@/lib/notion";

export const revalidate = 0;

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { posts, totalCount, hasMore } = await getArticlePostsPaginated(currentPage, 10).catch(() => ({
    posts: [], totalCount: 0, hasMore: false,
  }));

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <main className="page">
      <div className="container">
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div className="sectionHeader" style={{ marginBottom: "24px" }}>
            <Link href="/" style={{ fontSize: "13px", color: "var(--text-faint)", textDecoration: "none", display: "inline-block", marginBottom: "12px" }}>
              ← 홈으로
            </Link>
            <br />
            <span className="sectionMini">BLOG &amp; CONSULT</span>
            <h1 style={{ margin: "0", fontSize: "28px", lineHeight: "1.25", letterSpacing: "-0.04em", fontWeight: "800" }}>
              써니의 기록
            </h1>
            {totalCount > 0 && (
              <p style={{ margin: "8px 0 0", color: "var(--text-soft)", fontSize: "15px" }}>
                총 {totalCount}개의 글
              </p>
            )}
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
                  <h3>아직 등록된 글이 없습니다.</h3>
                </div>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "32px" }}>
              {currentPage > 1 && (
                <Link href={`/blog?page=${currentPage - 1}`} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  height: "40px", padding: "0 16px", borderRadius: "999px",
                  border: "1px solid var(--line)", background: "var(--card)",
                  color: "var(--text)", fontSize: "14px", fontWeight: "600", textDecoration: "none",
                }}>
                  ← 이전
                </Link>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={`/blog?page=${p}`} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: "40px", height: "40px", borderRadius: "999px",
                  border: p === currentPage ? "none" : "1px solid var(--line)",
                  background: p === currentPage ? "var(--text)" : "var(--card)",
                  color: p === currentPage ? "white" : "var(--text)",
                  fontSize: "14px", fontWeight: "700", textDecoration: "none",
                }}>
                  {p}
                </Link>
              ))}

              {hasMore && (
                <Link href={`/blog?page=${currentPage + 1}`} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  height: "40px", padding: "0 16px", borderRadius: "999px",
                  border: "1px solid var(--line)", background: "var(--card)",
                  color: "var(--text)", fontSize: "14px", fontWeight: "600", textDecoration: "none",
                }}>
                  다음 →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
