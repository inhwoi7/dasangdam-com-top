"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLocale } from "next-intl";

type Post = { id: number; nickname: string; title: string; content: string; created_at: string; password_hash: string };
type Comment = { id: number; nickname: string; content: string; created_at: string; password_hash: string };

const T = {
  ko: {
    back: "← 목록으로",
    delete: "삭제",
    comments: "💬 댓글",
    count: "개",
    writeComment: "댓글 쓰기",
    nickname: "닉네임",
    password: "비밀번호",
    commentPh: "댓글을 입력하세요",
    submit: "댓글 등록",
    submitting: "등록 중...",
    loading: "불러오는 중...",
    pwPrompt: "비밀번호를 입력하세요",
    pwWrong: "비밀번호가 틀렸어요.",
    required: "모든 항목을 입력해주세요.",
  },
  en: {
    back: "← Back to list",
    delete: "Delete",
    comments: "💬 Comments",
    count: "",
    writeComment: "Leave a Comment",
    nickname: "Nickname",
    password: "Password",
    commentPh: "Write your comment here",
    submit: "Post Comment",
    submitting: "Posting...",
    loading: "Loading...",
    pwPrompt: "Enter your password",
    pwWrong: "Incorrect password.",
    required: "Please fill in all fields.",
  },
};

export default function TalkDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = T[locale as "ko" | "en"] ?? T.ko;

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
    const pw = prompt(t.pwPrompt);
    if (!pw) return;
    const hash = btoa(encodeURIComponent(pw));
    if (hash !== post?.password_hash) { alert(t.pwWrong); return; }
    await supabase.from("posts").delete().eq("id", id);
    router.push(`/${locale}/talk`);
  };

  const handleCommentSubmit = async () => {
    if (!commentForm.nickname || !commentForm.password || !commentForm.content) {
      alert(t.required); return;
    }
    setLoading(true);
    const password_hash = btoa(encodeURIComponent(commentForm.password));
    const { error } = await supabase.from("comments").insert({
      post_id: Number(id), nickname: commentForm.nickname, password_hash, content: commentForm.content,
    });
    if (!error) {
      const { data } = await supabase.from("comments").select("*").eq("post_id", id).order("created_at");
      setComments(data || []);
      setCommentForm({ nickname: "", password: "", content: "" });
    }
    setLoading(false);
  };

  const handleCommentDelete = async (comment: Comment) => {
    const pw = prompt(t.pwPrompt);
    if (!pw) return;
    const hash = btoa(encodeURIComponent(pw));
    if (hash !== comment.password_hash) { alert(t.pwWrong); return; }
    await supabase.from("comments").delete().eq("id", comment.id);
    setComments(comments.filter(c => c.id !== comment.id));
  };

  if (!post) return <div style={{ padding: "60px", textAlign: "center", color: "#B8956A" }}>{t.loading}</div>;

  const dateLocale = locale === "en" ? "en-US" : "ko-KR";

  return (
    <main style={{ minHeight: "100vh", background: "#FAF6F0", padding: "40px 16px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        <button onClick={() => router.push(`/${locale}/talk`)} style={{
          background: "none", border: "none", color: "#B8956A", fontSize: "14px",
          cursor: "pointer", marginBottom: "24px", padding: 0, fontWeight: 600,
        }}>
          {t.back}
        </button>

        <div style={{ background: "#FFFFFF", border: "1px solid #EDE0CE", borderRadius: "16px", padding: "28px", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#2C1810", marginBottom: "12px", lineHeight: 1.4 }}>
            {post.title}
          </h1>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", color: "#7A6355" }}>
              ✍️ {post.nickname} · {new Date(post.created_at).toLocaleDateString(dateLocale)}
            </div>
            <button onClick={handleDelete} style={{
              background: "none", border: "1px solid #EDE0CE", borderRadius: "8px",
              padding: "4px 12px", fontSize: "12px", color: "#B8956A", cursor: "pointer",
            }}>
              {t.delete}
            </button>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid #EDE0CE", marginBottom: "20px" }} />
          <p style={{ fontSize: "15px", color: "#2C1810", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{post.content}</p>
        </div>

        {/* Comments */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#2C1810", marginBottom: "16px" }}>
            {t.comments} {comments.length}{t.count}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {comments.map(comment => (
              <div key={comment.id} style={{ background: "#FFFFFF", border: "1px solid #EDE0CE", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#7A6355" }}>
                    ✍️ {comment.nickname} · {new Date(comment.created_at).toLocaleDateString(dateLocale)}
                  </span>
                  <button onClick={() => handleCommentDelete(comment)} style={{ background: "none", border: "none", fontSize: "12px", color: "#B8956A", cursor: "pointer", padding: 0 }}>
                    {t.delete}
                  </button>
                </div>
                <p style={{ fontSize: "14px", color: "#2C1810", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Comment form */}
        <div style={{ background: "#FFFFFF", border: "1px solid #EDE0CE", borderRadius: "16px", padding: "20px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2C1810", marginBottom: "16px" }}>{t.writeComment}</h3>
          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <input style={inputStyle} placeholder={t.nickname} value={commentForm.nickname}
              onChange={e => setCommentForm({ ...commentForm, nickname: e.target.value })} />
            <input style={inputStyle} type="password" placeholder={t.password} value={commentForm.password}
              onChange={e => setCommentForm({ ...commentForm, password: e.target.value })} />
          </div>
          <textarea style={{ ...inputStyle, height: "100px", resize: "vertical", marginBottom: "12px" }}
            placeholder={t.commentPh} value={commentForm.content}
            onChange={e => setCommentForm({ ...commentForm, content: e.target.value })} />
          <div style={{ textAlign: "right" }}>
            <button onClick={handleCommentSubmit} disabled={loading} style={{
              background: "#2C1810", color: "#FAF6F0", border: "none", borderRadius: "10px",
              padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
            }}>
              {loading ? t.submitting : t.submit}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: "10px",
  border: "1px solid #EDE0CE", background: "#FAF6F0",
  fontSize: "14px", color: "#2C1810", outline: "none", boxSizing: "border-box",
};
