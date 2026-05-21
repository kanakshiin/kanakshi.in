"use client";

import Image from "next/image";
import Link from "next/link";

import { formatPrice, resolveAssetUrl } from "../lib/api";
import { SiteSettings } from "../lib/types";
import { CartQuantityControl } from "./cart-quantity-control";
import { useCart } from "./cart-provider";

export function CartView({ settings }: { settings: SiteSettings }) {
  const { items, subtotal, clearCart } = useCart();
  const currencySymbol = settings.site_currency_symbol || "₹";
  const whatsappNumber = (settings.site_phone || settings.site_email || "").replace(/[^\d+]/g, "");
  const whatsappMessage = encodeURIComponent(
    items.length
      ? `Hello Little Divinity, I want to order these items:\n${items
          .map((item) => `- ${item.name} x ${item.quantity}`)
          .join("\n")}`
      : "Hello Little Divinity"
  );

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
              <Image
                src={resolveAssetUrl(item.image)}
                alt={item.name}
                fill
                sizes="(max-width: 900px) 100vw, 18vw"
              />
            </div>

            <div className="cart-item-copy">
              <p className="product-category">{item.categoryName || "Signature Edit"}</p>
              <h2>{item.name}</h2>
              <p className="detail-price">{formatPrice(item.price, currencySymbol)}</p>

              <div className="cart-item-controls">
                <CartQuantityControl slug={item.slug} />
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
        <div className="cart-summary-actions">
          <a
            href={whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/^\+/, "")}?text=${whatsappMessage}` : "/shop"}
            className="primary-button"
            target="_blank"
            rel="noreferrer"
          >
            Order on WhatsApp
          </a>
          <button type="button" className="secondary-button" onClick={clearCart}>
            Clear Cart
          </button>
        </div>
      </aside>
    </div>
  );
}
