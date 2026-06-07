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

export type Post = {
  id: string
  nickname: string
  category: string
  content: string
  image_url: string | null
  likes: number
  created_at: string
}

export async function getPosts(category?: string): Promise<Post[]> {
  let query = supabase
    .from('community_posts')
    .select('id, nickname, category, content, image_url, likes, created_at')
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
  imageFile,
}: {
  nickname: string
  password: string
  category: string
  content: string
  imageFile?: File | null
}): Promise<void> {
  const password_hash = await bcrypt.hash(password, 10)

  let image_url: string | null = null

  if (imageFile) {
    // 이미지 리사이즈 (800px 이하로 압축, Storage 절약)
    const resized = await resizeImage(imageFile, 800)
    const ext = imageFile.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('community-images')
      .upload(path, resized, { contentType: imageFile.type })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('community-images')
      .getPublicUrl(path)

    image_url = data.publicUrl
  }

  const { error } = await supabase.from('community_posts').insert({
    nickname,
    password_hash,
    category,
    content,
    image_url,
  })

  if (error) throw error
}

export async function deletePost(id: string, password: string): Promise<boolean> {
  const { data } = await supabase
    .from('community_posts')
    .select('password_hash, image_url')
    .eq('id', id)
    .single()

  if (!data) return false

  const isValid = await bcrypt.compare(password, data.password_hash)
  if (!isValid) return false

  if (data.image_url) {
    const path = data.image_url.split('/community-images/')[1]
    await supabase.storage.from('community-images').remove([path])
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
