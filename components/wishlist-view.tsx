"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, resolveAssetUrl } from "../lib/api";
import { getProductPath } from "../lib/site";
import { Product, SiteSettings } from "../lib/types";
import { useCart } from "./cart-provider";
import { useWishlist } from "./wishlist-provider";
import { KanakshiTrustBadges } from "./kanakshi-trust-badges";
import { ProductCard } from "./product-card";

type WishlistViewProps = {
  settings: SiteSettings;
  recommendedProducts?: Product[];
};

export function WishlistView({ settings, recommendedProducts = [] }: WishlistViewProps) {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem, getItemQuantity, setAddedModalOpen } = useCart();
  const currencySymbol = settings.site_currency_symbol || "₹";

  const handleMoveAllToBag = () => {
    items.forEach((item) => {
      addItem({
        id: item.id,
        slug: item.slug,
        name: item.name,
        price: item.price,
        images: [item.image],
        category_name: item.categoryName,
        category_slug: item.categorySlug ?? null,
      });
    });
    setAddedModalOpen(true);
  };

  if (!items.length) {
    return (
      <div className="kanakshi-container" style={{ paddingTop: "32px", paddingBottom: "72px" }}>
        {/* Breadcrumb Navigation */}
        <nav style={{ display: "flex", gap: "8px", fontSize: "0.82rem", color: "var(--kanakshi-text-muted)", marginBottom: "24px" }}>
          <Link href="/" style={{ color: "var(--kanakshi-text-muted)", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <span style={{ color: "var(--kanakshi-pink)", fontWeight: "600" }}>Wishlist</span>
        </nav>

        {/* Empty State Box */}
        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto 64px",
            textAlign: "center",
            padding: "48px 24px",
            background: "#ffffff",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--kanakshi-border)",
            boxShadow: "var(--shadow-sm)"
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              backgroundColor: "var(--kanakshi-pink-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--kanakshi-pink)"
            }}
          >
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>

          <span className="kanakshi-badge kanakshi-badge-pink" style={{ marginBottom: "12px", display: "inline-block" }}>
            My Saved Pieces
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: "600", color: "var(--kanakshi-black)", marginBottom: "10px" }}>
            Your Wishlist is Empty
          </h1>
          <p style={{ fontSize: "0.92rem", color: "var(--kanakshi-text-body)", maxWidth: "440px", margin: "0 auto 24px", lineHeight: "1.6" }}>
            Save your favourite 925 sterling silver rings, necklaces, earrings, and lab-grown diamond solitaires to buy whenever you&apos;re ready.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/shop" className="kanakshi-btn kanakshi-btn-primary" style={{ padding: "0 28px" }}>
              Explore All Fine Jewellery
            </Link>
            <Link href="/shop/rings" className="kanakshi-btn kanakshi-btn-secondary" style={{ padding: "0 24px" }}>
              Shop Rings
            </Link>
          </div>
        </div>

        {/* Recommended Fine Jewellery Picks */}
        {recommendedProducts.length > 0 && (
          <section style={{ marginTop: "32px", marginBottom: "48px" }}>
            <div className="kanakshi-section-header">
              <span className="kanakshi-section-eyebrow">Handpicked Sparkle</span>
              <h2 className="kanakshi-section-title">Trending Bestsellers You May Love</h2>
              <p className="kanakshi-section-subtitle">Discover popular fine jewellery designs shortlisted by thousands of happy customers.</p>
            </div>

            <div className="kanakshi-product-grid">
              {recommendedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} />
              ))}
            </div>
          </section>
        )}

        {/* Trust Badges Reassurance */}
        <KanakshiTrustBadges />
      </div>
    );
  }

  return (
    <div className="kanakshi-container" style={{ paddingTop: "32px", paddingBottom: "72px" }}>
      {/* Breadcrumb Navigation */}
      <nav style={{ display: "flex", gap: "8px", fontSize: "0.82rem", color: "var(--kanakshi-text-muted)", marginBottom: "20px" }}>
        <Link href="/" style={{ color: "var(--kanakshi-text-muted)", textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <span style={{ color: "var(--kanakshi-pink)", fontWeight: "600" }}>Wishlist</span>
      </nav>

      {/* Wishlist Header & Action Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
          paddingBottom: "18px",
          borderBottom: "1px solid var(--kanakshi-border)"
        }}
      >
        <div>
          <span className="kanakshi-badge kanakshi-badge-pink" style={{ marginBottom: "8px", display: "inline-block" }}>
            {items.length} {items.length === 1 ? "Item Saved" : "Items Saved"}
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.2rem", fontWeight: "600", color: "var(--kanakshi-black)", lineHeight: "1.2" }}>
            My Saved Sparkle
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--kanakshi-text-muted)", marginTop: "4px" }}>
            Shortlist your favourite handcrafted jewellery pieces and move them to your bag anytime.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            type="button"
            className="kanakshi-btn kanakshi-btn-secondary"
            onClick={clearWishlist}
            style={{ fontSize: "0.82rem", padding: "0 18px" }}
          >
            Clear Wishlist
          </button>

          <button
            type="button"
            className="kanakshi-btn kanakshi-btn-primary"
            onClick={handleMoveAllToBag}
            style={{ fontSize: "0.82rem", padding: "0 22px", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Move All to Bag
          </button>
        </div>
      </div>

      {/* Wishlist Items Grid */}
      <div className="kanakshi-product-grid" style={{ marginBottom: "64px" }}>
        {items.map((item) => {
          const quantityInCart = getItemQuantity(item.slug);
          const productPath = getProductPath({ slug: item.slug, category_slug: item.categorySlug ?? null });

          return (
            <article key={item.slug} className="kanakshi-card">
              <div className="kanakshi-card-media">
                <Link href={productPath} style={{ display: "block", width: "100%", height: "100%", position: "relative" }}>
                  <Image
                    src={resolveAssetUrl(item.image)}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="kanakshi-card-img-primary"
                  />
                </Link>

                {/* Remove from Wishlist Button */}
                <button
                  type="button"
                  className="kanakshi-card-wishlist active"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeItem(item.slug);
                  }}
                  aria-label="Remove from wishlist"
                  title="Remove from wishlist"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {/* Category / Material Badge */}
                <div className="kanakshi-card-badges">
                  <span className="kanakshi-badge kanakshi-badge-silver">
                    {item.categoryName || "925 Sterling Silver"}
                  </span>
                </div>
              </div>

              <div className="kanakshi-card-body">
                <div className="kanakshi-card-material">
                  925 Sterling Silver • Anti-Tarnish
                </div>

                <Link href={productPath} className="kanakshi-card-title">
                  {item.name}
                </Link>

                <div className="kanakshi-card-price-row">
                  <span className="kanakshi-card-sale-price">
                    {formatPrice(item.price, currencySymbol)}
                  </span>
                  <span className="kanakshi-card-discount-pill">
                    Special Offer
                  </span>
                </div>

                <div className="kanakshi-card-delivery-tag">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>Express 2-Day Delivery</span>
                </div>

                {/* Move to Bag Action Button */}
                <button
                  type="button"
                  className="kanakshi-card-quick-add"
                  style={{
                    backgroundColor: quantityInCart > 0 ? "var(--kanakshi-bg-alt)" : "var(--kanakshi-black)",
                    color: quantityInCart > 0 ? "var(--kanakshi-black)" : "#ffffff",
                    borderColor: quantityInCart > 0 ? "var(--kanakshi-border-dark)" : "var(--kanakshi-black)"
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({
                      id: item.id,
                      slug: item.slug,
                      name: item.name,
                      price: item.price,
                      images: [item.image],
                      category_name: item.categoryName,
                      category_slug: item.categorySlug ?? null,
                    });
                    setAddedModalOpen(true);
                  }}
                >
                  {quantityInCart > 0 ? `In Bag (${quantityInCart}) • Add More +` : "Move to Bag"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Trust & Hallmarking Reassurance Strip */}
      <KanakshiTrustBadges />
    </div>
  );
}
