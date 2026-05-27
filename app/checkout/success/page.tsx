"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getCustomerOrderDetail, getSettings } from "../../../lib/api";
import { getStoredCustomerToken } from "../../../lib/customer-auth";
import { SiteSettings } from "../../../lib/types";

function SuccessReceiptContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order_number") || "";
  
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [order, setOrder] = useState<Awaited<ReturnType<typeof getCustomerOrderDetail>>["data"] | null>(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
  }, []);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) {
        setLoadingOrder(false);
        return;
      }

      const token = getStoredCustomerToken();
      if (!token) {
        setLoadingOrder(false);
        return;
      }

      try {
        const result = await getCustomerOrderDetail(token, orderNumber);
        if (result.success && result.data) {
          setOrder(result.data);
        } else {
          setOrderError(result.message || "We could not load your order details right now.");
        }
      } catch (error) {
        setOrderError("We could not load your order details right now.");
      } finally {
        setLoadingOrder(false);
      }
    }

    loadOrder();
  }, [orderNumber]);

  const handleCopy = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formattedDate = new Date();
  formattedDate.setDate(formattedDate.getDate() + 5);
  const deliveryEstimate = formattedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  const currencySymbol = settings?.site_currency_symbol || "₹";
  const orderStatus = order?.status ? order.status.replace(/_/g, " ") : "confirmed";
  const paymentStatus = order?.payment_status ? order.payment_status.replace(/_/g, " ") : "authorized";
  const paymentMethod = order?.payment_method ? order.payment_method.toUpperCase() : "COD / Online Gateway";
  const orderDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

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
          margin: "0 auto 1.5rem",
          boxShadow: "0 10px 25px -5px rgba(45, 123, 76, 0.2)",
          animation: "scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="success-draw-checkmark"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
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
          <div style={{ display: "grid", gap: "1.5rem" }} className="success-detail-grid">
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block" }}>ORDER DATE</span>
              <strong style={{ fontSize: "1.05rem", color: "var(--text)" }}>{orderDate}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block" }}>ESTIMATED DELIVERY</span>
              <strong style={{ fontSize: "1.05rem", color: "var(--text)" }}>{deliveryEstimate}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block" }}>SHIPPING STATUS</span>
              <strong style={{ fontSize: "1.05rem", color: "var(--accent-deep)", textTransform: "capitalize" }}>{orderStatus}</strong>
            </div>
          </div>

          <div style={{ display: "grid", gap: "1.5rem", borderTop: "1px solid var(--line)", paddingTop: "1rem" }} className="success-detail-grid">
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block" }}>PAYMENT PARAMETER</span>
              <strong style={{ fontSize: "1.05rem", color: "var(--text)" }}>{paymentMethod}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block" }}>PAYMENT STATUS</span>
              <strong style={{ fontSize: "1.05rem", color: "#2d7b4c", textTransform: "capitalize" }}>{paymentStatus}</strong>
            </div>
          </div>

          {loadingOrder ? (
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: "1rem" }}>
              <p style={{ margin: 0, color: "var(--muted)" }}>Loading order details…</p>
            </div>
          ) : null}

          {order ? (
            <div style={{ display: "grid", gap: "1rem", borderTop: "1px solid var(--line)", paddingTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block" }}>ORDER TOTAL</span>
                  <strong style={{ fontSize: "1.15rem", color: "var(--text)" }}>
                    {currencySymbol}{Number(order.total_amount || 0).toLocaleString("en-IN")}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block" }}>ITEMS</span>
                  <strong style={{ fontSize: "1.15rem", color: "var(--text)" }}>{order.items.length}</strong>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block", marginBottom: "0.4rem" }}>DELIVERY ADDRESS</span>
                <strong style={{ display: "block", color: "var(--text)" }}>{order.ship_name}</strong>
                <span style={{ color: "var(--muted)", lineHeight: 1.6 }}>
                  {order.ship_address}, {order.ship_city}, {order.ship_state} - {order.ship_pincode}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block", marginBottom: "0.5rem" }}>ORDER ITEMS</span>
                <div style={{ display: "grid", gap: "0.7rem" }}>
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", color: "var(--text)" }}>
                      <span>{item.name} x {item.quantity}</span>
                      <strong>{currencySymbol}{Number(item.line_total || 0).toLocaleString("en-IN")}</strong>
                    </div>
                  ))}
                  {order.items.length > 4 ? (
                    <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>+ {order.items.length - 4} more item(s)</span>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {orderError ? (
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: "1rem" }}>
              <p style={{ margin: 0, color: "#a43c31" }}>{orderError}</p>
            </div>
          ) : null}

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

        <button
          type="button"
          onClick={handlePrint}
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
          Download / Print Invoice
        </button>

        <a
          href="/account"
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
          View Order In My Account
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
        @keyframes drawCheckmark {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        .success-draw-checkmark polyline {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawCheckmark 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.25s;
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
