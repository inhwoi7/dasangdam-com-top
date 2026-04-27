export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: "760px", margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#3d2f22", marginBottom: "8px" }}>
        개인정보처리방침
      </h1>
      <p style={{ color: "#9c8878", fontSize: "14px", marginBottom: "40px" }}>
        최종 업데이트: 2026년 1월 1일
      </p>

      <Section title="1. 개요">
        다상담(이하 &quot;서비스&quot;)은 이용자의 개인정보를 중요하게 여기며, 「개인정보 보호법」 및 관련 법령을
        준수합니다. 본 방침은 서비스가 수집하는 정보, 사용 목적, 보호 방법에 대해 안내합니다.
      </Section>

      <Section title="2. 수집하는 정보">
        서비스는 다음과 같은 정보를 수집할 수 있습니다.
        <ul>
          <li>방문 페이지, 접속 시간, 브라우저 종류 등 자동 수집 정보</li>
          <li>쿠키(Cookie) 및 유사 기술을 통해 수집된 정보</li>
          <li>Google 애널리틱스 등 제3자 서비스를 통한 통계 데이터</li>
        </ul>
      </Section>

      <Section title="3. 쿠키(Cookie) 사용">
        서비스는 이용자 경험 향상과 광고 제공을 위해 쿠키를 사용합니다.
        <ul>
          <li>쿠키는 브라우저에 저장되는 작은 텍스트 파일입니다.</li>
          <li>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다. 단, 일부 서비스 이용이 제한될 수 있습니다.</li>
        </ul>
      </Section>

      <Section title="4. Google 애드센스 및 광고">
        서비스는 Google AdSense를 통해 광고를 게재합니다.
        <ul>
          <li>Google은 쿠키를 사용하여 이용자의 이전 방문 기록을 바탕으로 맞춤 광고를 제공합니다.</li>
          <li>Google의 광고 쿠키 사용을 원하지 않는 경우{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
              style={{ color: "#8c7b6b" }}>
              Google 광고 설정
            </a>
            에서 맞춤 광고를 비활성화할 수 있습니다.
          </li>
          <li>Google의 개인정보 처리 방식에 대한 자세한 내용은{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
              style={{ color: "#8c7b6b" }}>
              Google 개인정보처리방침
            </a>
            을 참고하세요.
          </li>
        </ul>
      </Section>

      <Section title="5. 제3자 서비스">
        서비스는 다음 제3자 서비스를 이용하며, 각 서비스의 개인정보처리방침이 적용됩니다.
        <ul>
          <li>Google Analytics — 방문자 통계 분석</li>
          <li>Google AdSense — 광고 게재</li>
          <li>Vercel — 서버 호스팅</li>
        </ul>
      </Section>

      <Section title="6. 개인정보의 보유 및 파기">
        수집된 개인정보는 목적 달성 후 지체 없이 파기합니다. 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우
        해당 기간 동안 보관 후 파기합니다.
      </Section>

      <Section title="7. 이용자의 권리">
        이용자는 언제든지 개인정보 열람, 수정, 삭제, 처리 정지를 요청할 수 있습니다. 요청은 아래 이메일로
        문의해 주세요.
      </Section>

      <Section title="8. 문의">
        개인정보 관련 문의사항은 아래 이메일로 연락해 주시기 바랍니다.
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
