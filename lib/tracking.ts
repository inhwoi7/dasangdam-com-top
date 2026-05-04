// lib/tracking.ts
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// 익명 ID 가져오기 (없으면 새로 생성)
export function getAnonymousId(): string {
  if (typeof window === 'undefined') return ''
  
  let id = localStorage.getItem('anon_id')
  if (!id) {
    id = uuidv4()
    localStorage.setItem('anon_id', id)
  }
  return id
}

// 디바이스 타입 감지
function getDeviceType(): string {
  const ua = navigator.userAgent
  if (/Mobi|Android/i.test(ua)) return 'mobile'
  if (/Tablet|iPad/i.test(ua)) return 'tablet'
  return 'desktop'
}

// 방문자 기록
export async function trackVisitor() {
  const anonymousId = getAnonymousId()
  if (!anonymousId) return

  await supabase.from('visitors').upsert(
    {
      anonymous_id: anonymousId,
      last_seen_at: new Date().toISOString(),
      referrer: document.referrer || null,
      utm_source: new URLSearchParams(window.location.search).get('utm_source'),
      utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
      utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
      device_type: getDeviceType(),
    },
    { onConflict: 'anonymous_id' }
  )
}

// 페이지뷰 기록
export async function trackPageView(path: string) {
  const anonymousId = getAnonymousId()
  if (!anonymousId) return

  await supabase.from('page_views').insert({
    anonymous_id: anonymousId,
    path,
    title: document.title,
  })
}

// 이벤트 기록 (버튼 클릭 등)
export async function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  const anonymousId = getAnonymousId()
  if (!anonymousId) return

  await supabase.from('events').insert({
    anonymous_id: anonymousId,
    event_name: eventName,
    properties: properties ?? {},
    path: window.location.pathname,
  })
}