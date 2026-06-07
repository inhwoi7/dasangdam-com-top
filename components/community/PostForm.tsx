'use client'

import { useState, useRef } from 'react'
import { createPost, CATEGORIES } from '@/lib/community'

const T = {
  ko: {
    prompt: '오늘 나의 하루, 혹은 삶의 지혜를 나눠주세요.',
    promptSub: '닉네임만 있으면 바로 쓸 수 있어요 ✏️',
    title: '이야기 쓰기',
    nickname: '닉네임 *',
    nicknamePh: '예: 행복한나무',
    password: '비밀번호 * (삭제용)',
    passwordPh: '숫자 4자리도 OK',
    topic: '주제',
    contentPh: '오늘 있었던 일, 고민, 감사한 것... 무엇이든 편하게 적어주세요.',
    photo: '📷 사진 첨부 (최대 5MB)',
    cancel: '취소',
    submit: '게시하기',
    submitting: '등록 중...',
    errNick: '닉네임을 입력해주세요.',
    errPw: '비밀번호를 입력해주세요 (나중에 글 삭제에 필요해요).',
    errContent: '내용을 입력해주세요.',
    errSize: '사진은 5MB 이하로 올려주세요.',
    errPost: '글 등록 중 오류가 발생했어요. 다시 시도해주세요.',
  },
  en: {
    prompt: 'Share your day or a piece of life wisdom.',
    promptSub: 'Just a nickname is enough ✏️',
    title: 'Write a Story',
    nickname: 'Nickname *',
    nicknamePh: 'e.g. HappyTree',
    password: 'Password * (for deletion)',
    passwordPh: '4 digits is fine',
    topic: 'Topic',
    contentPh: 'Share anything — your day, worries, or gratitude.',
    photo: '📷 Attach photo (max 5MB)',
    cancel: 'Cancel',
    submit: 'Post',
    submitting: 'Posting...',
    errNick: 'Please enter a nickname.',
    errPw: 'Please enter a password (needed to delete your post later).',
    errContent: 'Please write something.',
    errSize: 'Photo must be under 5MB.',
    errPost: 'Something went wrong. Please try again.',
  },
}

export default function PostForm({ onSuccess, locale = 'ko' }: { onSuccess: () => void; locale?: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nickname: '', password: '', category: '일상·감사', content: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const t = locale === 'en' ? T.en : T.ko

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert(t.errSize); return }
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.nickname.trim()) return alert(t.errNick)
    if (!form.password.trim()) return alert(t.errPw)
    if (!form.content.trim()) return alert(t.errContent)
    setLoading(true)
    try {
      await createPost({ ...form, imageFile })
      setForm({ nickname: '', password: '', category: '일상·감사', content: '' })
      setImageFile(null); setPreview(null); setOpen(false)
      onSuccess()
    } catch { alert(t.errPost) }
    finally { setLoading(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="w-full text-left bg-amber-50 border border-dashed border-amber-300 rounded-2xl p-4 text-amber-700 hover:bg-amber-100 transition">
      <p className="text-sm font-medium">{t.prompt}</p>
      <p className="text-xs text-amber-500 mt-1">{t.promptSub}</p>
    </button>
  )

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-base font-medium text-stone-700 mb-4">{t.title}</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-stone-500 mb-1 block">{t.nickname}</label>
          <input type="text" placeholder={t.nicknamePh} value={form.nickname}
            onChange={e => setForm(p => ({ ...p, nickname: e.target.value }))}
            className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400" />
        </div>
        <div>
          <label className="text-xs text-stone-500 mb-1 block">{t.password}</label>
          <input type="password" placeholder={t.passwordPh} value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400" />
        </div>
      </div>
      <div className="mb-3">
        <label className="text-xs text-stone-500 mb-1 block">{t.topic}</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.slice(1).map(cat => (
            <button key={cat} onClick={() => setForm(p => ({ ...p, category: cat }))}
              className={`text-xs px-3 py-1 rounded-full border transition ${
                form.category === cat ? 'bg-amber-500 text-white border-amber-500' : 'border-stone-200 text-stone-500 hover:border-amber-300'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <textarea rows={4} placeholder={t.contentPh} value={form.content}
        onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
        className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 resize-none mb-3" />
      {preview && (
        <div className="relative mb-3 w-full h-40">
          <img src={preview} alt="미리보기" className="w-full h-full object-cover rounded-xl" />
          <button onClick={() => { setImageFile(null); setPreview(null) }}
            className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">삭제</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <button onClick={() => fileRef.current?.click()}
          className="text-xs text-stone-400 hover:text-amber-600 transition">{t.photo}</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        <div className="flex gap-2">
          <button onClick={() => setOpen(false)} className="text-sm text-stone-400 px-4 py-2 rounded-xl hover:bg-stone-100 transition">{t.cancel}</button>
          <button onClick={handleSubmit} disabled={loading}
            className="text-sm bg-amber-500 text-white px-5 py-2 rounded-xl hover:bg-amber-600 disabled:opacity-50 transition">
            {loading ? t.submitting : t.submit}
          </button>
        </div>
      </div>
    </div>
  )
}
