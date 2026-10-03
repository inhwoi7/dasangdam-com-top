import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const CATEGORIES = [
  '전체',
  '은퇴·커리어',
  '부모 케어',
  '자녀 교육',
  '경제·재테크',
  '일상·감사',
  '건강·운동',
]

const MAX_IMAGES = 5

export type Post = {
  id: string
  nickname: string
  category: string
  content: string
  image_url: string | null
  image_urls: string[] | null
  likes: number
  created_at: string
}

export type Comment = {
  id: string
  post_id: string
  nickname: string
  content: string
  password_hash: string
  created_at: string
}

export async function getPosts(category?: string): Promise<Post[]> {
  let query = supabase
    .from('community_posts')
    .select('id, nickname, category, content, image_url, image_urls, likes, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (category && category !== '전체') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createPost({
  nickname,
  password,
  category,
  content,
  imageFiles,
}: {
  nickname: string
  password: string
  category: string
  content: string
  imageFiles?: File[]
}): Promise<void> {
  const password_hash = await bcrypt.hash(password, 10)

  const files = (imageFiles ?? []).slice(0, MAX_IMAGES)
  const image_urls: string[] = []

  for (const file of files) {
    // 이미지 리사이즈 (800px 이하로 압축, Storage 절약)
    const resized = await resizeImage(file, 800)
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('community-images')
      .upload(path, resized, { contentType: file.type })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('community-images')
      .getPublicUrl(path)

    image_urls.push(data.publicUrl)
  }

  const { error } = await supabase.from('community_posts').insert({
    nickname,
    password_hash,
    category,
    content,
    image_url: image_urls[0] ?? null, // 첫 장은 기존 화면과의 호환을 위해 여기에도 저장
    image_urls: image_urls.length > 0 ? image_urls : null,
  })

  if (error) throw error
}

export async function deletePost(id: string, password: string): Promise<boolean> {
  const { data } = await supabase
    .from('community_posts')
    .select('password_hash, image_url, image_urls')
    .eq('id', id)
    .single()

  if (!data) return false

  const isValid = await bcrypt.compare(password, data.password_hash)
  if (!isValid) return false

  const urls: string[] =
    data.image_urls?.length ? data.image_urls : data.image_url ? [data.image_url] : []
  const paths = urls.map((url: string) => url.split('/community-images/')[1]).filter(Boolean)
  if (paths.length > 0) {
    await supabase.storage.from('community-images').remove(paths)
  }

  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', id)

  return !error
}

export async function toggleLike(id: string): Promise<void> {
  await supabase.rpc('increment_likes', { post_id: id })
}

// ===== 댓글 =====

export async function getCommentCount(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from('community_comments')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId)
  if (error) throw error
  return count ?? 0
}

export async function getComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('community_comments')
    .select('id, post_id, nickname, content, password_hash, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createComment({
  postId,
  nickname,
  password,
  content,
}: {
  postId: string
  nickname: string
  password: string
  content: string
}): Promise<void> {
  const password_hash = await bcrypt.hash(password, 10)
  const { error } = await supabase.from('community_comments').insert({
    post_id: postId,
    nickname,
    content,
    password_hash,
  })
  if (error) throw error
}

export async function deleteComment(id: string, password: string): Promise<boolean> {
  const { data } = await supabase
    .from('community_comments')
    .select('password_hash')
    .eq('id', id)
    .single()

  if (!data) return false

  const isValid = await bcrypt.compare(password, data.password_hash)
  if (!isValid) return false

  const { error } = await supabase
    .from('community_comments')
    .delete()
    .eq('id', id)

  return !error
}

// Canvas로 이미지 리사이즈 (브라우저 전용)
async function resizeImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob!), file.type, 0.85)
    }
    img.src = url
  })
}
