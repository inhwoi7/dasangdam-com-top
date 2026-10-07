'use client'

import { useState, useEffect } from 'react'
import {
  Post, Comment, deletePost, toggleLike,
  getCommentCount, getComments, createComment, deleteComment,
} from '@/lib/community'

function timeAgo(dateStr: string, locale: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (locale === 'en') {
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}시간 전`
  return `${Math.floor(hrs / 24)}일 전`
}

// 본문 속 URL을 실제로 눌리는 링크로 바꿔줍니다.
function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g)
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-amber-600 underline break-all"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

const CT = {
  ko: {
    comments: '댓글',
    empty: '첫 댓글을 남겨보세요!',
    nicknamePh: '닉네임 *',
    passwordPh: '비밀번호 * (삭제용)',
    contentPh: '댓글을 입력하세요...',
    submit: '등록',
    submitting: '등록 중...',
    delete: '삭제',
    errNick: '닉네임을 입력해주세요.',
    errPw: '비밀번호를 입력해주세요.',
    errContent: '댓글 내용을 입력해주세요.',
    errPost: '댓글 등록 중 오류가 발생했어요.',
    deletePw: '삭제하려면 비밀번호를 입력해주세요.',
    deleteWrong: '비밀번호가 맞지 않아요.',
  },
  en: {
    comments: 'Comments',
    empty: 'Be the first to comment!',
    nicknamePh: 'Nickname *',
    passwordPh: 'Password * (for deletion)',
    contentPh: 'Write a comment...',
    submit: 'Post',
    submitting: 'Posting...',
    delete: 'Delete',
    errNick: 'Please enter a nickname.',
    errPw: 'Please enter a password.',
    errContent: 'Please write a comment.',
    errPost: 'Something went wrong.',
    deletePw: 'Enter your password to delete.',
    deleteWrong: 'Wrong password.',
  },
}

function CommentSection({ postId, locale }: { postId: string; locale: string }) {
  const ct = locale === 'en' ? CT.en : CT.ko
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getCommentCount(postId).then(setCount).catch(() => setCount(null))
  }, [postId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const data = await getComments(postId)
      setComments(data)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next) loadComments()
  }

  const submit = async () => {
    if (!nickname.trim()) return alert(ct.errNick)
    if (!password.trim()) return alert(ct.errPw)
    if (!content.trim()) return alert(ct.errContent)
    setSubmitting(true)
    try {
      await createComment({ postId, nickname: nickname.trim(), password, content: content.trim() })
      setContent('')
      await loadComments()
      setCount((c) => (c ?? 0) + 1)
    } catch {
      alert(ct.errPost)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    const pw = prompt(ct.deletePw)
    if (!pw) return
    const ok = await deleteComment(id, pw)
    if (ok) {
      setComments((prev) => prev.filter((c) => c.id !== id))
      setCount((c) => Math.max(0, (c ?? 1) - 1))
    } else {
      alert(ct.deleteWrong)
    }
  }

  return (
    <div className="mt-2 pt-2 border-t border-stone-50">
      <button
        onClick={handleToggle}
        className="text-xs text-stone-400 hover:text-amber-600 transition"
      >
        💬 {ct.comments} {count !== null ? count : ''}
      </button>

      {open && (
        <div className="mt-2">
          {loading ? (
            <p className="text-xs text-stone-400">...</p>
          ) : (
            <>
              {comments.length === 0 && (
                <p className="text-xs text-stone-400 mb-2">{ct.empty}</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-xs">
                    <span className="font-medium text-stone-600">{c.nickname}</span>
                    <span className="text-stone-300 ml-1">{timeAgo(c.created_at, locale)}</span>
                    <p className="text-stone-600 mt-0.5">{c.content}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-[10px] text-stone-300 hover:text-red-400 transition flex-shrink-0"
                  >
                    {ct.delete}
                  </button>
                </div>
              ))}

              <div className="mt-2 space-y-1.5">
                <div className="flex flex-col sm:flex-row gap-1.5">
                  <input
                    type="text"
                    placeholder={ct.nicknamePh}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={20}
                    className="w-full sm:flex-1 text-xs border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400 box-border"
                  />
                  <input
                    type="password"
                    placeholder={ct.passwordPh}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full sm:flex-1 text-xs border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400 box-border"
                  />
                </div>
                <input
                  type="text"
                  placeholder={ct.contentPh}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  className="w-full text-xs border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400 box-border"
                />
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="w-full text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition"
                >
                  {submitting ? ct.submitting : ct.submit}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function PostCard({ post, onDelete, locale = 'ko' }: {
  post: Post; onDelete: (id: string) => void; locale?: string
}) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likes)
  const [deleting, setDeleting] = useState(false)

  const handleLike = async () => {
    if (liked) return
    setLiked(true); setLikes(l => l + 1)
    await toggleLike(post.id)
  }

  const handleDelete = async () => {
    const pw = prompt(locale === 'en' ? 'Enter your password to delete.' : '삭제하려면 비밀번호를 입력해주세요.')
    if (!pw) return
    setDeleting(true)
    const ok = await deletePost(post.id, pw)
    if (ok) { onDelete(post.id) }
    else { alert(locale === 'en' ? 'Wrong password.' : '비밀번호가 맞지 않아요.'); setDeleting(false) }
  }

  const images = post.image_urls && post.image_urls.length > 0
    ? post.image_urls
    : post.image_url
      ? [post.image_url]
      : []

  return (
    <div id={post.id} className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition scroll-mt-4">
      {images.length === 1 && (
        <img src={images[0]} alt="첨부 이미지" className="w-full h-44 object-cover" loading="lazy" />
      )}
      {images.length > 1 && (
        <div className="grid grid-cols-2 gap-0.5">
          {images.slice(0, 4).map((url, idx) => (
            <div key={idx} className="relative">
              <img src={url} alt={`첨부 이미지 ${idx + 1}`} className="w-full h-22 object-cover" style={{ height: '5.5rem' }} loading="lazy" />
              {idx === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium">
                  +{images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="p-4">
        <span className="text-xs text-amber-600 font-medium">{post.category}</span>
        {post.title && (
          <h3 className="text-base font-semibold text-stone-800 mt-1">{post.title}</h3>
        )}
        <p className="text-sm text-stone-700 mt-1 leading-relaxed whitespace-pre-wrap">{linkify(post.content)}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-50">
          <div className="text-xs text-stone-400">{post.nickname} · {timeAgo(post.created_at, locale)}</div>
          <div className="flex items-center gap-2">
            <button onClick={handleLike}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition ${liked ? 'text-amber-600 bg-amber-50' : 'text-stone-400 hover:text-amber-500'}`}>
              ♥ {likes}
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="text-xs text-stone-300 hover:text-red-400 transition disabled:opacity-50">
              {locale === 'en' ? 'Delete' : '삭제'}
            </button>
          </div>
        </div>

        <CommentSection postId={post.id} locale={locale} />
      </div>
    </div>
  )
}
