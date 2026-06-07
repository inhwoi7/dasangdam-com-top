'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AnnouncementPopup({ locale }: { locale: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('popup-dismissed-date')
    const today = new Date().toDateString()
    if (dismissed !== today) {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('popup-dismissed-date', new Date().toDateString())
    setVisible(false)
  }

  if (!visible) return null

  const isEn = locale === 'en'

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fffdf9',
          borderRadius: '28px',
          padding: '32px 28px 24px',
          maxWidth: '360px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(74,56,28,0.18)',
          border: '1px solid #f0e4cc',
          position: 'relative',
        }}
      >
        {/* 닫기 */}
        <button onClick={dismiss} style={{
          position: 'absolute', top: '16px', right: '18px',
          background: 'none', border: 'none', fontSize: '20px',
          color: '#c0b0a0', cursor: 'pointer', lineHeight: 1,
        }}>×</button>

        {/* 이모지 */}
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌿</div>

        {/* 제목 */}
        <h2 style={{
          fontSize: '20px', fontWeight: '700', color: '#3d2f22',
          margin: '0 0 16px', lineHeight: 1.35,
        }}>
          {isEn ? 'New at Dasangdam!' : '다상담이 새로워졌어요!'}
        </h2>

        {/* 내용 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            background: '#fff8ee', border: '1px solid #f0e0c0',
            borderRadius: '14px', padding: '14px 16px',
            display: 'flex', gap: '10px', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>💬</span>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#5a3e28' }}>
                {isEn ? 'Comment without login' : '로그인 없이 댓글 달아요'}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#9a8070', lineHeight: 1.5 }}>
                {isEn ? 'Just a nickname is enough. No Google login needed.' : '닉네임만 있으면 돼요. Google 로그인 없이도 댓글을 남길 수 있어요.'}
              </p>
            </div>
          </div>

          <div style={{
            background: '#f0f8ee', border: '1px solid #d0e8c0',
            borderRadius: '14px', padding: '14px 16px',
            display: 'flex', gap: '10px', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>🏡</span>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#3a5a28' }}>
                {isEn ? 'Community is open!' : '커뮤니티가 생겼어요!'}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#8a9a80', lineHeight: 1.5 }}>
                {isEn
                  ? 'Share your story, career worries, or daily life freely.'
                  : '은퇴·커리어, 부모 케어, 자녀 교육, 경제 얘기까지 — 자유롭게 글을 올려보세요.'}
              </p>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            href={`/${locale}/community`}
            onClick={dismiss}
            style={{
              display: 'block', textAlign: 'center',
              background: '#c8a882', color: 'white',
              borderRadius: '14px', padding: '13px',
              fontSize: '15px', fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            {isEn ? 'Go to Community →' : '커뮤니티 바로가기 →'}
          </Link>
          <button onClick={dismiss} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', color: '#b0a090', padding: '6px',
          }}>
            {isEn ? 'Do not show today' : '오늘 하루 보지 않기'}
          </button>
        </div>
      </div>
    </div>
  )
}
