'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CARD_NAMES: Record<number, string> = {
  0:'바보', 1:'마법사', 2:'여사제', 3:'여황제', 4:'황제',
  5:'교황', 6:'연인', 7:'전차', 8:'힘', 9:'은둔자',
  10:'운명의 수레바퀴', 11:'정의', 12:'매달린 사람', 13:'죽음', 14:'절제',
  15:'악마', 16:'탑', 17:'별', 18:'달', 19:'태양', 20:'심판', 21:'세계',
}

interface Session {
  id: string
  question: string | null
  category: string | null
  card_id: number
  is_reversed: boolean
  created_at: string
}

interface CardStat {
  card_id: number
  count: number
  reversed_count: number
}

export default function TarotStatsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats]       = useState<CardStat[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState<'stats'|'log'>('stats')

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data: sessionData } = await supabase
        .from('tarot_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (sessionData) {
        setSessions(sessionData)
        setTotal(sessionData.length)

        // 카드별 통계 집계
        const map: Record<number, CardStat> = {}
        sessionData.forEach((s: Session) => {
          if (!map[s.card_id]) map[s.card_id] = { card_id: s.card_id, count: 0, reversed_count: 0 }
          map[s.card_id].count++
          if (s.is_reversed) map[s.card_id].reversed_count++
        })
        const sorted = Object.values(map).sort((a, b) => b.count - a.count)
        setStats(sorted)
      }
      setLoading(false)
    }
    load()
  }, [])

  // 카테고리 통계
  const catStats = sessions.reduce((acc, s) => {
    const cat = s.category || '미선택'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f0f0f; }
    .wrap {
      min-height: 100dvh;
      background: #0f0f0f;
      color: #e8e0f0;
      font-family: 'Noto Sans KR', sans-serif;
      padding: 24px 20px 60px;
      max-width: 640px;
      margin: 0 auto;
    }
    .header { margin-bottom: 24px; }
    .header h1 { font-size: 20px; font-weight: 500; color: #c9a84c; margin-bottom: 4px; }
    .header p  { font-size: 12px; color: #7a6898; }

    .summary-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 24px; }
    .summary-card {
      background: #1a1230; border: 1px solid #2e2448;
      border-radius: 12px; padding: 14px; text-align: center;
    }
    .summary-num { font-size: 28px; font-weight: 500; color: #c9a84c; }
    .summary-label { font-size: 11px; color: #7a6898; margin-top: 4px; }

    .tabs { display: flex; gap: 8px; margin-bottom: 20px; }
    .tab {
      padding: 8px 18px; border-radius: 20px;
      border: 1px solid #2e2448; background: transparent;
      color: #9b8fc2; font-size: 13px; cursor: pointer;
      font-family: 'Noto Sans KR', sans-serif; transition: all .2s;
    }
    .tab.on { background: #2d1e55; border-color: #6b3dad; color: #e8daff; }

    .section-title {
      font-size: 11px; letter-spacing: 2px; color: #7a6230;
      text-transform: uppercase; margin-bottom: 12px;
    }

    /* 카드 통계 바 */
    .stat-item { margin-bottom: 10px; }
    .stat-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .stat-name { font-size: 13px; color: #e8e0f0; }
    .stat-count { font-size: 12px; color: #9b8fc2; }
    .stat-bar-wrap { height: 6px; background: #1a1230; border-radius: 3px; overflow: hidden; }
    .stat-bar { height: 100%; background: linear-gradient(90deg,#5a2d9e,#c9a84c); border-radius: 3px; transition: width .6s ease; }
    .stat-rev { font-size: 10px; color: #7a6898; margin-top: 2px; }

    /* 카테고리 */
    .cat-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
    .cat-chip {
      padding: 6px 12px; border-radius: 20px;
      background: #1a1230; border: 1px solid #2e2448;
      font-size: 12px; color: #c8bfdb;
    }
    .cat-chip span { color: #c9a84c; font-weight: 500; margin-left: 4px; }

    /* 로그 */
    .log-item {
      background: #1a1230; border: 1px solid #2e2448;
      border-radius: 10px; padding: 12px; margin-bottom: 8px;
    }
    .log-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .log-card { font-size: 13px; font-weight: 500; color: #c9a84c; }
    .log-rev { font-size: 10px; background: rgba(155,100,80,.2); border: 1px solid rgba(155,100,80,.4); color: #e8b09a; padding: 2px 7px; border-radius: 8px; }
    .log-cat { font-size: 10px; color: #9b8fc2; background: #2d1e55; padding: 2px 8px; border-radius: 8px; }
    .log-q { font-size: 12px; color: #c8bfdb; margin-bottom: 4px; line-height: 1.5; }
    .log-time { font-size: 10px; color: #5a4878; }

    .empty { text-align: center; padding: 40px 0; color: #5a4878; font-size: 13px; }
    .loading { text-align: center; padding: 60px 0; color: #7a6898; }
  `

  const maxCount = stats[0]?.count || 1

  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        <div className="header">
          <h1>✦ 타로 통계 대시보드</h1>
          <p>써니님만 볼 수 있는 관리자 페이지</p>
        </div>

        {loading ? (
          <div className="loading">불러오는 중...</div>
        ) : (
          <>
            {/* 요약 */}
            <div className="summary-row">
              <div className="summary-card">
                <div className="summary-num">{total}</div>
                <div className="summary-label">총 상담 수</div>
              </div>
              <div className="summary-card">
                <div className="summary-num">{stats.length}</div>
                <div className="summary-label">등장한 카드</div>
              </div>
              <div className="summary-card">
                <div className="summary-num">
                  {total > 0 ? Math.round(sessions.filter(s => s.is_reversed).length / total * 100) : 0}%
                </div>
                <div className="summary-label">역방향 비율</div>
              </div>
            </div>

            {/* 카테고리 */}
            <div className="section-title">카테고리별</div>
            <div className="cat-row">
              {Object.entries(catStats).sort((a,b) => b[1]-a[1]).map(([cat, cnt]) => (
                <div key={cat} className="cat-chip">
                  {cat}<span>{cnt}회</span>
                </div>
              ))}
            </div>

            {/* 탭 */}
            <div className="tabs">
              <button className={`tab${activeTab === 'stats' ? ' on' : ''}`} onClick={() => setActiveTab('stats')}>
                카드 랭킹
              </button>
              <button className={`tab${activeTab === 'log' ? ' on' : ''}`} onClick={() => setActiveTab('log')}>
                상담 로그
              </button>
            </div>

            {/* 카드 랭킹 */}
            {activeTab === 'stats' && (
              <div>
                <div className="section-title">많이 뽑힌 카드 TOP</div>
                {stats.length === 0 ? (
                  <div className="empty">아직 데이터가 없어요</div>
                ) : (
                  stats.map((s, idx) => (
                    <div key={s.card_id} className="stat-item">
                      <div className="stat-head">
                        <span className="stat-name">
                          {idx + 1}. {CARD_NAMES[s.card_id] ?? `카드 ${s.card_id}`}
                        </span>
                        <span className="stat-count">{s.count}회</span>
                      </div>
                      <div className="stat-bar-wrap">
                        <div className="stat-bar" style={{ width: `${(s.count / maxCount) * 100}%` }} />
                      </div>
                      {s.reversed_count > 0 && (
                        <div className="stat-rev">역방향 {s.reversed_count}회 ({Math.round(s.reversed_count/s.count*100)}%)</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 상담 로그 */}
            {activeTab === 'log' && (
              <div>
                <div className="section-title">최근 상담 기록</div>
                {sessions.length === 0 ? (
                  <div className="empty">아직 상담 기록이 없어요</div>
                ) : (
                  sessions.map((s) => (
                    <div key={s.id} className="log-item">
                      <div className="log-head">
                        <span className="log-card">
                          {CARD_NAMES[s.card_id] ?? `카드 ${s.card_id}`}
                        </span>
                        <div style={{ display:'flex', gap: 6 }}>
                          {s.is_reversed && <span className="log-rev">역방향</span>}
                          {s.category && <span className="log-cat">{s.category}</span>}
                        </div>
                      </div>
                      {s.question && (
                        <div className="log-q">"{s.question}"</div>
                      )}
                      <div className="log-time">
                        {new Date(s.created_at).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
