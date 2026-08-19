"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { formatPrice, resolveAssetUrl } from "../lib/api";
import { getProductPath } from "../lib/site";
import { Coupon, Product, SiteSettings } from "../lib/types";
import { useCart } from "./cart-provider";
import { ProductCard } from "./product-card";

type CartViewProps = {
  settings: SiteSettings;
  offers: Coupon[];
  recommendedProducts?: Product[];
};

export function CartView({ settings, offers = [], recommendedProducts = [] }: CartViewProps) {
  const { items, subtotal, clearCart, removeItem, updateQuantity } = useCart();
  const currencySymbol = settings.site_currency_symbol || "₹";
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Delivery Threshold calculation
  const freeShippingThreshold = Number(settings.min_order_free_shipping || 499);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const isFreeShipping = remainingForFreeShipping === 0;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Coupon copy & apply state
  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ code: string; message: string; success: boolean } | null>(null);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    const matchedOffer = offers.find((o) => o.code.toUpperCase() === code);
    if (matchedOffer) {
      if (matchedOffer.min_order_amount && subtotal < Number(matchedOffer.min_order_amount)) {
        setCouponFeedback({
          code,
          message: `Minimum order amount of ${formatPrice(matchedOffer.min_order_amount, currencySymbol)} required.`,
          success: false,
        });
      } else {
        setCouponFeedback({
          code,
          message: `Coupon "${code}" will be applied at checkout!`,
          success: true,
        });
        navigator.clipboard.writeText(code);
      }
    } else {
      setCouponFeedback({
        code,
        message: `Coupon "${code}" copied! Apply directly at checkout.`,
        success: true,
      });
      navigator.clipboard.writeText(code);
    }
  };

  if (!items.length) {
    return (
      <div className="cart-page-wrapper">
        {/* Breadcrumb Navigation */}
        <nav style={{ display: "flex", gap: "8px", fontSize: "0.82rem", color: "var(--kanakshi-text-muted)", marginBottom: "24px" }}>
          <Link href="/" style={{ color: "var(--kanakshi-text-muted)", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <span style={{ color: "var(--kanakshi-pink)", fontWeight: "600" }}>Shopping Bag</span>
        </nav>

        {/* Empty State Card */}
        <div
          style={{
            maxWidth: "640px",
            margin: "0 auto 56px",
            textAlign: "center",
            padding: "52px 28px",
            background: "#ffffff",
            borderRadius: "var(--radius-lg)",
            border: "1px solid #ede8e3",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              backgroundColor: "var(--kanakshi-pink-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--kanakshi-pink)",
            }}
          >
            <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>

          <span className="kanakshi-badge kanakshi-badge-pink" style={{ marginBottom: "12px", display: "inline-block" }}>
            Your Shopping Bag
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.2rem", fontWeight: "700", color: "var(--kanakshi-black)", marginBottom: "12px" }}>
            Your Jewellery Bag is Empty
          </h1>
          <p style={{ fontSize: "0.92rem", color: "#666666", maxWidth: "460px", margin: "0 auto 28px", lineHeight: "1.6" }}>
            Explore certified 925 sterling silver, 18K solid gold, and lab-grown diamond solitaires crafted for everyday elegance.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/shop" className="kanakshi-btn kanakshi-btn-primary" style={{ padding: "0 32px" }}>
              Explore All Jewellery
            </Link>
            <Link href="/shop?category=rings" className="kanakshi-btn kanakshi-btn-secondary" style={{ padding: "0 24px" }}>
              Shop Rings &amp; Solitaires
            </Link>
          </div>
        </div>

        {/* Recommended Products Grid */}
        {recommendedProducts.length > 0 && (
          <section style={{ marginTop: "40px" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <span className="kanakshi-section-eyebrow">Curated for You</span>
              <h2 className="kanakshi-section-title" style={{ fontSize: "1.8rem" }}>Trending Fine Jewellery</h2>
              <p className="kanakshi-section-subtitle">Handcrafted pieces our patrons are loving right now</p>
            </div>

            <div className="kanakshi-product-grid">
              {recommendedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      {/* Breadcrumb Navigation */}
      <nav style={{ display: "flex", gap: "8px", fontSize: "0.82rem", color: "var(--kanakshi-text-muted)", marginBottom: "20px" }}>
        <Link href="/" style={{ color: "var(--kanakshi-text-muted)", textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <span style={{ color: "var(--kanakshi-pink)", fontWeight: "600" }}>Shopping Bag</span>
      </nav>

      {/* Free Shipping Progress Meter */}
      <div className={`cart-delivery-banner ${isFreeShipping ? "unlocked" : ""}`}>
        <div className="cart-delivery-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", color: isFreeShipping ? "#15803d" : "#111111" }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isFreeShipping ? "#16a34a" : "var(--kanakshi-pink)" }}>
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            {isFreeShipping ? (
              <span>Unlocked! You qualify for <strong>FREE Insured Express Delivery</strong> across India.</span>
            ) : (
              <span>Add <strong>{formatPrice(remainingForFreeShipping, currencySymbol)}</strong> more for <strong>FREE Insured Express Delivery</strong>!</span>
            )}
          </div>
          <span style={{ fontSize: "0.78rem", fontWeight: "700", color: isFreeShipping ? "#16a34a" : "#777777" }}>
            {isFreeShipping ? "100% Free Shipping" : `${freeShippingProgress}% of ${formatPrice(freeShippingThreshold, currencySymbol)}`}
          </span>
        </div>

        <div className="cart-delivery-bar-track">
          <div
            className="cart-delivery-bar-fill"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="cart-grid-layout">
        
        {/* Left Column: Cart Items List */}
        <div>
          <div className="cart-items-card">
            <div className="cart-header-row">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: "700", color: "#111111", margin: 0 }}>
                  Shopping Bag
                </h1>
                <span className="kanakshi-badge kanakshi-badge-pink" style={{ fontSize: "0.78rem" }}>
                  {itemCount} {itemCount === 1 ? "Piece" : "Pieces"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear your shopping bag?")) {
                    clearCart();
                  }
                }}
                style={{ background: "none", border: "none", color: "#888888", fontSize: "0.82rem", cursor: "pointer", textDecoration: "underline", padding: "4px" }}
              >
                Clear Bag
              </button>
            </div>

            {/* Items List */}
            <div>
              {items.map((item) => {
                const itemTotal = item.price * item.quantity;
                const productPath = getProductPath({ slug: item.slug, category_slug: item.categorySlug ?? null });

                return (
                  <article key={item.slug} className="cart-item-row">
                    {/* Item Thumbnail */}
                    <Link href={productPath} className="cart-item-image">
                      <Image
                        src={resolveAssetUrl(item.image)}
                        alt={item.name}
                        fill
                        sizes="96px"
                        style={{ objectFit: "cover" }}
                      />
                    </Link>

                    {/* Item Details */}
                    <div className="cart-item-details">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <div>
                          <span className="cart-item-badge">
                            {item.categoryName || "925 Sterling Silver"}
                          </span>
                          <Link href={productPath} style={{ textDecoration: "none" }}>
                            <h2 className="cart-item-name">{item.name}</h2>
                          </Link>
                        </div>

                        {/* Remove Action Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.slug)}
                          className="cart-remove-btn"
                          title="Remove item"
                          aria-label={`Remove ${item.name}`}
                        >
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span>Remove</span>
                        </button>
                      </div>

                      {/* Pricing */}
                      <div className="cart-item-pricing">
                        <span className="cart-item-price-current">
                          {formatPrice(itemTotal, currencySymbol)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="cart-item-price-unit">
                            ({formatPrice(item.price, currencySymbol)} each)
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls & Stock */}
                      <div className="cart-item-controls">
                        <div className="cart-qty-pill">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                removeItem(item.slug);
                              } else {
                                updateQuantity(item.slug, item.quantity - 1);
                              }
                            }}
                            className="cart-qty-btn"
                          >
                            −
                          </button>
                          <span className="cart-qty-number">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                            className="cart-qty-btn"
                          >
                            +
                          </button>
                        </div>

                        <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          In Stock • Insured Express Dispatch
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Continue Shopping Link */}
          <div style={{ marginTop: "20px" }}>
            <Link
              href="/shop"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "#111111",
                fontSize: "0.88rem",
                fontWeight: "600",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              ← Continue Shopping Fine Jewellery
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <aside className="cart-summary-sticky">
          <div className="cart-summary-card">
            <h2 className="cart-summary-title">
              Order Summary
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
              <div className="cart-summary-row">
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <strong>{formatPrice(subtotal, currencySymbol)}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Insured Express Delivery</span>
                {isFreeShipping ? (
                  <strong style={{ color: "#16a34a" }}>FREE</strong>
                ) : (
                  <strong>{formatPrice(settings.default_shipping_cost || 99, currencySymbol)}</strong>
                )}
              </div>

              <div className="cart-summary-row">
                <span>GST &amp; BIS Hallmarking</span>
                <strong style={{ color: "#16a34a" }}>Included (18%)</strong>
              </div>

              {/* Total Row */}
              <div className="cart-summary-total-row">
                <div>
                  <span style={{ fontWeight: "700", color: "#111111", fontSize: "1.05rem", display: "block" }}>
                    Estimated Total
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#888888" }}>
                    Includes all taxes &amp; shipping
                  </span>
                </div>
                <div className="cart-summary-total-price">
                  {formatPrice(subtotal, currencySymbol)}
                </div>
              </div>
            </div>

            {/* Promo Code Application Box */}
            <div className="cart-coupon-box">
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: "700", color: "#111111" }}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <span>Have a Promo Code?</span>
              </div>

              <div className="cart-coupon-input-wrap">
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="cart-coupon-input"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="cart-coupon-btn"
                >
                  Apply
                </button>
              </div>

              {couponFeedback && (
                <div style={{ marginTop: "8px", fontSize: "0.75rem", fontWeight: "600", color: couponFeedback.success ? "#15803d" : "#dc2626" }}>
                  {couponFeedback.message}
                </div>
              )}

              {/* Available Promo Codes */}
              {offers.length > 0 && (
                <div className="cart-promo-chips">
                  {offers.map((offer) => (
                    <div key={offer.id} className="cart-promo-chip-item">
                      <div>
                        <span className="cart-promo-chip-code">{offer.code}</span>
                        <span style={{ marginLeft: "6px", color: "#555555" }}>{offer.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponInput(offer.code);
                          handleApplyCoupon(offer.code);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--kanakshi-pink-dark)",
                          fontWeight: "700",
                          fontSize: "0.74rem",
                          cursor: "pointer",
                          padding: "2px 4px",
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Action CTA */}
            <Link
              href="/checkout"
              className="kanakshi-btn kanakshi-btn-primary kanakshi-btn-block"
              style={{
                padding: "15px 20px",
                fontSize: "1rem",
                fontWeight: "700",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 16px rgba(233, 113, 139, 0.35)",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Proceed to Checkout</span>
              <span>→</span>
            </Link>

            {/* Trust Micro-Badges Grid */}
            <div className="cart-trust-guarantee-grid">
              <div className="cart-trust-item">
                <div className="cart-trust-icon">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <span>100% Certified 925 &amp; Gold</span>
              </div>

              <div className="cart-trust-item">
                <div className="cart-trust-icon">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </div>
                <span>7-Day Easy Returns</span>
              </div>

              <div className="cart-trust-item">
                <div className="cart-trust-icon">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <span>Insured Express Shipping</span>
              </div>

              <div className="cart-trust-item">
                <div className="cart-trust-icon">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span>256-Bit Bank Grade SSL</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Real Recommended Products from Store Database */}
      {recommendedProducts.length > 0 && (
        <section style={{ marginTop: "64px", paddingTop: "40px", borderTop: "1px solid #ece8e4" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <span className="kanakshi-section-eyebrow">Pair &amp; Match</span>
            <h2 className="kanakshi-section-title" style={{ fontSize: "1.8rem" }}>Complete Your Fine Jewellery Look</h2>
            <p className="kanakshi-section-subtitle">Specially curated fine pieces to complement your selection</p>
          </div>

          <div className="kanakshi-product-grid">
            {recommendedProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
