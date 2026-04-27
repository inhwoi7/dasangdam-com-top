import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid #e8e0d5",
      marginTop: "60px",
      padding: "28px 24px",
      textAlign: "center",
      backgroundColor: "#faf8f5",
    }}>
      <nav style={{
        display: "flex",
        justifyContent: "center",
        gap: "8px",
        flexWrap: "wrap",
        marginBottom: "12px",
      }}>
        <Link href="/about" style={{ color: "#8c7b6b", fontSize: "13px", textDecoration: "none" }}>
          서비스 소개
        </Link>
        <span style={{ color: "#c8b8a8", fontSize: "13px" }}>|</span>
        <Link href="/privacy" style={{ color: "#8c7b6b", fontSize: "13px", textDecoration: "none" }}>
          개인정보처리방침
        </Link>
        <span style={{ color: "#c8b8a8", fontSize: "13px" }}>|</span>
        <Link href="/terms" style={{ color: "#8c7b6b", fontSize: "13px", textDecoration: "none" }}>
          이용약관
        </Link>
      </nav>
      <p style={{ color: "#b0a090", fontSize: "12px", margin: 0 }}>
        © 2026 다상담(Dasangdam). All rights reserved.
      </p>
    </footer>
  );
}
