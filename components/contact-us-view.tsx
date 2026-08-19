"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteSettings } from "../lib/types";
import { liveContactDefaults } from "../lib/legal-content";
import { submitContactInquiry } from "../lib/api";
import { KanakshiTrustBadges } from "./kanakshi-trust-badges";

type ContactUsViewProps = {
  settings: SiteSettings;
};

export function ContactUsView({ settings }: ContactUsViewProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Order Support & Tracking",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const phone = settings.support_phone || settings.site_phone || liveContactDefaults.phone;
  const email = settings.support_email || settings.site_email || liveContactDefaults.email;
  const whatsapp = settings.whatsapp_number || liveContactDefaults.whatsapp;
  const address1 = settings.address_line1 || liveContactDefaults.addressLine1;
  const address2 = settings.address_line2 || liveContactDefaults.addressLine2;
  const city = settings.city || liveContactDefaults.city;
  const state = settings.state || liveContactDefaults.state;
  const pincode = settings.pincode || liveContactDefaults.pincode;
  const country = settings.country || liveContactDefaults.country;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await submitContactInquiry(formData);
      if (res.success) {
        setSubmitResult({
          success: true,
          message: res.message || "Thank you! Your inquiry has been sent to our customer care team.",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "Order Support & Tracking",
          message: "",
        });
      } else {
        setSubmitResult({
          success: false,
          message: res.message || "Something went wrong. Please try again or chat with us on WhatsApp.",
        });
      }
    } catch (err: any) {
      setSubmitResult({
        success: false,
        message: err?.message || "Failed to submit inquiry. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="kanakshi-container" style={{ paddingTop: "24px", paddingBottom: "72px" }}>
      {/* Breadcrumbs */}
      <nav style={{ display: "flex", gap: "8px", fontSize: "0.82rem", color: "var(--kanakshi-text-muted)", marginBottom: "20px" }}>
        <Link href="/" style={{ color: "var(--kanakshi-text-muted)" }}>Home</Link>
        <span>/</span>
        <span style={{ color: "var(--kanakshi-pink)", fontWeight: "600" }}>Contact Us</span>
      </nav>

      {/* Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #fff0f3 0%, #fff9fa 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "36px 32px",
          marginBottom: "36px",
          border: "1px solid rgba(233, 113, 139, 0.15)",
        }}
      >
        <span className="kanakshi-badge kanakshi-badge-pink" style={{ marginBottom: "12px", display: "inline-block" }}>
          100% Online Fine Jewellery Direct to You
        </span>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", fontWeight: "600", color: "var(--kanakshi-black)", lineHeight: "1.2", marginBottom: "10px" }}>
          We&apos;re Here to Assist Your Jewellery Journey
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--kanakshi-text-muted)", maxWidth: "720px", lineHeight: "1.6" }}>
          We are a pure online fine jewellery brand delivering hallmarked 925 silver, 18K gold, and certified lab diamonds directly to your doorstep across India. Reach out for sizing advice, order help, or custom gifting.
        </p>
      </div>

      {/* 2-Column Main Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "36px", marginBottom: "48px" }} className="contact-page-grid">
        {/* Left Column: Direct Channels & Interactive Backend Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Quick Contact Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {/* Direct Phone */}
            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--kanakshi-border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--kanakshi-pink-light)", color: "var(--kanakshi-pink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--kanakshi-text-muted)", fontWeight: "700", display: "block" }}>Customer Helpline</span>
                  <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} style={{ color: "var(--kanakshi-black)", fontWeight: "700", fontSize: "0.95rem", textDecoration: "none" }}>
                    {phone}
                  </a>
                </div>
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--kanakshi-text-muted)" }}>Mon - Sat: 10:00 AM - 7:30 PM (IST)</span>
            </div>

            {/* Direct Email */}
            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--kanakshi-border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--kanakshi-pink-light)", color: "var(--kanakshi-pink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--kanakshi-text-muted)", fontWeight: "700", display: "block" }}>Online Support Email</span>
                  <a href={`mailto:${email}`} style={{ color: "var(--kanakshi-black)", fontWeight: "700", fontSize: "0.95rem", textDecoration: "none" }}>
                    {email}
                  </a>
                </div>
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--kanakshi-text-muted)" }}>Average response time: 2 - 4 hours</span>
            </div>
          </div>

          {/* WhatsApp Direct Chat Banner */}
          <div
            style={{
              background: "#e8f7ee",
              border: "1px solid #c2ebd1",
              borderRadius: "var(--radius-md)",
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "#0d532b", fontSize: "0.95rem", marginBottom: "4px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                Instant WhatsApp Online Consultation
              </div>
              <p style={{ fontSize: "0.84rem", color: "#1b6d3d", margin: 0 }}>
                Get live photos, ring size recommendations, custom gift messages & order tracking on WhatsApp.
              </p>
            </div>
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=Hi%20Kanakshi%20Fine%20Jewellery%2C%20I%20have%20an%20inquiry.`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#25D366",
                color: "#ffffff",
                padding: "10px 20px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.88rem",
                fontWeight: "700",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 8px rgba(37, 211, 102, 0.35)",
                whiteSpace: "nowrap"
              }}
            >
              Chat on WhatsApp
            </a>
          </div>

          {/* Interactive Backend Form */}
          <div style={{ background: "#ffffff", padding: "28px", borderRadius: "var(--radius-md)", border: "1px solid var(--kanakshi-border)", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--kanakshi-black)", marginBottom: "6px" }}>
              Send Us a Message
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--kanakshi-text-muted)", marginBottom: "20px" }}>
              Fill out the form below and our customer support team will get back to you promptly.
            </p>

            {submitResult && (
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "20px",
                  background: submitResult.success ? "#e8f7ee" : "#fef2f2",
                  border: `1px solid ${submitResult.success ? "#c2ebd1" : "#fecaca"}`,
                  color: submitResult.success ? "#0d532b" : "#991b1b",
                  fontSize: "0.88rem",
                  lineHeight: "1.5"
                }}
              >
                <strong>{submitResult.success ? "Success: " : "Error: "}</strong>
                {submitResult.message}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--kanakshi-black)", marginBottom: "6px" }}>
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ananya Sharma"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--kanakshi-border)", fontSize: "0.88rem", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--kanakshi-black)", marginBottom: "6px" }}>
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 XXXXX"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--kanakshi-border)", fontSize: "0.88rem", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--kanakshi-black)", marginBottom: "6px" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--kanakshi-border)", fontSize: "0.88rem", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--kanakshi-black)", marginBottom: "6px" }}>
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--kanakshi-border)", fontSize: "0.88rem", outline: "none", backgroundColor: "#ffffff" }}
                  >
                    <option value="Order Support & Tracking">Order Support & Tracking</option>
                    <option value="Ring Size Consultation">Ring Size Consultation</option>
                    <option value="Custom Gifting & Hampers">Custom Gifting & Hampers</option>
                    <option value="Product Care & Anti-Tarnish Polish">Product Care & Anti-Tarnish Polish</option>
                    <option value="WhatsApp Video Consultation">WhatsApp Video Consultation</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--kanakshi-black)", marginBottom: "6px" }}>
                  Your Message / Query *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe how we can assist you..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--kanakshi-border)", fontSize: "0.88rem", outline: "none", resize: "vertical" }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="kanakshi-btn kanakshi-btn-primary"
                style={{ width: "100%", height: "46px", fontSize: "0.95rem", fontWeight: "700" }}
              >
                {isSubmitting ? "Submitting Inquiry..." : "Submit Inquiry to Team →"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: 100% Online D2C Guarantees & Support Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Online Brand Guarantees Card */}
          <div style={{ background: "#ffffff", padding: "28px", borderRadius: "var(--radius-lg)", border: "1px solid var(--kanakshi-border)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "var(--kanakshi-pink-light)", color: "var(--kanakshi-pink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div>
                <span className="kanakshi-badge kanakshi-badge-pink" style={{ marginBottom: "6px", display: "inline-block" }}>
                  100% Online D2C Brand
                </span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--kanakshi-black)", marginBottom: "6px" }}>
                  Pure Online Luxury Experience
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--kanakshi-text-muted)", lineHeight: "1.6", margin: "0 0 16px 0" }}>
                  By operating 100% online without costly brick-and-mortar storefronts, we pass direct diamond & silver savings straight to you with premium craftsmanship.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.86rem", color: "var(--kanakshi-text-body)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span><strong>Free Insured Express Delivery</strong> across all Indian pincodes</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span><strong>7-Day Hassle-Free Home Trial</strong> with 100% money-back refund</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span><strong>Free Certificate of Authenticity</strong> with every silver & diamond piece</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span><strong>Anti-Tarnish Rhodium Finish</strong> & shine protection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registered Office & Hours Card */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--kanakshi-border)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--kanakshi-pink-light)", color: "var(--kanakshi-pink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--kanakshi-black)", margin: 0 }}>
                Registered Office & Support Hours
              </h4>
            </div>

            <div style={{ display: "grid", gap: "10px", fontSize: "0.86rem" }}>
              <div>
                <strong style={{ color: "var(--kanakshi-black)", display: "block", marginBottom: "2px" }}>Corporate Registered Address:</strong>
                <span style={{ color: "var(--kanakshi-text-muted)" }}>
                  {address1}, {address2}, {city}, {state} - {pincode}, {country}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--kanakshi-border)" }}>
                <span style={{ color: "var(--kanakshi-text-body)", fontWeight: "600" }}>Phone Helpline</span>
                <span style={{ color: "var(--kanakshi-black)", fontWeight: "700" }}>Mon - Sat: 10:00 AM – 7:30 PM</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--kanakshi-text-body)", fontWeight: "600" }}>Online Order Processing</span>
                <span style={{ color: "#0d532b", fontWeight: "700" }}>24/7 (Dispatched in 24 Hrs)</span>
              </div>
            </div>
          </div>

          {/* Frequently Requested Services */}
          <div style={{ background: "var(--kanakshi-bg-alt)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--kanakshi-border)" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--kanakshi-black)", marginBottom: "16px" }}>
              Quick Online Help
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem" }}>
              <Link href="/track-order" style={{ color: "var(--kanakshi-black)", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#ffffff", borderRadius: "var(--radius-sm)", border: "1px solid var(--kanakshi-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  <span>Track Current Order Status</span>
                </div>
                <span style={{ color: "var(--kanakshi-pink)" }}>→</span>
              </Link>

              <Link href="/returns" style={{ color: "var(--kanakshi-black)", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#ffffff", borderRadius: "var(--radius-sm)", border: "1px solid var(--kanakshi-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  <span>7-Day Returns & Exchanges Portal</span>
                </div>
                <span style={{ color: "var(--kanakshi-pink)" }}>→</span>
              </Link>

              <Link href="/pages/refund-policy" style={{ color: "var(--kanakshi-black)", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#ffffff", borderRadius: "var(--radius-sm)", border: "1px solid var(--kanakshi-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  <span>7-Day Easy Returns & Exchange</span>
                </div>
                <span style={{ color: "var(--kanakshi-pink)" }}>→</span>
              </Link>

              <Link href="/pages/about-us" style={{ color: "var(--kanakshi-black)", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#ffffff", borderRadius: "var(--radius-sm)", border: "1px solid var(--kanakshi-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  <span>Jewellery Care & Cleaning Guide</span>
                </div>
                <span style={{ color: "var(--kanakshi-pink)" }}>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Guarantees */}
      <div style={{ marginTop: "32px" }}>
        <KanakshiTrustBadges />
      </div>
    </div>
  );
}
