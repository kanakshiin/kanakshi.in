"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { trackOrder, formatPrice, resolveAssetUrl } from "../../lib/api";

interface Milestone {
  id: number;
  status: string;
  location: string | null;
  message: string | null;
  created_at: string;
}

interface TrackingData {
  order_number: string;
  status: string;
  ship_name: string;
  ship_city: string;
  ship_state: string;
  created_at: string;
  courier_name?: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  dispatched_at?: string | null;
  estimated_delivery_date?: string | null;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image: string | null;
    size: string | null;
    color: string | null;
    variant_details: string | null;
  }>;
  tracking_milestones: Milestone[];
}

function LiveTrackerContent() {
  const searchParams = useSearchParams();

  // Search inputs
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrackingData | null>(null);
  const [copiedAwb, setCopiedAwb] = useState(false);

  // Auto-fill and search from URL params if present
  useEffect(() => {
    const num = searchParams.get("number");
    const emailOrPhone = searchParams.get("contact");

    if (num) {
      setOrderNumber(num);
    }
    if (emailOrPhone) {
      setContact(emailOrPhone);
    }

    if (num && emailOrPhone) {
      triggerTracking(num, emailOrPhone);
    }
  }, [searchParams]);

  async function triggerTracking(num: string, contactVal: string) {
    if (!num.trim() || !contactVal.trim()) return;

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await trackOrder(num.trim(), contactVal.trim());
      if (res && res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || "No matching order found. Please check your order number and contact details.");
      }
    } catch (e) {
      console.error("Order tracking fetch failed:", e);
      setError("An error occurred while looking up shipment updates. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim() || !contact.trim()) {
      setError("Please provide both your Order Number and registered Email or Phone.");
      return;
    }
    triggerTracking(orderNumber, contact);
  }

  function handleCopyAwb(code: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedAwb(true);
      setTimeout(() => setCopiedAwb(false), 2500);
    }
  }

  // Predefined pipeline for shipment timelines
  const standardMilestones = [
    { key: "Placed", label: "Placed", desc: "Order submitted" },
    { key: "Confirmed", label: "Confirmed & Packed", desc: "Crafted & QC verified" },
    { key: "Shipped", label: "In Transit", desc: "Handed over to carrier" },
    { key: "Out for Delivery", label: "Out for Delivery", desc: "With local courier agent" },
    { key: "Delivered", label: "Delivered", desc: "Handed over to customer" }
  ];

  // Helper to check if a milestone is completed based on current order status
  const getMilestoneIndex = (status: string) => {
    const lower = status.toLowerCase();
    if (lower === "delivered") return 4;
    if (lower === "out for delivery" || lower === "out_for_delivery") return 3;
    if (lower === "shipped") return 2;
    if (lower === "confirmed" || lower === "processing") return 1;
    return 0; // Placed / Pending
  };

  const activeIndex = data ? getMilestoneIndex(data.status) : 0;

  return (
    <div style={{ maxWidth: "1020px", margin: "0 auto" }}>

      {/* Luxury Search Bar Card */}
      <div style={{
        background: "#ffffff",
        border: "1px solid var(--line, #e2e8f0)",
        borderRadius: "20px",
        padding: "2rem",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
        marginBottom: "2.5rem"
      }}>
        <form onSubmit={handleFormSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.2rem", alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text, #0f172a)", marginBottom: "0.5rem" }}>
              Order Number / Reference *
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. KAN-20260819-ABCDE"
              style={{
                width: "100%",
                padding: "0.85rem 1.1rem",
                borderRadius: "12px",
                border: "1px solid var(--line-strong, #cbd5e1)",
                background: "#f8fafc",
                fontSize: "0.95rem",
                color: "#0f172a",
                outline: "none",
                transition: "border 0.2s ease"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text, #0f172a)", marginBottom: "0.5rem" }}>
              Registered Email or 10-Digit Phone *
            </label>
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="email@example.com or 9876543210"
              style={{
                width: "100%",
                padding: "0.85rem 1.1rem",
                borderRadius: "12px",
                border: "1px solid var(--line-strong, #cbd5e1)",
                background: "#f8fafc",
                fontSize: "0.95rem",
                color: "#0f172a",
                outline: "none",
                transition: "border 0.2s ease"
              }}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="primary-button"
              style={{
                width: "100%",
                padding: "0.88rem 1.5rem",
                borderRadius: "12px",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.8 : 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.98rem",
                fontWeight: 700,
                letterSpacing: "0.5px",
                background: "var(--accent-deep, #0f172a)",
                color: "#ffffff",
                border: "none",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)"
              }}
            >
              {isLoading ? (
                <>
                  <span>Searching…</span>
                </>
              ) : (
                <>
                  <span>Track Shipment</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div style={{
            marginTop: "1.2rem",
            padding: "0.9rem 1.2rem",
            borderRadius: "12px",
            background: "rgba(224, 90, 71, 0.08)",
            border: "1px solid rgba(224, 90, 71, 0.25)",
            color: "#a43c31",
            fontSize: "0.92rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* TRACKING RESULTS VIEW */}
      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

          {/* Header Summary Strip */}
          <div style={{
            background: "#ffffff",
            border: "1px solid var(--line, #e2e8f0)",
            borderRadius: "20px",
            padding: "1.8rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.5rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)"
          }}>
            <div>
              <span className="eyebrow" style={{ color: "var(--accent-deep, #b45309)", fontSize: "0.8rem", letterSpacing: "1.5px" }}>Verified Kanakshi Shipment</span>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, margin: "4px 0", color: "#0f172a" }}>Order #{data.order_number}</h2>
              <span style={{ fontSize: "0.88rem", color: "var(--muted, #64748b)" }}>
                Placed on {new Date(data.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>

            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted, #64748b)", display: "block", fontWeight: 700 }}>
                  Estimated Delivery
                </span>
                <strong style={{ fontSize: "1.15rem", color: "#16a34a" }}>
                  {data.estimated_delivery_date
                    ? new Date(data.estimated_delivery_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : new Date(new Date(data.created_at).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </strong>
              </div>
              <div style={{
                background: data.status === "delivered" ? "#dcfce7" : data.status === "shipped" ? "#dbeafe" : "#fef3c7",
                color: data.status === "delivered" ? "#166534" : data.status === "shipped" ? "#1e40af" : "#92400e",
                padding: "8px 18px",
                borderRadius: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                fontSize: "0.85rem",
                letterSpacing: "0.5px"
              }}>
                {data.status}
              </div>
            </div>
          </div>

          {/* Premium Timeline Stepper */}
          <div style={{
            border: "1px solid var(--line, #e2e8f0)",
            borderRadius: "24px",
            padding: "2.5rem 2rem",
            background: "#ffffff",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.04)"
          }}>
            <h3 className="eyebrow" style={{ color: "var(--accent-deep, #b45309)", marginBottom: "2rem", fontSize: "0.95rem", letterSpacing: "1.5px" }}>
              Delivery Journey &amp; Milestones
            </h3>

            <div style={{ display: "flex", justifyContent: "space-between", position: "relative", flexWrap: "wrap", gap: "1.5rem" }} className="timeline-stepper">
              {/* Stepper Connector Line */}
              <div style={{
                position: "absolute",
                top: "16px",
                left: "40px",
                right: "40px",
                height: "3px",
                background: "#e2e8f0",
                zIndex: 1
              }} className="timeline-line-desktop" />

              {standardMilestones.map((m, index) => {
                const isCompleted = index <= activeIndex;
                const isActive = index === activeIndex;

                return (
                  <div key={m.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1, minWidth: "120px", zIndex: 2 }}>
                    {/* Circle Pin */}
                    <div style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: isCompleted ? "#16a34a" : "#ffffff",
                      border: isCompleted ? "none" : "2px solid #cbd5e1",
                      color: isCompleted ? "#ffffff" : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      boxShadow: isActive ? "0 0 0 6px rgba(22, 163, 74, 0.2)" : "none",
                      transition: "all 0.3s ease",
                      marginBottom: "0.8rem"
                    }}>
                      {isCompleted ? (
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>

                    <strong style={{ fontSize: "0.92rem", color: isCompleted ? "#0f172a" : "#94a3b8", fontWeight: 700, display: "block" }}>
                      {m.label}
                    </strong>
                    <span style={{ fontSize: "0.78rem", color: "#64748b", maxWidth: "150px", display: "block", marginTop: "3px", lineHeight: 1.3 }}>
                      {m.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid: Left - Courier & Logs Activity, Right - Items Summary Receipt */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>

            {/* LEFT: Courier details and activity logs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

              {/* Courier Tracking Card */}
              <div style={{ border: "1px solid var(--line, #e2e8f0)", borderRadius: "20px", padding: "1.8rem", background: "#ffffff", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)" }}>
                <h3 className="eyebrow" style={{ color: "var(--accent-deep, #b45309)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                  Courier &amp; AWB Dispatch Details
                </h3>

                {data.tracking_number ? (
                  <div style={{ display: "grid", gap: "1.2rem" }}>
                    <div style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "#334155" }}>
                      Your fine jewellery package is dispatched via our verified logistics partner.<br />
                      <div style={{ marginTop: "8px" }}>
                        <span style={{ color: "#64748b" }}>Carrier Company:</span> <strong>{data.courier_name || "Courier Partner"}</strong>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px", flexWrap: "wrap" }}>
                        <span style={{ color: "#64748b" }}>Tracking Code (AWB):</span>
                        <code style={{ fontSize: "1.05rem", fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: "6px" }}>{data.tracking_number}</code>
                        <button
                          type="button"
                          onClick={() => handleCopyAwb(data.tracking_number!)}
                          style={{
                            background: copiedAwb ? "#dcfce7" : "#f1f5f9",
                            color: copiedAwb ? "#166534" : "#334155",
                            border: "1px solid #cbd5e1",
                            padding: "3px 10px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 600
                          }}
                        >
                          {copiedAwb ? "Copied" : "Copy AWB"}
                        </button>
                      </div>
                    </div>

                    {data.tracking_url && (
                      <a
                        href={data.tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="primary-button"
                        style={{
                          display: "inline-flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "8px",
                          textDecoration: "none",
                          padding: "0.8rem 1.4rem",
                          borderRadius: "12px",
                          fontWeight: 700,
                          background: "#2563eb",
                          color: "#ffffff"
                        }}
                      >
                        Track Live on {data.courier_name || "Courier"} Website ↗
                      </a>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.92rem", lineHeight: 1.6 }}>
                    Your jewelry is currently undergoing final quality inspection and hallmark authentication in our fulfillment studio. As soon as it is picked up by our air courier partner, active tracking numbers and live URLs will appear here.
                  </p>
                )}
              </div>

              {/* Timestamped Activity Logs */}
              <div style={{ border: "1px solid var(--line, #e2e8f0)", borderRadius: "20px", padding: "1.8rem", background: "#ffffff", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)" }}>
                <h3 className="eyebrow" style={{ color: "var(--accent-deep, #b45309)", marginBottom: "1.2rem", fontSize: "0.9rem" }}>
                  Live Tracking Activity Log
                </h3>

                <div style={{ display: "grid", gap: "1.5rem", paddingLeft: "10px" }}>
                  {data.tracking_milestones.map((milestone, i) => (
                    <div key={milestone.id} style={{ display: "flex", gap: "1.2rem", position: "relative" }}>
                      {/* Circle Dot */}
                      <div style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: i === data.tracking_milestones.length - 1 ? "#16a34a" : "#94a3b8",
                        marginTop: "5px",
                        zIndex: 2,
                        flexShrink: 0
                      }} />

                      {/* Connector Line */}
                      {i < data.tracking_milestones.length - 1 && (
                        <div style={{
                          position: "absolute",
                          top: "16px",
                          left: "5px",
                          width: "2px",
                          height: "calc(100% + 1.5rem)",
                          background: "#e2e8f0",
                          zIndex: 1
                        }} />
                      )}

                      <div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                          <strong style={{ fontSize: "0.98rem", color: "#0f172a" }}>{milestone.status}</strong>
                          {milestone.location && (
                            <span style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "8px", color: "#475569", fontWeight: 600 }}>
                              {milestone.location}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "#64748b", lineHeight: 1.4 }}>
                          {milestone.message}
                        </p>
                        <small style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginTop: "4px" }}>
                          {new Date(milestone.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {new Date(milestone.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT: Items summary receipt & Address */}
            <div style={{ border: "1px solid var(--line, #e2e8f0)", borderRadius: "20px", padding: "1.8rem", background: "#ffffff", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)", alignSelf: "flex-start" }}>
              <h3 className="eyebrow" style={{ color: "var(--accent-deep, #b45309)", marginBottom: "1.2rem", fontSize: "0.9rem" }}>
                Delivery Address &amp; Summary
              </h3>

              {/* Shipping Address */}
              <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1.2rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, display: "block", marginBottom: "4px", textTransform: "uppercase" }}>DELIVERING TO</span>
                <strong style={{ fontSize: "1.05rem", color: "#0f172a", display: "block" }}>{data.ship_name}</strong>
                <span style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.5, display: "block", marginTop: "2px" }}>
                  {data.ship_city}, {data.ship_state}
                </span>
              </div>

              {/* Items List */}
              <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
                {data.items.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: "50px", height: "50px", borderRadius: "10px", overflow: "hidden", position: "relative", border: "1px solid #e2e8f0", flexShrink: 0 }}>
                      {item.image ? (
                        <img
                          src={resolveAssetUrl(item.image)}
                          alt={item.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "#94a3b8" }}>ITEM</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#0f172a" }}>{item.name}</h4>
                      <small style={{ color: "#64748b" }}>
                        {item.quantity} unit(s) · {formatPrice(item.price, "₹")}
                      </small>
                    </div>
                    <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{formatPrice(item.price * item.quantity, "₹")}</strong>
                  </div>
                ))}
              </div>

              {/* Totals Box */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", fontSize: "0.88rem" }}>
                  <span style={{ color: "#64748b" }}>Payment Method</span>
                  <span style={{ fontWeight: 700, textTransform: "uppercase" }}>{data.payment_method}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", fontSize: "0.88rem" }}>
                  <span style={{ color: "#64748b" }}>Payment Status</span>
                  <span style={{ fontWeight: 700, color: data.payment_status === "paid" ? "#16a34a" : "#d97706", textTransform: "uppercase" }}>
                    {data.payment_status}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "1rem", marginTop: "0.8rem" }}>
                  <strong style={{ fontSize: "1.05rem", color: "#0f172a" }}>Total Order Value</strong>
                  <strong style={{ fontSize: "1.25rem", color: "#16a34a" }}>
                    {formatPrice(data.total_amount, "₹")}
                  </strong>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Trust Pillars */}
      <div style={{ marginTop: "4rem", borderTop: "1px solid var(--line, #e2e8f0)", paddingTop: "2.5rem" }}>
        <h3 style={{ textAlign: "center", fontSize: "1.3rem", fontWeight: 700, marginBottom: "2rem", color: "#0f172a" }}>
          The Kanakshi Delivery Experience
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
          <div style={{ padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--line, #e2e8f0)", background: "#ffffff", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 6px", fontSize: "1rem" }}>100% Insured Shipping</h4>
            <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748b", lineHeight: 1.5 }}>
              Every jewellery piece travels in tamper-evident sealed luxury vaults fully covered by transit insurance.
            </p>
          </div>

          <div style={{ padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--line, #e2e8f0)", background: "#ffffff", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 6px", fontSize: "1rem" }}>Express Air Delivery</h4>
            <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748b", lineHeight: 1.5 }}>
              Partnered with BlueDart, Delhivery, and DTDC for swift 2–4 business days delivery across 19,000+ pin codes.
            </p>
          </div>

          <div style={{ padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--line, #e2e8f0)", background: "#ffffff", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 6px", fontSize: "1rem" }}>7-Day Easy Returns</h4>
            <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748b", lineHeight: 1.5 }}>
              Not completely captivated? Request an effortless reverse pickup via our <Link href="/returns" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "underline" }}>Returns Portal</Link>.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .timeline-line-desktop {
            display: none !important;
          }
          .timeline-stepper {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.5rem !important;
          }
          .timeline-stepper > div {
            flex-direction: row !important;
            align-items: center !important;
            text-align: left !important;
            width: 100% !important;
          }
          .timeline-stepper > div > div {
            margin-bottom: 0 !important;
            margin-right: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <main style={{ minHeight: "80vh", background: "#fcfbf9", padding: "3.5rem 1.5rem" }}>
      <div style={{ maxWidth: "1020px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p className="eyebrow" style={{ color: "var(--accent-deep, #b45309)", letterSpacing: "2px", textTransform: "uppercase", fontSize: "0.82rem", fontWeight: 700 }}>
            Live Shipment Tracker
          </p>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 700, margin: "0.4rem 0 0.8rem", color: "#0f172a" }}>
            Track Your Order
          </h1>
          <p style={{ color: "#64748b", maxWidth: "560px", margin: "0 auto", fontSize: "0.98rem", lineHeight: 1.6 }}>
            Enter your Order ID and registered Email or Phone to track real-time courier movement, AWB dispatch updates, and delivery date.
          </p>
        </div>

        <Suspense fallback={
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <h2 style={{ fontSize: "1.2rem", color: "#64748b" }}>Loading shipment tracker…</h2>
          </div>
        }>
          <LiveTrackerContent />
        </Suspense>
      </div>
    </main>
  );
}
