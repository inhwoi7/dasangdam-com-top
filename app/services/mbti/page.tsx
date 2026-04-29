'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type MbtiResult = {
  relation_type: string;
  score: number;
  summary: string;
  detail_analysis: string;
  advice_tips: string;
};

const supabase = createClient(
  'https://kkrshqrrifzggofmxejf.supabase.co',
  'sb_publishable_h9tFvYIsWjhbrr6u_rSO7w_Bi9B6jFa'
);

const mbtiList = [
  'ENFP',
  'ENFJ',
  'ENTP',
  'ENTJ',
  'ESFP',
  'ESFJ',
  'ESTP',
  'ESTJ',
  'INFP',
  'INFJ',
  'INTP',
  'INTJ',
  'ISFP',
  'ISFJ',
  'ISTP',
  'ISTJ',
];

export default function Home() {
  const [myMbti, setMyMbti] = useState('');
  const [yourMbti, setYourMbti] = useState('');
  const [result, setResult] = useState<MbtiResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setResult(null);
  }, [myMbti, yourMbti]);

  const handleAnalyze = async () => {
    if (!myMbti || !yourMbti) {
      alert('분석을 위해 MBTI를 선택해 주세요.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('mbti_matrix')
        .select('*')
        .eq('my_mbti', myMbti)
        .eq('your_mbti', yourMbti)
        .single();

      if (error) {
        throw error;
      }

      setResult(data as MbtiResult);
    } catch (error) {
      console.error('DB 연동 에러:', error);
      alert('데이터베이스에서 정보를 가져오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: '40px 20px',
        textAlign: 'center',
    fontFamily: "'Pretendard', sans-serif",
        backgroundColor: '#fafafa',
        minHeight: '100vh',
      }}
    >
      <header style={{ marginBottom: '40px' }}>
        <h2
          style={{
            color: '#ff4d4d',
            letterSpacing: '-1.5px',
            fontSize: '2rem',
            fontWeight: 800,
          }}
        >
          다상담 MBTI 정밀 분석
        </h2>
        <p style={{ color: '#888', fontSize: '0.95rem', marginTop: '10px' }}>
          Cloud Database 연동 정밀 진단 시스템 v8.1
        </p>
      </header>

      <main
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          backgroundColor: '#fff',
          padding: '35px',
          borderRadius: '35px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '35px',
          }}
        >
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '10px' }}>
              나의 유형
            </p>
            <select
              value={myMbti}
              onChange={(e) => setMyMbti(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '18px',
                border: '2px solid #f0f0f0',
                fontWeight: 'bold',
                backgroundColor: '#fff',
              }}
            >
              <option value="">선택</option>
              {mbtiList.map((mbti) => (
                <option key={mbti} value={mbti}>
                  {mbti}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              width: '40px',
              alignSelf: 'flex-end',
              paddingBottom: '15px',
              color: '#ff4d4d',
              fontSize: '1.2rem',
            }}
          >
            ♥
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '10px' }}>
              상대 유형
            </p>
            <select
              value={yourMbti}
              onChange={(e) => setYourMbti(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '18px',
                border: '2px solid #f0f0f0',
                fontWeight: 'bold',
                backgroundColor: '#fff',
              }}
            >
              <option value="">선택</option>
              {mbtiList.map((mbti) => (
                <option key={mbti} value={mbti}>
                  {mbti}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            width: '100%',
            padding: '22px',
            borderRadius: '22px',
            border: 'none',
            backgroundColor: '#ff4d4d',
            color: '#fff',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {loading ? '데이터 엔진 가동 중...' : '분석 리포트 생성'}
        </button>

        {result && (
          <div
            key={`${myMbti}-${yourMbti}`}
            style={{
              marginTop: '40px',
              textAlign: 'left',
              borderTop: '1px solid #eee',
              paddingTop: '35px',
              animation: 'fadeIn 0.5s ease-out',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <span
                style={{
                  backgroundColor: '#fff0f0',
                  color: '#ff4d4d',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                }}
              >
                {result.relation_type}
              </span>

              <h2 style={{ fontSize: '4rem', color: '#111', margin: '15px 0' }}>
                {result.score}
                <span style={{ fontSize: '1.5rem' }}>점</span>
              </h2>

              <p
                style={{
                  color: '#444',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  lineHeight: 1.4,
                }}
              >
                "{result.summary}"
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#f9f9f9',
                padding: '25px',
                borderRadius: '25px',
                marginBottom: '15px',
              }}
            >
              <h4 style={{ fontSize: '1rem', color: '#222', marginBottom: '15px' }}>
                전문가 상세분석 리포트
              </h4>
              <p
                style={{
                  fontSize: '1rem',
                  color: '#666',
                  lineHeight: 1.7,
                  wordBreak: 'keep-all',
                }}
              >
                {result.detail_analysis}
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#fff9f0',
                padding: '20px',
                borderRadius: '25px',
                borderLeft: '5px solid #ffa500',
              }}
            >
              <h4 style={{ fontSize: '1rem', color: '#e67e22', marginBottom: '8px' }}>
                다상담의 현실 조언
              </h4>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#7f8c8d',
                  lineHeight: 1.6,
                  wordBreak: 'keep-all',
                }}
              >
                {result.advice_tips}
              </p>
            </div>
          </div>
        )}
      </main>

      <footer style={{ marginTop: '60px', fontSize: '0.8rem', color: '#bbb' }}>
        © 2026 Sunny Lab & Dasangdam. 모든 데이터는 Cloud DB에서 실시간으로 호출됩니다.
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}