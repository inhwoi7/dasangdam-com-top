import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// 간단한 스팸 방지: 1분에 최대 10건까지만 메일 발송
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
let windowStart = Date.now();
let count = 0;

export async function POST(req: Request) {
  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    count = 0;
  }
  if (count >= MAX_PER_WINDOW) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const nickname = String(body.nickname ?? "익명").slice(0, 30);
  const text = String(body.text ?? "").slice(0, 1000);
  const isSecret = Boolean(body.isSecret);
  const rawUrl = String(body.url ?? "");
  const url = rawUrl.startsWith("https://dasangdam.com")
    ? rawUrl
    : "https://dasangdam.com";

  if (!text.trim()) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  // 본인(관리자) 닉네임이면 알림 제외
  const owners = (process.env.OWNER_NICKNAMES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (owners.includes(nickname)) {
    return NextResponse.json({ ok: true, skipped: "owner" });
  }

  count += 1;

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST ?? "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"다상담 알림" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO ?? process.env.MAIL_USER,
      subject: `[다상담] 새 댓글${isSecret ? "(비밀)" : ""} - ${nickname}`,
      text: `${nickname}님이 댓글을 남겼어요${isSecret ? " (비밀댓글)" : ""}\n\n${text}\n\n${url}`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
