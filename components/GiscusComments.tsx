"use client";

import Giscus from "@giscus/react";

export default function GiscusComments() {
  return (
    <div className="giscusWrap">
      <Giscus
        id="comments"
        repo={process.env.NEXT_PUBLIC_GISCUS_REPO!}
        repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID!}
        category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY!}
        categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!}
        mapping={
          (process.env.NEXT_PUBLIC_GISCUS_MAPPING as
            | "pathname"
            | "url"
            | "title"
            | "og:title"
            | "specific"
            | "number") || "pathname"
        }
        strict={process.env.NEXT_PUBLIC_GISCUS_STRICT === "1" ? "1" : "0"}
        reactionsEnabled={
          process.env.NEXT_PUBLIC_GISCUS_REACTIONS_ENABLED === "1" ? "1" : "0"
        }
        emitMetadata="0"
        inputPosition={
          (process.env.NEXT_PUBLIC_GISCUS_INPUT_POSITION as "top" | "bottom") ||
          "bottom"
        }
        theme="light"
        lang={process.env.NEXT_PUBLIC_GISCUS_LANG || "ko"}
        loading="lazy"
      />
    </div>
  );
}
