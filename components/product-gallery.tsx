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
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbRailRef = useRef<HTMLDivElement>(null);

  const switchImage = (index: number) => {
    if (index === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 160);
    // Scroll active thumb into view in the vertical rail
    if (thumbRailRef.current) {
      const thumbEl = thumbRailRef.current.children[index] as HTMLElement;
      if (thumbEl) {
        thumbEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsOpen(true);
    if (dialogRef.current) {
      dialogRef.current.showModal();
      document.body.style.overflow = "hidden";
    }
  };

  const closeLightbox = () => {
    setIsOpen(false);
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    document.body.style.overflow = "";
  };

  const nextLightboxImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightboxImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextLightboxImage();
      else if (e.key === "ArrowLeft") prevLightboxImage();
      else if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length]);

  return (
    <div className="product-detail-media-gallery">
      {/* Vertical Thumbnail Rail — Desktop */}
      {images.length > 1 ? (
        <div className="gallery-thumb-rail" ref={thumbRailRef}>
          {images.map((image, index) => (
            <button
              key={`gallery-thumb-${index}`}
              type="button"
              className={`gallery-thumb-btn ${activeIndex === index ? "active" : ""}`}
              onClick={() => switchImage(index)}
              onMouseEnter={() => switchImage(index)}
              aria-label={`Show product image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                width={100}
                height={100}
                sizes="88px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : null}

      {/* Main Image Stage */}
      <div className="gallery-main-stage">
        <div
          className={`gallery-main-wrapper${isTransitioning ? " gallery-fade-out" : ""}`}
          onClick={() => openLightbox(activeIndex)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openLightbox(activeIndex)}
          aria-label="Click to expand gallery"
        >
          <Image
            src={images[activeIndex] || PRODUCT_PLACEHOLDER_IMAGE}
            alt={productName}
            className="product-detail-main interactive-zoom"
            width={1200}
            height={1200}
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
          />

          {/* Image Counter Badge */}
          {images.length > 1 && (
            <div className="gallery-counter-badge">
              {activeIndex + 1} / {images.length}
            </div>
          )}

          <button
            type="button"
            className="gallery-expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              openLightbox(activeIndex);
            }}
            aria-label="Expand gallery to full screen"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="expand-svg-icon">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            <span>View All Photos</span>
          </button>
        </div>

        {/* Mobile Dot Indicators */}
        {images.length > 1 && (
          <div className="gallery-mobile-dots">
            {images.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                className={`gallery-dot${activeIndex === index ? " active" : ""}`}
                onClick={() => switchImage(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Dialog */}
      <dialog
        ref={dialogRef}
        className="premium-lightbox-dialog"
        onClose={closeLightbox}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeLightbox();
        }}
      >
        <div className="lightbox-viewport">
          <button
            type="button"
            className="lightbox-close-btn"
            onClick={closeLightbox}
            aria-label="Close fullscreen gallery"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="lightbox-content-grid">
            <button
              type="button"
              className="lightbox-nav-btn prev"
              onClick={prevLightboxImage}
              aria-label="Previous image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="lightbox-display-frame">
              <img
                src={images[lightboxIndex] || PRODUCT_PLACEHOLDER_IMAGE}
                alt={`${productName} fullscreen view ${lightboxIndex + 1}`}
                className="lightbox-active-img"
              />
              <div className="lightbox-counter-badge">
                <span>{lightboxIndex + 1}</span>
                <span className="divider">/</span>
                <span>{images.length}</span>
              </div>
            </div>

            <button
              type="button"
              className="lightbox-nav-btn next"
              onClick={nextLightboxImage}
              aria-label="Next image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {images.length > 1 && (
            <div className="lightbox-carousel-row">
              {images.map((image, index) => (
                <button
                  key={`lightbox-carousel-thumb-${index}`}
                  type="button"
                  className={`lightbox-carousel-thumb-btn ${lightboxIndex === index ? "active" : ""}`}
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`View fullscreen image ${index + 1}`}
                >
                  <img
                    src={image || PRODUCT_PLACEHOLDER_IMAGE}
                    alt={`Thumbnail indicator ${index + 1}`}
                    className="lightbox-carousel-thumb-img"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
