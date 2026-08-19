"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type HeroSlide = {
  alt: string;
  eyebrow?: string;
  href?: string;
  image: string;
  subtitle?: string;
  title?: string;
  buttonText?: string;
};

type HeroSliderProps = {
  autoplayMs?: number;
  slides: HeroSlide[];
};

export function HeroSlider({ slides, autoplayMs = 4500 }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, autoplayMs);
    return () => clearInterval(interval);
  }, [autoplayMs, slides.length]);

  if (!slides || slides.length === 0) return null;

  const current = slides[activeIndex];

  return (
    <section className="kanakshi-hero">
      <div className="kanakshi-hero-slide">
        {/* Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.image}
          alt={current.alt || "Fine Jewellery Collection"}
          className="kanakshi-hero-bg-img"
        />
        <div className="kanakshi-hero-overlay" />

        {/* Content Box */}
        <div className="kanakshi-container" style={{ position: "relative", zIndex: 3 }}>
          <div className="kanakshi-hero-content">
            <div className="kanakshi-hero-tag">
              {current.eyebrow || "Exclusive 2026 Collection"}
            </div>
            <h1 className="kanakshi-hero-title">
              {current.title || "The Solitaire & Silver Edit"}
            </h1>
            <p className="kanakshi-hero-description">
              {current.subtitle ||
                "Certified 925 Sterling Silver, 18K Real Gold & Ethical Lab-Grown Diamonds. Designed for everyday brilliance with 7-day hassle-free returns."}
            </p>
            <div className="kanakshi-hero-actions">
              <Link href={current.href || "/shop"} className="kanakshi-btn kanakshi-btn-primary kanakshi-btn-lg">
                {current.buttonText || "Shop New Arrivals →"}
              </Link>
              <Link href="/shop?sort=bestseller" className="kanakshi-btn kanakshi-btn-outline kanakshi-btn-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.85)" }}>
                View Best Sellers
              </Link>
            </div>
          </div>
        </div>

        {/* Slider Controls / Luxury Indicators & Navigation */}
        {slides.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "24px",
              right: "32px",
              zIndex: 4,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(12px)",
              padding: "6px 10px",
              borderRadius: "30px",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)"
            }}
          >
            <button
              type="button"
              onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--kanakshi-black)",
                transition: "all 0.2s ease",
                cursor: "pointer"
              }}
              aria-label="Previous slide"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Luxury Expanding Progress Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0 6px" }}>
              {slides.map((_, idx) => (
                <button
                  key={`slide-pill-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    height: "6px",
                    width: activeIndex === idx ? "26px" : "8px",
                    borderRadius: "4px",
                    background: activeIndex === idx ? "var(--kanakshi-pink, #e9718b)" : "rgba(0, 0, 0, 0.2)",
                    boxShadow: activeIndex === idx ? "0 0 8px rgba(233, 113, 139, 0.45)" : "none",
                    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    border: "none",
                    padding: 0
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--kanakshi-black)",
                transition: "all 0.2s ease",
                cursor: "pointer"
              }}
              aria-label="Next slide"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
