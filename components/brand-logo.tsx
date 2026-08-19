import React from "react";

type BrandLogoProps = {
  theme?: "dark" | "white";
  logoUrl?: string | null;
  className?: string;
  height?: number;
};

export function BrandLogo({ theme = "dark", logoUrl, className = "", height = 38 }: BrandLogoProps) {
  const isWhite = theme === "white";
  const primaryTextColor = isWhite ? "#FFFFFF" : "#1A1A1A";
  const subTextColor = "var(--kanakshi-pink, #E9718B)";

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt="Kanakshi Fine Jewellery"
        style={{ height: `${height}px`, width: "auto", objectFit: "contain", display: "block" }}
        className={className}
      />
    );
  }

  return (
    <div
      className={`kanakshi-brand-logo ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        userSelect: "none"
      }}
      aria-label="Kanakshi Fine Jewellery"
    >
      {/* Precision Vector Diamond Insignia */}
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="kanakshi-brand-logo-icon"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id={`kanakshiEmblemGrad-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E9718B" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B83253" />
          </linearGradient>
        </defs>
        <polygon
          points="22,2 40,16 22,42 4,16"
          fill="none"
          stroke={`url(#kanakshiEmblemGrad-${theme})`}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <polygon
          points="13,9 31,9 38,16 22,34 6,16"
          fill="none"
          stroke={isWhite ? "#FFF0F3" : "#E9718B"}
          strokeWidth="1.1"
          strokeOpacity="0.85"
        />
        <line x1="13" y1="9" x2="22" y2="2" stroke={`url(#kanakshiEmblemGrad-${theme})`} strokeWidth="1" />
        <line x1="31" y1="9" x2="22" y2="2" stroke={`url(#kanakshiEmblemGrad-${theme})`} strokeWidth="1" />
        <line x1="22" y1="9" x2="22" y2="34" stroke={`url(#kanakshiEmblemGrad-${theme})`} strokeWidth="1.2" />
        <line x1="6" y1="16" x2="38" y2="16" stroke={`url(#kanakshiEmblemGrad-${theme})`} strokeWidth="1" />
        <g transform="translate(22, 16) scale(0.6)">
          <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#D4AF37" />
          <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
        </g>
      </svg>

      {/* Luxury Serif Typography */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05, justifyContent: "center" }}>
        <span
          className="kanakshi-brand-logo-text"
          style={{
            fontFamily: "var(--font-heading-family, 'Cormorant Garamond', Georgia, serif)",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: primaryTextColor,
            textTransform: "uppercase"
          }}
        >
          KANAKSHI
        </span>
        <span
          className="kanakshi-brand-logo-sub"
          style={{
            fontFamily: "var(--font-body-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: subTextColor,
            textTransform: "uppercase",
            marginTop: "1px"
          }}
        >
          FINE JEWELLERY
        </span>
      </div>
    </div>
  );
}
