"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { formatPrice, resolveAssetUrl } from "../lib/api";
import { getProductPath } from "../lib/site";

export function AddToCartPopup() {
  const { isAddedModalOpen, lastAddedItem, setAddedModalOpen, subtotal } = useCart();
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes countdown
  const currencySymbol = "₹";

  // Reset timer on open
  useEffect(() => {
    if (isAddedModalOpen) {
      setTimeLeft(600);
    }
  }, [isAddedModalOpen]);

  // Countdown timer logic
  useEffect(() => {
    if (!isAddedModalOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isAddedModalOpen, timeLeft]);

  if (!isAddedModalOpen || !lastAddedItem) return null;

  // Format time (MM:SS)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Delivery Threshold Calculation
  const isFreeDelivery = subtotal >= 999;
  const difference = 999 - subtotal;

  return (
    <div className="cart-popup-backdrop" onClick={() => setAddedModalOpen(false)}>
      <div 
        className="cart-popup-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "popup-scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
      >
        {/* Urgent Ticker Band */}
        <div className="cart-popup-ticker">
          <div className="ticker-pulse"></div>
          <span>⚡ Exclusive Deal Reserved: checkout within <strong>{formattedTime}</strong> for extra benefits!</span>
        </div>

        {/* Close Button */}
        <button 
          className="cart-popup-close-btn" 
          onClick={() => setAddedModalOpen(false)}
          aria-label="Close modal"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Success Header */}
        <div className="cart-popup-header">
          <div className="success-icon-wrap">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <h3>Added to cart successfully!</h3>
            <p>Your premium brass selection is saved.</p>
          </div>
        </div>

        {/* Product Preview */}
        <div className="cart-popup-product-card">
          <div className="product-card-img-wrap">
            <Image
              src={resolveAssetUrl(lastAddedItem.image)}
              alt={lastAddedItem.name}
              fill
              sizes="80px"
              className="product-card-img"
            />
          </div>
          <div className="product-card-details">
            <span className="product-card-cat">{lastAddedItem.categoryName || "Premium Brass Collection"}</span>
            <h4 className="product-card-title">{lastAddedItem.name}</h4>
            <div className="product-card-meta-row">
              <span className="product-card-qty">Qty: {lastAddedItem.quantity}</span>
              <strong className="product-card-price">{formatPrice(lastAddedItem.price, currencySymbol)}</strong>
            </div>
          </div>
        </div>

        {/* Exclusive Premium Offers & Value Props */}
        <div className="cart-popup-offers">
          {/* Free Shipping Alert with dynamic progress bar */}
          <div className="offer-item shipping-offer">
            <div className="offer-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <div className="offer-copy">
              {isFreeDelivery ? (
                <>
                  <strong>🎉 Your order qualifies for FREE Delivery!</strong>
                  <p>Standard delivery charges (₹99) waived completely.</p>
                </>
              ) : (
                <>
                  <strong>Add {formatPrice(difference, currencySymbol)} more for Free Shipping</strong>
                  <div className="shipping-progress-track">
                    <div 
                      className="shipping-progress-bar" 
                      style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Extra 5% Prepaid Discount */}
          <div className="offer-item discount-offer">
            <div className="offer-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
            <div className="offer-copy">
              <strong>💳 Extra 5% OFF on Prepaid Orders</strong>
              <p>Pay online via UPI, Cards, or NetBanking to save an extra 5% instantly.</p>
            </div>
          </div>

          {/* First Order Discount Coupon */}
          <div className="offer-item coupon-offer">
            <div className="offer-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
            </div>
            <div className="offer-copy">
              <strong>🏷️ Welcome Coupon Available</strong>
              <p>Apply code <span className="coupon-highlight">WELCOME10</span> at checkout for **10% extra discount**.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="cart-popup-actions">
          <Link 
            href="/checkout" 
            className="popup-btn-primary"
            onClick={() => setAddedModalOpen(false)}
          >
            <span>Proceed to Secure Checkout</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
          <button 
            className="popup-btn-secondary" 
            onClick={() => setAddedModalOpen(false)}
          >
            Continue Gifting & Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
