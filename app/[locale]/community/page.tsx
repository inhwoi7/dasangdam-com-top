import PostFeed from '@/components/community/PostFeed'
import { getLocale } from 'next-intl/server'

export const revalidate = 0

export default async function CommunityPage() {
  const locale = await getLocale()

  return (
    <main className="max-w-4xl mx-auto px-4">
      <PostFeed locale={locale} />
    </main>
  )
}
