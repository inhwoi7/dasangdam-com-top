export default function TermsPage() {
  return (
    <main style={{ maxWidth: "760px", margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#3d2f22", marginBottom: "8px" }}>
        이용약관
      </h1>
      <p style={{ color: "#9c8878", fontSize: "14px", marginBottom: "40px" }}>
        최종 업데이트: 2026년 1월 1일
      </p>

      <Section title="제1조 (목적)">
        본 약관은 다상담(이하 &quot;서비스&quot;)이 제공하는 모든 서비스의 이용 조건 및 절차,
        이용자와 서비스 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
      </Section>

      <Section title="제2조 (서비스 이용)">
        서비스는 콘텐츠 제공을 목적으로 하며, 이용자는 본 약관에 동의함으로써 서비스를 이용할 수 있습니다.
        서비스는 사전 고지 없이 내용을 변경하거나 중단할 수 있습니다.
      </Section>

      <Section title="제3조 (면책조항)">
        서비스가 제공하는 사주, 운세, MBTI 등의 콘텐츠는 오락 및 참고 목적이며, 실제 결과를 보장하지 않습니다.
        콘텐츠를 근거로 한 의사결정에 대한 책임은 이용자 본인에게 있습니다.
      </Section>

      <Section title="제4조 (지식재산권)">
        서비스 내 모든 콘텐츠(텍스트, 이미지 등)의 저작권은 다상담에 귀속됩니다.
        무단 복제 및 배포를 금합니다.
      </Section>

      <Section title="제5조 (문의)">
        이용약관 관련 문의는 아래 이메일로 연락해 주세요.
        <br /><br />
        <strong>이메일:</strong> contact@dasangdam.com
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "17px", fontWeight: "600", color: "#3d2f22", marginBottom: "10px" }}>
        {title}
      </h2>
      <div style={{ fontSize: "15px", color: "#6b5c4e", lineHeight: "1.8" }}>
        {children}
      </div>
    </section>
  );
}
