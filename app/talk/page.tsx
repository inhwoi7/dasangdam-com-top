import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function TalkPage() {
  const { data: posts } = await supabase
    .from("posts")
    .select("id, nickname, title, created_at")
    .order("created_at", { ascending: false });

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg, #FAF6F0)", padding: "40px 16px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* 헤더 */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#B8956A", letterSpacing: "0.1em", marginBottom: "8px" }}>
            SUNNY'S TALK
          </p>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#2C1810", marginBottom: "8px" }}>
            수다방 💬
          </h1>
          <p style={{ fontSize: "14px", color: "#7A6355" }}>
            써니와 함께하는 이야기 공간이에요. 편하게 글 남겨주세요 😊
          </p>
        </div>

        {/* 글쓰기 버튼 */}
        <div style={{ marginBottom: "24px", textAlign: "right" }}>
          <Link href="/talk/write" style={{
            display: "inline-block",
            background: "#2C1810",
            color: "#FAF6F0",
            padding: "10px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
          }}>
            ✏️ 글쓰기
          </Link>
        </div>

        {/* 게시글 목록 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <Link key={post.id} href={`/talk/${post.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#FFFFFF",
                  border: "1px solid #EDE0CE",
                  borderRadius: "14px",
                  padding: "18px 20px",
                  transition: "box-shadow 0.2s",
                  cursor: "pointer",
                }}>
                  <h2 style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#2C1810",
                    marginBottom: "8px",
                    lineHeight: 1.4,
                  }}>
                    {post.title}
                  </h2>
                  <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "#7A6355" }}>
                    <span>✍️ {post.nickname}</span>
                    <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#B8956A",
              fontSize: "15px",
            }}>
              아직 글이 없어요. 첫 글을 남겨보세요! 🌟
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
