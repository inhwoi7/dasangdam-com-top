import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // 비밀키 확인 (아무나 호출해서 스팸 메일 보내는 것 방지)
  if (req.headers.get("x-notify-secret") !== process.env.NOTIFY_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  // Supabase Webhook 형식(record)과 직접 호출 형식 둘 다 지원
  const rec = body.record ?? body;
  const nickname = String(rec.nickname ?? "익명").slice(0, 30);
  const content = String(rec.content ?? "").slice(0, 1000);
  const where = String(rec.category ?? rec.where ?? "커뮤니티");

  // 본인(관리자)이 쓴 글은 알림 제외
  const owners = (process.env.OWNER_NICKNAMES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (owners.includes(nickname)) {
    return NextResponse.json({ ok: true, skipped: "owner" });
  }

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
      subject: `[다상담] 새 글/댓글 - ${nickname}`,
      text: `[${where}] ${nickname}\n\n${content}\n\nhttps://dasangdam.com/ko/community`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
