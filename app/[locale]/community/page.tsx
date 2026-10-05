import Link from 'next/link'
import PostFeed from '@/components/community/PostFeed'
import { getLocale } from 'next-intl/server'

export const revalidate = 0

export default async function CommunityPage() {
  const locale = await getLocale()
  const back = locale === 'en' ? '← Home' : '← 홈으로'

  return (
    <main className="max-w-4xl mx-auto px-4">
      <Link
        href="/"
        style={{
          fontSize: '13px',
          color: 'var(--text-faint)',
          textDecoration: 'none',
          display: 'inline-block',
          marginTop: '16px',
          marginBottom: '4px',
        }}
      >
        {back}
      </Link>
      <PostFeed locale={locale} />
    </main>
  )
}
