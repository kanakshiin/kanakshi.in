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

  // Desktop Mouse Drag state
  const isMouseDown = useRef(false);
  const mouseStartX = useRef(0);
  const mouseScrollStart = useRef(0);
  const mouseMoved = useRef(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Set initial scroll position to set 1 so reverse scrolling works immediately
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
    const t = setTimeout(setInitial, 60);
    return () => clearTimeout(t);
  }, [items.length]);

  // Seamless Infinite Loop animation
  useEffect(() => {
    let lastTime = performance.now();
    const speed = 0.6; // pixels per frame at 60fps

    const loop = (currentTime: number) => {
      const container = containerRef.current;
      const track = trackRef.current;

      if (container && track && !isInteracting.current && !isMouseDown.current) {
        const delta = Math.min((currentTime - lastTime) / 16.67, 2);
        container.scrollLeft += speed * delta;

        const singleSetWidth = track.scrollWidth / 4;
        if (singleSetWidth > 0) {
          if (container.scrollLeft >= singleSetWidth * 2) {
            container.scrollLeft -= singleSetWidth;
          } else if (container.scrollLeft <= 0.1 * singleSetWidth) {
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

  // Wrap around seamlessly on manual user scrolling (touch, wheel, drag)
  const handleScroll = () => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const singleSetWidth = track.scrollWidth / 4;
    if (singleSetWidth > 0) {
      if (container.scrollLeft >= singleSetWidth * 2.5) {
        container.scrollLeft -= singleSetWidth;
        if (isMouseDown.current) {
          mouseScrollStart.current -= singleSetWidth;
        }
      } else if (container.scrollLeft <= 0.15 * singleSetWidth) {
        container.scrollLeft += singleSetWidth;
        if (isMouseDown.current) {
          mouseScrollStart.current += singleSetWidth;
        }
      }
    }

    if (isInteracting.current) {
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
      resumeTimeout.current = setTimeout(() => {
        isInteracting.current = false;
      }, 1500);
    }
  };

  // Touch Handlers (Mobile Touch Pause & Natural Scroll)
  const onTouchStart = () => {
    isInteracting.current = true;
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
  };

  const onTouchEnd = () => {
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => {
      isInteracting.current = false;
    }, 1500);
  };

  // Mouse Handlers (Desktop click & drag in both directions)
  const onMouseDown = (e: React.MouseEvent) => {
    isInteracting.current = true;
    isMouseDown.current = true;
    setIsDragActive(true);
    mouseMoved.current = false;
    mouseStartX.current = e.pageX - (containerRef.current?.offsetLeft || 0);
    mouseScrollStart.current = containerRef.current?.scrollLeft || 0;
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - mouseStartX.current) * 1.4;
    if (Math.abs(walk) > 4) {
      mouseMoved.current = true;
    }
    containerRef.current.scrollLeft = mouseScrollStart.current - walk;
  };

  const onMouseUp = () => {
    isMouseDown.current = false;
    setIsDragActive(false);
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => {
      isInteracting.current = false;
      mouseMoved.current = false;
    }, 1500);
  };

  const onMouseEnter = () => {
    isInteracting.current = true;
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
  };

  const onMouseLeave = () => {
    if (isMouseDown.current) {
      onMouseUp();
    } else {
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
      resumeTimeout.current = setTimeout(() => {
        isInteracting.current = false;
      }, 800);
    }
  };

  // Prevent link click navigation when user was dragging/swiping
  const handleClick = (e: React.MouseEvent) => {
    if (mouseMoved.current) {
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

      {/* Interactive Infinite Loop Container with Touch Pause, Momentum Scroll & Reverse Drag */}
      <div
        ref={containerRef}
        className={`kanakshi-stories-infinite-container ${isDragActive ? "is-dragging" : ""}`}
        onScroll={handleScroll}
        onTouchStart={onTouchStart}
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
