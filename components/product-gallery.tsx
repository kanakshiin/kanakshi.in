"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { PRODUCT_PLACEHOLDER_IMAGE } from "../lib/api";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const thumbRailRef = useRef<HTMLDivElement>(null);

  const displayImages = images.length > 0 ? images : [PRODUCT_PLACEHOLDER_IMAGE];

  const switchImage = (index: number) => {
    if (index === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 150);

    if (thumbRailRef.current) {
      const thumbEl = thumbRailRef.current.children[index] as HTMLElement;
      if (thumbEl) {
        thumbEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
  };

  const nextLightboxImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevLightboxImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextLightboxImage();
      else if (e.key === "ArrowLeft") prevLightboxImage();
      else if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, displayImages.length]);

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped Left -> Next Image
        switchImage((activeIndex + 1) % displayImages.length);
      } else {
        // Swiped Right -> Prev Image
        switchImage((activeIndex - 1 + displayImages.length) % displayImages.length);
      }
    }
    touchStartX.current = null;
  };

  return (
    <div className="kanakshi-pdp-gallery-container">
      {/* Desktop Thumbnail Column (Left side) */}
      {displayImages.length > 1 && (
        <div className="kanakshi-gallery-thumbnails-rail" ref={thumbRailRef}>
          {displayImages.map((image, index) => (
            <button
              key={`thumb-${index}`}
              type="button"
              className={`kanakshi-gallery-thumb-btn ${activeIndex === index ? "is-active" : ""}`}
              onClick={() => switchImage(index)}
              onMouseEnter={() => switchImage(index)}
              aria-label={`View photo ${index + 1} of ${productName}`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="kanakshi-thumb-img"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Showcase Stage */}
      <div className="kanakshi-gallery-stage-wrapper">
        <div
          className={`kanakshi-gallery-stage ${isTransitioning ? "is-transitioning" : ""}`}
          onClick={() => openLightbox(activeIndex)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openLightbox(activeIndex)}
          aria-label="Click to expand photo gallery"
        >
          <Image
            src={displayImages[activeIndex] || PRODUCT_PLACEHOLDER_IMAGE}
            alt={productName}
            className="kanakshi-gallery-main-img"
            width={1000}
            height={1000}
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
          />

          {/* Top-Right Tag: 100% Certified / Hallmarked */}
          <div className="kanakshi-gallery-badge-top">
            <span>925 Hallmarked</span>
          </div>

          {/* Bottom Floating Bar */}
          <div className="kanakshi-gallery-bottom-bar">
            {displayImages.length > 1 && (
              <span className="kanakshi-gallery-counter-pill">
                {activeIndex + 1} / {displayImages.length}
              </span>
            )}

            <button
              type="button"
              className="kanakshi-gallery-expand-pill"
              onClick={(e) => {
                e.stopPropagation();
                openLightbox(activeIndex);
              }}
              title="Full screen view"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
              <span>View All {displayImages.length > 1 ? `${displayImages.length} ` : ""}Photos</span>
            </button>
          </div>
        </div>

        {/* Mobile Thumbnails / Dots strip */}
        {displayImages.length > 1 && (
          <div className="kanakshi-gallery-mobile-strip">
            {displayImages.map((image, index) => (
              <button
                key={`mobile-thumb-${index}`}
                type="button"
                className={`kanakshi-gallery-mobile-thumb ${activeIndex === index ? "is-active" : ""}`}
                onClick={() => switchImage(index)}
                aria-label={`Go to image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt=""
                  width={56}
                  height={56}
                  className="kanakshi-mobile-thumb-img"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isOpen && (
        <div className="kanakshi-lightbox-backdrop" onClick={closeLightbox}>
          <div className="kanakshi-lightbox-content" onClick={(e) => e.stopPropagation()}>
            {/* Top Toolbar */}
            <div className="kanakshi-lightbox-header">
              <span className="kanakshi-lightbox-title">
                {productName} ({lightboxIndex + 1} of {displayImages.length})
              </span>
              <button
                type="button"
                className="kanakshi-lightbox-close-btn"
                onClick={closeLightbox}
                aria-label="Close lightbox"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Center Image with Navigation */}
            <div className="kanakshi-lightbox-stage">
              {displayImages.length > 1 && (
                <button
                  type="button"
                  className="kanakshi-lightbox-nav-btn prev"
                  onClick={prevLightboxImage}
                  aria-label="Previous image"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}

              <div className="kanakshi-lightbox-img-wrapper">
                <Image
                  src={displayImages[lightboxIndex] || PRODUCT_PLACEHOLDER_IMAGE}
                  alt={`${productName} full view`}
                  width={1400}
                  height={1400}
                  className="kanakshi-lightbox-main-img"
                  priority
                />
              </div>

              {displayImages.length > 1 && (
                <button
                  type="button"
                  className="kanakshi-lightbox-nav-btn next"
                  onClick={nextLightboxImage}
                  aria-label="Next image"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}
            </div>

            {/* Bottom Lightbox Thumbnail Carousel */}
            {displayImages.length > 1 && (
              <div className="kanakshi-lightbox-footer">
                <div className="kanakshi-lightbox-thumbs">
                  {displayImages.map((image, index) => (
                    <button
                      key={`lb-thumb-${index}`}
                      type="button"
                      className={`kanakshi-lightbox-thumb ${lightboxIndex === index ? "is-active" : ""}`}
                      onClick={() => setLightboxIndex(index)}
                    >
                      <Image
                        src={image}
                        alt=""
                        width={60}
                        height={60}
                        className="kanakshi-lb-thumb-img"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
