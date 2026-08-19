"use client";

import Link from "next/link";
import { FooterNewsletterForm } from "./footer-newsletter-form";
import { BrandLogo } from "./brand-logo";
import { PaymentBadges } from "./payment-badges";
import type { SiteSettings, Category, NavigationItem, SocialLink } from "../lib/types";

type SiteFooterProps = {
  categories: Category[];
  settings: SiteSettings;
  footerMenu: NavigationItem[];
  socialLinks: SocialLink[];
};

export function SiteFooter({ categories = [], settings, footerMenu = [], socialLinks = [] }: SiteFooterProps) {
  const brandName = settings.site_name || "Kanakshi Fine Jewellery";
  const copyright =
    settings.footer_copyright_text ||
    `© ${new Date().getFullYear()} Kanakshi Fine Jewellery. All Rights Reserved.`;

  const phone = settings.support_phone || settings.site_phone || "+91 85868 98691";
  const email = settings.support_email || settings.site_email || "care@kanakshi.in";
  const whatsapp = settings.whatsapp_number || "+91 85868 98691";
  const address1 = settings.address_line1 || "Kanakshi Flagship Studio, Ground Floor, DLF Horizon Plaza";
  const address2 = settings.address_line2 || "Golf Course Road, Sector 43";
  const city = settings.city || "Gurugram";
  const state = settings.state || "Haryana";
  const pincode = settings.pincode || "122002";
  const country = settings.country || "India";

  return (
    <footer className="kanakshi-footer">
      <div className="kanakshi-container">
        {/* VIP Club Newsletter Box */}
        <div className="kanakshi-footer-newsletter-box">
          <div className="kanakshi-footer-newsletter-text">
            <h3>Join the Kanakshi Sparkle Club</h3>
            <p>Subscribe to receive <strong>FLAT ₹500 OFF</strong> on your first order, plus VIP sale previews.</p>
          </div>
          <FooterNewsletterForm />
        </div>

        {/* 4-Column Links Grid */}
        <div className="kanakshi-footer-grid">
          {/* Col 1: Brand & Social */}
          <div>
            <div className="kanakshi-logo" style={{ marginBottom: "16px" }}>
              <BrandLogo theme="white" height={40} />
            </div>
            <p style={{ fontSize: "0.85rem", lineHeight: "1.6", color: "#a0a0a0", marginBottom: "20px" }}>
              India&apos;s destination for everyday fine jewellery. 100% BIS Hallmarked 925 Sterling Silver, 18K Solid Gold, and Certified Lab Diamonds.
            </p>

            {/* Improved Luxury Social Media Icons */}
            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "1px", color: "#888888", fontWeight: "700", display: "block", marginBottom: "10px" }}>
                Follow Our Sparkle
              </span>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                {/* Instagram */}
                <a
                  href="https://instagram.com/kanakshi.in"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="kanakshi-social-btn kanakshi-social-instagram"
                  title="Follow us on Instagram @kanakshi.in"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com/kanakshi.in"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="kanakshi-social-btn kanakshi-social-facebook"
                  title="Like us on Facebook"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>

                {/* Pinterest */}
                <a
                  href="https://pinterest.com/kanakshi.in"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Pinterest"
                  className="kanakshi-social-btn kanakshi-social-pinterest"
                  title="Pin our looks on Pinterest"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="12" />
                    <path d="M12 12c-3 0-4-3-4-5 0-3.31 2.69-6 6-6s6 2.69 6 6c0 3-2 6-5 6" />
                    <path d="M8 12c0 2 1 5 4 10" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com/@kanakshi.in"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="kanakshi-social-btn kanakshi-social-youtube"
                  title="Watch our jewellery films on YouTube"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
                  </svg>
                </a>

                {/* WhatsApp Direct Chat */}
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=Hi%20Kanakshi%20Fine%20Jewellery%2C%20I%20have%20an%20inquiry%20regarding%20an%20order.`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="kanakshi-social-btn kanakshi-social-whatsapp"
                  title="Instant WhatsApp Consultation"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Shop Fine Jewellery */}
          <div>
            <h4 className="kanakshi-footer-col-title">Shop by Category</h4>
            <div className="kanakshi-footer-links">
              <Link href="/shop/rings">Rings & Solitaires</Link>
              <Link href="/shop/earrings">Earrings & Studs</Link>
              <Link href="/shop/necklaces">Necklaces & Pendants</Link>
              <Link href="/shop/bracelets">Bracelets & Bangles</Link>
              <Link href="/shop/gold-lab-diamonds">18K Gold & Lab Diamonds</Link>
              <Link href="/shop/silver-jewellery">925 Sterling Silver</Link>
              <Link href="/shop/mangalsutra">Modern Mangalsutras</Link>
              <Link href="/shop/mens-jewellery">Men&apos;s Jewellery</Link>
              <Link href="/shop/gifting-edits">Curated Luxury Hampers</Link>
            </div>
          </div>

          {/* Col 3: Customer Care & Policy */}
          <div>
            <h4 className="kanakshi-footer-col-title">Customer Care</h4>
            <div className="kanakshi-footer-links">
              <Link href="/returns">7-Day Returns &amp; Exchanges</Link>
              <Link href="/track-order">Track Your Order</Link>
              <Link href="/account">Kanakshi Privé Wallet</Link>
              <Link href="/pages/refund-policy">Return Policy &amp; Terms</Link>
              <Link href="/pages/shipping-policy">Shipping &amp; Delivery Details</Link>
              <Link href="/pages/privacy-policy">Privacy Policy</Link>
              <Link href="/pages/terms-conditions">Terms &amp; Conditions</Link>
              <Link href="/pages/about-us">Our Brand Story</Link>
            </div>
          </div>

          {/* Col 4: Registered Office & Direct Contact */}
          <div>
            <h4 className="kanakshi-footer-col-title">Online Care & Office</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.85rem", color: "#b0b0b0" }}>
              {/* Address */}
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div style={{ lineHeight: "1.45" }}>
                  <strong style={{ color: "#ffffff", display: "block", marginBottom: "2px" }}>Registered Office (Online D2C)</strong>
                  {address1}, {address2}, {city}, {state} - {pincode}, {country}
                  <span style={{ display: "block", color: "var(--kanakshi-pink)", fontSize: "0.75rem", marginTop: "2px", fontWeight: "600" }}>
                    Free Insured Delivery All Over India
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <div>
                  <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} style={{ color: "#ffffff", fontWeight: "600", textDecoration: "none" }}>
                    {phone}
                  </a>
                  <span style={{ fontSize: "0.75rem", color: "#888888", display: "block" }}>Mon - Sat: 10:00 AM - 7:30 PM</span>
                </div>
              </div>

              {/* Email */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a href={`mailto:${email}`} style={{ color: "#ffffff", fontWeight: "600", textDecoration: "none" }}>
                  {email}
                </a>
              </div>

              {/* WhatsApp Quick Action Button */}
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=Hi%20Kanakshi%20Fine%20Jewellery%2C%20I%20need%20help%20with%20an%20order.`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#25D366",
                  color: "#ffffff",
                  padding: "8px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  textDecoration: "none",
                  marginTop: "4px",
                  width: "fit-content",
                  transition: "opacity 0.2s"
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                WhatsApp Consultant
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="kanakshi-footer-bottom">
          <div>{copyright}</div>

          <PaymentBadges />
        </div>
      </div>
    </footer>
  );
}
