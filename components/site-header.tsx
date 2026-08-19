"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { NavigationItem, Product, SiteSettings } from "../lib/types";
import { useCart } from "./cart-provider";
import { useWishlist } from "./wishlist-provider";
import { KanakshiPincodeModal } from "./kanakshi-pincode-modal";
import { BrandLogo } from "./brand-logo";

type SiteHeaderProps = {
  brandName: string;
  logoUrl?: string | null;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  menuItems: NavigationItem[];
  mobileMenuItems?: NavigationItem[];
  settings: SiteSettings;
};

export function SiteHeader({
  brandName = "Kanakshi Fine Jewellery",
  logoUrl,
  categories = [],
  menuItems = [],
  settings
}: SiteHeaderProps) {
  const router = useRouter();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [offerIndex, setOfferIndex] = useState(0);
  const [topbarDismissed, setTopbarDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [pincodeModalOpen, setPincodeModalOpen] = useState(false);
  const [selectedPincode, setSelectedPincode] = useState("110001");
  const [selectedCity, setSelectedCity] = useState("Delhi NCR");

  const offers = useMemo(() => {
    const list = settings.topbar_offers?.filter((offer) => typeof offer === "string" && offer.trim().length > 0) ?? [];
    return list.length
      ? list
      : [
          "FLAT ₹500 OFF on Orders Above ₹2,999 | Code: SPARKLE500",
          "Free Insured Express Delivery Across India",
          "100% Certified 925 Sterling Silver & Hallmarked Gold",
          "7-Day Hassle-Free Returns & Express Doorstep Pickup"
        ];
  }, [settings.topbar_offers]);

  // Rotate announcement offers
  useEffect(() => {
    if (offers.length <= 1) return;
    const interval = setInterval(() => {
      setOfferIndex((prev) => (prev + 1) % offers.length);
    }, 3600);
    return () => clearInterval(interval);
  }, [offers]);

  // Debounced Live Product Search (fires after user stops typing)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setLiveProducts([]);
      setIsSearching(false);
      setTotalResults(0);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setLiveProducts(data.products || []);
          setTotalResults(data.total || (data.products ? data.products.length : 0));
        }
      } catch (err) {
        console.error("Live search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularSearches = [
    "Solitaire Rings",
    "925 Silver Earrings",
    "Tennis Bracelet",
    "Heart Necklace",
    "Lab Diamond Pendant",
    "Men's Cuban Chain",
    "Evil Eye Bracelet",
    "Gifts Under ₹1999"
  ];

  return (
    <>
      {/* Top Announcement Bar (Center Aligned with Dismiss Option) */}
      {!topbarDismissed && (
        <div className="kanakshi-topbar">
          <div className="kanakshi-container kanakshi-topbar-inner">
            <div className="kanakshi-topbar-left" aria-hidden="true" />

            <div className="kanakshi-topbar-ticker">
              <span>{offers[offerIndex]}</span>
            </div>

            <div className="kanakshi-topbar-right">
              <div className="kanakshi-topbar-links">
                <Link href="/track-order">Track Order</Link>
                <Link href="/returns">Easy Returns</Link>
                <Link href="/pages/contact">Need Help?</Link>
              </div>
              <button
                type="button"
                onClick={() => setTopbarDismissed(true)}
                className="kanakshi-topbar-close"
                aria-label="Close announcement"
                title="Dismiss banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Sticky Header */}
      <header className="kanakshi-header">
        <div className="kanakshi-container">
          <div className="kanakshi-main-header">
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className="kanakshi-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="kanakshi-logo" aria-label="Kanakshi Fine Jewellery" style={{ textDecoration: "none" }}>
              <BrandLogo height={42} logoUrl={settings.logo_url} theme="dark" />
            </Link>

            {/* Delivery Pincode Box */}
            <button
              type="button"
              className="kanakshi-pincode-btn"
              onClick={() => setPincodeModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <div className="kanakshi-pincode-label">Deliver to</div>
                <div className="kanakshi-pincode-val">{selectedPincode} • {selectedCity}</div>
              </div>
            </button>

            {/* Functional Debounced Search Bar */}
            <div className="kanakshi-search-box">
              <form onSubmit={handleSearchSubmit}>
                <div className="kanakshi-search-input-wrap">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--kanakshi-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="kanakshi-search-icon">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="kanakshi-search-input"
                    placeholder="Search for Rings, 925 Silver, Lab Diamonds, Gifts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 260)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setLiveProducts([]);
                      }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--kanakshi-text-muted)", display: "flex", padding: "2px" }}
                      aria-label="Clear search"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              </form>

              {/* Instant Search Dropdown */}
              {searchFocused && (
                <div
                  className="kanakshi-search-dropdown"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {searchQuery.trim().length > 0 ? (
                    <div>
                      <div className="kanakshi-search-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>
                          {isSearching
                            ? "Searching..."
                            : liveProducts.length > 0
                            ? `Matching Products (${totalResults || liveProducts.length})`
                            : "No Results"}
                        </span>
                        {isSearching && (
                          <span className="spinner" style={{ width: "12px", height: "12px", borderWidth: "2px" }} />
                        )}
                      </div>

                      {isSearching ? (
                        <div style={{ padding: "16px 8px", textAlign: "center", color: "#888888", fontSize: "0.85rem" }}>
                          Searching Kanakshi fine jewellery...
                        </div>
                      ) : liveProducts.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxHeight: "320px", overflowY: "auto" }}>
                          {liveProducts.map((product) => {
                            const img = Array.isArray(product.images)
                              ? (product.images[0] || "/product-placeholder.svg")
                              : (typeof product.images === "string" ? product.images : "/product-placeholder.svg");
                            const catName = product.category_name || "";
                            const currentPrice = Number(product.sale_price || product.price || 0);
                            const originalPrice = product.sale_price ? Number(product.price || 0) : null;

                            return (
                              <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                className="kanakshi-search-item"
                                onClick={() => {
                                  setSearchFocused(false);
                                  setSearchQuery("");
                                }}
                              >
                                <img
                                  src={img}
                                  alt={product.name || "Jewellery"}
                                  className="kanakshi-search-thumb"
                                />
                                <div className="kanakshi-search-info">
                                  <div className="kanakshi-search-name">{product.name}</div>
                                  <div className="kanakshi-search-meta">
                                    {catName && <span className="kanakshi-search-cat">{catName}</span>}
                                    <span className="kanakshi-search-price">₹{currentPrice.toLocaleString("en-IN")}</span>
                                    {originalPrice && originalPrice > currentPrice && (
                                      <span className="kanakshi-search-original-price">₹{originalPrice.toLocaleString("en-IN")}</span>
                                    )}
                                  </div>
                                </div>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="9 18 15 12 9 6" />
                                </svg>
                              </Link>
                            );
                          })}

                          <button
                            type="button"
                            className="kanakshi-search-view-all"
                            onClick={() => {
                              setSearchFocused(false);
                              router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
                            }}
                          >
                            <span>View all results for &ldquo;{searchQuery}&rdquo; →</span>
                          </button>
                        </div>
                      ) : (
                        <div style={{ padding: "16px 8px", textAlign: "center" }}>
                          <p style={{ margin: "0 0 8px", color: "#444444", fontSize: "0.9rem" }}>
                            No jewellery found matching <strong>&ldquo;{searchQuery}&rdquo;</strong>
                          </p>
                          <p style={{ margin: 0, color: "#888888", fontSize: "0.8rem" }}>
                            Try searching for <em>Rings, Earrings, 925 Silver, Solitaires, or Bracelets</em>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="kanakshi-search-section-title">Trending Searches</div>
                      <div className="kanakshi-search-chips">
                        {popularSearches.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="kanakshi-search-chip"
                            onMouseDown={() => {
                              setSearchQuery(item);
                              router.push(`/shop?q=${encodeURIComponent(item)}`);
                            }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>

                      <div className="kanakshi-search-section-title">Shop by Metal &amp; Collection</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.85rem" }}>
                        <Link href="/shop?category=silver-jewellery" style={{ color: "var(--kanakshi-pink-dark)", fontWeight: "600" }}>
                          • 925 Sterling Silver
                        </Link>
                        <Link href="/shop?category=gold-lab-diamonds" style={{ color: "var(--kanakshi-gold-dark)", fontWeight: "600" }}>
                          • 18K Real Gold
                        </Link>
                        <Link href="/shop?category=necklaces" style={{ color: "var(--kanakshi-pink)", fontWeight: "600" }}>
                          • Rose Gold Edit
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions: Wishlist, Account, Cart */}
            <div className="kanakshi-header-actions">
              <Link href="/wishlist" className="kanakshi-icon-btn" aria-label="Wishlist">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="kanakshi-icon-btn-label">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="kanakshi-badge-count">{wishlistCount}</span>
                )}
              </Link>

              <Link href="/account" className="kanakshi-icon-btn" aria-label="Account">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="kanakshi-icon-btn-label">Account</span>
              </Link>

              <Link href="/cart" className="kanakshi-icon-btn" aria-label="Shopping Bag">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span className="kanakshi-icon-btn-label">Bag</span>
                {cartCount > 0 && (
                  <span className="kanakshi-badge-count">{cartCount}</span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Mega-Menu Navigation Bar */}
        <nav className="kanakshi-nav-bar">
          <div className="kanakshi-container">
            <ul className="kanakshi-nav-list">
              {menuItems.map((item) => (
                <li key={item.id} className="kanakshi-nav-item">
                  <Link href={item.url || "/shop"} className="kanakshi-nav-link">
                    {item.title}
                    {item.children && item.children.length > 0 && (
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px" }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {item.children && item.children.length > 0 && (
                    <div className="kanakshi-mega-dropdown">
                      <div>
                        <div className="kanakshi-dropdown-col-title">Popular Styles</div>
                        {item.children.slice(0, 4).map((child) => (
                          <Link key={child.id} href={child.url} className="kanakshi-dropdown-link">
                            {child.title}
                          </Link>
                        ))}
                      </div>

                      {item.children.length > 4 && (
                        <div>
                          <div className="kanakshi-dropdown-col-title">More Collections</div>
                          {item.children.slice(4).map((child) => (
                            <Link key={child.id} href={child.url} className="kanakshi-dropdown-link">
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      )}

                      <div style={{ background: "var(--kanakshi-pink-subtle)", padding: "12px", borderRadius: "var(--radius-sm)" }}>
                        <div className="kanakshi-dropdown-col-title" style={{ borderBottom: "none", color: "var(--kanakshi-pink-dark)" }}>
                          Special Offers
                        </div>
                        <p style={{ fontSize: "0.78rem", color: "var(--kanakshi-text-body)", marginBottom: "8px" }}>
                          Get ₹500 OFF on orders above ₹2,999 with code <strong>SPARKLE500</strong>.
                        </p>
                        <Link
                          href="/shop?sort=bestseller"
                          style={{
                            display: "inline-block",
                            fontSize: "0.78rem",
                            fontWeight: "700",
                            color: "var(--kanakshi-pink)"
                          }}
                        >
                          Explore Bestsellers →
                        </Link>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className="kanakshi-modal-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          style={{ justifyContent: "flex-start", padding: 0 }}
        >
          <div
            style={{
              width: "82%",
              maxWidth: "320px",
              height: "100%",
              background: "#ffffff",
              overflowY: "auto",
              padding: "24px 20px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div className="kanakshi-logo">
                <span className="kanakshi-logo-title" style={{ fontSize: "1.4rem" }}>KANAKSHI</span>
                <span className="kanakshi-logo-sub">FINE JEWELLERY</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--kanakshi-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                aria-label="Close Navigation"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: "1rem", fontWeight: "700", color: "var(--kanakshi-pink)", paddingBottom: "8px", borderBottom: "1px solid var(--kanakshi-border)" }}
              >
                Shop All Fine Jewellery
              </Link>
              {menuItems.map((item) => (
                <div key={item.id} style={{ borderBottom: "1px solid var(--kanakshi-border)", paddingBottom: "10px" }}>
                  <Link
                    href={item.url || "/shop"}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--kanakshi-black)", display: "block", marginBottom: "6px" }}
                  >
                    {item.title}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <div style={{ paddingLeft: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {item.children.map((child) => (
                         <Link
                          key={child.id}
                          href={child.url}
                          onClick={() => setMobileMenuOpen(false)}
                          style={{ fontSize: "0.85rem", color: "var(--kanakshi-text-muted)" }}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--kanakshi-border)" }}>
              <Link href="/track-order" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", fontSize: "0.88rem", padding: "6px 0" }}>
                Track Order
              </Link>
              <Link href="/returns" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", fontSize: "0.88rem", padding: "6px 0" }}>
                7-Day Easy Returns
              </Link>
              <Link href="/pages/contact" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", fontSize: "0.88rem", padding: "6px 0" }}>
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pincode Selector Modal */}
      <KanakshiPincodeModal
        isOpen={pincodeModalOpen}
        onClose={() => setPincodeModalOpen(false)}
        currentPincode={selectedPincode}
        onSelectPincode={(pin, city) => {
          setSelectedPincode(pin);
          setSelectedCity(city);
        }}
      />
    </>
  );
}
