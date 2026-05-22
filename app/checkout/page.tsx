"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "../../components/cart-provider";
import { getStoredCustomerToken, fetchCurrentCustomer } from "../../lib/customer-auth";
import { getActiveCoupons, getSettings, placeOrder, formatPrice, resolveAssetUrl } from "../../lib/api";
import { Coupon, CustomerUser, SiteSettings } from "../../lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  // User & settings states
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Form states
  const [shipName, setShipName] = useState("");
  const [shipEmail, setShipEmail] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shipAddress, setShipAddress] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipPincode, setShipPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay" | "phonepe">("cod");
  const [notes, setNotes] = useState("");

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load configuration & user data
  useEffect(() => {
    async function loadData() {
      try {
        const [settingsData, couponsData] = await Promise.all([
          getSettings(),
          getActiveCoupons()
        ]);
        setSettings(settingsData);
        setCoupons(couponsData || []);

        const token = getStoredCustomerToken();
        if (token) {
          try {
            const customer = await fetchCurrentCustomer(token);
            setUser(customer);
            // Pre-fill shipping info from authenticated user
            setShipName(customer.name || "");
            setShipEmail(customer.email || "");
            setShipPhone(customer.phone || "");
          } catch (e) {
            console.error("Auth fetch failed in checkout:", e);
          }
        }
      } catch (err) {
        console.error("Failed to load initial checkout data:", err);
      } finally {
        setLoadingConfig(false);
      }
    }

    loadData();
  }, []);

  // Redirect to cart if empty
  useEffect(() => {
    if (!loadingConfig && items.length === 0) {
      router.push("/cart");
    }
  }, [items, loadingConfig, router]);

  if (loadingConfig || items.length === 0) {
    return (
      <main className="content-section auth-page" style={{ justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p className="eyebrow" style={{ animation: "pulse 1.5s infinite" }}>Little Divinity</p>
          <h2 className="auth-title">Preparing your secure checkout…</h2>
          <p className="auth-muted">Loading product availability, shipping parameters and user profile.</p>
        </div>
      </main>
    );
  }

  const currencySymbol = settings?.site_currency_symbol || "₹";

  // Compute subtotal, discount, shipping, and total amount
  let discountAmount = 0;
  if (appliedCoupon) {
    const minSpend = Number(appliedCoupon.min_order_amount || 0);
    if (subtotal >= minSpend) {
      if (appliedCoupon.type === "percent") {
        discountAmount = subtotal * (Number(appliedCoupon.value) / 100);
      } else {
        discountAmount = Number(appliedCoupon.value);
      }
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
    }
  }

  const netSubtotal = subtotal - discountAmount;
  // Free shipping above ₹999 net total
  const shippingCost = netSubtotal >= 999 ? 0 : 99;
  const grandTotal = netSubtotal + shippingCost;

  // Handle coupon application
  function handleApplyCoupon(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    const matched = coupons.find(c => c.code.toLowerCase() === couponCode.trim().toLowerCase());
    if (!matched) {
      setCouponError(`The coupon code "${couponCode}" is invalid or expired.`);
      return;
    }

    const minSpend = Number(matched.min_order_amount || 0);
    if (subtotal < minSpend) {
      setCouponError(`This coupon requires a minimum spend of ${formatPrice(minSpend, currencySymbol)}.`);
      return;
    }

    setAppliedCoupon(matched);
    setCouponSuccess(`Coupon "${matched.code}" applied successfully!`);
  }

  // Handle coupon removal
  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSuccess(null);
    setCouponError(null);
  }

  // Handle order submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!shipName || !shipEmail || !shipPhone || !shipAddress || !shipCity || !shipState || !shipPincode) {
      setError("Please fill out all required shipping fields.");
      setIsSubmitting(false);
      return;
    }

    const token = getStoredCustomerToken() || undefined;

    const orderData = {
      ship_name: shipName,
      ship_email: shipEmail,
      ship_phone: shipPhone,
      ship_address: shipAddress,
      ship_city: shipCity,
      ship_state: shipState,
      ship_pincode: shipPincode,
      payment_method: paymentMethod,
      coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      notes: notes || undefined,
      items: items.map(item => ({
        product_id: item.id,
        variant_id: null, // Default variant parameter as structured in CheckoutController
        quantity: item.quantity
      }))
    };

    const res = await placeOrder(orderData, token);

    if (res.success && res.data) {
      clearCart();
      router.push(`/checkout/success?order_number=${res.data.order_number}`);
    } else {
      setError(res.message || "An unexpected error occurred while placing your order.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="content-section" style={{ minHeight: "80vh", background: "linear-gradient(to bottom, #FAF8F5, #FFFFFF)", padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "1200px" }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <p className="eyebrow">Secure Gateway</p>
          <h1 className="page-title" style={{ fontSize: "2.8rem", marginBottom: "0.5rem" }}>Checkout</h1>
          <p className="shop-intro" style={{ maxWidth: "600px", margin: "0 auto" }}>
            Complete your order below. Free shipping is automatically applied to orders above ₹999.
          </p>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "2.5rem" }} className="auth-two-column">
          
          {/* LEFT COLUMN: SHIPPING & PAYMENT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Shipping Card */}
            <div style={{ border: "1px solid var(--line)", borderRadius: "28px", padding: "2rem", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)", boxShadow: "var(--shadow)" }}>
              <h2 className="eyebrow" style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "var(--accent-deep)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>1.</span> Shipping Details
              </h2>
              
              <div className="auth-grid-form" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1.2rem" }}>
                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Full Name *</span>
                  <input
                    type="text"
                    required
                    value={shipName}
                    onChange={(e) => setShipName(e.target.value)}
                    placeholder="Enter your first and last name"
                  />
                </div>

                <div className="auth-field">
                  <span>Email Address *</span>
                  <input
                    type="email"
                    required
                    value={shipEmail}
                    onChange={(e) => setShipEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="auth-field">
                  <span>Phone Number *</span>
                  <input
                    type="tel"
                    required
                    value={shipPhone}
                    onChange={(e) => setShipPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Street Address *</span>
                  <input
                    type="text"
                    required
                    value={shipAddress}
                    onChange={(e) => setShipAddress(e.target.value)}
                    placeholder="Flat, House no., Building, Company, Apartment, Area"
                  />
                </div>

                <div className="auth-field">
                  <span>City *</span>
                  <input
                    type="text"
                    required
                    value={shipCity}
                    onChange={(e) => setShipCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                  />
                </div>

                <div className="auth-field">
                  <span>State *</span>
                  <input
                    type="text"
                    required
                    value={shipState}
                    onChange={(e) => setShipState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                  />
                </div>

                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Pincode *</span>
                  <input
                    type="text"
                    required
                    value={shipPincode}
                    onChange={(e) => setShipPincode(e.target.value)}
                    placeholder="6-digit PIN code"
                  />
                </div>

                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Order Notes (Optional)</span>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special instructions for delivery (e.g. deliver after 5 PM)"
                    style={{
                      padding: "1rem",
                      border: "1px solid var(--line-strong)",
                      borderRadius: "16px",
                      background: "rgba(255, 255, 255, 0.86)",
                      color: "var(--text)",
                      fontFamily: "inherit",
                      fontSize: "1rem",
                      resize: "none"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div style={{ border: "1px solid var(--line)", borderRadius: "28px", padding: "2rem", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)", boxShadow: "var(--shadow)" }}>
              <h2 className="eyebrow" style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "var(--accent-deep)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>2.</span> Payment Method
              </h2>

              <div style={{ display: "grid", gap: "1rem" }}>
                
                {/* Cash on Delivery */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.2rem",
                    border: paymentMethod === "cod" ? "2px solid var(--accent)" : "1px solid var(--line)",
                    borderRadius: "20px",
                    background: paymentMethod === "cod" ? "rgba(241, 167, 32, 0.05)" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    style={{ marginTop: "3px", accentColor: "var(--accent)" }}
                  />
                  <div>
                    <strong style={{ display: "block", color: "var(--text)", fontSize: "1.05rem" }}>Cash On Delivery (COD)</strong>
                    <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Pay with cash upon delivery. Recommended & fully functional gateway.</span>
                  </div>
                </label>

                {/* Razorpay Simulated */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.2rem",
                    border: paymentMethod === "razorpay" ? "2px solid var(--accent)" : "1px solid var(--line)",
                    borderRadius: "20px",
                    background: paymentMethod === "razorpay" ? "rgba(241, 167, 32, 0.05)" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    style={{ marginTop: "3px", accentColor: "var(--accent)" }}
                  />
                  <div style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "var(--text)", fontSize: "1.05rem" }}>Razorpay (Cards / UPI / NetBanking)</strong>
                      <span style={{ fontSize: "0.75rem", background: "rgba(var(--rgb-text), 0.08)", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>Simulation</span>
                    </div>
                    <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Pay securely via Credit Card, Debit Card, NetBanking, or wallets. Will simulate successful completion.</span>
                  </div>
                </label>

                {/* PhonePe Simulated */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.2rem",
                    border: paymentMethod === "phonepe" ? "2px solid var(--accent)" : "1px solid var(--line)",
                    borderRadius: "20px",
                    background: paymentMethod === "phonepe" ? "rgba(241, 167, 32, 0.05)" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="phonepe"
                    checked={paymentMethod === "phonepe"}
                    onChange={() => setPaymentMethod("phonepe")}
                    style={{ marginTop: "3px", accentColor: "var(--accent)" }}
                  />
                  <div style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "var(--text)", fontSize: "1.05rem" }}>PhonePe UPI Gateway</strong>
                      <span style={{ fontSize: "0.75rem", background: "rgba(var(--rgb-text), 0.08)", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>Simulation</span>
                    </div>
                    <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Pay directly via PhonePe app or UPI account. Will simulate successful completion.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY & OFFERS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Order Review Card */}
            <div className="cart-summary-card" style={{ border: "1px solid var(--line)", borderRadius: "28px", padding: "2rem", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)", boxShadow: "var(--shadow)" }}>
              <p className="eyebrow" style={{ color: "var(--accent-deep)", marginBottom: "0.5rem" }}>Review Order</p>
              <h2 style={{ fontSize: "1.6rem", marginBottom: "1.5rem" }}>Items Summary</h2>

              {/* Items List */}
              <div style={{ display: "grid", gap: "1rem", maxHeight: "250px", overflowY: "auto", paddingRight: "5px", marginBottom: "1.5rem" }}>
                {items.map((item) => (
                  <div key={item.slug} style={{ display: "flex", gap: "1rem", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: "0.8rem" }}>
                    <div style={{ width: "50px", height: "50px", position: "relative", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--line)" }}>
                      <img
                        src={resolveAssetUrl(item.image)}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--text)" }}>{item.name}</h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                        {item.quantity} x {formatPrice(item.price, currencySymbol)}
                      </p>
                    </div>
                    <strong style={{ fontSize: "0.95rem", color: "var(--text)" }}>
                      {formatPrice(item.price * item.quantity, currencySymbol)}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Coupon Box */}
              <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--line)", paddingBottom: "1.5rem" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--accent-deep)", display: "block", marginBottom: "0.5rem" }}>Apply Promo Code</span>
                
                {appliedCoupon ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(45, 123, 76, 0.08)", border: "1px dashed #226643", borderRadius: "14px", padding: "0.6rem 1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ color: "#226643", fontSize: "0.9rem" }}>Code: {appliedCoupon.code} Applied</strong>
                      <span style={{ color: "var(--text)", fontSize: "0.8rem" }}>Saved {appliedCoupon.type === "percent" ? `${appliedCoupon.value}%` : formatPrice(appliedCoupon.value, currencySymbol)}</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} style={{ border: "none", background: "transparent", color: "#a43c31", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, textDecoration: "underline" }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code (e.g. FESTIVE20)"
                      style={{
                        flex: 1,
                        padding: "0.6rem 1rem",
                        border: "1px solid var(--line-strong)",
                        borderRadius: "14px",
                        background: "rgba(255, 255, 255, 0.86)",
                        fontSize: "0.9rem"
                      }}
                    />
                    <button type="button" onClick={() => handleApplyCoupon()} className="secondary-button" style={{ padding: "0.6rem 1.2rem", borderRadius: "14px", border: "1px solid var(--accent)", color: "var(--accent-deep)", background: "transparent", fontWeight: 600, cursor: "pointer" }}>
                      Apply
                    </button>
                  </div>
                )}
                
                {couponError && <p style={{ color: "#a43c31", fontSize: "0.8rem", margin: "0.4rem 0 0" }}>{couponError}</p>}
                {couponSuccess && <p style={{ color: "#226643", fontSize: "0.8rem", margin: "0.4rem 0 0" }}>{couponSuccess}</p>}
              </div>

              {/* Price Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                  <span style={{ color: "var(--muted)" }}>Subtotal</span>
                  <strong>{formatPrice(subtotal, currencySymbol)}</strong>
                </div>

                {appliedCoupon && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: "#226643" }}>
                    <span>Coupon Discount</span>
                    <strong>-{formatPrice(discountAmount, currencySymbol)}</strong>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                  <span style={{ color: "var(--muted)" }}>Shipping Fee</span>
                  {shippingCost === 0 ? (
                    <strong style={{ color: "#226643" }}>FREE</strong>
                  ) : (
                    <strong>{formatPrice(shippingCost, currencySymbol)}</strong>
                  )}
                </div>

                {shippingCost > 0 && (
                  <p style={{ margin: "0", fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.3 }}>
                    Add pieces worth {formatPrice(999 - netSubtotal, currencySymbol)} more for free delivery!
                  </p>
                )}
              </div>

              {/* Total Row */}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: "1.2rem", marginBottom: "2rem" }}>
                <strong style={{ fontSize: "1.2rem", color: "var(--text)" }}>Total Amount</strong>
                <strong style={{ fontSize: "1.4rem", color: "var(--accent-deep)" }}>
                  {formatPrice(grandTotal, currencySymbol)}
                </strong>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="primary-button"
                style={{
                  width: "100%",
                  textAlign: "center",
                  justifyContent: "center",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.75 : 1
                }}
              >
                {isSubmitting ? (
                  <>
                    <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid #FFF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Placing Your Order…
                  </>
                ) : (
                  <>Secure Order Now {currencySymbol === "₹" ? "₹" : ""}{grandTotal.toLocaleString("en-IN")}</>
                )}
              </button>
            </div>

            {/* Public Coupons Card */}
            {coupons.length > 0 && (
              <div style={{ border: "1px solid var(--line)", borderRadius: "28px", padding: "1.5rem", background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(10px)" }}>
                <p className="eyebrow" style={{ fontSize: "0.8rem", marginBottom: "1rem" }}>Available Offers</p>
                <div style={{ display: "grid", gap: "0.8rem" }}>
                  {coupons.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setCouponCode(c.code);
                        setCouponError(null);
                        setCouponSuccess(null);
                      }}
                      style={{
                        padding: "0.8rem",
                        border: "1px dashed var(--line-strong)",
                        borderRadius: "16px",
                        cursor: "pointer",
                        background: couponCode.toLowerCase() === c.code.toLowerCase() ? "rgba(241, 167, 32, 0.04)" : "transparent",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, padding: "2px 8px", background: "var(--accent)", color: "var(--accent-deep)", borderRadius: "6px" }}>
                          {c.code}
                        </span>
                        <strong style={{ fontSize: "0.85rem" }}>
                          {c.type === "percent" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                        </strong>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.3 }}>{c.description || "Apply to save on this order."}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </form>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </main>
  );
}
