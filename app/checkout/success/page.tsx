"use client";

import Link from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getSettings } from "../../../lib/api";
import { SiteSettings } from "../../../lib/types";

function SuccessReceiptContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order_number") || "";
  
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
  }, []);

  const handleCopy = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = new Date();
  formattedDate.setDate(formattedDate.getDate() + 5);
  const deliveryEstimate = formattedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "1.5rem" }}>
      
      {/* Visual Header / Animation Placeholder */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(45, 123, 76, 0.1)",
          color: "#2d7b4c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "3rem",
          margin: "0 auto 1.5rem",
          boxShadow: "0 10px 25px -5px rgba(45, 123, 76, 0.2)",
          animation: "scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}>
          ✓
        </div>
        <p className="eyebrow" style={{ color: "#2d7b4c" }}>Order Confirmed</p>
        <h1 className="page-title" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Thank you for your purchase!</h1>
        <p className="shop-intro" style={{ maxWidth: "480px", margin: "0 auto" }}>
          Your order has been safely registered. We will send you courier updates on your email/phone.
        </p>
      </div>

      {/* Details Card */}
      <div style={{
        border: "1px solid var(--line)",
        borderRadius: "28px",
        padding: "2rem",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        boxShadow: "var(--shadow)",
        marginBottom: "2rem"
      }}>
        
        <div style={{ display: "grid", gap: "1.5rem" }}>
          
          {/* Order Number Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block" }}>ORDER NUMBER</span>
              <strong style={{ fontSize: "1.25rem", color: "var(--text)" }}>{orderNumber || "LD-SAMPLE-NUMBER"}</strong>
            </div>
            <button
              onClick={handleCopy}
              disabled={!orderNumber}
              style={{
                background: copied ? "rgba(45, 123, 76, 0.08)" : "rgba(var(--rgb-text), 0.05)",
                border: "none",
                borderRadius: "10px",
                padding: "6px 12px",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: copied ? "#2d7b4c" : "var(--text)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {copied ? "Copied ✓" : "Copy ID"}
            </button>
          </div>

          {/* Delivery & Method */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block" }}>ESTIMATED DELIVERY</span>
              <strong style={{ fontSize: "1.05rem", color: "var(--text)" }}>{deliveryEstimate}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block" }}>SHIPPING STATUS</span>
              <strong style={{ fontSize: "1.05rem", color: "var(--accent-deep)" }}>Pending Fulfilment</strong>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", borderTop: "1px solid var(--line)", paddingTop: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block" }}>PAYMENT PARAMETER</span>
              <strong style={{ fontSize: "1.05rem", color: "var(--text)" }}>COD / Online Gateway</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block" }}>PAYMENT STATUS</span>
              <strong style={{ fontSize: "1.05rem", color: "#2d7b4c" }}>Authorized</strong>
            </div>
          </div>

        </div>

      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
        <a
          href={`/track-order?number=${encodeURIComponent(orderNumber)}`}
          className="primary-button"
          style={{
            width: "100%",
            textAlign: "center",
            textDecoration: "none",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          Track Live Shipment Status
        </a>

        <a
          href="/shop"
          className="secondary-button"
          style={{
            width: "100%",
            textAlign: "center",
            textDecoration: "none",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          Continue Shopping
        </a>
      </div>

      <style jsx global>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.85);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="content-section" style={{ minHeight: "75vh", background: "linear-gradient(to bottom, #FAF8F5, #FFFFFF)", display: "flex", alignItems: "center", padding: "4rem 0" }}>
      <Suspense fallback={
        <div style={{ margin: "0 auto", textAlign: "center", padding: "3rem" }}>
          <p className="eyebrow">Little Divinity</p>
          <h2 className="auth-title">Preparing Order Receipt…</h2>
        </div>
      }>
        <SuccessReceiptContent />
      </Suspense>
    </main>
  );
}
