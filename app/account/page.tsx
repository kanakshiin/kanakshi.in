"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { clearCustomerToken, fetchCurrentCustomer, getStoredCustomerToken, logoutCustomer } from "../../lib/customer-auth";
import { getCustomerOrders, getCustomerOrderDetail, formatPrice, resolveAssetUrl } from "../../lib/api";
import { CustomerUser } from "../../lib/types";

// Type definitions matching CustomerOrderController responses
interface OrderSummary {
  id: number;
  order_number: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping_cost: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  ship_name: string;
  created_at: string;
  items_count: number;
  first_item_image: string | null;
  first_item_name: string | null;
}

interface OrderDetail {
  id: number;
  order_number: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping_cost: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  payment_id: string | null;
  ship_name: string;
  ship_email: string;
  ship_phone: string;
  ship_address: string;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  notes: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  items: Array<{
    id: number;
    product_id: number;
    variant_id: number | null;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
    size: string | null;
    color: string | null;
    variant_details: string | null;
    line_total: number;
    sku: string | null;
  }>;
  tracking: Array<{
    id: number;
    status: string;
    location: string | null;
    message: string | null;
    created_at: string;
  }>;
}

export default function AccountPage() {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Orders states
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredCustomerToken();

    if (!token) {
      setLoading(false);
      return;
    }

    setLoadingOrders(true);
    fetchCurrentCustomer(token)
      .then((customer) => {
        setUser(customer);
        setError(null);

        // Fetch user order history
        return getCustomerOrders(token);
      })
      .then((res) => {
        if (res && res.success && res.data) {
          setOrders(res.data);
        }
      })
      .catch((err: Error) => {
        clearCustomerToken();
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
        setLoadingOrders(false);
      });
  }, []);

  async function handleLogout() {
    const token = getStoredCustomerToken();

    if (token) {
      try {
        await logoutCustomer(token);
      } catch {
        // Ignore logout transport errors and clear the local session anyway.
      }
    }

    clearCustomerToken();
    window.location.href = "/account/login";
  }

  async function handleViewOrderDetail(orderNumber: string) {
    const token = getStoredCustomerToken();
    if (!token) return;

    setLoadingOrderDetail(orderNumber);
    try {
      const res = await getCustomerOrderDetail(token, orderNumber);
      if (res && res.success && res.data) {
        setSelectedOrder(res.data);
      } else {
        alert(res.message || "Failed to load order details.");
      }
    } catch (e) {
      console.error("View order details error:", e);
      alert("Something went wrong while fetching order receipt.");
    } finally {
      setLoadingOrderDetail(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return { bg: "rgba(45, 123, 76, 0.08)", text: "#2d7b4c" };
      case "cancelled":
        return { bg: "rgba(181, 58, 44, 0.08)", text: "#b53a2c" };
      case "shipped":
        return { bg: "rgba(33, 115, 181, 0.08)", text: "#2173b5" };
      case "placed":
      case "pending":
        return { bg: "rgba(241, 167, 32, 0.08)", text: "#b57317" };
      default:
        return { bg: "rgba(var(--rgb-text), 0.06)", text: "var(--text)" };
    }
  };

  return (
    <main className="content-section auth-page" style={{ padding: "4rem 0", background: "linear-gradient(to bottom, #FAF8F5, #FFFFFF)" }}>
      <div className="container" style={{ maxWidth: selectedOrder ? "1200px" : "1100px" }}>
        
        {/* Main account wrapper */}
        <div style={{ display: "grid", gridTemplateColumns: user ? "0.35fr 0.65fr" : "1fr", gap: "2.5rem" }} className="auth-two-column">
          
          {/* PROFILE SUMMARY COLUMN */}
          <section className="auth-card" style={{ width: "100%", margin: 0, height: "fit-content", position: "sticky", top: "2rem" }}>
            <small className="eyebrow">Customer Account</small>
            <h1 className="auth-title" style={{ fontSize: "2.2rem" }}>Profile</h1>
            {loading ? <p className="auth-muted">Loading your account…</p> : null}
            
            {!loading && !user ? (
              <div className="auth-stack">
                <p className="auth-muted">{error || "You are not logged in yet."}</p>
                <div className="auth-link-row">
                  <Link href="/account/login" className="primary-button">Login</Link>
                  <Link href="/account/register" className="secondary-button">Create Account</Link>
                </div>
              </div>
            ) : null}

            {!loading && user ? (
              <div className="auth-stack" style={{ gap: "1.5rem" }}>
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div className="account-summary-card">
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>NAME</span>
                    <strong style={{ fontSize: "1.05rem" }}>{user.name}</strong>
                  </div>
                  <div className="account-summary-card">
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>EMAIL</span>
                    <strong style={{ fontSize: "1.05rem", overflowWrap: "anywhere" }}>{user.email}</strong>
                  </div>
                  <div className="account-summary-card">
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>PHONE</span>
                    <strong style={{ fontSize: "1.05rem" }}>{user.phone || "Not added yet"}</strong>
                  </div>
                  <div className="account-summary-card">
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>EMAIL STATUS</span>
                    <strong style={{ fontSize: "1.05rem", color: user.email_verified_at ? "#2d7b4c" : "var(--accent-deep)" }}>
                      {user.email_verified_at ? "Verified" : "Pending Verification"}
                    </strong>
                  </div>
                </div>
                <button type="button" className="secondary-button" style={{ width: "100%", cursor: "pointer" }} onClick={handleLogout}>Logout</button>
              </div>
            ) : null}
          </section>

          {/* ORDER HISTORY COLUMN */}
          {user && (
            <section style={{ border: "1px solid var(--line)", borderRadius: "32px", padding: "2.4rem", background: "rgba(255, 253, 249, 0.94)", boxShadow: "var(--shadow)" }}>
              <small className="eyebrow">Purchase History</small>
              <h2 className="auth-title" style={{ fontSize: "2.2rem", marginBottom: "1.5rem" }}>Orders</h2>

              {loadingOrders ? (
                <p className="auth-muted">Loading your past purchases…</p>
              ) : orders.length === 0 ? (
                <div style={{ padding: "3rem 1.5rem", textAlign: "center", border: "1px dashed var(--line-strong)", borderRadius: "24px" }}>
                  <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "1rem" }}>🛍️</span>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>No orders placed yet</h3>
                  <p className="auth-muted" style={{ marginBottom: "1.5rem" }}>Explore our catalog and find premium brass accents for your home.</p>
                  <Link href="/shop" className="primary-button" style={{ display: "inline-block", textDecoration: "none" }}>Shop Now</Link>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "1.2rem" }}>
                  {orders.map((order) => {
                    const badge = getStatusColor(order.status);
                    return (
                      <div
                        key={order.order_number}
                        style={{
                          border: "1px solid var(--line)",
                          borderRadius: "24px",
                          padding: "1.2rem",
                          background: "rgba(255,255,255,0.7)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "1.5rem",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {/* Left Info: Product first item thumbnail & metadata */}
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                          <div style={{ width: "55px", height: "55px", borderRadius: "12px", overflow: "hidden", position: "relative", border: "1px solid var(--line)" }}>
                            {order.first_item_image ? (
                              <img
                                src={resolveAssetUrl(order.first_item_image)}
                                alt={order.first_item_name || "Item"}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <div style={{ width: "100%", height: "100%", background: "rgba(var(--rgb-text), 0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>📦</div>
                            )}
                          </div>

                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <strong style={{ fontSize: "1.05rem" }}>{order.order_number}</strong>
                              <span style={{ fontSize: "0.75rem", background: badge.bg, color: badge.text, padding: "2px 8px", borderRadius: "8px", fontWeight: 700, textTransform: "capitalize" }}>
                                {order.status}
                              </span>
                            </div>
                            <span style={{ fontSize: "0.85rem", color: "var(--muted)", display: "block", marginTop: "2px" }}>
                              {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {order.items_count} {order.items_count === 1 ? "item" : "items"}
                            </span>
                          </div>
                        </div>

                        {/* Right Action: Total cost & view details button */}
                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>TOTAL PAID</span>
                            <strong style={{ fontSize: "1.1rem", color: "var(--accent-deep)" }}>
                              {formatPrice(order.total_amount, "₹")}
                            </strong>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleViewOrderDetail(order.order_number)}
                            disabled={loadingOrderDetail !== null}
                            className="secondary-button"
                            style={{
                              padding: "0.6rem 1rem",
                              borderRadius: "14px",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              minWidth: "100px",
                              textAlign: "center"
                            }}
                          >
                            {loadingOrderDetail === order.order_number ? "Loading…" : "Details"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

        </div>

      </div>

      {/* DETAILED RECEIPT MODAL */}
      {selectedOrder && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1.5rem",
          animation: "fadeIn 0.2s ease"
        }}>
          <div style={{
            width: "min(100%, 750px)",
            maxHeight: "85vh",
            background: "#FAF8F5",
            borderRadius: "32px",
            border: "1px solid var(--line)",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            animation: "slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)"
          }}>
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
                border: "none",
                background: "rgba(var(--rgb-text), 0.05)",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                fontSize: "1.2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "var(--text)"
              }}
            >
              ✕
            </button>

            {/* Modal Scroll Container */}
            <div style={{ overflowY: "auto", flex: 1, paddingRight: "5px" }}>
              
              {/* Header */}
              <div style={{ marginBottom: "1.5rem", paddingBottom: "1.2rem", borderBottom: "1px solid var(--line)" }}>
                <p className="eyebrow" style={{ color: "var(--accent-deep)" }}>Order Details</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <h3 style={{ fontSize: "1.6rem", fontWeight: 700 }}>{selectedOrder.order_number}</h3>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--muted)", display: "block" }}>PLACED ON</span>
                    <strong>{new Date(selectedOrder.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div style={{
                background: getStatusColor(selectedOrder.status).bg,
                border: `1px solid ${getStatusColor(selectedOrder.status).text}40`,
                borderRadius: "20px",
                padding: "1rem",
                marginBottom: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", fontWeight: 600 }}>SHIPMENT STATUS</span>
                  <strong style={{ color: getStatusColor(selectedOrder.status).text, textTransform: "capitalize", fontSize: "1.1rem" }}>
                    {selectedOrder.status}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", fontWeight: 600 }}>PAYMENT METHOD</span>
                  <strong style={{ textTransform: "uppercase", fontSize: "1rem" }}>
                    {selectedOrder.payment_method} ({selectedOrder.payment_status})
                  </strong>
                </div>
              </div>

              {/* Items Summary */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent-deep)", marginBottom: "0.8rem" }}>Ordered Items</h4>
                <div style={{ display: "grid", gap: "0.8rem" }}>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: "1rem", alignItems: "center", borderBottom: "1px solid var(--line-strong)30", paddingBottom: "0.6rem" }}>
                      <div style={{ width: "45px", height: "45px", borderRadius: "8px", overflow: "hidden", position: "relative", border: "1px solid var(--line)" }}>
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
                        <h5 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{item.name}</h5>
                        {item.variant_details && <small style={{ color: "var(--muted)" }}>{item.variant_details}</small>}
                      </div>
                      <div style={{ textAlign: "right", minWidth: "120px" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--muted)", display: "block" }}>
                          {item.quantity} x {formatPrice(item.price, "₹")}
                        </span>
                        <strong>{formatPrice(item.line_total, "₹")}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address & Tracking Layout */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem", borderTop: "1px solid var(--line)", paddingTop: "1.2rem" }}>
                
                {/* Shipping Details */}
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent-deep)", marginBottom: "0.6rem" }}>Delivery Address</h4>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.5 }}>
                    <strong>{selectedOrder.ship_name}</strong><br />
                    {selectedOrder.ship_address}<br />
                    {selectedOrder.ship_city}, {selectedOrder.ship_state} - {selectedOrder.ship_pincode}<br />
                    Phone: {selectedOrder.ship_phone}
                  </p>
                </div>

                {/* Tracking Details */}
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent-deep)", marginBottom: "0.6rem" }}>Shipment Tracking</h4>
                  {selectedOrder.tracking_number ? (
                    <div>
                      <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
                        <strong>Courier:</strong> Blue Dart / Delhivery<br />
                        <strong>AWB:</strong> {selectedOrder.tracking_number}
                      </p>
                      {selectedOrder.tracking_url && (
                        <a href={selectedOrder.tracking_url} target="_blank" rel="noreferrer" className="text-link" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          Track on Courier Website →
                        </a>
                      )}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)" }}>
                      Shipment details will be updated as soon as the order leaves our warehouse.
                    </p>
                  )}
                </div>

              </div>

              {/* Milestone Updates Timeline */}
              {selectedOrder.tracking && selectedOrder.tracking.length > 0 && (
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: "1.2rem", marginBottom: "1rem" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent-deep)", marginBottom: "0.8rem" }}>Activity Log</h4>
                  <div style={{ display: "grid", gap: "1rem", paddingLeft: "10px" }}>
                    {selectedOrder.tracking.map((track, i) => (
                      <div key={track.id} style={{ display: "flex", gap: "1rem", position: "relative" }}>
                        
                        {/* Circle Indicator */}
                        <div style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: i === 0 ? "var(--accent)" : "var(--line-strong)",
                          marginTop: "4px",
                          zIndex: 2
                        }} />

                        {/* Connector line */}
                        {i < selectedOrder.tracking.length - 1 && (
                          <div style={{
                            position: "absolute",
                            top: "16px",
                            left: "5px",
                            width: "2px",
                            height: "calc(100% + 4px)",
                            background: "var(--line)",
                            zIndex: 1
                          }} />
                        )}

                        <div>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <strong style={{ fontSize: "0.95rem" }}>{track.status}</strong>
                            {track.location && <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>({track.location})</span>}
                          </div>
                          <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.3 }}>{track.message}</p>
                          <small style={{ fontSize: "0.75rem", color: "rgba(var(--rgb-text), 0.4)", display: "block", marginTop: "2px" }}>
                            {new Date(track.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {new Date(track.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Details */}
              <div style={{
                borderTop: "1px solid var(--line)",
                paddingTop: "1.2rem",
                marginTop: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "0.5rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "240px", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--muted)" }}>Subtotal</span>
                  <strong>{formatPrice(selectedOrder.subtotal, "₹")}</strong>
                </div>
                {selectedOrder.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", width: "240px", fontSize: "0.85rem", color: "#2d7b4c" }}>
                    <span>Discount Code Applied</span>
                    <strong>-{formatPrice(selectedOrder.discount, "₹")}</strong>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", width: "240px", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--muted)" }}>Shipping Cost</span>
                  <strong>{selectedOrder.shipping_cost === 0 ? "FREE" : formatPrice(selectedOrder.shipping_cost, "₹")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", width: "240px", fontSize: "1.1rem", borderTop: "1px solid var(--line)", paddingTop: "0.5rem", marginTop: "0.2rem" }}>
                  <strong>Grand Total</strong>
                  <strong style={{ color: "var(--accent-deep)" }}>{formatPrice(selectedOrder.total_amount, "₹")}</strong>
                </div>
              </div>

            </div>

            {/* Quick Track Link */}
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
              <a
                href={`/track-order?number=${encodeURIComponent(selectedOrder.order_number)}`}
                className="primary-button"
                style={{ flex: 1, textAlign: "center", textDecoration: "none", display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                Track Live Order Updates
              </a>
              <button
                onClick={() => setSelectedOrder(null)}
                className="secondary-button"
                style={{ flex: 0.5, cursor: "pointer" }}
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </main>
  );
}

