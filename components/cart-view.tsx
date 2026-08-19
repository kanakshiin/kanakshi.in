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

export function CartView({ settings, offers, recommendedProducts = [] }: CartViewProps) {
  const { items, subtotal, clearCart, removeItem, updateQuantity, addItem } = useCart();
  const currencySymbol = settings.site_currency_symbol || "₹";
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Delivery Threshold calculation
  const freeShippingThreshold = Number(settings.min_order_free_shipping || 499);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Copy code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Upsell quick add items
  const upsellItems = [
    {
      id: 9001,
      slug: "anti-tarnish-polishing-cloth",
      name: "Anti-Tarnish Silver Polishing Cloth",
      price: 99,
      image: "/jewellery/tennis-bracelet.jpg",
      categoryName: "Jewellery Care",
      desc: "Micro-abrasive cloth restores mirror sparkle.",
    },
    {
      id: 9002,
      slug: "luxury-velvet-gift-box",
      name: "Signature Velvet Box & Gift Bag",
      price: 149,
      image: "/jewellery/solitaire-ring.jpg",
      categoryName: "Luxury Gifting",
      desc: "Plush velvet jewellery box + custom card.",
    },
  ];

  const handleAddUpsell = (upsell: (typeof upsellItems)[0]) => {
    addItem({
      id: upsell.id,
      slug: upsell.slug,
      name: upsell.name,
      price: upsell.price,
      images: [upsell.image],
      category_name: upsell.categoryName,
    });
  };

  if (!items.length) {
    return (
      <div className="kanakshi-container" style={{ paddingTop: "32px", paddingBottom: "72px" }}>
        {/* Breadcrumb Navigation */}
        <nav style={{ display: "flex", gap: "8px", fontSize: "0.82rem", color: "var(--kanakshi-text-muted)", marginBottom: "24px" }}>
          <Link href="/" style={{ color: "var(--kanakshi-text-muted)", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <span style={{ color: "var(--kanakshi-pink)", fontWeight: "600" }}>Shopping Bag</span>
        </nav>

        {/* Empty State Card */}
        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto 56px",
            textAlign: "center",
            padding: "48px 24px",
            background: "#ffffff",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--kanakshi-border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              width: "76px",
              height: "76px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              backgroundColor: "var(--kanakshi-pink-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--kanakshi-pink)",
            }}
          >
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>

          <span className="kanakshi-badge kanakshi-badge-pink" style={{ marginBottom: "12px", display: "inline-block" }}>
            Your Shopping Bag
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.2rem", fontWeight: "600", color: "var(--kanakshi-black)", marginBottom: "12px" }}>
            Your Jewellery Bag is Empty
          </h1>
          <p style={{ fontSize: "0.92rem", color: "var(--kanakshi-text-body)", maxWidth: "460px", margin: "0 auto 28px", lineHeight: "1.6" }}>
            Add everyday luxury to your collection. Discover certified 925 sterling silver, 18K solid gold, and lab-grown diamond solitaires.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/shop" className="kanakshi-btn kanakshi-btn-primary" style={{ padding: "0 32px" }}>
              Explore All Fine Jewellery
            </Link>
            <Link href="/shop/rings" className="kanakshi-btn kanakshi-btn-secondary" style={{ padding: "0 24px" }}>
              Shop Rings & Solitaires
            </Link>
          </div>
        </div>

        {/* Recommended Products Grid */}
        {recommendedProducts.length > 0 && (
          <section style={{ marginTop: "32px" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <span className="kanakshi-section-eyebrow">Curated for You</span>
              <h2 className="kanakshi-section-title" style={{ fontSize: "1.8rem" }}>Trending Jewellery Bestsellers</h2>
              <p className="kanakshi-section-subtitle">Handcrafted fine pieces our patrons are loving right now</p>
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
    <div className="kanakshi-container" style={{ paddingTop: "28px", paddingBottom: "72px" }}>
      {/* Breadcrumb Navigation */}
      <nav style={{ display: "flex", gap: "8px", fontSize: "0.82rem", color: "var(--kanakshi-text-muted)", marginBottom: "20px" }}>
        <Link href="/" style={{ color: "var(--kanakshi-text-muted)", textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <span style={{ color: "var(--kanakshi-pink)", fontWeight: "600" }}>Shopping Bag</span>
      </nav>

      {/* Free Shipping Progress Meter */}
      <div
        style={{
          background: remainingForFreeShipping === 0 ? "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)" : "#ffffff",
          border: remainingForFreeShipping === 0 ? "1px solid #81c784" : "1px solid var(--kanakshi-border)",
          borderRadius: "var(--radius-md)",
          padding: "14px 20px",
          marginBottom: "28px",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", fontWeight: "600", color: remainingForFreeShipping === 0 ? "#1b5e20" : "var(--kanakshi-black)" }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: remainingForFreeShipping === 0 ? "#2e7d32" : "var(--kanakshi-pink)" }}>
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            {remainingForFreeShipping === 0 ? (
              <span>Unlocked! You qualify for <strong>FREE Insured Express Delivery</strong> across India.</span>
            ) : (
              <span>Add <strong>{formatPrice(remainingForFreeShipping, currencySymbol)}</strong> more to get <strong>FREE Insured Express Delivery</strong>!</span>
            )}
          </div>
          <span style={{ fontSize: "0.78rem", fontWeight: "700", color: remainingForFreeShipping === 0 ? "#2e7d32" : "var(--kanakshi-text-muted)" }}>
            {remainingForFreeShipping === 0 ? "100% Free Shipping" : `${freeShippingProgress}% of ${formatPrice(freeShippingThreshold, currencySymbol)}`}
          </span>
        </div>

        <div style={{ height: "6px", width: "100%", background: "#f0ece4", borderRadius: "999px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${freeShippingProgress}%`,
              background: remainingForFreeShipping === 0 ? "linear-gradient(90deg, #4caf50, #2e7d32)" : "linear-gradient(90deg, var(--kanakshi-pink), #d4af37)",
              borderRadius: "999px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "start" }}>
        
        {/* Left Column: Cart Items List */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", paddingBottom: "12px", borderBottom: "1px solid var(--kanakshi-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", fontWeight: "600", color: "var(--kanakshi-black)", margin: 0 }}>
                Shopping Bag
              </h1>
              <span className="kanakshi-badge kanakshi-badge-pink" style={{ fontSize: "0.78rem" }}>
                {itemCount} {itemCount === 1 ? "Piece" : "Pieces"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to remove all items from your bag?")) {
                  clearCart();
                }
              }}
              style={{ background: "none", border: "none", color: "var(--kanakshi-text-muted)", fontSize: "0.82rem", cursor: "pointer", textDecoration: "underline", padding: "4px" }}
            >
              Clear Bag
            </button>
          </div>

          {/* Items List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
            {items.map((item) => {
              const itemTotal = item.price * item.quantity;
              const productPath = getProductPath({ slug: item.slug, category_slug: item.categorySlug ?? null });

              return (
                <article
                  key={item.slug}
                  style={{
                    display: "flex",
                    gap: "18px",
                    background: "#ffffff",
                    border: "1px solid var(--kanakshi-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                    boxShadow: "var(--shadow-xs)",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Item Image Thumbnail */}
                  <Link
                    href={productPath}
                    style={{
                      position: "relative",
                      width: "92px",
                      height: "92px",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      flexShrink: 0,
                      backgroundColor: "var(--kanakshi-bg-alt)",
                      border: "1px solid var(--kanakshi-border)",
                    }}
                  >
                    <Image
                      src={resolveAssetUrl(item.image)}
                      alt={item.name}
                      fill
                      sizes="92px"
                      style={{ objectFit: "cover" }}
                    />
                  </Link>

                  {/* Item Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "4px" }}>
                      <div>
                        <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--kanakshi-gold)", fontWeight: "700" }}>
                          {item.categoryName || "925 Sterling Silver"}
                        </span>
                        <Link href={productPath} style={{ textDecoration: "none", display: "block" }}>
                          <h2 style={{ fontSize: "0.98rem", fontWeight: "600", color: "var(--kanakshi-black)", margin: "2px 0 0", lineHeight: "1.35" }}>
                            {item.name}
                          </h2>
                        </Link>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.slug)}
                        aria-label="Remove item"
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--kanakshi-text-muted)",
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#d32f2f")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--kanakshi-text-muted)")}
                        title="Remove from bag"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>

                    {/* Unit Price and Subtotal */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "6px 0 12px" }}>
                      <span style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--kanakshi-black)" }}>
                        {formatPrice(itemTotal, currencySymbol)}
                      </span>
                      {item.quantity > 1 && (
                        <span style={{ fontSize: "0.78rem", color: "var(--kanakshi-text-muted)" }}>
                          ({formatPrice(item.price, currencySymbol)} each)
                        </span>
                      )}
                    </div>

                    {/* Quantity Pill Controls */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          border: "1px solid var(--kanakshi-border)",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--kanakshi-bg-alt)",
                          overflow: "hidden",
                        }}
                      >
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
                          style={{
                            width: "32px",
                            height: "30px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--kanakshi-black)",
                            fontWeight: "600",
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            width: "32px",
                            textAlign: "center",
                            fontSize: "0.88rem",
                            fontWeight: "700",
                            color: "var(--kanakshi-black)",
                            background: "#ffffff",
                            lineHeight: "30px",
                            borderLeft: "1px solid var(--kanakshi-border)",
                            borderRight: "1px solid var(--kanakshi-border)",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                          style={{
                            width: "32px",
                            height: "30px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--kanakshi-black)",
                            fontWeight: "600",
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "#2e7d32", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          In Stock • Ready to Dispatch
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* 1-Click Fine Care & Gifting Upsells */}
          <div
            style={{
              background: "#ffffff",
              border: "1px dashed var(--kanakshi-gold)",
              borderRadius: "var(--radius-md)",
              padding: "18px 20px",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--kanakshi-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--kanakshi-black)", margin: 0 }}>
                Enhance Your Fine Jewellery Experience
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
              {upsellItems.map((upsell) => {
                const alreadyInCart = items.some((i) => i.slug === upsell.slug);

                return (
                  <div
                    key={upsell.slug}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "var(--kanakshi-bg-alt)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--kanakshi-border)",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "0.85rem", color: "var(--kanakshi-black)", display: "block" }}>
                        {upsell.name}
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--kanakshi-text-muted)" }}>
                        {formatPrice(upsell.price, currencySymbol)} • {upsell.desc}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={alreadyInCart}
                      onClick={() => handleAddUpsell(upsell)}
                      style={{
                        background: alreadyInCart ? "#e0e0e0" : "var(--kanakshi-pink)",
                        color: alreadyInCart ? "#888888" : "#ffffff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        cursor: alreadyInCart ? "default" : "pointer",
                        whiteSpace: "nowrap",
                        marginLeft: "10px",
                        transition: "background 0.2s",
                      }}
                    >
                      {alreadyInCart ? "Added" : `+ Add (${formatPrice(upsell.price, currencySymbol)})`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Continue Shopping Link */}
          <div>
            <Link
              href="/shop"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--kanakshi-black)",
                fontSize: "0.88rem",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              ← Continue Shopping Fine Jewellery
            </Link>
          </div>
        </div>

        {/* Right Column: Sticky Order Summary & Available Coupons */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "24px", position: "sticky", top: "100px" }}>
          
          {/* Order Summary Box */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--kanakshi-border)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: "600", color: "var(--kanakshi-black)", margin: "0 0 18px", paddingBottom: "12px", borderBottom: "1px solid var(--kanakshi-border)" }}>
              Order Summary
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--kanakshi-text-body)" }}>
                <span>Item Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <strong style={{ color: "var(--kanakshi-black)" }}>{formatPrice(subtotal, currencySymbol)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--kanakshi-text-body)" }}>
                <span>Insured Express Delivery</span>
                {remainingForFreeShipping === 0 ? (
                  <strong style={{ color: "#2e7d32" }}>FREE</strong>
                ) : (
                  <strong style={{ color: "var(--kanakshi-black)" }}>{formatPrice(settings.default_shipping_cost || 99, currencySymbol)}</strong>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--kanakshi-text-body)" }}>
                <span>GST & Authenticity Card</span>
                <strong style={{ color: "#2e7d32" }}>Included (18%)</strong>
              </div>

              {/* Prepaid Special Discount Hint */}
              <div
                style={{
                  background: "linear-gradient(135deg, #fff5f7 0%, #fef0f2 100%)",
                  border: "1px dashed var(--kanakshi-pink)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 12px",
                  fontSize: "0.8rem",
                  color: "var(--kanakshi-pink)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span><strong>Prepaid Extra 5% OFF</strong> will be automatically calculated at checkout when you pay via UPI or Card.</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--kanakshi-border)",
                  fontSize: "1.1rem",
                }}
              >
                <span style={{ fontWeight: "700", color: "var(--kanakshi-black)" }}>Estimated Total</span>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontSize: "1.45rem", fontWeight: "700", color: "var(--kanakshi-pink)", fontFamily: "var(--font-heading)" }}>
                    {formatPrice(subtotal, currencySymbol)}
                  </strong>
                  <span style={{ display: "block", fontSize: "0.72rem", color: "var(--kanakshi-text-muted)" }}>
                    Taxes included • Free shipping across India
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Action Button */}
            <Link
              href="/checkout"
              className="kanakshi-btn kanakshi-btn-primary kanakshi-btn-block"
              style={{
                padding: "14px 20px",
                fontSize: "1rem",
                fontWeight: "700",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(233, 113, 139, 0.35)",
              }}
            >
              Proceed to Secure Checkout →
            </Link>

            {/* Trust Micro-Badges */}
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--kanakshi-border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.75rem", color: "var(--kanakshi-text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span>100% Certified 925</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span>7-Day Easy Returns</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>Anti-Tarnish Coating</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>100% Safe Payments</span>
              </div>
            </div>
          </div>

          {/* Available Offers & Promo Codes */}
          {offers.length > 0 && (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid var(--kanakshi-border)",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--kanakshi-black)", margin: 0 }}>
                  Available Promo Codes
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    style={{
                      border: "1px dashed var(--kanakshi-border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 12px",
                      background: "var(--kanakshi-bg-alt)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <code style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--kanakshi-pink)", background: "#ffffff", padding: "2px 6px", borderRadius: "4px", border: "1px solid #fed7e2" }}>
                          {offer.code}
                        </code>
                        <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--kanakshi-black)" }}>
                          {offer.title}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "var(--kanakshi-text-muted)", margin: "4px 0 0" }}>
                        {offer.description || (offer.min_order_amount ? `On orders above ${formatPrice(offer.min_order_amount, currencySymbol)}` : "Applicable at checkout")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(offer.code)}
                      style={{
                        background: copiedCode === offer.code ? "#2e7d32" : "#ffffff",
                        color: copiedCode === offer.code ? "#ffffff" : "var(--kanakshi-black)",
                        border: "1px solid var(--kanakshi-border)",
                        padding: "5px 10px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s",
                      }}
                    >
                      {copiedCode === offer.code ? "Copied" : "Copy Code"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Recommended Section (If available) */}
      {recommendedProducts.length > 0 && (
        <section style={{ marginTop: "64px", paddingTop: "40px", borderTop: "1px solid var(--kanakshi-border)" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <span className="kanakshi-section-eyebrow">Pair & Match</span>
            <h2 className="kanakshi-section-title" style={{ fontSize: "1.8rem" }}>Complete Your Jewellery Look</h2>
            <p className="kanakshi-section-subtitle">Specially selected fine pieces to complement your selection</p>
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
