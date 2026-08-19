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

        {/* Slider Controls / Arrows */}
        {slides.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "24px",
              right: "32px",
              zIndex: 4,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <button
              onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.9)",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                color: "var(--kanakshi-black)"
              }}
              aria-label="Previous slide"
            >
              ‹
            </button>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", padding: "0 8px", color: "var(--kanakshi-black)" }}>
              {activeIndex + 1} / {slides.length}
            </div>
            <button
              onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.9)",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                color: "var(--kanakshi-black)"
              }}
              aria-label="Next slide"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
