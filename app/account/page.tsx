"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  clearCustomerToken,
  createCustomerAddress,
  deleteCustomerAddress,
  fetchCurrentCustomer,
  fetchCustomerAddresses,
  getStoredCustomerToken,
  logoutCustomer,
  updateCustomerAddress
} from "../../lib/customer-auth";
import { getCustomerOrders, getCustomerOrderDetail, formatPrice, requestCustomerOrderReturn, resolveAssetUrl } from "../../lib/api";
import { fetchPincodeLocation, formatIndianPhone, isValidIndianPhone, normalizeIndianPhone, normalizeIndianPincode } from "../../lib/form-inputs";
import { CustomerAddress, CustomerUser } from "../../lib/types";

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
  returns: Array<{
    id: number;
    return_number: string;
    status: string;
    reason: string;
    requested_amount: number;
    approved_amount: number;
    requested_at: string | null;
    resolved_at: string | null;
  }>;
}

type ToastMessage = {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
};

type AddressFormState = {
  type: "home" | "office" | "other";
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  is_default: boolean;
};

const EMPTY_ADDRESS_FORM: AddressFormState = {
  type: "home",
  label: "",
  recipient_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  is_default: false,
};

export default function AccountPage() {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS_FORM);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressFeedback, setAddressFeedback] = useState<string | null>(null);
  const [addressPincodeStatus, setAddressPincodeStatus] = useState<string | null>(null);
  const addressPincodeLookupRef = useRef<string>("");

  // Orders states
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnNotes, setReturnNotes] = useState("");
  const [returnImages, setReturnImages] = useState("");
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnFeedback, setReturnFeedback] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function showToast(message: string, tone: ToastMessage["tone"] = "info") {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }

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

        return Promise.all([getCustomerOrders(token), fetchCustomerAddresses(token)]);
      })
      .then(([ordersRes, fetchedAddresses]) => {
        if (ordersRes && ordersRes.success && ordersRes.data) {
          setOrders(ordersRes.data);
        }
        setAddresses(fetchedAddresses || []);
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

  function resetAddressForm() {
    setAddressForm(EMPTY_ADDRESS_FORM);
    setEditingAddressId(null);
  }

  function hydrateAddressForm(address: CustomerAddress) {
    setEditingAddressId(address.id);
    setAddressForm({
      type: address.type,
      label: address.label || "",
      recipient_name: address.recipient_name,
      phone: address.phone || "",
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || "",
      is_default: address.is_default,
    });
  }

  async function handleSaveAddress() {
    const token = getStoredCustomerToken();
    if (!token) {
      setAddressFeedback("Please log in again before saving an address.");
      return;
    }

    if (!addressForm.recipient_name || !addressForm.address_line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      setAddressFeedback("Please complete the required address fields.");
      return;
    }

    if (addressForm.phone && !isValidIndianPhone(addressForm.phone)) {
      setAddressFeedback("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setAddressLoading(true);
    setAddressFeedback(null);

    try {
      const payload = {
        ...addressForm,
        phone: normalizeIndianPhone(addressForm.phone) || null,
        address_line2: addressForm.address_line2 || null,
        landmark: addressForm.landmark || null,
        label: addressForm.label || null,
        pincode: normalizeIndianPincode(addressForm.pincode),
      };

      const nextAddresses = editingAddressId
        ? await updateCustomerAddress(token, editingAddressId, payload)
        : await createCustomerAddress(token, payload);

      setAddresses(nextAddresses);
      const successMessage = editingAddressId ? "Address updated successfully." : "Address added successfully.";
      setAddressFeedback(successMessage);
      showToast(successMessage, "success");
      resetAddressForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save address.";
      setAddressFeedback(message);
      showToast(message, "error");
    } finally {
      setAddressLoading(false);
    }
  }

  useEffect(() => {
    const normalizedPincode = normalizeIndianPincode(addressForm.pincode);

    if (normalizedPincode.length !== 6 || normalizedPincode === addressPincodeLookupRef.current) {
      if (normalizedPincode.length < 6) {
        setAddressPincodeStatus(null);
      }
      return;
    }

    let active = true;
    addressPincodeLookupRef.current = normalizedPincode;
    setAddressPincodeStatus("Looking up city and state from pincode…");

    fetchPincodeLocation(normalizedPincode)
      .then((location) => {
        if (!active) {
          return;
        }

        setAddressForm((current) => ({
          ...current,
          pincode: normalizedPincode,
          city: location.city || current.city,
          state: location.state || current.state,
        }));
        setAddressPincodeStatus("City and state auto-filled from pincode.");
      })
      .catch((err) => {
        if (!active) {
          return;
        }

        setAddressPincodeStatus(err instanceof Error ? err.message : "Unable to auto-fill city/state right now.");
      });

    return () => {
      active = false;
    };
  }, [addressForm.pincode]);

  async function handleDeleteAddress(addressId: number) {
    const token = getStoredCustomerToken();
    if (!token) {
      setAddressFeedback("Please log in again before deleting an address.");
      return;
    }

    setAddressLoading(true);
    setAddressFeedback(null);

    try {
      const nextAddresses = await deleteCustomerAddress(token, addressId);
      setAddresses(nextAddresses);
      if (editingAddressId === addressId) {
        resetAddressForm();
      }
      setAddressFeedback("Address removed successfully.");
      showToast("Address removed successfully.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to remove address.";
      setAddressFeedback(message);
      showToast(message, "error");
    } finally {
      setAddressLoading(false);
    }
  }

  async function handleViewOrderDetail(orderNumber: string) {
    const token = getStoredCustomerToken();
    if (!token) return;

    setLoadingOrderDetail(orderNumber);
    try {
      const res = await getCustomerOrderDetail(token, orderNumber);
      if (res && res.success && res.data) {
        setSelectedOrder(res.data);
        setReturnReason("");
        setReturnNotes("");
        setReturnImages("");
        setReturnFeedback(null);
        setReturnQuantities(
          Object.fromEntries(
            res.data.items.map((item) => [
              `${item.product_id}:${item.variant_id ?? 0}`,
              item.quantity > 0 ? 1 : 0,
            ])
          )
        );
      } else {
        showToast(res.message || "Failed to load order details.", "error");
      }
    } catch (e) {
      console.error("View order details error:", e);
      showToast("Something went wrong while fetching order receipt.", "error");
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

  const canRequestReturn = selectedOrder
    ? ["delivered", "shipped"].includes(selectedOrder.status.toLowerCase())
    : false;

  async function handleSubmitReturn() {
    if (!selectedOrder) return;

    const token = getStoredCustomerToken();
    if (!token) {
      setReturnFeedback("Please log in again before submitting a return request.");
      return;
    }

    if (!returnReason.trim()) {
      setReturnFeedback("Please enter a return reason.");
      return;
    }

    const items = selectedOrder.items
      .map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: Number(returnQuantities[`${item.product_id}:${item.variant_id ?? 0}`] || 0),
      }))
      .filter((item) => item.quantity > 0);

    if (items.length === 0) {
      setReturnFeedback("Select at least one item quantity to return.");
      return;
    }

    setIsSubmittingReturn(true);
    setReturnFeedback(null);

    const result = await requestCustomerOrderReturn(token, selectedOrder.order_number, {
      reason: returnReason.trim(),
      customer_notes: returnNotes.trim() || undefined,
      items,
      images: returnImages
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .filter(Boolean),
    });

    if (!result.success) {
      const message = result.message || "Could not submit the return request.";
      setReturnFeedback(message);
      showToast(message, "error");
      setIsSubmittingReturn(false);
      return;
    }

    await handleViewOrderDetail(selectedOrder.order_number);
    const successMessage = `Return request ${result.data?.return_number || ""} submitted successfully.`.trim();
    setReturnFeedback(successMessage);
    showToast(successMessage, "success");
    setIsSubmittingReturn(false);
  }

  return (
    <main className="content-section auth-page" style={{ padding: "4rem 0", background: "linear-gradient(to bottom, #FAF8F5, #FFFFFF)", minHeight: "80vh" }}>
      {toasts.length > 0 ? (
        <div
          style={{
            position: "fixed",
            top: "1.25rem",
            right: "1.25rem",
            zIndex: 10050,
            display: "grid",
            gap: "0.8rem",
            width: "min(360px, calc(100vw - 2rem))",
          }}
        >
          {toasts.map((toast) => {
            const palette =
              toast.tone === "success"
                ? {
                    background: "linear-gradient(135deg, rgba(45, 123, 76, 0.96), rgba(33, 99, 63, 0.96))",
                    accent: "#d7f5df",
                    shadow: "0 18px 40px -22px rgba(45, 123, 76, 0.85)",
                  }
                : toast.tone === "error"
                  ? {
                      background: "linear-gradient(135deg, rgba(123, 36, 29, 0.97), rgba(181, 58, 44, 0.96))",
                      accent: "#ffe1dc",
                      shadow: "0 18px 40px -22px rgba(181, 58, 44, 0.9)",
                    }
                  : {
                      background: "linear-gradient(135deg, rgba(41, 36, 31, 0.96), rgba(74, 62, 53, 0.96))",
                      accent: "#f5e7c8",
                      shadow: "0 18px 40px -22px rgba(41, 36, 31, 0.82)",
                    };

            return (
              <div
                key={toast.id}
                style={{
                  borderRadius: "18px",
                  padding: "0.95rem 1rem",
                  color: "#fffdf8",
                  background: palette.background,
                  boxShadow: palette.shadow,
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "grid",
                  gap: "0.45rem",
                  animation: "slideUp 0.24s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: "1.9rem",
                      height: "1.9rem",
                      borderRadius: "999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255,255,255,0.14)",
                      color: palette.accent,
                      fontSize: "0.95rem",
                      flexShrink: 0,
                    }}
                  >
                    {toast.tone === "success" ? "✓" : toast.tone === "error" ? "!" : "i"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.78rem", letterSpacing: "0.06em", textTransform: "uppercase", color: palette.accent, fontWeight: 700, marginBottom: "0.18rem" }}>
                      {toast.tone === "success" ? "Done" : toast.tone === "error" ? "Heads up" : "Notice"}
                    </div>
                    <div style={{ fontSize: "0.95rem", lineHeight: 1.5, fontWeight: 500 }}>{toast.message}</div>
                  </div>
                  <button
                    type="button"
                    aria-label="Dismiss notification"
                    onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "rgba(255,255,255,0.78)",
                      cursor: "pointer",
                      fontSize: "1rem",
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="container" style={{ maxWidth: "1100px" }}>
        
        {/* Main account wrapper */}
        <div style={{ display: "grid", gridTemplateColumns: user ? "260px 1fr" : "1fr", gap: "3rem", alignItems: "start" }}>
          
          {/* SIDEBAR TABS (Only for logged in users) */}
          {user && (
            <aside style={{ background: "rgba(255, 253, 249, 0.94)", borderRadius: "24px", padding: "1.5rem", border: "1px solid var(--line)", boxShadow: "var(--shadow)" }}>
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.5rem" }}>My Account</h2>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>{user.name}</p>
              </div>
              
              <nav style={{ display: "grid", gap: "0.5rem" }}>
                <button 
                  onClick={() => setActiveTab("orders")}
                  style={{ textAlign: "left", padding: "0.8rem 1rem", borderRadius: "12px", border: "none", cursor: "pointer", background: activeTab === "orders" ? "rgba(var(--rgb-accent), 0.1)" : "transparent", color: activeTab === "orders" ? "var(--accent-deep)" : "var(--text)", fontWeight: activeTab === "orders" ? 700 : 500, transition: "all 0.2s" }}
                >
                  📦 Order History
                </button>
                <button 
                  onClick={() => setActiveTab("profile")}
                  style={{ textAlign: "left", padding: "0.8rem 1rem", borderRadius: "12px", border: "none", cursor: "pointer", background: activeTab === "profile" ? "rgba(var(--rgb-accent), 0.1)" : "transparent", color: activeTab === "profile" ? "var(--accent-deep)" : "var(--text)", fontWeight: activeTab === "profile" ? 700 : 500, transition: "all 0.2s" }}
                >
                  👤 Profile Details
                </button>
                <button 
                  onClick={() => setActiveTab("addresses")}
                  style={{ textAlign: "left", padding: "0.8rem 1rem", borderRadius: "12px", border: "none", cursor: "pointer", background: activeTab === "addresses" ? "rgba(var(--rgb-accent), 0.1)" : "transparent", color: activeTab === "addresses" ? "var(--accent-deep)" : "var(--text)", fontWeight: activeTab === "addresses" ? 700 : 500, transition: "all 0.2s" }}
                >
                  📍 Address Book
                </button>
              </nav>
              
              <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--line)" }}>
                <button type="button" onClick={handleLogout} style={{ width: "100%", textAlign: "left", padding: "0.8rem 1rem", borderRadius: "12px", border: "none", cursor: "pointer", background: "rgba(181, 58, 44, 0.08)", color: "#b53a2c", fontWeight: 600, transition: "all 0.2s" }}>
                  Logout
                </button>
              </div>
            </aside>
          )}

          {/* MAIN CONTENT AREA */}
          <div style={{ display: "grid", gap: "2rem" }}>
            
            {/* GUEST VIEW */}
            {!loading && !user ? (
              <section className="auth-card account-profile-card" style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}>
                <small className="eyebrow">Customer Account</small>
                <h1 className="auth-title" style={{ fontSize: "2.2rem" }}>Profile</h1>
                <div className="auth-stack">
                  <p className="auth-muted">{error || "You are not logged in yet."}</p>
                  <div className="auth-link-row">
                    <Link href="/account/login" className="primary-button">Login</Link>
                    <Link href="/account/register" className="secondary-button">Create Account</Link>
                  </div>
                </div>
              </section>
            ) : null}

            {loading ? <p className="auth-muted">Loading your account…</p> : null}

            {/* TAB: PROFILE */}
            {!loading && user && activeTab === "profile" && (
              <section style={{ animation: "fadeIn 0.3s ease" }}>
                <h1 className="auth-title" style={{ fontSize: "2.2rem", marginBottom: "1.5rem" }}>Profile Details</h1>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <div className="account-summary-card" style={{ background: "rgba(255, 253, 249, 0.94)", padding: "1.5rem", borderRadius: "20px", border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>NAME</span>
                    <strong style={{ fontSize: "1.1rem" }}>{user.name}</strong>
                  </div>
                  <div className="account-summary-card" style={{ background: "rgba(255, 253, 249, 0.94)", padding: "1.5rem", borderRadius: "20px", border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>EMAIL</span>
                    <strong style={{ fontSize: "1.1rem", overflowWrap: "anywhere" }}>{user.email}</strong>
                  </div>
                  <div className="account-summary-card" style={{ background: "rgba(255, 253, 249, 0.94)", padding: "1.5rem", borderRadius: "20px", border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>PHONE</span>
                    <strong style={{ fontSize: "1.1rem" }}>{user.phone || "Not added yet"}</strong>
                  </div>
                  <div className="account-summary-card" style={{ background: "rgba(255, 253, 249, 0.94)", padding: "1.5rem", borderRadius: "20px", border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>EMAIL STATUS</span>
                    <strong style={{ fontSize: "1.1rem", color: user.email_verified_at ? "#2d7b4c" : "var(--accent-deep)" }}>
                      {user.email_verified_at ? "Verified" : "Pending Verification"}
                    </strong>
                  </div>
                </div>
              </section>
            )}

            {/* TAB: ADDRESSES */}
            {!loading && user && activeTab === "addresses" && (
              <section style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h1 className="auth-title" style={{ fontSize: "2.2rem", margin: 0 }}>Address Book</h1>
                  {editingAddressId && (
                    <button type="button" className="secondary-button" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }} onClick={resetAddressForm}>
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                  {/* Address List */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                    {addresses.length === 0 ? (
                      <div className="account-address-empty" style={{ gridColumn: "1 / -1", padding: "2rem", textAlign: "center", background: "rgba(255, 253, 249, 0.94)", borderRadius: "20px", border: "1px dashed var(--line-strong)" }}>
                        No saved addresses yet. Add one below to speed up checkout.
                      </div>
                    ) : (
                      addresses.map((address) => (
                        <div key={address.id} className="account-address-card" style={{ background: "rgba(255, 253, 249, 0.94)", padding: "1.5rem", borderRadius: "20px", border: "1px solid var(--line)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start", marginBottom: "0.8rem", paddingBottom: "0.8rem", borderBottom: "1px solid var(--line)" }}>
                            <div>
                              <strong style={{ display: "block", textTransform: "capitalize", fontSize: "1.05rem" }}>
                                {address.type}{address.is_default ? " · Default" : ""}
                              </strong>
                              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                                {address.label || address.recipient_name}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              <button type="button" className="auth-link-button text-link" style={{ fontSize: "0.8rem" }} onClick={() => hydrateAddressForm(address)}>Edit</button>
                              <button type="button" className="auth-link-button text-link" style={{ fontSize: "0.8rem", color: "#b53a2c" }} onClick={() => handleDeleteAddress(address.id)}>Remove</button>
                            </div>
                          </div>
                          <p style={{ margin: "0", fontSize: "0.9rem", lineHeight: 1.55 }}>
                            <strong>{address.recipient_name}</strong><br />
                            {address.address_line1}
                            {address.address_line2 ? <><br />{address.address_line2}</> : null}
                            <br />
                            {address.city}, {address.state} - {address.pincode}
                            {address.landmark ? <><br />Landmark: {address.landmark}</> : null}
                            {address.phone ? <><br />Phone: {address.phone}</> : null}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Address Form */}
                  <div style={{ background: "rgba(255, 253, 249, 0.94)", padding: "2rem", borderRadius: "24px", border: "1px solid var(--line)", boxShadow: "var(--shadow)" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>{editingAddressId ? "Edit Address" : "Add New Address"}</h3>
                    <div className="account-address-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                      <div className="auth-field">
                        <span>Address Type</span>
                        <select value={addressForm.type} onChange={(event) => setAddressForm((current) => ({ ...current, type: event.target.value as AddressFormState["type"] }))}>
                          <option value="home">Home</option>
                          <option value="office">Office</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="auth-field">
                        <span>Label</span>
                        <input value={addressForm.label} onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))} placeholder="Home, Work, Gift address" />
                      </div>
                      <div className="auth-field">
                        <span>Recipient Name *</span>
                        <input value={addressForm.recipient_name} onChange={(event) => setAddressForm((current) => ({ ...current, recipient_name: event.target.value }))} required />
                      </div>
                      <div className="auth-field">
                        <span>Phone</span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          pattern="[6-9][0-9]{9}"
                          maxLength={11}
                          className={addressForm.phone.length > 0 && !isValidIndianPhone(addressForm.phone) ? "input-invalid" : ""}
                          aria-invalid={addressForm.phone.length > 0 && !isValidIndianPhone(addressForm.phone)}
                          value={formatIndianPhone(addressForm.phone)}
                          onChange={(event) => setAddressForm((current) => ({ ...current, phone: normalizeIndianPhone(event.target.value) }))}
                          placeholder="10-digit mobile number"
                        />
                        {addressForm.phone.length > 0 && !isValidIndianPhone(addressForm.phone) ? (
                          <p className="auth-field-error">Use a valid 10-digit Indian mobile number.</p>
                        ) : null}
                      </div>
                      <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                        <span>Address Line 1 *</span>
                        <input value={addressForm.address_line1} onChange={(event) => setAddressForm((current) => ({ ...current, address_line1: event.target.value }))} placeholder="Flat, floor, building, area" />
                      </div>
                      <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                        <span>Address Line 2</span>
                        <input value={addressForm.address_line2} onChange={(event) => setAddressForm((current) => ({ ...current, address_line2: event.target.value }))} placeholder="Apartment, company, street details" />
                      </div>
                      <div className="auth-field">
                        <span>City *</span>
                        <input value={addressForm.city} onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))} />
                      </div>
                      <div className="auth-field">
                        <span>State *</span>
                        <input value={addressForm.state} onChange={(event) => setAddressForm((current) => ({ ...current, state: event.target.value }))} />
                      </div>
                      <div className="auth-field">
                        <span>Pincode *</span>
                        <input
                          inputMode="numeric"
                          pattern="[1-9][0-9]{5}"
                          maxLength={6}
                          value={addressForm.pincode}
                          onChange={(event) => setAddressForm((current) => ({ ...current, pincode: normalizeIndianPincode(event.target.value) }))}
                          placeholder="6-digit pincode"
                        />
                        {addressPincodeStatus ? <p className={addressPincodeStatus.toLowerCase().includes("unable") ? "auth-field-error" : "auth-field-success"}>{addressPincodeStatus}</p> : null}
                      </div>
                      <div className="auth-field">
                        <span>Landmark</span>
                        <input value={addressForm.landmark} onChange={(event) => setAddressForm((current) => ({ ...current, landmark: event.target.value }))} placeholder="Nearby landmark" />
                      </div>
                      <label className="account-default-toggle" style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={addressForm.is_default}
                          onChange={(event) => setAddressForm((current) => ({ ...current, is_default: event.target.checked }))}
                        />
                        <span style={{ fontSize: "0.95rem" }}>Make this my default delivery address</span>
                      </label>
                    </div>

                    {addressFeedback ? (
                      <div style={{ marginTop: "1.5rem" }} className={addressFeedback.toLowerCase().includes("success") || addressFeedback.toLowerCase().includes("added") || addressFeedback.toLowerCase().includes("updated") || addressFeedback.toLowerCase().includes("removed") ? "auth-success" : "auth-error"}>
                        {addressFeedback}
                      </div>
                    ) : null}

                    <div style={{ marginTop: "2rem" }}>
                      <button type="button" className="primary-button" style={{ width: "auto", cursor: "pointer", padding: "0.8rem 2.5rem" }} onClick={handleSaveAddress} disabled={addressLoading}>
                        {addressLoading ? "Saving…" : editingAddressId ? "Update Address" : "Save New Address"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* TAB: ORDERS */}
            {!loading && user && activeTab === "orders" && (
              <section style={{ animation: "fadeIn 0.3s ease" }}>
                <h1 className="auth-title" style={{ fontSize: "2.2rem", marginBottom: "1.5rem" }}>Purchase History</h1>

                {loadingOrders ? (
                  <p className="auth-muted">Loading your past purchases…</p>
                ) : orders.length === 0 ? (
                  <div style={{ padding: "4rem 2rem", textAlign: "center", border: "1px dashed var(--line-strong)", borderRadius: "24px", background: "rgba(255, 253, 249, 0.5)" }}>
                    <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🛍️</span>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.5rem" }}>No orders found</h3>
                    <p className="auth-muted" style={{ marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>We didn't find any purchases linked to your account or email address. Explore our catalog to find premium brass accents.</p>
                    <Link href="/shop" className="primary-button" style={{ display: "inline-block", textDecoration: "none" }}>Shop Now</Link>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "1.5rem" }}>
                    {orders.map((order) => {
                      const badge = getStatusColor(order.status);
                      
                      const trackingNumber = (order as any).tracking_number;
                      const trackingUrl = (order as any).tracking_url;

                      return (
                        <div
                          key={order.order_number}
                          className="account-order-row"
                          style={{
                            border: "1px solid var(--line)",
                            borderRadius: "24px",
                            padding: "1.5rem",
                            background: "rgba(255, 253, 249, 0.94)",
                            boxShadow: "var(--shadow)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.5rem",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {/* Top Row: Meta and Actions */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
                            {/* Left Info: Product first item thumbnail & metadata */}
                            <div className="account-order-meta" style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
                              <div style={{ width: "70px", height: "70px", borderRadius: "14px", overflow: "hidden", position: "relative", border: "1px solid var(--line)" }}>
                                {order.first_item_image ? (
                                  <img
                                    src={resolveAssetUrl(order.first_item_image)}
                                    alt={order.first_item_name || "Item"}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  <div style={{ width: "100%", height: "100%", background: "rgba(var(--rgb-text), 0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>📦</div>
                                )}
                              </div>

                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                                  <strong style={{ fontSize: "1.2rem", color: "var(--accent-deep)" }}>{order.order_number}</strong>
                                  <span style={{ fontSize: "0.8rem", background: badge.bg, color: badge.text, padding: "3px 10px", borderRadius: "10px", fontWeight: 700, textTransform: "capitalize" }}>
                                    {order.status}
                                  </span>
                                </div>
                                <span style={{ fontSize: "0.9rem", color: "var(--muted)", display: "block" }}>
                                  Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                </span>
                                <span style={{ fontSize: "0.9rem", color: "var(--text)", display: "block", marginTop: "4px", fontWeight: 500 }}>
                                  {order.items_count} {order.items_count === 1 ? "item" : "items"} · Total: {formatPrice(order.total_amount, "₹")}
                                </span>
                              </div>
                            </div>

                            {/* Right Action */}
                            <div className="account-order-action" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                              {trackingNumber && (
                                <div style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid var(--line)" }}>
                                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", fontWeight: 600 }}>TRACKING ID</span>
                                  <strong style={{ fontSize: "1rem" }}>{trackingNumber}</strong>
                                  {trackingUrl && (
                                    <a href={trackingUrl} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600, marginTop: "2px", textDecoration: "none" }}>Track Package ↗</a>
                                  )}
                                </div>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => handleViewOrderDetail(order.order_number)}
                                disabled={loadingOrderDetail !== null}
                                className="secondary-button"
                                style={{
                                  padding: "0.7rem 1.2rem",
                                  borderRadius: "14px",
                                  cursor: "pointer",
                                  fontSize: "0.9rem",
                                  fontWeight: 600,
                                  minWidth: "120px",
                                  textAlign: "center"
                                }}
                              >
                                {loadingOrderDetail === order.order_number ? "Loading…" : "View Receipt"}
                              </button>
                            </div>
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
      </div>

      {/* DETAILED RECEIPT MODAL */}
      {selectedOrder && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(5px)",
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
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)",
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem", borderTop: "1px solid var(--line)", paddingTop: "1.2rem" }} className="account-detail-grid">
                
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

              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "1.2rem", marginBottom: "1rem" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent-deep)", marginBottom: "0.8rem" }}>Returns & Refunds</h4>

                {selectedOrder.returns.length > 0 ? (
                  <div style={{ display: "grid", gap: "0.8rem", marginBottom: "1rem" }}>
                    {selectedOrder.returns.map((request) => (
                      <div key={request.id} style={{ border: "1px solid var(--line)", borderRadius: "18px", padding: "0.9rem 1rem", background: "rgba(255,255,255,0.6)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                          <div>
                            <strong>{request.return_number}</strong>
                            <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "2px" }}>{request.reason}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>STATUS</span>
                            <strong style={{ textTransform: "capitalize" }}>{request.status}</strong>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginTop: "0.6rem", fontSize: "0.85rem" }}>
                          <span>Requested: {formatPrice(request.requested_amount, "₹")}</span>
                          <span>Approved: {request.approved_amount > 0 ? formatPrice(request.approved_amount, "₹") : "Pending"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {canRequestReturn ? (
                  <div style={{ border: "1px solid var(--line)", borderRadius: "22px", padding: "1rem", background: "rgba(255,255,255,0.7)" }}>
                    <p style={{ margin: "0 0 0.85rem", fontSize: "0.9rem", color: "var(--muted)" }}>
                      Submit a return request for shipped or delivered items. Choose only the quantities you want to send back.
                    </p>
                    <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
                      {selectedOrder.items.map((item) => {
                        const key = `${item.product_id}:${item.variant_id ?? 0}`;
                        return (
                          <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 92px", gap: "0.75rem", alignItems: "center" }}>
                            <div>
                              <strong style={{ display: "block", fontSize: "0.92rem" }}>{item.name}</strong>
                              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                                Ordered qty: {item.quantity}
                              </span>
                            </div>
                            <input
                              type="number"
                              min={0}
                              max={item.quantity}
                              value={returnQuantities[key] ?? 0}
                              onChange={(e) =>
                                setReturnQuantities((current) => ({
                                  ...current,
                                  [key]: Math.max(0, Math.min(item.quantity, Number(e.target.value || 0))),
                                }))
                              }
                              style={{
                                padding: "0.75rem 0.8rem",
                                borderRadius: "14px",
                                border: "1px solid var(--line)",
                                background: "white",
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "grid", gap: "0.8rem" }}>
                      <input
                        type="text"
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="Reason for return (wrong item, damaged, not as expected...)"
                        style={{ padding: "0.95rem 1rem", borderRadius: "16px", border: "1px solid var(--line)" }}
                      />
                      <textarea
                        rows={3}
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                        placeholder="Extra notes for the return team (optional)"
                        style={{ padding: "0.95rem 1rem", borderRadius: "16px", border: "1px solid var(--line)", resize: "vertical" }}
                      />
                      <textarea
                        rows={2}
                        value={returnImages}
                        onChange={(e) => setReturnImages(e.target.value)}
                        placeholder="Optional proof image URLs, one per line"
                        style={{ padding: "0.95rem 1rem", borderRadius: "16px", border: "1px solid var(--line)", resize: "vertical" }}
                      />
                      {returnFeedback ? (
                        <div style={{ fontSize: "0.86rem", color: returnFeedback.toLowerCase().includes("successfully") ? "#2d7b4c" : "#b53a2c" }}>
                          {returnFeedback}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleSubmitReturn}
                        disabled={isSubmittingReturn}
                        className="secondary-button"
                        style={{ justifySelf: "start", cursor: "pointer" }}
                      >
                        {isSubmittingReturn ? "Sending Request…" : "Request Return"}
                      </button>
                    </div>
                  </div>
                ) : selectedOrder.returns.length === 0 ? (
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)" }}>
                    Return requests open once the order is shipped or delivered.
                  </p>
                ) : null}
              </div>

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
        @media (max-width: 768px) {
          .account-address-form {
             grid-template-columns: 1fr !important;
          }
          .account-detail-grid {
             grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
