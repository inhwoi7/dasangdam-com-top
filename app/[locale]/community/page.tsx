import PostFeed from '@/components/community/PostFeed'

export const revalidate = 0 // 커뮤니티는 항상 최신 데이터

export default function CommunityPage() {
  return (
    <main className="max-w-4xl mx-auto px-4">
      <PostFeed />
    </main>
  )
}
