"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice, lookupOrderForReturn, resolveAssetUrl, submitPublicOrderReturn } from "../../lib/api";

type LookupOrderData = {
  order_number: string;
  status: string;
  created_at?: string;
  subtotal: number;
  total_amount: number;
  ship_name: string;
  ship_email: string;
  ship_phone: string;
  is_return_eligible: boolean;
  items: Array<{
    id: number;
    product_id: number;
    variant_id?: number | null;
    name: string;
    quantity: number;
    price: number;
    image: string | null;
    size: string | null;
    color: string | null;
    sku: string | null;
  }>;
  existing_return?: {
    id: number;
    return_number: string;
    status: string;
    reason: string;
    customer_notes?: string | null;
    pickup_courier_name?: string | null;
    pickup_tracking_number?: string | null;
    pickup_tracking_url?: string | null;
    pickup_scheduled_date?: string | null;
    requested_items?: any[];
    requested_amount: number;
    approved_amount: number;
    refund_mode?: "wallet" | "original_payment";
    refund_processed_at?: string | null;
    reason_detail?: string | null;
    admin_notes?: string | null;
    requested_at?: string | null;
    resolved_at?: string | null;
  } | null;
};

const RETURN_REASONS = [
  "Size / Fitting Issue (e.g. Ring too loose/tight, unsuitable length)",
  "Design / Color Different from Photos (e.g. Stone or plating in person)",
  "Received Defective or Damaged (e.g. Scratched surface, loose clasp/gem)",
  "Received Wrong Item / SKU (e.g. Different piece delivered)",
  "Quality / Weight Not as Expected",
  "Arrived Later than Needed (e.g. Missed occasion/gift date)",
  "Want to Exchange for Another Design (Instant Wallet Credit)",
  "Other Reason"
];

export default function ReturnsPortalPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<LookupOrderData | null>(null);

  // Return submission states
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [reasonDetail, setReasonDetail] = useState("");
  const [refundMode, setRefundMode] = useState<"wallet" | "original_payment">("wallet");
  const [customerNotes, setCustomerNotes] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupError(null);
    setSubmitSuccess(null);
    setSubmitError(null);

    if (!orderNumber.trim() || !identifier.trim()) {
      setLookupError("Please provide both your Order ID and registered Email / Phone.");
      return;
    }

    setLoadingLookup(true);
    try {
      const res = await lookupOrderForReturn({
        order_number: orderNumber.trim(),
        identifier: identifier.trim(),
      });

      if (res.success && res.data) {
        setOrderData(res.data);
        // Pre-select first item
        if (res.data.items?.length > 0) {
          const first = res.data.items[0];
          setSelectedItems({ [first.id]: true });
          setSelectedQuantities({ [first.id]: 1 });
        }
      } else {
        setLookupError(res.message || "No matching order found. Please verify your order number and contact details.");
        setOrderData(null);
      }
    } catch (err: any) {
      setLookupError(err?.message || "Failed to lookup order details. Please try again.");
      setOrderData(null);
    } finally {
      setLoadingLookup(false);
    }
  }

  function handleItemToggle(itemId: number, maxQty: number) {
    setSelectedItems((prev) => {
      const nextState = !prev[itemId];
      if (nextState && !selectedQuantities[itemId]) {
        setSelectedQuantities((qPrev) => ({ ...qPrev, [itemId]: 1 }));
      }
      return { ...prev, [itemId]: nextState };
    });
  }

  function handleQuantityChange(itemId: number, qty: number, maxQty: number) {
    const clamped = Math.max(1, Math.min(qty, maxQty));
    setSelectedQuantities((prev) => ({ ...prev, [itemId]: clamped }));
  }

  async function handleSubmitReturn(e: React.FormEvent) {
    e.preventDefault();
    if (!orderData) return;

    setSubmitError(null);
    setSubmitSuccess(null);

    const itemsToReturn = orderData.items
      .filter((item) => selectedItems[item.id])
      .map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id ?? undefined,
        quantity: selectedQuantities[item.id] || 1,
      }));

    if (itemsToReturn.length === 0) {
      setSubmitError("Please select at least one item to return.");
      return;
    }

    const parsedImages = imageUrls
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    setSubmittingReturn(true);
    try {
      const res = await submitPublicOrderReturn({
        order_number: orderData.order_number,
        identifier: identifier.trim(),
        reason,
        reason_detail: reasonDetail.trim() || undefined,
        refund_mode: refundMode,
        customer_notes: customerNotes.trim() || undefined,
        items: itemsToReturn,
        images: parsedImages.length > 0 ? parsedImages : undefined,
      });

      if (res.success && res.data) {
        setSubmitSuccess(`Return request ${res.data.return_number} created successfully! Our concierge team will review and approve pickup within 24 hours.`);
        // Refresh lookup
        const refresh = await lookupOrderForReturn({
          order_number: orderData.order_number,
          identifier: identifier.trim(),
        });
        if (refresh.success && refresh.data) {
          setOrderData(refresh.data);
        }
      } else {
        setSubmitError(res.message || "Failed to submit return request. Please try again.");
      }
    } catch (err: any) {
      setSubmitError(err?.message || "An unexpected error occurred while submitting your return.");
    } finally {
      setSubmittingReturn(false);
    }
  }

  const estimatedRefund = orderData
    ? orderData.items
        .filter((item) => selectedItems[item.id])
        .reduce((sum, item) => sum + item.price * (selectedQuantities[item.id] || 1), 0)
    : 0;

  return (
    <main className="content-section" style={{ minHeight: "80vh", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: "920px", margin: "0 auto" }}>
        
        {/* Top Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p className="eyebrow" style={{ color: "var(--accent-deep)", letterSpacing: "2px" }}>Kanakshi Care &amp; Guarantees</p>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 700, margin: "0.5rem 0 1rem", color: "var(--text)" }}>
            Returns &amp; Exchanges Portal
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: "580px", margin: "0 auto", fontSize: "0.98rem", lineHeight: 1.6 }}>
            Look up your order to initiate an effortless 7-day return, exchange request, or track live reverse-pickup status.
          </p>
        </div>

        {/* Order Lookup Card */}
        <div style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid var(--line)", borderRadius: "24px", padding: "2rem", backdropFilter: "blur(12px)", boxShadow: "var(--shadow)", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.2rem", color: "var(--text)" }}>
            Step 1: Look Up Your Order
          </h3>

          <form onSubmit={handleLookup} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text)" }}>
                Order Number / Reference
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. KAN-20260819-ABCDE"
                required
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid var(--line-strong)", fontSize: "0.95rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text)" }}>
                Registered Email or 10-Digit Phone
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="customer@email.com or 9876543210"
                required
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid var(--line-strong)", fontSize: "0.95rem" }}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loadingLookup}
                className="primary-button"
                style={{ width: "100%", padding: "0.75rem 1.5rem", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
              >
                {loadingLookup ? "Finding Order…" : "Lookup Order & Returns"}
              </button>
            </div>
          </form>

          {lookupError && (
            <div style={{ marginTop: "1rem", padding: "0.85rem 1rem", borderRadius: "12px", background: "rgba(224, 90, 71, 0.08)", border: "1px solid rgba(224, 90, 71, 0.25)", color: "#a43c31", fontSize: "0.9rem" }}>
              {lookupError}
            </div>
          )}
        </div>

        {/* Loaded Order & Return Processing Section */}
        {orderData && (
          <div style={{ display: "grid", gap: "2rem" }}>
            
            {/* Order Overview Strip */}
            <div style={{ background: "rgba(255, 255, 255, 0.7)", border: "1px solid var(--line)", borderRadius: "20px", padding: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Order Found</span>
                <h4 style={{ margin: "2px 0 0", fontSize: "1.15rem", color: "var(--text)" }}>{orderData.order_number}</h4>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                  Recipient: <strong>{orderData.ship_name}</strong> • Total Paid: <strong>{formatPrice(orderData.total_amount)}</strong>
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>Order Status</span>
                <span style={{ display: "inline-block", marginTop: "2px", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: 700, textTransform: "capitalize", background: orderData.status === "delivered" ? "#dcfce7" : "#e0e7ff", color: orderData.status === "delivered" ? "#166534" : "#3730a3" }}>
                  {orderData.status}
                </span>
              </div>
            </div>

            {/* If an active return exists */}
            {orderData.existing_return && (
              <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "24px", padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div>
                    <span className="eyebrow" style={{ color: "#2563eb", letterSpacing: "1.5px" }}>Active Return Case</span>
                    <h3 style={{ margin: "4px 0", fontSize: "1.3rem" }}>{orderData.existing_return.return_number}</h3>
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "#64748b" }}>
                      Reason: <strong>{orderData.existing_return.reason}</strong>
                    </p>
                  </div>
                  <div>
                    <span style={{ padding: "6px 14px", borderRadius: "12px", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", background: orderData.existing_return.status === "refunded" ? "#dcfce7" : orderData.existing_return.status === "approved" ? "#dbeafe" : "#fef3c7", color: orderData.existing_return.status === "refunded" ? "#166534" : orderData.existing_return.status === "approved" ? "#1e40af" : "#92400e" }}>
                      {orderData.existing_return.status}
                    </span>
                  </div>
                </div>

                {/* Return Progress Timeline */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1rem", margin: "1.5rem 0", padding: "1.2rem", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#16a34a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <strong style={{ fontSize: "0.82rem", display: "block" }}>1. Requested</strong>
                    <small style={{ color: "#64748b", fontSize: "0.75rem" }}>Case Logged</small>
                  </div>
                  <div style={{ textAlign: "center", opacity: ["approved", "received", "refunded"].includes(orderData.existing_return.status) ? 1 : 0.4 }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: ["approved", "received", "refunded"].includes(orderData.existing_return.status) ? "#16a34a" : "#cbd5e1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontWeight: 700, fontSize: "0.85rem" }}>
                      {["approved", "received", "refunded"].includes(orderData.existing_return.status) ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : "2"}
                    </div>
                    <strong style={{ fontSize: "0.82rem", display: "block" }}>2. Approved</strong>
                    <small style={{ color: "#64748b", fontSize: "0.75rem" }}>Pickup Initiated</small>
                  </div>
                  <div style={{ textAlign: "center", opacity: ["received", "refunded"].includes(orderData.existing_return.status) ? 1 : 0.4 }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: ["received", "refunded"].includes(orderData.existing_return.status) ? "#16a34a" : "#cbd5e1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontWeight: 700, fontSize: "0.85rem" }}>
                      {["received", "refunded"].includes(orderData.existing_return.status) ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : "3"}
                    </div>
                    <strong style={{ fontSize: "0.82rem", display: "block" }}>3. Received</strong>
                    <small style={{ color: "#64748b", fontSize: "0.75rem" }}>Lab Inspected</small>
                  </div>
                  <div style={{ textAlign: "center", opacity: orderData.existing_return.status === "refunded" ? 1 : 0.4 }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: orderData.existing_return.status === "refunded" ? "#16a34a" : "#cbd5e1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontWeight: 700, fontSize: "0.85rem" }}>
                      {orderData.existing_return.status === "refunded" ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : "4"}
                    </div>
                    <strong style={{ fontSize: "0.82rem", display: "block" }}>4. Refunded</strong>
                    <small style={{ color: "#64748b", fontSize: "0.75rem" }}>Amount Credited</small>
                  </div>
                </div>

                {/* Refund Settled / Celebration Banner */}
                {orderData.existing_return.status === "refunded" && (
                  <div style={{
                    margin: "1.5rem 0",
                    padding: "1.5rem",
                    borderRadius: "18px",
                    background: "linear-gradient(135deg, rgba(241, 167, 32, 0.12) 0%, rgba(241, 167, 32, 0.04) 100%)",
                    border: "1px solid rgba(241, 167, 32, 0.35)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
                      </div>
                      <div>
                        <h4 style={{ margin: "0 0 2px", fontSize: "1.15rem", color: "var(--text)" }}>
                          {orderData.existing_return.refund_mode === "wallet"
                            ? `${formatPrice(orderData.existing_return.approved_amount)} Credited to Your Kanakshi Wallet`
                            : `Refund of ${formatPrice(orderData.existing_return.approved_amount)} Processed`}
                        </h4>
                        <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--muted)" }}>
                          {orderData.existing_return.refund_mode === "wallet"
                            ? "Your refund is ready to spend immediately. Use it at checkout to buy any other fine jewellery piece!"
                            : "Refund has been sent to your original payment method. Please allow 3–5 working days."}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
                      <Link
                        href="/shop"
                        className="primary-button"
                        style={{ padding: "0.65rem 1.4rem", borderRadius: "10px", fontSize: "0.88rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                      >
                        <span>Shop Fine Jewellery With Wallet Cash</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </Link>
                      <Link
                        href="/account"
                        style={{ padding: "0.65rem 1.2rem", borderRadius: "10px", fontSize: "0.88rem", border: "1px solid var(--line-strong)", background: "#fff", color: "var(--text)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600 }}
                      >
                        <span>View Wallet in My Account</span>
                      </Link>
                    </div>
                  </div>
                )}

                {orderData.existing_return.pickup_tracking_number && (
                  <div style={{ margin: "1rem 0", padding: "1rem", background: "#f0fdf4", borderRadius: "14px", border: "1px solid #bbf7d0", fontSize: "0.9rem" }}>
                    <div style={{ fontWeight: 700, color: "#166534", marginBottom: "4px" }}>Reverse Pickup Details:</div>
                    <div style={{ color: "#15803d", lineHeight: 1.6 }}>
                      <span>Carrier: <strong>{orderData.existing_return.pickup_courier_name || 'Delhivery Reverse'}</strong></span> • <span>Pickup AWB: <code style={{ fontWeight: 700, background: "#dcfce7", padding: "2px 6px", borderRadius: "4px" }}>{orderData.existing_return.pickup_tracking_number}</code></span>
                      {orderData.existing_return.pickup_scheduled_date && (
                        <div>Scheduled Pickup Date: <strong>{orderData.existing_return.pickup_scheduled_date}</strong></div>
                      )}
                    </div>
                    {orderData.existing_return.pickup_tracking_url && (
                      <a href={orderData.existing_return.pickup_tracking_url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "8px", color: "#15803d", fontWeight: 700, textDecoration: "underline" }}>
                        Track Reverse Courier Live ↗
                      </a>
                    )}
                  </div>
                )}

                {orderData.existing_return.admin_notes && (
                  <div style={{ padding: "0.85rem 1rem", background: "#f1f5f9", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "0.88rem", color: "#334155" }}>
                    <strong>Concierge Note:</strong> {orderData.existing_return.admin_notes}
                  </div>
                )}
              </div>
            )}

            {/* If Order is not eligible for return */}
            {!orderData.is_return_eligible && !orderData.existing_return && (
              <div style={{ padding: "1.5rem", borderRadius: "18px", background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.3)", color: "#854d0e", lineHeight: 1.5 }}>
                <strong style={{ display: "block", marginBottom: "4px" }}>Order Not Yet Eligible for Returns</strong>
                Returns and exchanges can only be created once the shipment has been dispatched or delivered. Your order is currently in <code>{orderData.status}</code> stage. If you need urgent cancellation or address modifications, please WhatsApp us at <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" style={{ color: "#854d0e", fontWeight: 700, textDecoration: "underline" }}>+91 98765 43210</a>.
              </div>
            )}

            {/* If eligible and can submit new return */}
            {orderData.is_return_eligible && !orderData.existing_return && (
              <div style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid var(--line)", borderRadius: "24px", padding: "2rem", backdropFilter: "blur(12px)", boxShadow: "var(--shadow)" }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text)" }}>
                  Step 2: Select Items to Return
                </h3>

                <form onSubmit={handleSubmitReturn}>
                  <div style={{ display: "grid", gap: "1rem", marginBottom: "1.8rem" }}>
                    {orderData.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemToggle(item.id, item.quantity)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1rem",
                          borderRadius: "16px",
                          border: selectedItems[item.id] ? "2px solid var(--accent)" : "1px solid var(--line)",
                          background: selectedItems[item.id] ? "rgba(241, 167, 32, 0.04)" : "#fff",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!selectedItems[item.id]}
                          onChange={() => {}}
                          style={{ width: "18px", height: "18px", accentColor: "var(--accent)" }}
                        />
                        <div style={{ width: "54px", height: "54px", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--line)", flexShrink: 0 }}>
                          <img
                            src={resolveAssetUrl(item.image)}
                            alt={item.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: "block", fontSize: "0.98rem", color: "var(--text)" }}>{item.name}</strong>
                          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                            Delivered: {item.quantity} unit(s) • {formatPrice(item.price)} each
                          </span>
                        </div>
                        {selectedItems[item.id] && (
                          <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <label style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>Qty to Return:</label>
                            <input
                              type="number"
                              min={1}
                              max={item.quantity}
                              value={selectedQuantities[item.id] || 1}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1, item.quantity)}
                              style={{ width: "60px", padding: "4px 8px", borderRadius: "8px", border: "1px solid var(--line-strong)", textAlign: "center", fontWeight: 700 }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gap: "1.4rem", marginBottom: "1.8rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text)" }}>
                        Primary Reason for Return *
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid var(--line-strong)", fontSize: "0.95rem" }}
                      >
                        {RETURN_REASONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text)" }}>
                        Specific Concern / Detail (Optional)
                      </label>
                      <input
                        type="text"
                        value={reasonDetail}
                        onChange={(e) => setReasonDetail(e.target.value)}
                        placeholder="e.g. Ring size was too loose, want to exchange for smaller size"
                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid var(--line-strong)", fontSize: "0.92rem" }}
                      />
                    </div>

                    {/* Refund Preference Selection */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.6rem", color: "var(--text)" }}>
                        Choose Refund Settlement Method *
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                        <div
                          onClick={() => setRefundMode("wallet")}
                          style={{
                            padding: "1.2rem",
                            borderRadius: "16px",
                            border: refundMode === "wallet" ? "2px solid var(--accent)" : "1px solid var(--line)",
                            background: refundMode === "wallet" ? "rgba(241, 167, 32, 0.06)" : "#fff",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <input
                                type="radio"
                                name="refund_mode"
                                checked={refundMode === "wallet"}
                                onChange={() => setRefundMode("wallet")}
                                style={{ accentColor: "var(--accent)" }}
                              />
                              <strong style={{ color: "var(--text)", fontSize: "0.95rem" }}>Instant Kanakshi Wallet Cash</strong>
                            </div>
                            <span style={{ fontSize: "0.72rem", background: "rgba(241, 167, 32, 0.18)", color: "#b45309", padding: "2px 8px", borderRadius: "8px", fontWeight: 700, textTransform: "uppercase" }}>
                              Recommended
                            </span>
                          </div>
                          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.45 }}>
                            100% money credited to your wallet immediately upon lab verification. Zero waiting time — buy another jewellery piece right away!
                          </p>
                        </div>

                        <div
                          onClick={() => setRefundMode("original_payment")}
                          style={{
                            padding: "1.2rem",
                            borderRadius: "16px",
                            border: refundMode === "original_payment" ? "2px solid var(--accent)" : "1px solid var(--line)",
                            background: refundMode === "original_payment" ? "rgba(241, 167, 32, 0.06)" : "#fff",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <input
                              type="radio"
                              name="refund_mode"
                              checked={refundMode === "original_payment"}
                              onChange={() => setRefundMode("original_payment")}
                              style={{ accentColor: "var(--accent)" }}
                            />
                            <strong style={{ color: "var(--text)", fontSize: "0.95rem" }}>Original Payment Source / Bank</strong>
                          </div>
                          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.45 }}>
                            Credited back to your original payment card, UPI, or bank account in 3–5 working days post quality verification.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text)" }}>
                        Additional Notes / Feedback (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="Please describe the issue or any specific request for our concierge team..."
                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid var(--line-strong)", fontSize: "0.92rem", lineHeight: 1.5 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text)" }}>
                        Photo Proof / Image URLs (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={imageUrls}
                        onChange={(e) => setImageUrls(e.target.value)}
                        placeholder="One image URL per line showing tags / condition (e.g. https://...)"
                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid var(--line-strong)", fontSize: "0.92rem" }}
                      />
                    </div>
                  </div>

                  {/* Summary & Submission */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Estimated Refund Value</span>
                      <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#16a34a" }}>
                        {formatPrice(estimatedRefund)}
                      </div>
                      <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
                        Settlement Mode: <strong>{refundMode === "wallet" ? "Instant Kanakshi Wallet Cash" : "Original Payment Source"}</strong>
                      </small>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReturn || estimatedRefund <= 0}
                      className="primary-button"
                      style={{ padding: "0.85rem 1.8rem", borderRadius: "12px", fontSize: "0.95rem" }}
                    >
                      {submittingReturn ? "Submitting Return Request…" : "Confirm & Submit Return"}
                    </button>
                  </div>

                  {submitError && (
                    <div style={{ padding: "0.85rem 1rem", borderRadius: "12px", background: "rgba(224, 90, 71, 0.08)", border: "1px solid rgba(224, 90, 71, 0.25)", color: "#a43c31", fontSize: "0.9rem" }}>
                      {submitError}
                    </div>
                  )}

                  {submitSuccess && (
                    <div style={{ padding: "0.85rem 1rem", borderRadius: "12px", background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#15803d", fontSize: "0.9rem" }}>
                      {submitSuccess}
                    </div>
                  )}
                </form>
              </div>
            )}

          </div>
        )}

        {/* 7-Day Return Policy & Non-Returnable Terms */}
        <div style={{ marginTop: "3.5rem", borderTop: "1px solid var(--line)", paddingTop: "2.5rem", display: "grid", gap: "2.5rem" }}>
          <div>
            <h3 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text)" }}>
              The Kanakshi 7-Day Home Trial Promise
            </h3>
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.92rem", maxWidth: "600px", margin: "0 auto 2rem" }}>
              Experience the craftsmanship in person with complete peace of mind.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
              <div style={{ padding: "1.6rem", borderRadius: "20px", border: "1px solid var(--line)", background: "rgba(255, 255, 255, 0.7)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(241, 167, 32, 0.12)", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.8rem" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </div>
                <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem", color: "var(--text)" }}>7-Day Hassle-Free Returns</h4>
                <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--muted)", lineHeight: 1.55 }}>
                  Try your jewellery at home. If the fit or style is not what you expected, initiate a return within 7 calendar days of delivery.
                </p>
              </div>

              <div style={{ padding: "1.6rem", borderRadius: "20px", border: "1px solid var(--line)", background: "rgba(255, 255, 255, 0.7)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(37, 99, 235, 0.12)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.8rem" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="13" x="1" y="3" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </div>
                <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem", color: "var(--text)" }}>Insured Doorstep Pickup</h4>
                <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--muted)", lineHeight: 1.55 }}>
                  Our trusted logistics partners (Delhivery, BlueDart) will pick up the package securely right from your doorstep.
                </p>
              </div>

              <div style={{ padding: "1.6rem", borderRadius: "20px", border: "1px solid var(--line)", background: "rgba(255, 255, 255, 0.7)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(22, 163, 74, 0.12)", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.8rem" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem", color: "var(--text)" }}>100% Refund or Exchange</h4>
                <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--muted)", lineHeight: 1.55 }}>
                  Refunds are credited directly back to your source account or Kanakshi wallet within 3–5 working days post quality verification.
                </p>
              </div>
            </div>
          </div>

          {/* Non-Returnable Terms & Conditions Card */}
          <div style={{
            background: "linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)",
            border: "1px solid #fecaca",
            borderRadius: "24px",
            padding: "2.2rem 2rem",
            color: "#991b1b"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              </div>
              <h4 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#991b1b" }}>
                Non-Returnable Items &amp; Policy Terms
              </h4>
            </div>

            <p style={{ margin: "0 0 1.2rem", fontSize: "0.9rem", color: "#7f1d1d", lineHeight: 1.5 }}>
              To maintain the highest standards of hygiene, purity, and certified craftsmanship, the following items and conditions are strictly non-returnable and non-refundable:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
              <div style={{ background: "#ffffff", padding: "1rem 1.2rem", borderRadius: "14px", border: "1px solid #fecaca" }}>
                <strong style={{ color: "#991b1b", fontSize: "0.9rem", display: "block", marginBottom: "3px" }}>
                  1. Customized &amp; Engraved Pieces
                </strong>
                <span style={{ color: "#7f1d1d", fontSize: "0.82rem", lineHeight: 1.45, display: "block" }}>
                  Jewellery custom-made with bespoke engravings, monograms, custom ring sizing, or custom gemstones cannot be returned.
                </span>
              </div>

              <div style={{ background: "#ffffff", padding: "1rem 1.2rem", borderRadius: "14px", border: "1px solid #fecaca" }}>
                <strong style={{ color: "#991b1b", fontSize: "0.9rem", display: "block", marginBottom: "3px" }}>
                  2. Tampered Authenticity Seals
                </strong>
                <span style={{ color: "#7f1d1d", fontSize: "0.82rem", lineHeight: 1.45, display: "block" }}>
                  Products with removed, broken, or tampered security tags, missing authenticity cards, or incomplete packaging.
                </span>
              </div>

              <div style={{ background: "#ffffff", padding: "1rem 1.2rem", borderRadius: "14px", border: "1px solid #fecaca" }}>
                <strong style={{ color: "#991b1b", fontSize: "0.9rem", display: "block", marginBottom: "3px" }}>
                  3. Worn, Perfumed, or Altered Jewellery
                </strong>
                <span style={{ color: "#7f1d1d", fontSize: "0.82rem", lineHeight: 1.45, display: "block" }}>
                  Pieces showing signs of wear, cosmetic/perfume residue, scratches, chemical exposure, or resizing by third-party jewelers.
                </span>
              </div>

              <div style={{ background: "#ffffff", padding: "1rem 1.2rem", borderRadius: "14px", border: "1px solid #fecaca" }}>
                <strong style={{ color: "#991b1b", fontSize: "0.9rem", display: "block", marginBottom: "3px" }}>
                  4. Requests Beyond 7 Days
                </strong>
                <span style={{ color: "#7f1d1d", fontSize: "0.82rem", lineHeight: 1.45, display: "block" }}>
                  Return or exchange requests submitted after 7 calendar days from the date of confirmed delivery will not be accepted.
                </span>
              </div>
            </div>

            <div style={{ marginTop: "1.2rem", fontSize: "0.84rem", color: "#991b1b", borderTop: "1px solid #fecaca", paddingTop: "0.8rem" }}>
              <strong>Transit Damages / Shortages:</strong> Any in-transit damage or package tampering must be reported to our concierge within 48 hours of delivery with unboxing photos/video.
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
