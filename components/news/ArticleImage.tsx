"use client";
import { useState } from "react";
import { ImageOff } from "lucide-react";
export default function ArticleImage({
  src,
  priority = false,
}: {
  src: string | null;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const sized = (width: number) => {
    const url = new URL(src!);
    url.searchParams.set("w", String(width));
    return url.href;
  };
  const canResize = src?.startsWith("https://images.unsplash.com/");
  return (
    <div className="article-image">
      {src && !failed ? (
        // Direct browser requests avoid exposing a server-side image proxy to arbitrary publishers.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={canResize ? sized(priority ? 800 : 320) : src}
          srcSet={
            canResize
              ? [320, 640, 960, 1200].map((w) => `${sized(w)} ${w}w`).join(", ")
              : undefined
          }
          sizes={
            priority ? "(max-width: 767px) calc(100vw - 40px), 740px" : "170px"
          }
          alt=""
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="image-placeholder" aria-label="No article image">
          <ImageOff size={24} strokeWidth={1} />
          <span>NewsHub</span>
        </div>
      )}
    </div>
  );
}
