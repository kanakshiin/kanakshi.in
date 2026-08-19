"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { formatPrice, resolveAssetUrl } from "../lib/api";
import { getProductPath } from "../lib/site";
import { CartQuantityControl } from "./cart-quantity-control";

export function AddToCartPopup() {
  const { isAddedModalOpen, lastAddedItem, setAddedModalOpen, items, subtotal, removeItem } = useCart();
  const currencySymbol = "₹";

  const freeShippingThreshold = 499;
  const freeGiftThreshold = 1999;

  const isFreeShipping = subtotal >= freeShippingThreshold;
  const isFreeGift = subtotal >= freeGiftThreshold;
  const giftDifference = freeGiftThreshold - subtotal;
  const progressPercent = Math.min(100, Math.round((subtotal / freeGiftThreshold) * 100));

  if (!isAddedModalOpen) return null;

  return (
    <div className={`kanakshi-drawer-overlay ${isAddedModalOpen ? "open" : ""}`} onClick={() => setAddedModalOpen(false)}>
      <aside className="kanakshi-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="kanakshi-drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h3 className="kanakshi-drawer-title">Your Jewellery Bag ({items.reduce((acc, it) => acc + it.quantity, 0)})</h3>
          </div>
          <button
            className="kanakshi-drawer-close"
            onClick={() => setAddedModalOpen(false)}
            aria-label="Close cart drawer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Free Shipping & Gift Progress Bar */}
        <div className="kanakshi-cart-progress-box">
          <div className="kanakshi-cart-progress-text">
            {isFreeGift ? (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
                <strong>Unlocked!</strong> Free Silver Polishing Cloth & Free Express Shipping!
              </span>
            ) : (
              <span>
                Add <strong>₹{giftDifference.toLocaleString("en-IN")}</strong> more to unlock <strong>FREE Silver Care Cloth + Velvet Box</strong>!
              </span>
            )}
          </div>
          <div className="kanakshi-cart-progress-track">
            <div className="kanakshi-cart-progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="kanakshi-cart-items-list">
          {items.map((item) => (
            <div key={item.slug} className="kanakshi-cart-item">
              <Link
                href={getProductPath({ slug: item.slug, category_slug: item.categorySlug ?? null })}
                style={{ position: "relative", width: "72px", height: "72px", flexShrink: 0 }}
              >
                <Image
                  src={resolveAssetUrl(item.image)}
                  alt={item.name}
                  fill
                  sizes="72px"
                  className="kanakshi-cart-item-img"
                />
              </Link>

              <div className="kanakshi-cart-item-info">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <Link
                    href={getProductPath({ slug: item.slug, category_slug: item.categorySlug ?? null })}
                    className="kanakshi-cart-item-title"
                  >
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.slug)}
                    style={{ color: "var(--kanakshi-text-subtle)", padding: "0 4px", background: "none", border: "none", cursor: "pointer", display: "flex" }}
                    aria-label="Remove item"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="kanakshi-cart-item-variant">
                  {item.categoryName || "925 Sterling Silver"}
                </div>

                <div className="kanakshi-cart-item-price-row">
                  <span className="kanakshi-cart-item-price">
                    {formatPrice(item.price * item.quantity, currencySymbol)}
                  </span>
                  <CartQuantityControl slug={item.slug} compact />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* One Click Coupon Offer */}
        <div style={{ padding: "12px 20px", background: "var(--kanakshi-pink-subtle)", borderTop: "1px solid var(--kanakshi-border)", fontSize: "0.82rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Coupon <strong>SPARKLE500</strong> available for ₹500 OFF!</span>
            <Link href="/checkout" style={{ color: "var(--kanakshi-pink-dark)", fontWeight: "700" }}>
              Apply at Checkout →
            </Link>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="kanakshi-drawer-footer">
          <div className="kanakshi-drawer-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal, currencySymbol)}</span>
          </div>

          <div className="kanakshi-drawer-summary-row">
            <span>Estimated Shipping</span>
            <span style={{ color: "var(--kanakshi-success)", fontWeight: "700" }}>FREE</span>
          </div>

          <div className="kanakshi-drawer-summary-row total">
            <span>Estimated Total</span>
            <span>{formatPrice(subtotal, currencySymbol)}</span>
          </div>

          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              href="/checkout"
              className="kanakshi-btn kanakshi-btn-primary kanakshi-btn-block"
              style={{ padding: "14px 20px", fontSize: "1rem" }}
              onClick={() => setAddedModalOpen(false)}
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/cart"
              className="kanakshi-btn kanakshi-btn-outline kanakshi-btn-block"
              style={{ padding: "10px 20px", fontSize: "0.88rem" }}
              onClick={() => setAddedModalOpen(false)}
            >
              View Full Bag & Cart
            </Link>
          </div>

          <div style={{ marginTop: "14px", display: "flex", justifyContent: "center", gap: "16px", fontSize: "0.72rem", color: "var(--kanakshi-text-muted)" }}>
            <span>100% Safe Payments</span>
            <span>7-Day Easy Returns</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
