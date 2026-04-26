import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GiscusComments from "@/components/GiscusComments";
import NotionBlockRenderer from "@/components/NotionBlockRenderer";
import { getPostBySlug } from "@/lib/notion";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "글을 찾을 수 없습니다 | 다상담",
      description: "요청하신 글을 찾을 수 없습니다.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dasangdam.com";

  return {
    title: `${post.title} | 다상담`,
    description: post.excerpt || "다상담 글 상세 페이지",
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | 다상담`,
      description: post.excerpt || "다상담 글 상세 페이지",
      url: `${siteUrl}/blog/${post.slug}`,
      siteName: "다상담",
      locale: "ko_KR",
      type: "article",
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="postPage">
      <div className="container">
        <article className="postArticle">
          <div className="postHeaderCard">
            <div className="postMeta">
              <span className="categoryTag">{post.category || "다상담"}</span>
              <span className="postDate">
                {formatDate(post.publishedDate)}
              </span>
            </div>

            <h1 className="postTitle">{post.title}</h1>

            {post.excerpt ? (
              <p className="postExcerpt">{post.excerpt}</p>
            ) : null}
          </div>

          <div className="postBodyCard">
            <NotionBlockRenderer blocks={post.blocks} />
          </div>

          <div className="commentsCard">
            <h2>댓글</h2>
            <GiscusComments />
          </div>
        </article>
      </div>
    </main>
  );
}
