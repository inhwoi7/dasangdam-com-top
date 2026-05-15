'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useLocale } from 'next-intl'; // ✅ 추가
import { useKakaoShare } from '@/lib/useKakaoShare';

type MbtiResult = {
  relation_type: string;
  relation_type_en: string;   // ✅ 추가
  score: number;
  summary: string;
  summary_en: string;         // ✅ 추가
  detail_analysis: string;
  detail_analysis_en: string; // ✅ 추가
  advice_tips: string;
  advice_tips_en: string;     // ✅ 추가
};

const supabase = createClient(
  'https://kkrshqrrifzggofmxejf.supabase.co',
  'sb_publishable_h9tFvYIsWjhbrr6u_rSO7w_Bi9B6jFa'
);

const mbtiList = [
  'ENFP','ENFJ','ENTP','ENTJ','ESFP','ESFJ','ESTP','ESTJ',
  'INFP','INFJ','INTP','INTJ','ISFP','ISFJ','ISTP','ISTJ',
];

export default function Home() {
  const locale = useLocale(); // ✅ 추가
  const isEn = locale === 'en'; // ✅ 편의 변수

  const [myMbti, setMyMbti] = useState('');
  const [yourMbti, setYourMbti] = useState('');
  const [result, setResult] = useState<MbtiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const { shareWithCapture } = useKakaoShare();

  useEffect(() => {
    setResult(null);
  }, [myMbti, yourMbti]);

  const handleAnalyze = async () => {
    if (!myMbti || !yourMbti) {
      alert(isEn ? 'Please select both MBTI types.' : '분석을 위해 MBTI를 선택해 주세요.');
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
      if (error) throw error;
      setResult(data as MbtiResult);
    } catch (error) {
      console.error('DB 연동 에러:', error);
      alert(isEn ? 'Failed to load data. Please try again.' : '데이터베이스에서 정보를 가져오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ locale에 따라 표시할 값 선택하는 헬퍼
  const d = useCallback((ko: string, en: string) => {
    return isEn && en ? en : ko;
  }, [isEn]);

  const handleKakaoShare = useCallback(() => {
    if (!result) return;
    const params = new URLSearchParams({ my: myMbti, your: yourMbti });
    const relationType = d(result.relation_type, result.relation_type_en);
    const summary = d(result.summary, result.summary_en);
    shareWithCapture({
      captureId: 'mbti-capture',
      title: `${myMbti} ♥ ${yourMbti} — ${result.score}${isEn ? 'pts' : '점'} · ${relationType}`,
      description: `"${summary}"`,
      buttonText: isEn ? 'Check your chemistry →' : '나도 궁합 보기 →',
      pageUrl: `https://dasangdam.com/services/mbti?${params.toString()}`,
    });
  }, [result, myMbti, yourMbti, shareWithCapture, d, isEn]);

  return (
    <div style={{
      padding: '40px 20px',
      textAlign: 'center',
      fontFamily: "'Pretendard', sans-serif",
      backgroundColor: '#fafafa',
      minHeight: '100vh',
    }}>
      <header style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#ff4d4d', letterSpacing: '-1.5px', fontSize: '2rem', fontWeight: 800 }}>
          {isEn ? 'Dasangdam MBTI Analysis' : '다상담 MBTI 정밀 분석'}
        </h2>
        <p style={{ color: '#888', fontSize: '0.95rem', marginTop: '10px' }}>
          {isEn ? 'Cloud Database Precision Diagnosis System v8.1' : 'Cloud Database 연동 정밀 진단 시스템 v8.1'}
        </p>
      </header>

      <main style={{
        maxWidth: '480px',
        margin: '0 auto',
        backgroundColor: '#fff',
        padding: '35px',
        borderRadius: '35px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '35px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '10px' }}>
              {isEn ? 'My Type' : '나의 유형'}
            </p>
            <select value={myMbti} onChange={(e) => setMyMbti(e.target.value)}
              style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '2px solid #f0f0f0', fontWeight: 'bold', backgroundColor: '#fff' }}>
              <option value="">{isEn ? 'Select' : '선택'}</option>
              {mbtiList.map((mbti) => <option key={mbti} value={mbti}>{mbti}</option>)}
            </select>
          </div>

          <div style={{ width: '40px', alignSelf: 'flex-end', paddingBottom: '15px', color: '#ff4d4d', fontSize: '1.2rem' }}>♥</div>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '10px' }}>
              {isEn ? "Partner's Type" : '상대 유형'}
            </p>
            <select value={yourMbti} onChange={(e) => setYourMbti(e.target.value)}
              style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '2px solid #f0f0f0', fontWeight: 'bold', backgroundColor: '#fff' }}>
              <option value="">{isEn ? 'Select' : '선택'}</option>
              {mbtiList.map((mbti) => <option key={mbti} value={mbti}>{mbti}</option>)}
            </select>
          </div>
        </div>

        <button onClick={handleAnalyze} disabled={loading}
          style={{
            width: '100%', padding: '22px', borderRadius: '22px', border: 'none',
            backgroundColor: '#ff4d4d', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
          }}>
          {loading
            ? (isEn ? 'Analyzing...' : '데이터 엔진 가동 중...')
            : (isEn ? 'Generate Report' : '분석 리포트 생성')
          }
        </button>

        {result && (
          <div key={`${myMbti}-${yourMbti}`} style={{
            marginTop: '40px', textAlign: 'left',
            borderTop: '1px solid #eee', paddingTop: '35px',
            animation: 'fadeIn 0.5s ease-out',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <span style={{
                backgroundColor: '#fff0f0', color: '#ff4d4d',
                padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
              }}>
                {/* ✅ locale에 따라 relation_type 선택 */}
                {d(result.relation_type, result.relation_type_en)}
              </span>
              <h2 style={{ fontSize: '4rem', color: '#111', margin: '15px 0' }}>
                {result.score}<span style={{ fontSize: '1.5rem' }}>{isEn ? 'pts' : '점'}</span>
              </h2>
              <p style={{ color: '#444', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.4 }}>
                {/* ✅ locale에 따라 summary 선택 */}
                "{d(result.summary, result.summary_en)}"
              </p>
            </div>

            <div style={{ backgroundColor: '#f9f9f9', padding: '25px', borderRadius: '25px', marginBottom: '15px' }}>
              <h4 style={{ fontSize: '1rem', color: '#222', marginBottom: '15px' }}>
                {isEn ? 'Detailed Analysis Report' : '전문가 상세분석 리포트'}
              </h4>
              <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.7, wordBreak: 'keep-all' }}>
                {/* ✅ locale에 따라 detail_analysis 선택 */}
                {d(result.detail_analysis, result.detail_analysis_en)}
              </p>
            </div>

            <div style={{ backgroundColor: '#fff9f0', padding: '20px', borderRadius: '25px', borderLeft: '5px solid #ffa500' }}>
              <h4 style={{ fontSize: '1rem', color: '#e67e22', marginBottom: '8px' }}>
                {isEn ? "Dasangdam's Honest Advice" : '다상담의 현실 조언'}
              </h4>
              <p style={{ fontSize: '0.95rem', color: '#7f8c8d', lineHeight: 1.6, wordBreak: 'keep-all' }}>
                {/* ✅ locale에 따라 advice_tips 선택 */}
                {d(result.advice_tips, result.advice_tips_en)}
              </p>
            </div>

            {/* 카카오 공유 버튼 */}
            <button onClick={handleKakaoShare}
              style={{
                marginTop: '24px', width: '100%', padding: '18px',
                borderRadius: '22px', border: 'none',
                backgroundColor: '#FEE500', color: '#1a1a1a',
                fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C6.477 3 2 6.71 2 11.28c0 2.913 1.792 5.481 4.5 7.012L5.5 21l3.663-1.98C10.005 19.33 10.99 19.5 12 19.5c5.523 0 10-3.71 10-8.22C22 6.71 17.523 3 12 3z" fill="#3C1E1E" />
              </svg>
              {isEn ? 'Share via KakaoTalk' : '카카오톡으로 공유하기'}
            </button>

            {/* 다상담 링크 */}
            <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '0.75rem', color: '#bbb' }}>
              {isEn ? 'Dasangdam ' : '다상담 '}
              <a href="https://dasangdam.com" target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'underline', color: '#bbb' }}>
                dasangdam.com
              </a>
            </p>
          </div>
        )}
      </main>

      <footer style={{ marginTop: '60px', fontSize: '0.8rem', color: '#bbb' }}>
        {isEn
          ? '© 2026 Sunny Lab & Dasangdam. All data is loaded in real-time from Cloud DB.'
          : '© 2026 Sunny Lab & Dasangdam. 모든 데이터는 Cloud DB에서 실시간으로 호출됩니다.'
        }
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
