"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";
import { Product } from "../lib/types";

interface CustomLocketCustomizerProps {
  baseProduct?: Product;
}

const FINISH_OPTIONS = [
  {
    id: "silver",
    name: "Antique Oxidised Silver",
    tag: "Most Popular",
    color: "#b0b7bd",
    border: "#8e979e",
    bgGradient: "linear-gradient(135deg, #e4e7eb 0%, #8e979e 100%)",
    glow: "rgba(142, 151, 158, 0.4)",
    textColor: "#2b2d42"
  },
  {
    id: "gold",
    name: "Vintage Matte Gold",
    tag: "Royal Heritage",
    color: "#d4af37",
    border: "#b8901f",
    bgGradient: "linear-gradient(135deg, #fce085 0%, #b8901f 100%)",
    glow: "rgba(212, 175, 55, 0.4)",
    textColor: "#543d00"
  },
  {
    id: "rose",
    name: "Rose Oxidised Tone",
    tag: "Romantic Blush",
    color: "#e8929e",
    border: "#c46a78",
    bgGradient: "linear-gradient(135deg, #ffd1d8 0%, #c46a78 100%)",
    glow: "rgba(232, 146, 158, 0.4)",
    textColor: "#5e1d27"
  }
];

const FONT_OPTIONS = [
  { id: "cursive", name: "Royal Cursive", fontFamily: "'Brush Script MT', 'Great Vibes', cursive", sample: "Priya" },
  { id: "serif", name: "Classic Roman", fontFamily: "Georgia, 'Cormorant Garamond', serif", sample: "PRIYA" },
  { id: "modern", name: "Clean Minimal", fontFamily: "system-ui, sans-serif", sample: "Priya" }
];

const BUNDLE_TIERS = [
  {
    qty: 1,
    label: "1 Custom Name Locket",
    subtext: "Personal Self-Love / Single Gift",
    price: 399,
    originalPrice: 899,
    badge: "55% OFF"
  },
  {
    qty: 2,
    label: "2 Lockets — Couple / BFF Combo",
    subtext: "1 for You, 1 for Your Loved One",
    price: 699,
    originalPrice: 1798,
    badge: "SAVE ₹100 EXTRA • BEST VALUE",
    popular: true
  },
  {
    qty: 3,
    label: "3 Lockets — Gifting / Family Pack",
    subtext: "Matching Trio + Free Velvet Gift Box",
    price: 949,
    originalPrice: 2697,
    badge: "SAVE ₹250 EXTRA"
  }
];

export function CustomLocketCustomizer({ baseProduct }: CustomLocketCustomizerProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const [nameText, setNameText] = useState("Kanakshi");
  const [partnerName, setPartnerName] = useState("");
  const [selectedFinish, setSelectedFinish] = useState("silver");
  const [selectedFont, setSelectedFont] = useState("cursive");
  const [chainLength] = useState("18inch");
  const [selectedTier, setSelectedTier] = useState(2); // Default to Couple Combo (high conversion)
  const [giftBoxAddon, setGiftBoxAddon] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);

  const currentFinish = FINISH_OPTIONS.find((f) => f.id === selectedFinish) || FINISH_OPTIONS[0];
  const currentFont = FONT_OPTIONS.find((f) => f.id === selectedFont) || FONT_OPTIONS[0];
  const currentTier = BUNDLE_TIERS.find((t) => t.qty === selectedTier) || BUNDLE_TIERS[1];

  const effectiveTotalPrice = currentTier.price + (giftBoxAddon ? 49 : 0);

  const displayName = nameText.trim() || "Your Name";
  const displayFullText = partnerName.trim() ? `${displayName} ❤️ ${partnerName.trim()}` : displayName;

  const handleAddToCartOrBuyNow = (redirectCheckout = false) => {
    const customizedItem: Product = {
      id: baseProduct?.id || 9901,
      name: `Customised Name Locket (${displayFullText})`,
      slug: `custom-locket-${selectedFinish}-${Date.now()}`,
      price: currentTier.originalPrice,
      sale_price: currentTier.price,
      effective_price: currentTier.price,
      material: `Handcrafted Brass • ${currentFinish.name} • ${currentFont.name} • ${chainLength}`,
      category_name: "Personalised Jewellery",
      category_slug: "personalised-jewellery",
      images: [
        selectedFinish === "gold"
          ? "/jewellery/gold-pendant.jpg"
          : selectedFinish === "rose"
          ? "/jewellery/rose-gold-pendant.jpg"
          : "/jewellery/heart-necklace.jpg"
      ],
      is_featured: true,
      is_sellable: true,
      short_desc: `Custom engraved name locket for: "${displayFullText}". Finish: ${currentFinish.name}.`,
      description: `Personalized handcrafted name necklace engraved with: ${displayFullText}. Polish: ${currentFinish.name}. Chain: ${chainLength}.`,
      avg_rating: 4.9,
      review_count: 1840,
      bullet_points: [
        `Customized Name: ${displayFullText}`,
        `Finish: ${currentFinish.name}`,
        `Font Style: ${currentFont.name}`,
        `Anti-Tarnish Protective Dual-Coat Lacquer`,
        `Includes Velvet Gifting Pouch`
      ]
    };

    addItem(customizedItem, 1);

    if (redirectCheckout) {
      router.push("/checkout");
    } else {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 3000);
    }
  };

  return (
    <div className="custom-locket-builder-grid">
      {/* LEFT COLUMN: Interactive Visual Mockup Preview */}
      <div className="custom-locket-preview-wrap">
        <div className="custom-locket-preview-card" style={{ borderColor: currentFinish.border }}>
          {/* Badge */}
          <div className="custom-locket-preview-badge">
            <span className="live-pulse-dot" />
            Live Personalized Preview
          </div>

          {/* Locket Chain Illustration */}
          <div className="custom-locket-chain-graphic">
            <svg viewBox="0 0 200 120" width="100%" height="90" fill="none" stroke={currentFinish.color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3">
              <path d="M 30 0 Q 100 100 170 0" />
            </svg>
          </div>

          {/* Name Pendant Plate */}
          <div
            className="custom-locket-pendant-plate"
            style={{
              background: currentFinish.bgGradient,
              boxShadow: `0 12px 30px ${currentFinish.glow}, inset 0 2px 4px rgba(255,255,255,0.6)`
            }}
          >
            <span
              className="custom-locket-engraved-name"
              style={{
                fontFamily: currentFont.fontFamily,
                color: currentFinish.textColor,
                textShadow: "0 1px 2px rgba(255,255,255,0.8), 0 -1px 1px rgba(0,0,0,0.3)"
              }}
            >
              {displayFullText}
            </span>
          </div>

          {/* Specs Micro Tags */}
          <div className="custom-locket-preview-specs">
            <span>✨ {currentFinish.name}</span>
            <span>•</span>
            <span>🔤 {currentFont.name}</span>
            <span>•</span>
            <span>⛓️ 18&quot; Box Chain + 2&quot; Extender</span>
          </div>

          {/* Unboxing Reassurance */}
          <div className="custom-locket-unboxing-note">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#e9718b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span>WhatsApp proof will be sent before cutting for 100% spelling accuracy.</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Customizer Controls & Checkout Engine */}
      <div className="custom-locket-controls-wrap">
        
        {/* Header & Rating */}
        <div className="custom-locket-header">
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
            <span className="kanakshi-badge kanakshi-badge-pink">100% Handcrafted Custom</span>
            <span style={{ fontSize: "0.82rem", color: "#f59e0b", fontWeight: "700" }}>★★★★★ 4.9 (2,400+ Delivered)</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.4rem, 3.5vw, 1.95rem)", fontWeight: "700", color: "#111111", margin: "0 0 8px" }}>
            Customized Name Locket Necklace
          </h1>
          <p style={{ fontSize: "0.88rem", color: "#666666", lineHeight: "1.5", margin: 0 }}>
            Laser-cut in pure antique brass alloy with anti-tarnish protective lacquer. Daily wear safe, water-resistant, and skin-friendly.
          </p>
        </div>

        {/* STEP 1: Enter Name(s) */}
        <div className="custom-step-card">
          <label className="custom-step-label">
            <span className="step-num">1</span>
            <span>Enter Your Custom Name or Word:</span>
          </label>
          <input
            type="text"
            className="custom-name-input"
            placeholder="Type Name (e.g. Priya, Rahul, Ananya, A❤️P)"
            maxLength={18}
            value={nameText}
            onChange={(e) => setNameText(e.target.value)}
          />

          {/* Optional Partner Name for Couple Initial Sets */}
          <div style={{ marginTop: "10px" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: "600", color: "#666", display: "block", marginBottom: "4px" }}>
              Want a Couple Name Locket? Add 2nd Name (Optional):
            </label>
            <input
              type="text"
              className="custom-name-input-secondary"
              placeholder="Partner Name (e.g. Aman)"
              maxLength={12}
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
            />
          </div>
        </div>

        {/* STEP 2: Choose Polish / Metallic Finish */}
        <div className="custom-step-card">
          <label className="custom-step-label">
            <span className="step-num">2</span>
            <span>Select Antique Oxidised Finish:</span>
          </label>
          <div className="custom-options-grid">
            {FINISH_OPTIONS.map((finish) => (
              <button
                key={finish.id}
                type="button"
                className={`custom-finish-btn ${selectedFinish === finish.id ? "active" : ""}`}
                onClick={() => setSelectedFinish(finish.id)}
              >
                <span className="finish-swatch" style={{ background: finish.bgGradient }} />
                <span className="finish-name">{finish.name}</span>
                {finish.tag && <span className="finish-tag">{finish.tag}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 3: Choose Font Style */}
        <div className="custom-step-card">
          <label className="custom-step-label">
            <span className="step-num">3</span>
            <span>Select Engraving Font Style:</span>
          </label>
          <div className="custom-font-grid">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.id}
                type="button"
                className={`custom-font-btn ${selectedFont === font.id ? "active" : ""}`}
                onClick={() => setSelectedFont(font.id)}
              >
                <span style={{ fontFamily: font.fontFamily, fontSize: "1.15rem", display: "block", marginBottom: "2px" }}>
                  {font.sample}
                </span>
                <span style={{ fontSize: "0.72rem", color: "#666666" }}>{font.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 4: Choose Bundle & Save (High AOV Engine) */}
        <div className="custom-step-card">
          <label className="custom-step-label">
            <span className="step-num">4</span>
            <span>Special Quantity Offers (Save More):</span>
          </label>
          <div className="custom-tier-grid">
            {BUNDLE_TIERS.map((tier) => (
              <div
                key={tier.qty}
                className={`custom-tier-card ${selectedTier === tier.qty ? "selected" : ""}`}
                onClick={() => setSelectedTier(tier.qty)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "700", fontSize: "0.95rem", color: "#111111" }}>{tier.label}</span>
                  <span className="tier-badge">{tier.badge}</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#666666", marginBottom: "8px" }}>{tier.subtext}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--kanakshi-pink)" }}>₹{tier.price}</span>
                  <span style={{ fontSize: "0.85rem", color: "#999999", textDecoration: "line-through" }}>₹{tier.originalPrice}</span>
                  <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: "700" }}>Free Delivery</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gift Wrap Addon Option */}
        <label className="custom-gift-addon-wrap">
          <input
            type="checkbox"
            checked={giftBoxAddon}
            onChange={(e) => setGiftBoxAddon(e.target.checked)}
          />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: "600", fontSize: "0.85rem", color: "#111111", display: "block" }}>
              🎁 Add Luxury Red Velvet Gift Box + Greeting Card (+₹49)
            </span>
            <span style={{ fontSize: "0.75rem", color: "#777777" }}>
              Ready to gift straight out of the package. Perfect for birthdays &amp; anniversaries.
            </span>
          </div>
        </label>

        {/* CTA Buttons Row */}
        <div className="custom-cta-row">
          <button
            type="button"
            className="custom-buy-now-btn"
            onClick={() => handleAddToCartOrBuyNow(true)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#fff" />
            </svg>
            <span>Instant Buy Now (₹{effectiveTotalPrice})</span>
            <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>→</span>
          </button>

          <button
            type="button"
            className="custom-add-bag-btn"
            onClick={() => handleAddToCartOrBuyNow(false)}
          >
            Add to Bag
          </button>
        </div>

        {addedNotice && (
          <div className="custom-added-alert">
            ✓ Added custom locket for <strong>&quot;{displayFullText}&quot;</strong> to your bag!
          </div>
        )}

        {/* Trust Badges Bar */}
        <div className="custom-trust-grid">
          <div className="custom-trust-item">
            <span className="trust-icon">⚡</span>
            <span><strong>Cash on Delivery</strong> Available</span>
          </div>
          <div className="custom-trust-item">
            <span className="trust-icon">🛡️</span>
            <span><strong>Anti-Tarnish</strong> Lacquer Coat</span>
          </div>
          <div className="custom-trust-item">
            <span className="trust-icon">🚚</span>
            <span><strong>2-4 Days</strong> Express Dispatch</span>
          </div>
          <div className="custom-trust-item">
            <span className="trust-icon">🔄</span>
            <span><strong>7-Day</strong> Replacement Guarantee</span>
          </div>
        </div>

      </div>
    </div>
  );
}
