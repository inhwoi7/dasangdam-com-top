'use client'

import { useState, useEffect, useCallback } from 'react'
import { Post, getPosts, CATEGORIES } from '@/lib/community'
import PostCard from './PostCard'
import PostForm from './PostForm'

const T = {
  ko: {
    title: '함께하는 이야기',
    sub: '오늘 나의 하루를 나눠주세요 — 위로도, 지혜도, 고민도 환영해요',
    all: '전체',
    loading: '불러오는 중...',
    empty: '아직 글이 없어요. 첫 번째 이야기를 남겨보세요 🌿',
  },
  en: {
    title: 'Our Stories',
    sub: 'Share your day — comfort, wisdom, or worries, all welcome',
    all: 'All',
    loading: 'Loading...',
    empty: 'No posts yet. Be the first to share your story 🌿',
  },
}

const CATEGORIES_EN = [
  'All',
  'Retirement & Career',
  'Parent Care',
  'Education',
  'Finance',
  'Daily Life',
  'Health',
]

export default function PostFeed({ locale = 'ko' }: { locale?: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [category, setCategory] = useState('전체')
  const [loading, setLoading] = useState(true)
  const t = locale === 'en' ? T.en : T.ko
  const cats = locale === 'en' ? CATEGORIES_EN : CATEGORIES

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // 영어일 때도 DB 카테고리는 한국어로 저장되어 있으므로 전체만 필터
      const koCategory = locale === 'en'
        ? (category === 'All' ? '전체' : '전체')
        : category
      const data = await getPosts(koCategory)
      setPosts(data)
    } catch {
      console.error('게시글 불러오기 실패')
    } finally {
      setLoading(false)
    }
  }, [category, locale])

  useEffect(() => { load() }, [load])

  const handleDelete = (id: string) =>
    setPosts((prev) => prev.filter((p) => p.id !== id))

  return (
    <section className="py-10">
      <div className="mb-2">
        <h2 className="text-xl font-medium text-stone-700">{t.title}</h2>
        <p className="text-sm text-stone-400 mt-1">{t.sub}</p>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 flex-wrap my-4">
        {cats.map((cat, i) => {
          const kocat = CATEGORIES[i] ?? '전체'
          const isActive = locale === 'en'
            ? (cat === 'All' ? category === '전체' : false)
            : category === cat
          return (
            <button
              key={cat}
              onClick={() => setCategory(locale === 'en' ? (cat === 'All' ? '전체' : CATEGORIES[i] ?? '전체') : cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                isActive
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'border-stone-200 text-stone-500 hover:border-amber-300'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* 글쓰기 폼 */}
      <div className="mb-6">
        <PostForm onSuccess={load} locale={locale} />
      </div>

      {/* 피드 */}
      {loading ? (
        <div className="text-center text-sm text-stone-400 py-10">{t.loading}</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-sm text-stone-400 py-10">{t.empty}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} locale={locale} />
          ))}
        </div>
      )}
    </section>
  )
}
