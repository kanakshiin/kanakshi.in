"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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
  tracking_number: string | null;
  tracking_url: string | null;
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
        setError(res.message || "No matching order found. Please check your credentials.");
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
    if (!orderNumber || !contact) {
      setError("Please fill out both Order Number and Billing Email/Phone.");
      return;
    }
    triggerTracking(orderNumber, contact);
  }

  // Predefined pipeline for shipment timelines
  const standardMilestones = [
    { key: "Placed", label: "Placed", desc: "Order successfully submitted" },
    { key: "Confirmed", label: "Confirmed", desc: "Verified by our jewelry atelier" },
    { key: "Shipped", label: "Shipped", desc: "Dispatched via air express" },
    { key: "Out for Delivery", label: "Out for Delivery", desc: "Arrived at your local delivery hub" },
    { key: "Delivered", label: "Delivered", desc: "Successfully delivered to recipient" }
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
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      
      {/* Search Bar Form */}
      <div style={{
        border: "1px solid var(--line)",
        borderRadius: "28px",
        padding: "2rem",
        background: "rgba(255, 253, 249, 0.94)",
        boxShadow: "var(--shadow)",
        marginBottom: "3rem"
      }}>
        <form onSubmit={handleFormSubmit} style={{ display: "grid", gap: "1.5rem", alignItems: "end" }} className="auth-grid-form tracking-search-form">
          <div className="auth-field" style={{ gridColumn: "span 1" }}>
            <span>Order Number *</span>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. KAN-20260522-ABCD"
              style={{ minHeight: "50px" }}
            />
          </div>

          <div className="auth-field" style={{ gridColumn: "span 1" }}>
            <span>Billing Email / Phone *</span>
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Email or 10-digit phone"
              style={{ minHeight: "50px" }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="primary-button"
            style={{
              minHeight: "50px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.8 : 1,
              width: "100%",
              justifyContent: "center",
              display: "flex",
              alignItems: "center"
            }}
          >
            {isLoading ? "Searching…" : "Track Order"}
          </button>
        </form>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* TRACKING RESULTS VIEW */}
      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          
          {/* Header summary panel */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem", borderBottom: "1px solid var(--line)", paddingBottom: "1.5rem" }}>
            <div>
              <p className="eyebrow" style={{ color: "var(--accent-deep)", marginBottom: "0.2rem" }}>Shipment Tracked</p>
              <h2 style={{ fontSize: "2.2rem", margin: 0 }}>Order {data.order_number}</h2>
              <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                Placed on {new Date(data.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>

            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>ESTIMATED ARRIVAL</span>
                <strong style={{ fontSize: "1.1rem" }}>
                  {new Date(new Date(data.created_at).getTime() + 5*24*60*60*1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </strong>
              </div>
              <div style={{ background: "rgba(45, 123, 76, 0.08)", color: "#2d7b4c", padding: "8px 16px", borderRadius: "14px", fontWeight: 700, textTransform: "uppercase", fontSize: "0.9rem" }}>
                {data.status}
              </div>
            </div>
          </div>

          {/* Premium Timeline Stepper */}
          <div style={{
            border: "1px solid var(--line)",
            borderRadius: "28px",
            padding: "2.5rem 2rem",
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(10px)",
            boxShadow: "var(--shadow)"
          }}>
            <h3 className="eyebrow" style={{ color: "var(--accent-deep)", marginBottom: "2rem", fontSize: "1rem" }}>Delivery Progress</h3>
            
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative", flexWrap: "wrap", gap: "1.5rem" }} className="timeline-stepper">
              
              {/* Stepper Connector Line */}
              <div style={{
                position: "absolute",
                top: "15px",
                left: "40px",
                right: "40px",
                height: "4px",
                background: "var(--line)",
                zIndex: 1,
                display: "block"
              }} className="timeline-line-desktop" />

              {standardMilestones.map((m, index) => {
                const isCompleted = index <= activeIndex;
                const isActive = index === activeIndex;

                return (
                  <div key={m.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1, minWidth: "120px", zIndex: 2 }}>
                    
                    {/* Circle Pin */}
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: isCompleted ? "var(--accent)" : "#FFF",
                      border: isCompleted ? "none" : "2px solid var(--line-strong)",
                      color: isCompleted ? "var(--accent-deep)" : "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      boxShadow: isActive ? "0 0 0 6px rgba(241, 167, 32, 0.18)" : "none",
                      transition: "all 0.3s ease",
                      marginBottom: "0.8rem"
                    }}>
                      {isCompleted ? "✓" : index + 1}
                    </div>

                    <strong style={{ fontSize: "0.95rem", color: isCompleted ? "var(--text)" : "var(--muted)", fontWeight: 700, display: "block" }}>
                      {m.label}
                    </strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)", maxWidth: "150px", display: "block", marginTop: "2px", lineHeight: 1.3 }}>
                      {m.desc}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Grid: Left - Courier & Logs activity, Right - Items summary receipt */}
          <div style={{ display: "grid", gap: "2.5rem" }} className="auth-two-column tracking-results-layout">
            
            {/* LEFT: Courier details and activity logs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              
              {/* Courier Tracking Card */}
              <div style={{ border: "1px solid var(--line)", borderRadius: "28px", padding: "2rem", background: "rgba(255, 255, 255, 0.6)" }}>
                <h3 className="eyebrow" style={{ color: "var(--accent-deep)", marginBottom: "1rem" }}>Courier Details</h3>
                
                {data.tracking_number ? (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.5 }}>
                      Your jewelry shipment is dispatched via our premium courier partner.<br />
                      <strong>Carrier:</strong> Blue Dart Air Express<br />
                      <strong>Waybill Number (AWB):</strong> {data.tracking_number}
                    </p>
                    {data.tracking_url && (
                      <a href={data.tracking_url} target="_blank" rel="noreferrer" className="primary-button" style={{ display: "inline-flex", justifyContent: "center", textDecoration: "none" }}>
                        Track Live on Blue Dart Gateway →
                      </a>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
                    Your package is currently in our quality control check at the warehouse. As soon as it is handed over to the courier partner, active tracking numbers and live URLs will be loaded here.
                  </p>
                )}
              </div>

              {/* Timestamped Activity Logs */}
              <div style={{ border: "1px solid var(--line)", borderRadius: "28px", padding: "2rem", background: "rgba(255, 255, 255, 0.6)" }}>
                <h3 className="eyebrow" style={{ color: "var(--accent-deep)", marginBottom: "1.5rem" }}>Activity Feed</h3>
                
                <div style={{ display: "grid", gap: "1.5rem", paddingLeft: "10px" }}>
                  {data.tracking_milestones.map((milestone, i) => (
                    <div key={milestone.id} style={{ display: "flex", gap: "1.2rem", position: "relative" }}>
                      
                      {/* Circle Dot */}
                      <div style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: i === data.tracking_milestones.length - 1 ? "var(--accent)" : "var(--line-strong)",
                        marginTop: "4px",
                        zIndex: 2
                      }} />

                      {/* Line */}
                      {i < data.tracking_milestones.length - 1 && (
                        <div style={{
                          position: "absolute",
                          top: "16px",
                          left: "5px",
                          width: "2px",
                          height: "calc(100% + 1.5rem)",
                          background: "var(--line)",
                          zIndex: 1
                        }} />
                      )}

                      <div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <strong style={{ fontSize: "1rem" }}>{milestone.status}</strong>
                          {milestone.location && (
                            <span style={{ fontSize: "0.75rem", background: "rgba(var(--rgb-text), 0.05)", padding: "2px 8px", borderRadius: "10px", color: "var(--muted)" }}>
                              {milestone.location}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: "2px 0 0", fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.4 }}>{milestone.message}</p>
                        <small style={{ fontSize: "0.75rem", color: "rgba(var(--rgb-text), 0.4)", display: "block", marginTop: "4px" }}>
                          {new Date(milestone.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {new Date(milestone.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT: Items receipt */}
            <div style={{ border: "1px solid var(--line)", borderRadius: "28px", padding: "2rem", background: "rgba(255, 255, 255, 0.7)", height: "fit-content" }}>
              <h3 className="eyebrow" style={{ color: "var(--accent-deep)", marginBottom: "1.5rem" }}>Receipt Details</h3>
              
              {/* Shipping Address */}
              <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--line)", paddingBottom: "1.2rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "4px" }}>DELIVERING TO</span>
                <strong style={{ fontSize: "1rem", color: "var(--text)", display: "block" }}>{data.ship_name}</strong>
                <span style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.4, display: "block", marginTop: "2px" }}>
                  {data.ship_city}, {data.ship_state}
                </span>
              </div>

              {/* Items List */}
              <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
                {data.items.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: "45px", height: "45px", borderRadius: "10px", overflow: "hidden", position: "relative", border: "1px solid var(--line)" }}>
                      {item.image ? (
                        <img
                          src={resolveAssetUrl(item.image)}
                          alt={item.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "rgba(var(--rgb-text), 0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>📦</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>{item.name}</h4>
                      <small style={{ color: "var(--muted)" }}>
                        {item.quantity} x {formatPrice(item.price, "₹")}
                      </small>
                    </div>
                    <strong>{formatPrice(item.price * item.quantity, "₹")}</strong>
                  </div>
                ))}
              </div>

              {/* Totals Box */}
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--muted)" }}>Payment Method</span>
                  <span style={{ fontWeight: 600, textTransform: "uppercase" }}>{data.payment_method}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--muted)" }}>Payment Status</span>
                  <span style={{ fontWeight: 600, color: data.payment_status === "paid" ? "#2d7b4c" : "var(--accent-deep)" }}>
                    {data.payment_status.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: "1rem", marginTop: "0.8rem" }}>
                  <strong style={{ fontSize: "1.1rem" }}>Total Paid</strong>
                  <strong style={{ fontSize: "1.2rem", color: "var(--accent-deep)" }}>
                    {formatPrice(data.total_amount, "₹")}
                  </strong>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

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
    <main className="page-shell" style={{ minHeight: "80vh", background: "linear-gradient(to bottom, #FAF8F5, #FFFFFF)", padding: "4rem 0" }}>
      <section className="content-section">
        <div className="container" style={{ maxWidth: "1000px" }}>
          <p className="eyebrow" style={{ textAlign: "center" }}>Live Tracker</p>
          <h1 className="page-title" style={{ textAlign: "center", marginBottom: "3rem" }}>Track Your Order</h1>
          
          <Suspense fallback={
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p className="eyebrow">Kanakshi.in</p>
              <h2 className="auth-title">Preparing shipment details lookup…</h2>
            </div>
          }>
            <LiveTrackerContent />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
