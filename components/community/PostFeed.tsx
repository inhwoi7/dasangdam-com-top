'use client'

import { useState, useEffect, useCallback } from 'react'
import { Post, getPosts, CATEGORIES } from '@/lib/community'
import PostCard from './PostCard'
import PostForm from './PostForm'

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [category, setCategory] = useState('전체')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPosts(category)
      setPosts(data)
    } catch {
      console.error('게시글 불러오기 실패')
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = (id: string) =>
    setPosts((prev) => prev.filter((p) => p.id !== id))

  return (
    <section className="py-10">
      <div className="mb-2">
        <h2 className="text-xl font-medium text-stone-700">함께하는 이야기</h2>
        <p className="text-sm text-stone-400 mt-1">
          오늘 나의 하루를 나눠주세요 — 위로도, 지혜도, 고민도 환영해요
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 flex-wrap my-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              category === cat
                ? 'bg-amber-500 text-white border-amber-500'
                : 'border-stone-200 text-stone-500 hover:border-amber-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 글쓰기 폼 */}
      <div className="mb-6">
        <PostForm onSuccess={load} />
      </div>

      {/* 피드 */}
      {loading ? (
        <div className="text-center text-sm text-stone-400 py-10">
          불러오는 중...
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center text-sm text-stone-400 py-10">
          아직 글이 없어요. 첫 번째 이야기를 남겨보세요 🌿
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </section>
  )
}
