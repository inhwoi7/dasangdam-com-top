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
  isSecret: boolean;
  createdAt: any;
  parentId?: string | null;
};

function hashPassword(pw: string): string {
  return CryptoJS.SHA256(pw).toString();
}

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [text, setText] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPwInput, setAdminPwInput] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  // 비밀댓글 열람: { [commentId]: true }
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  // 답글(대댓글) 입력 상태 — 한 번에 하나의 답글 창만 열림
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyNickname, setReplyNickname] = useState("");
  const [replyPassword, setReplyPassword] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

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

  // 알림 메일 전송 (실패해도 댓글 등록 자체에는 영향 없음)
  const notify = (nick: string, body: string, secret: boolean) => {
    fetch("/api/notify-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: nick,
        text: body,
        isSecret: secret,
        url: window.location.href,
      }),
    }).catch(() => {});
  };

  const submit = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력해주세요.");
    if (!password.trim()) return alert("비밀번호를 입력해주세요 (삭제·열람에 필요해요).");
    if (!text.trim()) return alert("댓글을 입력해주세요.");
    setSubmitting(true);
    try {
      await addDoc(collection(db, "comments"), {
        slug,
        text: text.trim(),
        nickname: nickname.trim(),
        passwordHash: hashPassword(password),
        isSecret: isSecret,
        createdAt: serverTimestamp(),
        parentId: null,
      });

      if (!adminMode) {
        notify(nickname.trim(), text.trim(), isSecret);
      }

      setText("");
      setPassword("");
      setIsSecret(false);
    } catch {
      alert("댓글 등록 중 오류가 발생했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  const openReply = (commentId: string) => {
    setReplyOpenId(prev => (prev === commentId ? null : commentId));
    setReplyNickname("");
    setReplyPassword("");
    setReplyText("");
  };

  const submitReply = async (parentId: string, parentNickname: string) => {
    if (!replyNickname.trim()) return alert("닉네임을 입력해주세요.");
    if (!replyPassword.trim()) return alert("비밀번호를 입력해주세요 (삭제에 필요해요).");
    if (!replyText.trim()) return alert("답글 내용을 입력해주세요.");
    setReplySubmitting(true);
    try {
      await addDoc(collection(db, "comments"), {
        slug,
        text: replyText.trim(),
        nickname: replyNickname.trim(),
        passwordHash: hashPassword(replyPassword),
        isSecret: false,
        createdAt: serverTimestamp(),
        parentId,
      });

      if (!adminMode) {
        notify(replyNickname.trim(), `${parentNickname}님 댓글에 답글: ${replyText.trim()}`, false);
      }

      setReplyOpenId(null);
      setReplyNickname("");
      setReplyPassword("");
      setReplyText("");
    } catch {
      alert("답글 등록 중 오류가 발생했어요.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const deleteComment = async (id: string, passwordHash: string) => {
    if (adminMode) {
      if (!confirm("댓글을 삭제할까요? 답글이 있다면 답글은 남아있어요.")) return;
      await deleteDoc(doc(db, "comments", id));
      return;
    }
    const pw = prompt("삭제하려면 비밀번호를 입력해주세요.");
    if (!pw) return;
    if (hashPassword(pw) !== passwordHash) return alert("비밀번호가 맞지 않아요.");
    await deleteDoc(doc(db, "comments", id));
  };

  // 비밀댓글 열람 (본인 비번 or 관리자모드)
  const revealSecret = async (id: string, passwordHash: string) => {
    if (adminMode) {
      setRevealed(prev => ({ ...prev, [id]: true }));
      return;
    }
    const pw = prompt("비밀댓글입니다. 비밀번호를 입력해주세요.");
    if (!pw) return;
    if (hashPassword(pw) !== passwordHash) return alert("비밀번호가 맞지 않아요.");
    setRevealed(prev => ({ ...prev, [id]: true }));
  };

  const handleAdminLogin = () => {
    if (adminPwInput === ADMIN_PASSWORD) {
      setAdminMode(true);
      setShowAdminLogin(false);
      setAdminPwInput("");
      // 관리자 모드 진입 시 모든 비밀댓글 자동 열람
      const allRevealed: Record<string, boolean> = {};
      comments.forEach(c => { if (c.isSecret) allRevealed[c.id] = true; });
      setRevealed(allRevealed);
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

  // 최상위 댓글만 (답글은 parentId를 가짐)
  const topLevelComments = comments.filter(c => !c.parentId);
  // 부모 id별 답글 목록
  const repliesByParent: Record<string, Comment[]> = {};
  comments.forEach(c => {
    if (c.parentId) {
      if (!repliesByParent[c.parentId]) repliesByParent[c.parentId] = [];
      repliesByParent[c.parentId].push(c);
    }
  });

  const renderComment = (c: Comment, isReply: boolean) => {
    const isRevealed = revealed[c.id];
    const isHidden = c.isSecret && !isRevealed;
    const replies = repliesByParent[c.id] ?? [];

    return (
      <div key={c.id}>
        <div style={{
          display: "flex", gap: "12px", marginBottom: isReply ? "12px" : "20px", alignItems: "flex-start",
          background: c.isSecret ? "#fdf8f2" : "transparent",
          border: c.isSecret ? "1px solid #f0e4cc" : "none",
          borderRadius: c.isSecret ? "14px" : "0",
          padding: c.isSecret ? "12px" : "0",
        }}>
          <div style={{
            width: isReply ? "28px" : "36px", height: isReply ? "28px" : "36px", borderRadius: "50%", flexShrink: 0,
            background: c.isSecret
              ? "linear-gradient(135deg, #f5deb3, #daa060)"
              : "linear-gradient(135deg, #f5e8d5, #e8d0b0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: isReply ? "12px" : "14px", color: "#a07850", fontWeight: "600"
          }}>
            {c.isSecret ? "🔒" : (c.nickname?.[0] ?? "?")}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: isReply ? "12px" : "13px", fontWeight: "600", color: "#3d2f22" }}>{c.nickname}</span>
              {c.isSecret && (
                <span style={{
                  fontSize: "10px", background: "#f5e0c0", color: "#a06820",
                  padding: "2px 7px", borderRadius: "10px", fontWeight: "600"
                }}>비밀댓글</span>
              )}
              <span style={{ fontSize: "12px", color: "#c0b0a0" }}>{timeAgo(c.createdAt)}</span>
            </div>

            {isHidden ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <p style={{ fontSize: "14px", color: "#c0a880", margin: 0, fontStyle: "italic" }}>
                  🔒 비밀댓글입니다.
                </p>
                <button onClick={() => revealSecret(c.id, c.passwordHash)}
                  style={{
                    fontSize: "12px", color: "#c8a882", background: "none",
                    border: "1px solid #e8d0b0", borderRadius: "8px",
                    padding: "2px 8px", cursor: "pointer"
                  }}>
                  열람
                </button>
              </div>
            ) : (
              <p style={{ fontSize: isReply ? "14px" : "15px", color: "#4a3b2e", margin: 0 }}>{c.text}</p>
            )}

            {!isReply && (
              <button
                onClick={() => openReply(c.id)}
                style={{
                  marginTop: "6px", fontSize: "12px", color: "#a88860", background: "none",
                  border: "none", cursor: "pointer", padding: 0
                }}
              >
                {replyOpenId === c.id ? "답글 취소" : "답글달기"}
              </button>
            )}

            {/* 답글 입력창 */}
            {replyOpenId === c.id && (
              <div style={{ marginTop: "10px", background: "#faf7f3", border: "1px solid #e8e0d5", borderRadius: "10px", padding: "12px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input type="text" placeholder="닉네임 *" value={replyNickname}
                    onChange={e => setReplyNickname(e.target.value)} maxLength={20}
                    style={{ flex: 1, padding: "7px 10px", border: "1px solid #e8e0d5", borderRadius: "8px", fontSize: "13px" }} />
                  <input type="password" placeholder="비밀번호 * (삭제용)" value={replyPassword}
                    onChange={e => setReplyPassword(e.target.value)}
                    style={{ flex: 1, padding: "7px 10px", border: "1px solid #e8e0d5", borderRadius: "8px", fontSize: "13px" }} />
                </div>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                  placeholder="답글을 입력하세요..."
                  style={{ width: "100%", minHeight: "60px", padding: "10px", borderRadius: "8px", border: "1px solid #e8e0d5", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }} />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                  <button onClick={() => submitReply(c.id, c.nickname)} disabled={replySubmitting}
                    style={{ padding: "7px 16px", background: replySubmitting ? "#e0d0c0" : "#c8a882", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
                    {replySubmitting ? "등록 중..." : "답글 등록"}
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => deleteComment(c.id, c.passwordHash)}
            style={{ fontSize: "12px", color: adminMode ? "#e57373" : "#d0c0b0", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
          >
            {adminMode ? "삭제" : "✕"}
          </button>
        </div>

        {/* 답글 목록 (들여쓰기) */}
        {replies.length > 0 && (
          <div style={{ marginLeft: "44px", borderLeft: "2px solid #f0e8de", paddingLeft: "16px" }}>
            {replies.map(r => renderComment(r, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: "60px", borderTop: "1px solid #e8e0d5", paddingTop: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#3d2f22", margin: 0 }}>댓글</h3>
        <div>
          {adminMode ? (
            <span style={{ fontSize: "12px", color: "#c8a882", cursor: "pointer" }}
              onClick={() => { setAdminMode(false); setRevealed({}); }}>관리자 모드 종료</span>
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
      {topLevelComments.length === 0 && (
        <p style={{ color: "#b0a090", fontSize: "14px", marginBottom: "24px" }}>첫 댓글을 남겨보세요!</p>
      )}
      {topLevelComments.map((c) => renderComment(c, false))}

      {/* 댓글 입력 */}
      <div style={{ borderTop: "1px solid #f0e8de", paddingTop: "20px", marginTop: "8px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <input type="text" placeholder="닉네임 *" value={nickname}
            onChange={e => setNickname(e.target.value)} maxLength={20}
            style={{ flex: 1, padding: "8px 12px", border: "1px solid #e8e0d5", borderRadius: "10px", fontSize: "14px" }} />
          <input type="password" placeholder="비밀번호 * (삭제·열람용)" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", border: "1px solid #e8e0d5", borderRadius: "10px", fontSize: "14px" }} />
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="댓글을 입력하세요..."
          style={{ width: "100%", minHeight: "80px", padding: "12px", borderRadius: "10px", border: "1px solid #e8e0d5", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }} />

        {/* 비밀댓글 토글 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#8c7a62" }}>
            <input
              type="checkbox"
              checked={isSecret}
              onChange={e => setIsSecret(e.target.checked)}
              style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#c8a882" }}
            />
            🔒 비밀댓글 (나와 방장만 볼 수 있어요)
          </label>
          <button onClick={submit} disabled={submitting}
            style={{ padding: "10px 20px", background: submitting ? "#e0d0c0" : "#c8a882", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
