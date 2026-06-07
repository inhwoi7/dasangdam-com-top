'use client'

import { useState } from 'react'
import { Post, deletePost, toggleLike } from '@/lib/community'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}시간 전`
  return `${Math.floor(hrs / 24)}일 전`
}

export default function PostCard({
  post,
  onDelete,
}: {
  post: Post
  onDelete: (id: string) => void
}) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likes)
  const [deleting, setDeleting] = useState(false)

  const handleLike = async () => {
    if (liked) return
    setLiked(true)
    setLikes((l) => l + 1)
    await toggleLike(post.id)
  }

  const handleDelete = async () => {
    const pw = prompt('삭제하려면 비밀번호를 입력해주세요.')
    if (!pw) return
    setDeleting(true)
    const ok = await deletePost(post.id, pw)
    if (ok) {
      onDelete(post.id)
    } else {
      alert('비밀번호가 맞지 않아요.')
      setDeleting(false)
    }
  }

  return (
    <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
      {post.image_url && (
        <img
          src={post.image_url}
          alt="첨부 이미지"
          className="w-full h-44 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4">
        <span className="text-xs text-amber-600 font-medium">{post.category}</span>
        <p className="text-sm text-stone-700 mt-1 leading-relaxed line-clamp-4">
          {post.content}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-50">
          <div className="text-xs text-stone-400">
            {post.nickname} · {timeAgo(post.created_at)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition ${
                liked
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-stone-400 hover:text-amber-500'
              }`}
            >
              ♥ {likes}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-stone-300 hover:text-red-400 transition disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
