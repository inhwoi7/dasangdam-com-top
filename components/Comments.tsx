"use client";

import { useState, useEffect } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import {
  collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp
} from "firebase/firestore";

export default function Comments({ slug }: { slug: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  // 로그인 상태 감지
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  // 댓글 실시간 불러오기
  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("slug", "==", slug),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [slug]);

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  const submit = async () => {
    if (!text.trim() || !user) return;
    await addDoc(collection(db, "comments"), {
      slug,
      text: text.trim(),
      uid: user.uid,
      name: user.displayName,
      photo: user.photoURL,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  return (
    <div style={{ marginTop: "60px", borderTop: "1px solid #e8e0d5", paddingTop: "40px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#3d2f22", marginBottom: "24px" }}>댓글</h3>

      {/* 댓글 목록 */}
      {comments.length === 0 && (
        <p style={{ color: "#b0a090", fontSize: "14px", marginBottom: "24px" }}>첫 댓글을 남겨보세요!</p>
      )}
      {comments.map((c) => (
        <div key={c.id} style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          {c.photo && <img src={c.photo} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%" }} />}
          <div>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#3d2f22", margin: "0 0 4px" }}>{c.name}</p>
            <p style={{ fontSize: "15px", color: "#4a3b2e", margin: 0 }}>{c.text}</p>
          </div>
        </div>
      ))}

      {/* 로그인/댓글 입력 */}
      {user ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            {user.photoURL && <img src={user.photoURL} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%" }} />}
            <span style={{ fontSize: "14px", color: "#3d2f22" }}>{user.displayName}</span>
            <button onClick={logout} style={{ fontSize: "12px", color: "#b0a090", background: "none", border: "none", cursor: "pointer" }}>로그아웃</button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="댓글을 입력하세요..."
            style={{ width: "100%", minHeight: "80px", padding: "12px", borderRadius: "8px", border: "1px solid #e8e0d5", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }}
          />
          <button
            onClick={submit}
            style={{ marginTop: "8px", padding: "10px 20px", background: "#c8a882", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}
          >
            등록
          </button>
        </div>
      ) : (
        <button
          onClick={login}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "white", border: "1px solid #e8e0d5", borderRadius: "8px", cursor: "pointer", fontSize: "14px", color: "#3d2f22" }}
        >
          <img src="https://www.google.com/favicon.ico" alt="" style={{ width: "16px" }} />
          Google로 로그인하고 댓글 달기
        </button>
      )}
    </div>
  );
}