"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Category } from "../lib/types";
import { referenceAssets } from "../lib/reference-assets";

type StoryCirclesProps = {
  categories?: Category[];
};

export function KanakshiStoryCircles({ categories = [] }: StoryCirclesProps) {
  const defaultItems = [
    { title: "Rings", slug: "rings", image: "/jewellery/solitaire-ring.jpg", href: "/shop/rings" },
    { title: "Earrings", slug: "earrings", image: "/jewellery/drop-earrings.jpg", href: "/shop/earrings" },
    { title: "Necklaces", slug: "necklaces", image: "/jewellery/heart-necklace.jpg", href: "/shop/necklaces" },
    { title: "Bracelets", slug: "bracelets", image: "/jewellery/tennis-bracelet.jpg", href: "/shop/bracelets" },
    { title: "Gold & Lab", slug: "gold-lab-diamonds", image: "/jewellery/gold-pendant.jpg", href: "/shop/gold-lab-diamonds" },
    { title: "925 Silver", slug: "silver-jewellery", image: "/jewellery/drop-earrings.jpg", href: "/shop/silver-jewellery" },
    { title: "Mangalsutra", slug: "mangalsutra", image: "/jewellery/heart-necklace.jpg", href: "/shop/mangalsutra" },
    { title: "Men's", slug: "mens-jewellery", image: "/jewellery/mens-cuban-chain.jpg", href: "/shop/mens-jewellery" },
    { title: "Gift Sets", slug: "gifting-edits", image: "/jewellery/couple-promise-rings.jpg", href: "/shop/gifting-edits" },
    { title: "Evil Eye", slug: "bracelets", image: "/jewellery/evil-eye-bracelet.jpg", href: "/shop/bracelets" }
  ];

  const items = categories.length > 0
    ? categories.map((cat) => ({
        title: cat.name,
        slug: cat.slug,
        image: cat.image || referenceAssets.categories.rings,
        href: `/shop/${encodeURIComponent(cat.slug)}`
      }))
    : defaultItems;

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);
  const isInteracting = useRef(false);
  const resumeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Drag state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const dragMoved = useRef(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Set initial scroll position to set 1 so reverse scrolling works immediately without boundary
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const setInitial = () => {
      const singleSetWidth = track.scrollWidth / 4;
      if (singleSetWidth > 0 && container.scrollLeft === 0) {
        container.scrollLeft = singleSetWidth;
      }
    };
    const t = setTimeout(setInitial, 80);
    return () => clearTimeout(t);
  }, [items.length]);

  // Seamless Infinite Loop animation via requestAnimationFrame
  useEffect(() => {
    let lastTime = performance.now();
    const speed = 0.55; // pixels per frame at 60fps

    const loop = (currentTime: number) => {
      const container = containerRef.current;
      const track = trackRef.current;

      if (container && track && !isInteracting.current && !isDragging.current) {
        const delta = Math.min((currentTime - lastTime) / 16.67, 2);
        container.scrollLeft += speed * delta;

        const singleSetWidth = track.scrollWidth / 4;
        if (singleSetWidth > 0) {
          // Scrolled forward past set 2 -> wrap back by 1 set
          if (container.scrollLeft >= singleSetWidth * 2) {
            container.scrollLeft -= singleSetWidth;
          } else if (container.scrollLeft <= 0.1 * singleSetWidth) {
            // Dragged backward (reverse) near beginning -> jump forward by 1 set
            container.scrollLeft += singleSetWidth;
          }
        }
      }

      lastTime = currentTime;
      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const handlePointerDown = (clientX: number) => {
    isInteracting.current = true;
    isDragging.current = true;
    setIsDragActive(true);
    startX.current = clientX;
    dragMoved.current = false;

    if (containerRef.current) {
      scrollStart.current = containerRef.current.scrollLeft;
    }
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging.current || !containerRef.current || !trackRef.current) return;
    const diff = clientX - startX.current;
    if (Math.abs(diff) > 5) {
      dragMoved.current = true;
    }

    containerRef.current.scrollLeft = scrollStart.current - diff;

    // Handle instant infinite wrap during manual touch/mouse drag (forward or reverse)
    const singleSetWidth = trackRef.current.scrollWidth / 4;
    if (singleSetWidth > 0) {
      if (containerRef.current.scrollLeft >= singleSetWidth * 2.5) {
        containerRef.current.scrollLeft -= singleSetWidth;
        scrollStart.current -= singleSetWidth;
      } else if (containerRef.current.scrollLeft <= 0.2 * singleSetWidth) {
        containerRef.current.scrollLeft += singleSetWidth;
        scrollStart.current += singleSetWidth;
      }
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    setIsDragActive(false);
    // Resume auto-scroll after release
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => {
      isInteracting.current = false;
      dragMoved.current = false;
    }, 1200);
  };

  // Touch Handlers (Mobile)
  const onTouchStart = (e: React.TouchEvent) => {
    handlePointerDown(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handlePointerMove(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    handlePointerUp();
  };

  // Mouse Handlers (Desktop click & drag)
  const onMouseDown = (e: React.MouseEvent) => {
    handlePointerDown(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      handlePointerMove(e.clientX);
    }
  };

  const onMouseUp = () => {
    if (isDragging.current) {
      handlePointerUp();
    }
  };

  const onMouseEnter = () => {
    isInteracting.current = true;
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
  };

  const onMouseLeave = () => {
    if (!isDragging.current) {
      isInteracting.current = false;
    }
    handlePointerUp();
  };

  // Prevent link click navigation when user is actively dragging/swiping
  const handleClick = (e: React.MouseEvent) => {
    if (dragMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className="kanakshi-stories-wrapper" aria-label="Top Categories">
      <div className="kanakshi-container">
        <div className="kanakshi-top-categories-header">
          <h2 className="kanakshi-top-categories-title">Top Categories</h2>
        </div>
      </div>

      {/* Interactive Infinite Loop Container with Touch Pause & Bidirectional Drag */}
      <div
        ref={containerRef}
        className={`kanakshi-stories-infinite-container ${isDragActive ? "is-dragging" : ""}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div ref={trackRef} className="kanakshi-stories-infinite-track">
          {[1, 2, 3, 4].map((setNum) =>
            items.map((item, index) => (
              <Link
                key={`story-${setNum}-${item.slug || index}`}
                href={item.href}
                className="kanakshi-story-item"
                onClick={handleClick}
                draggable={false}
                aria-hidden={setNum > 1 ? "true" : undefined}
              >
                <div className="kanakshi-story-avatar-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="kanakshi-story-img"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
                <span className="kanakshi-story-label">{item.title}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
