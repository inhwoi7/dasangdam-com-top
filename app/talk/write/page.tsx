"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function WritePage() {
  const router = useRouter();
  const [form, setForm] = useState({ nickname: "", password: "", title: "", content: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.nickname || !form.password || !form.title || !form.content) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    setLoading(true);

    // 비밀번호 간단 해시 (btoa)
    const password_hash = btoa(encodeURIComponent(form.password));

    const { error } = await supabase.from("posts").insert({
      nickname: form.nickname,
      password_hash,
      title: form.title,
      content: form.content,
    });

    setLoading(false);
    if (error) { alert("오류가 발생했어요. 다시 시도해주세요."); return; }
    router.push("/talk");
  };

  return (
    <main style={{ minHeight: "100vh", background: "#FAF6F0", padding: "40px 16px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#B8956A", letterSpacing: "0.1em", marginBottom: "8px" }}>
            SUNNY'S TALK
          </p>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#2C1810" }}>글쓰기 ✏️</h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>닉네임</label>
              <input
                style={inputStyle}
                placeholder="닉네임을 입력하세요"
                value={form.nickname}
                onChange={e => setForm({ ...form, nickname: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>비밀번호 <span style={{ color: "#B8956A", fontSize: "11px" }}>(수정/삭제 시 필요)</span></label>
              <input
                style={inputStyle}
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>제목</label>
            <input
              style={inputStyle}
              placeholder="제목을 입력하세요"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label style={labelStyle}>내용</label>
            <textarea
              style={{ ...inputStyle, height: "200px", resize: "vertical" }}
              placeholder="내용을 입력하세요"
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={() => router.back()}
              style={{ ...btnStyle, background: "#EDE0CE", color: "#7A6355" }}
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ ...btnStyle, background: "#2C1810", color: "#FAF6F0" }}
            >
              {loading ? "등록 중..." : "등록하기"}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#7A6355",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #EDE0CE",
  background: "#FFFFFF",
  fontSize: "15px",
  color: "#2C1810",
  outline: "none",
  boxSizing: "border-box",
};

const btnStyle: React.CSSProperties = {
  padding: "11px 24px",
  borderRadius: "10px",
  border: "none",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};
