"use client";

import { useState } from "react";

type BlogSocialShareProps = {
  url: string;
  title: string;
  media?: string | null;
};

export function BlogSocialShare({ url, title, media }: BlogSocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedMedia = media ? encodeURIComponent(media) : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL to clipboard", err);
    }
  };

  return (
    <section className="blog-share-container" aria-label="Social sharing actions" style={{ marginTop: "3rem", padding: "1.5rem 0", borderTop: "1px dashed var(--line)" }}>
      <h4 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-deep)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Share This Journal
      </h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share-btn"
          aria-label="Share on Facebook"
          style={shareBtnStyle}
        >
          Facebook
        </a>

        {/* Twitter/X */}
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share-btn"
          aria-label="Share on Twitter"
          style={shareBtnStyle}
        >
          Twitter
        </a>

        {/* Pinterest */}
        {media && (
          <a
            href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedMedia}&description=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="blog-share-btn"
            aria-label="Share on Pinterest"
            style={shareBtnStyle}
          >
            Pinterest
          </a>
        )}

        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share-btn"
          aria-label="Share on WhatsApp"
          style={shareBtnStyle}
        >
          WhatsApp
        </a>

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="blog-share-btn"
          aria-label="Copy article link"
          style={{ ...shareBtnStyle, border: "none", cursor: "pointer", background: copied ? "var(--accent)" : "rgba(25, 25, 25, 0.04)", color: copied ? "#fff" : "var(--accent-deep)" }}
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      {/* Styled effects hover inside global CSS, inline style backup */}
      <style jsx global>{`
        .blog-share-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1.15rem;
          border-radius: 12px;
          border: 1px solid var(--line-strong);
          background: rgba(255, 255, 255, 0.72);
          color: var(--accent-deep);
          font-size: 0.88rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 220ms ease;
        }
        .blog-share-btn:hover {
          transform: translateY(-2px);
          border-color: var(--accent);
          background: rgba(241, 167, 32, 0.08);
          color: var(--accent-deep);
        }
      `}</style>
    </section>
  );
}

const shareBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  padding: "0.55rem 1.15rem",
  borderRadius: "12px",
  border: "1px solid var(--line-strong)",
  fontSize: "0.88rem",
  fontWeight: 600,
  textDecoration: "none",
  fontFamily: "inherit",
};
