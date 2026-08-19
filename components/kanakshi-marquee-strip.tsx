"use client";

export function KanakshiMarqueeStrip() {
  const marqueeItems = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kanakshi-marquee-icon">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      label: "Free Insured Shipping",
      sublabel: "On all orders across India",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kanakshi-marquee-icon">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      label: "100% Anti-Tarnish Rhodium",
      sublabel: "Lasting mirror shine finish",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kanakshi-marquee-icon">
          <polygon points="6 2 18 2 22 8 12 22 2 8 6 2" />
          <line x1="2" y1="8" x2="22" y2="8" />
          <line x1="12" y1="2" x2="8" y2="8" />
          <line x1="12" y1="2" x2="16" y2="8" />
          <line x1="8" y1="8" x2="12" y2="22" />
          <line x1="16" y1="8" x2="12" y2="22" />
        </svg>
      ),
      label: "3,000+ Fine Styles",
      sublabel: "New designs every week",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kanakshi-marquee-icon">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
      label: "Genuine BIS Hallmarked",
      sublabel: "100% Certified 925 & 18K",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kanakshi-marquee-icon">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      ),
      label: "7-Day Easy Returns",
      sublabel: "Free doorstep reverse pickup",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kanakshi-marquee-icon">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      ),
      label: "Free Velvet Gift Box",
      sublabel: "With authenticity certificate",
    },
  ];

  return (
    <div className="kanakshi-marquee-container" aria-label="Customer trust highlights">
      <div className="kanakshi-marquee-track">
        {[1, 2, 3, 4].map((setNum) =>
          marqueeItems.map((item, idx) => (
            <div
              key={`marquee-${setNum}-${idx}`}
              className="kanakshi-marquee-item"
              aria-hidden={setNum > 1 ? "true" : undefined}
            >
              <div className="kanakshi-marquee-icon-wrap">{item.icon}</div>
              <div className="kanakshi-marquee-text">
                <span className="kanakshi-marquee-label">{item.label}</span>
                <span className="kanakshi-marquee-sub">{item.sublabel}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
