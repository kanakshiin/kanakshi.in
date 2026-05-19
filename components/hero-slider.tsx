"use client";

import { useEffect, useState } from "react";

type HeroSlide = {
  alt: string;
  eyebrow?: string;
  image: string;
  subtitle?: string;
  title?: string;
};

type HeroSliderProps = {
  slides: HeroSlide[];
};

export function HeroSlider({ slides }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="hero-slider">
      <div className="hero-slider-stage">
        {slides.map((slide, index) => (
          <div
            key={`${slide.image}-${index}`}
            className={`hero-slide ${index === activeIndex ? "active" : ""}`}
            aria-hidden={index === activeIndex ? "false" : "true"}
          >
            <img src={slide.image} alt={slide.alt} />
          </div>
        ))}
      </div>

      <div className="hero-slider-controls">
        <button
          type="button"
          className="hero-slider-arrow"
          onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
          aria-label="Previous slide"
        >
          ‹
        </button>

        {slides[activeIndex]?.title ? (
          <div className="hero-slide-copy">
            <strong className="hero-slide-title">{slides[activeIndex].title}</strong>
          </div>
        ) : null}

        <button
          type="button"
          className="hero-slider-arrow"
          onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
          aria-label="Next slide"
        >
          ›
        </button>
      </div>

    </div>
  );
}
