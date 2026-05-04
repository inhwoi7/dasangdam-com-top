// components/TrackingProvider.tsx
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackVisitor, trackPageView } from '@/lib/tracking'

export default function TrackingProvider() {
  const pathname = usePathname()

  // 최초 방문자 기록 (딱 한 번)
  useEffect(() => {
    trackVisitor()
  }, [])

  // 페이지 이동할 때마다 기록
  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  return null
}