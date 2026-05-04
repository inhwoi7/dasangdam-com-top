"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Post = { id: number; nickname: string; title: string; content: string; created_at: string; password_hash: string };
type Comment = { id: number; nickname: string; content: string; created_at: string; password_hash: string };

export default function TalkDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentForm, setCommentForm] = useState({ nickname: "", password: "", content: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: postData } = await supabase.from("posts").select("*").eq("id", id).single();
      const { data: commentData } = await supabase.from("comments").select("*").eq("post_id", id).order("created_at");
      setPost(postData);
      setComments(commentData || []);
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    const pw = prompt("비밀번호를 입력하세요");
    if (!pw) return;
    const hash = btoa(encodeURIComponent(pw));
    if (hash !== post?.password_hash) { alert("비밀번호가 틀렸어요."); return; }
    await supabase.from("posts").delete().eq("id", id);
    router.push("/talk");
  };

  const handleCommentSubmit = async () => {
    if (!commentForm.nickname || !commentForm.password || !commentForm.content) {
      alert("모든 항목을 입력해주세요."); return;
    }
    setLoading(true);
    const password_hash = btoa(encodeURIComponent(commentForm.password));
    const { error } = await supabase.from("comments").insert({
      post_id: Number(id),
      nickname: commentForm.nickname,
      password_hash,
      content: commentForm.content,
    });
    if (!error) {
      const { data } = await supabase.from("comments").select("*").eq("post_id", id).order("created_at");
      setComments(data || []);
      setCommentForm({ nickname: "", password: "", content: "" });
    }
    setLoading(false);
  };

  const handleCommentDelete = async (comment: Comment) => {
    const pw = prompt("비밀번호를 입력하세요");
    if (!pw) return;
    const hash = btoa(encodeURIComponent(pw));
    if (hash !== comment.password_hash) { alert("비밀번호가 틀렸어요."); return; }
    await supabase.from("comments").delete().eq("id", comment.id);
    setComments(comments.filter(c => c.id !== comment.id));
  };

  if (!post) return <div style={{ padding: "60px", textAlign: "center", color: "#B8956A" }}>불러오는 중...</div>;

  return (
    <main style={{ minHeight: "100vh", background: "#FAF6F0", padding: "40px 16px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* 뒤로가기 */}
        <button onClick={() => router.push("/talk")} style={{
          background: "none", border: "none", color: "#B8956A", fontSize: "14px",
          cursor: "pointer", marginBottom: "24px", padding: 0, fontWeight: 600,
        }}>
          ← 목록으로
        </button>

        {/* 글 본문 */}
        <div style={{ background: "#FFFFFF", border: "1px solid #EDE0CE", borderRadius: "16px", padding: "28px", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#2C1810", marginBottom: "12px", lineHeight: 1.4 }}>
            {post.title}
          </h1>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", color: "#7A6355" }}>
              ✍️ {post.nickname} · {new Date(post.created_at).toLocaleDateString("ko-KR")}
            </div>
            <button onClick={handleDelete} style={{
              background: "none", border: "1px solid #EDE0CE", borderRadius: "8px",
              padding: "4px 12px", fontSize: "12px", color: "#B8956A", cursor: "pointer",
            }}>
              삭제
            </button>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid #EDE0CE", marginBottom: "20px" }} />
          <p style={{ fontSize: "15px", color: "#2C1810", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {post.content}
          </p>
        </div>

        {/* 댓글 목록 */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#2C1810", marginBottom: "16px" }}>
            💬 댓글 {comments.length}개
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {comments.map(comment => (
              <div key={comment.id} style={{
                background: "#FFFFFF", border: "1px solid #EDE0CE",
                borderRadius: "12px", padding: "16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#7A6355" }}>
                    ✍️ {comment.nickname} · {new Date(comment.created_at).toLocaleDateString("ko-KR")}
                  </span>
                  <button onClick={() => handleCommentDelete(comment)} style={{
                    background: "none", border: "none", fontSize: "12px",
                    color: "#B8956A", cursor: "pointer", padding: 0,
                  }}>
                    삭제
                  </button>
                </div>
                <p style={{ fontSize: "14px", color: "#2C1810", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 댓글 작성 */}
        <div style={{ background: "#FFFFFF", border: "1px solid #EDE0CE", borderRadius: "16px", padding: "20px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2C1810", marginBottom: "16px" }}>댓글 쓰기</h3>
          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <input
              style={inputStyle}
              placeholder="닉네임"
              value={commentForm.nickname}
              onChange={e => setCommentForm({ ...commentForm, nickname: e.target.value })}
            />
            <input
              style={inputStyle}
              type="password"
              placeholder="비밀번호"
              value={commentForm.password}
              onChange={e => setCommentForm({ ...commentForm, password: e.target.value })}
            />
          </div>
          <textarea
            style={{ ...inputStyle, height: "100px", resize: "vertical", marginBottom: "12px" }}
            placeholder="댓글을 입력하세요"
            value={commentForm.content}
            onChange={e => setCommentForm({ ...commentForm, content: e.target.value })}
          />
          <div style={{ textAlign: "right" }}>
            <button
              onClick={handleCommentSubmit}
              disabled={loading}
              style={{
                background: "#2C1810", color: "#FAF6F0",
                border: "none", borderRadius: "10px",
                padding: "10px 20px", fontSize: "14px",
                fontWeight: 600, cursor: "pointer",
              }}
            >
              {loading ? "등록 중..." : "댓글 등록"}
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "10px",
  border: "1px solid #EDE0CE",
  background: "#FAF6F0",
  fontSize: "14px",
  color: "#2C1810",
  outline: "none",
  boxSizing: "border-box",
};
