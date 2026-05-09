export default function AboutPage() {
  return (
    <main style={{ maxWidth: "760px", margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#3d2f22", marginBottom: "8px" }}>
        서비스 소개
      </h1>
      <p style={{ color: "#9c8878", fontSize: "14px", marginBottom: "40px" }}>
        다상담 (Dasangdam)
      </p>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "17px", fontWeight: "600", color: "#3d2f22", marginBottom: "10px" }}>
          다상담이란?
        </h2>
        <p style={{ fontSize: "15px", color: "#6b5c4e", lineHeight: "1.9" }}>
          다상담은 써니와 함께하는 인생의 지혜로운 쉼터입니다. 사주, MBTI, 궁합 등 다양한 콘텐츠를 통해
          나 자신과 주변 사람을 더 깊이 이해하고, 일상의 작은 쉼을 찾아가는 공간입니다.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "17px", fontWeight: "600", color: "#3d2f22", marginBottom: "10px" }}>
          제공 서비스
        </h2>
        <ul style={{ fontSize: "15px", color: "#6b5c4e", lineHeight: "2" }}>
          <li>사주 — 타고난 흐름과 현재의 운</li>
          <li>MBTI 매칭 — 성향과 관계 패턴 이해</li>
          <li>사주 궁합 — 두 사람의 조화 확인</li>
          <li>IPIP-50 성격검사 — 과학적 5대 성격 요인 측정</li>
          <li>행운의 숫자 / 오늘의 운세</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: "17px", fontWeight: "600", color: "#3d2f22", marginBottom: "10px" }}>
          문의
        </h2>
        <p style={{ fontSize: "15px", color: "#6b5c4e", lineHeight: "1.9" }}>
          이메일: contact@dasangdam.com
        </p>
      </section>
    </main>
  );
}
