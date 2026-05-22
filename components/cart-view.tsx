"use client";

import Image from "next/image";
import Link from "next/link";

import { formatPrice, resolveAssetUrl } from "../lib/api";
import { getProductPath } from "../lib/site";
import { Coupon, SiteSettings } from "../lib/types";
import { CartQuantityControl } from "./cart-quantity-control";
import { useCart } from "./cart-provider";

export function CartView({ settings, offers }: { settings: SiteSettings; offers: Coupon[] }) {
  const { items, subtotal, clearCart } = useCart();
  const currencySymbol = settings.site_currency_symbol || "₹";

  if (!items.length) {
    return (
      <div className="cart-empty-state">
        <p className="eyebrow">Your Cart</p>
        <h1 className="page-title">No pieces added yet</h1>
        <p className="shop-intro">Start from the shop and add handcrafted products here before checkout.</p>
        <Link href="/shop" className="primary-button">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div className="cart-list">
        {items.map((item) => (
          <article key={item.slug} className="cart-item-card">
            <div className="cart-item-media">
              <Link href={getProductPath({ slug: item.slug, category_slug: null })} className="cart-item-media-shell">
                <div className="cart-item-media-inner">
                  <Image
                    src={resolveAssetUrl(item.image)}
                    alt={item.name}
                    fill
                    sizes="(max-width: 900px) 100vw, 160px"
                    className="cart-item-image"
                  />
                </div>
              </Link>
            </div>

            <div className="cart-item-copy">
              <div className="cart-item-head">
                <div>
                  <p className="product-category">{item.categoryName || "Signature Edit"}</p>
                  <h2>{item.name}</h2>
                </div>
                <p className="detail-price">{formatPrice(item.price, currencySymbol)}</p>
              </div>

              <div className="cart-item-foot">
                <CartQuantityControl slug={item.slug} compact />
                <Link href={getProductPath({ slug: item.slug, category_slug: null })} className="text-link">
                  View product
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="cart-summary-card">
        <p className="eyebrow">Order Summary</p>
        <h2>Ready To Checkout</h2>
        <div className="cart-summary-row">
          <span>Items</span>
          <strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong>
        </div>
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <strong>{formatPrice(subtotal, currencySymbol)}</strong>
        </div>
        <div className="cart-summary-actions" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", width: "100%" }}>
          <Link href="/checkout" className="primary-button" style={{ textAlign: "center", textDecoration: "none", width: "100%" }}>
            Proceed to Secure Checkout
          </Link>

          <button type="button" className="secondary-button" style={{ border: "none", background: "transparent", color: "rgba(var(--rgb-text), 0.5)", textDecoration: "underline", padding: "var(--space-xs) 0", cursor: "pointer", fontSize: "0.875rem" }} onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        {offers.length ? (
          <div className="cart-offers-panel">
            <p className="eyebrow">Available Offers</p>
            <div className="cart-offers-list">
              {offers.map((offer) => (
                <article key={offer.id} className="cart-offer-card">
                  <div className="cart-offer-head">
                    <strong>{offer.title}</strong>
                    <span>{offer.badge_text || offer.code}</span>
                  </div>
                  <p>{offer.description || `${offer.code} can be applied on eligible orders.`}</p>
                  <small>
                    Code: {offer.code}
                    {offer.min_order_amount ? ` · Min order ${formatPrice(offer.min_order_amount, currencySymbol)}` : ""}
                  </small>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
