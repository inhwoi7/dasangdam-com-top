"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, deleteDoc, doc, query, where,
  orderBy, onSnapshot, serverTimestamp
} from "firebase/firestore";
import CryptoJS from "crypto-js";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_COMMENT_PASSWORD || "sunny-admin-2024";

type Comment = {
  id: string;
  slug: string;
  text: string;
  nickname: string;
  passwordHash: string;
  createdAt: any;
};

function hashPassword(pw: string): string {
  return CryptoJS.SHA256(pw).toString();
}

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPwInput, setAdminPwInput] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("slug", "==", slug),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment)));
    });
    return () => unsub();
  }, [slug]);

  const submit = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력해주세요.");
    if (!password.trim()) return alert("비밀번호를 입력해주세요 (삭제할 때 필요해요).");
    if (!text.trim()) return alert("댓글을 입력해주세요.");
    setSubmitting(true);
    try {
      await addDoc(collection(db, "comments"), {
        slug,
        text: text.trim(),
        nickname: nickname.trim(),
        passwordHash: hashPassword(password),
        createdAt: serverTimestamp(),
      });
      setText("");
      setPassword("");
    } catch {
      alert("댓글 등록 중 오류가 발생했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (id: string, passwordHash: string) => {
    if (adminMode) {
      if (!confirm("댓글을 삭제할까요?")) return;
      await deleteDoc(doc(db, "comments", id));
      return;
    }
    const pw = prompt("삭제하려면 비밀번호를 입력해주세요.");
    if (!pw) return;
    if (hashPassword(pw) !== passwordHash) return alert("비밀번호가 맞지 않아요.");
    await deleteDoc(doc(db, "comments", id));
  };

  const handleAdminLogin = () => {
    if (adminPwInput === ADMIN_PASSWORD) {
      setAdminMode(true);
      setShowAdminLogin(false);
      setAdminPwInput("");
    } else {
      alert("비밀번호가 틀렸어요.");
    }
  };

  const timeAgo = (ts: any) => {
    if (!ts?.seconds) return "";
    const diff = Date.now() - ts.seconds * 1000;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금";
    if (mins < 60) return `${mins}분 전`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}시간 전`;
    return `${Math.floor(hrs / 24)}일 전`;
  };

  return (
    <div style={{ marginTop: "60px", borderTop: "1px solid #e8e0d5", paddingTop: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#3d2f22", margin: 0 }}>댓글</h3>
        <div>
          {adminMode ? (
            <span style={{ fontSize: "12px", color: "#c8a882", cursor: "pointer" }}
              onClick={() => setAdminMode(false)}>관리자 모드 종료</span>
          ) : (
            <span style={{ fontSize: "11px", color: "#d0c8c0", cursor: "pointer" }}
              onClick={() => setShowAdminLogin(v => !v)}>●●●</span>
          )}
        </div>
      </div>

      {/* 관리자 로그인 */}
      {showAdminLogin && !adminMode && (
        <div style={{ background: "#faf7f3", border: "1px solid #e8e0d5", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
          <p style={{ fontSize: "13px", color: "#8c7a62", marginBottom: "10px" }}>관리자 확인</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input type="password" placeholder="관리자 비밀번호" value={adminPwInput}
              onChange={e => setAdminPwInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #e8e0d5", borderRadius: "8px", fontSize: "14px" }} />
            <button onClick={handleAdminLogin}
              style={{ padding: "8px 16px", background: "#c8a882", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
              확인
            </button>
          </div>
        </div>
      )}

      {/* 댓글 목록 */}
      {comments.length === 0 && (
        <p style={{ color: "#b0a090", fontSize: "14px", marginBottom: "24px" }}>첫 댓글을 남겨보세요!</p>
      )}
      {comments.map((c) => (
        <div key={c.id} style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "flex-start" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #f5e8d5, #e8d0b0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", color: "#a07850", fontWeight: "600"
          }}>
            {c.nickname?.[0] ?? "?"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#3d2f22" }}>{c.nickname}</span>
              <span style={{ fontSize: "12px", color: "#c0b0a0" }}>{timeAgo(c.createdAt)}</span>
            </div>
            <p style={{ fontSize: "15px", color: "#4a3b2e", margin: 0 }}>{c.text}</p>
          </div>
          <button
            onClick={() => deleteComment(c.id, c.passwordHash)}
            style={{ fontSize: "12px", color: adminMode ? "#e57373" : "#d0c0b0", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
          >
            {adminMode ? "삭제" : "✕"}
          </button>
        </div>
      ))}

      {/* 댓글 입력 */}
      <div style={{ borderTop: "1px solid #f0e8de", paddingTop: "20px", marginTop: "8px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <input type="text" placeholder="닉네임 *" value={nickname}
            onChange={e => setNickname(e.target.value)} maxLength={20}
            style={{ flex: 1, padding: "8px 12px", border: "1px solid #e8e0d5", borderRadius: "10px", fontSize: "14px" }} />
          <input type="password" placeholder="비밀번호 * (삭제용)" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", border: "1px solid #e8e0d5", borderRadius: "10px", fontSize: "14px" }} />
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="댓글을 입력하세요..."
          style={{ width: "100%", minHeight: "80px", padding: "12px", borderRadius: "10px", border: "1px solid #e8e0d5", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }} />
        <button onClick={submit} disabled={submitting}
          style={{ marginTop: "8px", padding: "10px 20px", background: submitting ? "#e0d0c0" : "#c8a882", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>
          {submitting ? "등록 중..." : "등록"}
        </button>
      </div>
    </div>
  );
}
