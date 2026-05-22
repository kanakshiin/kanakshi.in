"use client";

import { useState } from "react";
import { Coupon } from "../lib/types";

type OffersWidgetProps = {
  coupons?: Coupon[];
};

type PromoCampaign = {
  code: string;
  description: string;
  badge?: string;
};

export function OffersWidget({ coupons = [] }: OffersWidgetProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Dynamic coupons mapped
  const dynamicCampaigns: PromoCampaign[] = coupons.map((c) => ({
    code: c.code,
    description: `${c.value}${c.type === "percentage" ? "%" : " ₹"} off your order. ${c.description || ""}`,
    badge: c.badge_text || (c.type === "percentage" ? "Special %" : "Direct Discount")
  }));

  // Fallback high-converting boutique promotions
  const fallbackCampaigns: PromoCampaign[] = [
    {
      code: "DIVINE10",
      description: "Enjoy 10% off your first sanctuary addition. Handcrafted with warm boutique styling.",
      badge: "Welcome Pick"
    },
    {
      code: "FREESHIP",
      description: "Complimentary shipping on orders above ₹499. Direct India-wide fulfillment.",
      badge: "Complimentary"
    },
    {
      code: "FESTIVE15",
      description: "Unlock 15% off on purchases of 2 or more heritage accent pieces.",
      badge: "Milestone Edit"
    }
  ];

  // Merge so we always have at least a beautiful selection
  const allCampaigns = [...dynamicCampaigns, ...fallbackCampaigns].slice(0, 3);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy code to clipboard", err);
    }
  };

  return (
    <div className="offers-widget">
      <div className="offers-header">
        <svg className="offers-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2.5" />
        </svg>
        <h3 className="offers-title">Exclusive Altar Offers</h3>
      </div>
      <div className="offers-grid">
        {allCampaigns.map((camp) => (
          <div key={camp.code} className="offer-card">
            <div className="offer-card-top">
              <span className="offer-badge">{camp.badge || "Special offer"}</span>
              <button
                type="button"
                className={`offer-code-btn ${copiedCode === camp.code ? "copied" : ""}`}
                onClick={() => handleCopy(camp.code)}
                aria-label={`Copy promotion code ${camp.code}`}
              >
                <span className="code-text">{camp.code}</span>
                <span className="copy-action-text">
                  {copiedCode === camp.code ? (
                    <>
                      <svg className="copy-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    "Copy"
                  )}
                </span>
              </button>
            </div>
            <p className="offer-desc">{camp.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
