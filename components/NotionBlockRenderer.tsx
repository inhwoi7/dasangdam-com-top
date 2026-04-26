import React from "react";

type NotionBlockRendererProps = {
  blocks: any[];
};

function renderRichText(richText: any[] = []) {
  return richText.map((item, index) => {
    const text = item?.plain_text ?? "";
    const href = item?.href ?? null;

    if (href) {
      return (
        <a key={index} href={href} target="_blank" rel="noreferrer">
          {text}
        </a>
      );
    }

    return <React.Fragment key={index}>{text}</React.Fragment>;
  });
}

function BlockItem({ block }: { block: any }) {
  const children =
    block?.children?.length > 0 ? (
      <div className="notionChildren">
        <NotionBlockRenderer blocks={block.children} />
      </div>
    ) : null;

  switch (block.type) {
    case "paragraph":
      return (
        <div className="notionBlock">
          <p>{renderRichText(block.paragraph.rich_text)}</p>
          {children}
        </div>
      );

    case "heading_1":
      return (
        <div className="notionBlock">
          <h1>{renderRichText(block.heading_1.rich_text)}</h1>
          {children}
        </div>
      );

    case "heading_2":
      return (
        <div className="notionBlock">
          <h2>{renderRichText(block.heading_2.rich_text)}</h2>
          {children}
        </div>
      );

    case "heading_3":
      return (
        <div className="notionBlock">
          <h3>{renderRichText(block.heading_3.rich_text)}</h3>
          {children}
        </div>
      );

    case "bulleted_list_item":
      return (
        <div className="notionBlock">
          <ul>
            <li>{renderRichText(block.bulleted_list_item.rich_text)}</li>
          </ul>
          {children}
        </div>
      );

    case "numbered_list_item":
      return (
        <div className="notionBlock">
          <ol>
            <li>{renderRichText(block.numbered_list_item.rich_text)}</li>
          </ol>
          {children}
        </div>
      );

    case "quote":
      return (
        <div className="notionBlock">
          <blockquote>{renderRichText(block.quote.rich_text)}</blockquote>
          {children}
        </div>
      );

    case "divider":
      return (
        <div className="notionBlock">
          <hr className="notionDivider" />
        </div>
      );

    case "callout":
      return (
        <div className="notionCallout">
          <div className="notionCalloutIcon">
            {block.callout.icon?.emoji ?? "☀️"}
          </div>
          <div className="notionCalloutContent">
            {renderRichText(block.callout.rich_text)}
            {children}
          </div>
        </div>
      );

    case "code":
      return (
        <div className="notionBlock">
          <pre className="notionCode">
            <code>
              {block.code.rich_text.map((item: any) => item.plain_text).join("")}
            </code>
          </pre>
        </div>
      );

    case "image": {
      const src =
        block.image.type === "external"
          ? block.image.external.url
          : block.image.file.url;

      const caption =
        block.image.caption?.map((item: any) => item.plain_text).join("") ?? "";

      return (
        <figure className="notionImage">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={caption || "notion image"} />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      );
    }

    case "to_do":
      return (
        <div className="notionBlock">
          <label className="notionTodo">
            <input
              type="checkbox"
              checked={Boolean(block.to_do.checked)}
              readOnly
            />
            <span>{renderRichText(block.to_do.rich_text)}</span>
          </label>
          {children}
        </div>
      );

    case "toggle":
      return (
        <details className="notionToggle">
          <summary>{renderRichText(block.toggle.rich_text)}</summary>
          {children}
        </details>
      );

    default:
      return null;
  }
}

export default function NotionBlockRenderer({
  blocks,
}: NotionBlockRendererProps) {
  if (!blocks?.length) {
    return null;
  }

  return (
    <div className="notionProse">
      {blocks.map((block) => (
        <BlockItem key={block.id} block={block} />
      ))}
    </div>
  );
}
