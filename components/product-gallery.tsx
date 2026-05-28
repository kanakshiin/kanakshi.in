"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

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

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Keyboard navigation for standard accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "Escape") {
        closeLightbox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length]);

  return (
    <div className="product-detail-media-gallery">
      {images.length > 1 ? (
        <div className="product-thumb-row interactive-thumbs product-thumb-rail">
          {images.map((image, index) => (
            <button
              key={`gallery-thumb-${index}`}
              type="button"
              className={`gallery-thumb-btn ${activeIndex === index ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              aria-label={`Show product image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                width={180}
                height={180}
                sizes="(max-width: 900px) 22vw, 88px"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="gallery-main-stage">
        <div className="gallery-main-wrapper" onClick={() => openLightbox(activeIndex)}>
          <Image
            src={images[activeIndex] || "/placeholder.jpg"}
            alt={productName}
            className="product-detail-main interactive-zoom"
            width={1200}
            height={1344}
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
          />

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
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span>Expand View</span>
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="premium-lightbox-dialog"
        onClose={closeLightbox}
        onClick={(e) => {
          // Native light-dismiss: close on overlay backdrop click
          if (e.target === dialogRef.current) {
            closeLightbox();
          }
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
            {/* Previous Arrow */}
            <button
              type="button"
              className="lightbox-nav-btn prev"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Active Image Box */}
            <div className="lightbox-display-frame">
              <img
                src={images[lightboxIndex]}
                alt={`${productName} fullscreen view ${lightboxIndex + 1}`}
                className="lightbox-active-img"
              />
              <div className="lightbox-counter-badge">
                <span>{lightboxIndex + 1}</span>
                <span className="divider">/</span>
                <span>{images.length}</span>
              </div>
            </div>

            {/* Next Arrow */}
            <button
              type="button"
              className="lightbox-nav-btn next"
              onClick={nextImage}
              aria-label="Next image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Inline Slider Indicators / Thumbnails */}
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
                    src={image}
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
