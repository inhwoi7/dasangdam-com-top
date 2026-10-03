'use client'

import { useState, useRef } from 'react'
import { createPost, CATEGORIES } from '@/lib/community'

const MAX_IMAGES = 5

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
    contentPh: `오늘 있었던 일, 고민, 감사한 것... 무엇이든 편하게 적어주세요. (Ctrl+V로 스크린샷을 바로 붙여넣을 수 있어요, 최대 ${MAX_IMAGES}장)`,
    photo: `📷 사진 첨부 (최대 5MB, ${MAX_IMAGES}장까지)`,
    cancel: '취소',
    submit: '게시하기',
    submitting: '등록 중...',
    errNick: '닉네임을 입력해주세요.',
    errPw: '비밀번호를 입력해주세요 (나중에 글 삭제에 필요해요).',
    errContent: '내용을 입력해주세요.',
    errSize: '사진은 한 장당 5MB 이하로 올려주세요.',
    errMax: `사진은 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요.`,
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
    contentPh: `Share anything — your day, worries, or gratitude. (Paste screenshots with Ctrl+V, up to ${MAX_IMAGES})`,
    photo: `📷 Attach photos (max 5MB each, up to ${MAX_IMAGES})`,
    cancel: 'Cancel',
    submit: 'Post',
    submitting: 'Posting...',
    errNick: 'Please enter a nickname.',
    errPw: 'Please enter a password (needed to delete your post later).',
    errContent: 'Please write something.',
    errSize: 'Each photo must be under 5MB.',
    errMax: `You can attach up to ${MAX_IMAGES} photos.`,
    errPost: 'Something went wrong. Please try again.',
  },
}

type ImageItem = { file: File; preview: string }

export default function PostForm({ onSuccess, locale = 'ko' }: { onSuccess: () => void; locale?: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nickname: '', password: '', category: '일상·감사', content: '' })
  const [images, setImages] = useState<ImageItem[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const t = locale === 'en' ? T.en : T.ko

  const addFiles = (files: File[]) => {
    const room = MAX_IMAGES - images.length
    if (room <= 0) { alert(t.errMax); return }
    const toAdd = files.slice(0, room)
    if (files.length > toAdd.length) alert(t.errMax)
    const valid = toAdd.filter(file => {
      if (file.size > 5 * 1024 * 1024) { alert(t.errSize); return false }
      return true
    })
    if (valid.length === 0) return
    setImages(prev => [...prev, ...valid.map(file => ({ file, preview: URL.createObjectURL(file) }))])
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    addFiles(files)
    e.target.value = ''
  }

  // 텍스트 입력창에서 Ctrl+V로 스크린샷을 붙여넣으면 바로 추가됩니다. 여러 번 붙여넣으면 계속 쌓여요.
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return
    const pastedFiles: File[] = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) pastedFiles.push(file)
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault()
      addFiles(pastedFiles)
    }
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!form.nickname.trim()) return alert(t.errNick)
    if (!form.password.trim()) return alert(t.errPw)
    if (!form.content.trim()) return alert(t.errContent)
    setLoading(true)
    try {
      await createPost({ ...form, imageFiles: images.map(i => i.file) })
      setForm({ nickname: '', password: '', category: '일상·감사', content: '' })
      setImages([])
      setOpen(false)
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
        onPaste={handlePaste}
        className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 resize-none mb-3" />

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative w-20 h-20 bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
              <img src={img.preview} alt={`첨부 ${idx + 1}`} className="w-full h-full object-cover" />
              <button onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-black/50 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={() => fileRef.current?.click()} disabled={images.length >= MAX_IMAGES}
          className="text-xs text-stone-400 hover:text-amber-600 transition disabled:opacity-40">
          {t.photo}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImage} />
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
