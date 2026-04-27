import { getPostBySlug } from "@/lib/notion";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 0;

export default async function BlogPostPage({
  params,
}: {
  params: { id: string };  // ← slug → id 로 수정
}) {
  const post = await getPostBySlug(params.id);  // ← slug → id 로 수정

  if (!post) return notFound();

  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "60px 24px" }}>
      <Link
        href="/"
        style={{
          display: "inline-block",
          marginBottom: "32px",
          color: "#8c7b6b",
          fontSize: "14px",
          textDecoration: "none",
        }}
      >
        ← 홈으로
      </Link>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
        {post.category && (
          <span style={{
            background: "#f0e8df",
            color: "#8c7b6b",
            fontSize: "12px",
            padding: "3px 10px",
            borderRadius: "20px",
          }}>
            {post.category}
          </span>
        )}
        {post.publishedDate && (
          <span style={{ color: "#b0a090", fontSize: "13px" }}>
            {new Intl.DateTimeFormat("ko-KR", {
              year: "numeric", month: "2-digit", day: "2-digit",
            }).format(new Date(post.publishedDate))}
          </span>
        )}
      </div>

      <h1 style={{
        fontSize: "28px",
        fontWeight: "700",
        color: "#3d2f22",
        lineHeight: "1.5",
        marginBottom: "12px",
      }}>
        {post.title}
      </h1>

      {post.excerpt && (
        <p style={{
          fontSize: "16px",
          color: "#8c7b6b",
          lineHeight: "1.8",
          marginBottom: "40px",
          paddingBottom: "32px",
          borderBottom: "1px solid #e8e0d5",
        }}>
          {post.excerpt}
        </p>
      )}

      <div style={{ fontSize: "16px", color: "#4a3b2e", lineHeight: "1.9" }}>
        {post.blocks?.map((block: any) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </main>
  );
}

function BlockRenderer({ block }: { block: any }) {
  const text = block[block.type]?.rich_text
    ?.map((t: any) => t.plain_text)
    .join("") ?? "";

  switch (block.type) {
    case "paragraph":
      return <p style={{ marginBottom: "16px", whiteSpace: "pre-wrap" }}>{text || <br />}</p>;
    case "heading_1":
      return <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#3d2f22", margin: "32px 0 12px" }}>{text}</h1>;
    case "heading_2":
      return <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#3d2f22", margin: "28px 0 10px" }}>{text}</h2>;
    case "heading_3":
      return <h3 style={{ fontSize: "17px", fontWeight: "600", color: "#3d2f22", margin: "24px 0 8px" }}>{text}</h3>;
    case "bulleted_list_item":
      return <li style={{ marginBottom: "8px", paddingLeft: "4px" }}>{text}</li>;
    case "numbered_list_item":
      return <li style={{ marginBottom: "8px", paddingLeft: "4px" }}>{text}</li>;
    case "quote":
      return (
        <blockquote style={{
          borderLeft: "3px solid #c8a882",
          paddingLeft: "16px",
          margin: "24px 0",
          color: "#6b5c4e",
          fontStyle: "italic",
        }}>
          {text}
        </blockquote>
      );
    case "divider":
      return <hr style={{ border: "none", borderTop: "1px solid #e8e0d5", margin: "32px 0" }} />;
    case "image": {
      const url = block.image?.file?.url || block.image?.external?.url;
      return url ? <img src={url} alt="" style={{ maxWidth: "100%", borderRadius: "8px", margin: "24px 0" }} /> : null;
    }
    default:
      return text ? <p style={{ marginBottom: "16px" }}>{text}</p> : null;
  }
}