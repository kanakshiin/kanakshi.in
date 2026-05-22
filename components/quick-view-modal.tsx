"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { discountPercent, formatPrice, parseProductImages, resolveAssetUrl } from "../lib/api";
import { getProductPath } from "../lib/site";
import { Product } from "../lib/types";
import { AddToCartButton } from "./add-to-cart-button";
import { useWishlist } from "./wishlist-provider";
import { useCart } from "./cart-provider";

type QuickViewModalProps = {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
};

export function QuickViewModal({ product, isOpen, onClose, currencySymbol }: QuickViewModalProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [mounted, setMounted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const parsedImages = parseProductImages(product.images);
  const discount = discountPercent(product);
  const currentPrice = formatPrice(product.effective_price ?? product.price, currencySymbol);
  
  const comparePrice =
    Number(product.sale_price || 0) > 0 && Number(product.sale_price || 0) < Number(product.price)
      ? formatPrice(product.price, currencySymbol)
      : null;

  const { toggleItem, hasItem } = useWishlist();
  const isWishlisted = hasItem(product.slug);
  const productPath = getProductPath(product);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when the modal is open
  useEffect(() => {
    if (isOpen && mounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mounted]);

  // Reset active image index when product changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [product]);

  if (!isOpen || !mounted) {
    return null;
  }

  const activeImageSrc = parsedImages.length > 0
    ? resolveAssetUrl(parsedImages[activeImageIndex])
    : "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80";

  // Use React Portal to mount under body to avoid relative stacking contexts/transforms and flickering
  return createPortal(
    <div className="quickview-overlay" onClick={onClose}>
      <div 
        className="quickview-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qv-title"
      >
        {/* Floating Close Button */}
        <button 
          type="button" 
          className="quickview-close-btn" 
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Gallery / Slider Column */}
        <div className="quickview-gallery">
          <div className="quickview-active-image-wrap">
            <Image
              src={activeImageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              priority
              className="quickview-active-image"
            />
            {discount ? <span className="product-badge">Sale {discount}%</span> : null}
          </div>

          {/* Thumbnail Slider / Selector Strip */}
          {parsedImages.length > 1 ? (
            <div className="quickview-thumbs">
              {parsedImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`quickview-thumb-btn${idx === activeImageIndex ? " active" : ""}`}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View product image ${idx + 1}`}
                >
                  <Image
                    src={resolveAssetUrl(img)}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Details Column */}
        <div className="quickview-details">
          <div className="quickview-details-header">
            <p className="product-category">{product.category_name || "Signature Edit"}</p>
            <h2 id="qv-title" className="quickview-title">{product.name}</h2>
            
            <div className="price-row" style={{ margin: "1rem 0" }}>
              <strong className="quickview-price">{currentPrice}</strong>
              {comparePrice ? <span className="quickview-compare-price">{comparePrice}</span> : null}
            </div>

            <hr className="quickview-divider" />
            
            {product.short_desc ? (
              <p className="quickview-snippet">{product.short_desc}</p>
            ) : product.description ? (
              <p className="quickview-snippet" style={{ display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {product.description}
              </p>
            ) : (
              <p className="quickview-snippet">Handcrafted heirloom accent created to elevate your spaces with spiritual warmth and curated boutique styling.</p>
            )}
          </div>

          {/* Luxury Action Deck: Buy Now, Add to Cart (syncing), and Wishlist */}
          <div className="quickview-details-footer">
            <div className="quickview-actions-wrap" style={{ marginTop: "2rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", width: "100%", alignItems: "center" }}>
                <button
                  type="button"
                  className="primary-button"
                  style={{ width: "100%", minHeight: "2.85rem", padding: "0 1.25rem", margin: 0, border: "0" }}
                  onClick={() => {
                    addItem(product, 1);
                    onClose();
                    router.push("/cart");
                  }}
                >
                  Buy Now
                </button>
                <div style={{ width: "100%" }}>
                  <AddToCartButton 
                    product={product} 
                    className="secondary-button" 
                    label="Add To Cart"
                  />
                </div>
              </div>
              
              <button
                type="button"
                className={`product-card-action ${isWishlisted ? "wishlisted-active" : "muted"}`}
                style={{ width: "100%", marginTop: "0.8rem", minHeight: "2.85rem" }}
                onClick={() => toggleItem(product)}
              >
                {isWishlisted ? "♥ Wishlisted" : "♡ Add to Wishlist"}
              </button>
            </div>
            
            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <Link 
                href={productPath} 
                className="quickview-view-more"
                onClick={onClose}
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
