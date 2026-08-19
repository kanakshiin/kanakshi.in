"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  clearCustomerToken,
  createCustomerAddress,
  deleteCustomerAddress,
  fetchCurrentCustomer,
  fetchCustomerAddresses,
  fetchCustomerWallet,
  getStoredCustomerToken,
  logoutCustomer,
  updateCustomerAddress
} from "../../lib/customer-auth";
import { getCustomerOrders, getCustomerOrderDetail, formatPrice, requestCustomerOrderReturn, resolveAssetUrl } from "../../lib/api";
import { fetchPincodeLocation, formatIndianPhone, isValidIndianPhone, normalizeIndianPhone, normalizeIndianPincode } from "../../lib/form-inputs";
import { CustomerAddress, CustomerUser, CustomerWalletPayload } from "../../lib/types";

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
  courier_name?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  dispatched_at?: string | null;
  estimated_delivery_date?: string | null;
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
  ship_alt_phone?: string | null;
  ship_address: string;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  notes: string | null;
  courier_name?: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  dispatched_at?: string | null;
  estimated_delivery_date?: string | null;
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
    reason_detail?: string | null;
    refund_mode?: string | null;
    refund_processed_at?: string | null;
    pickup_courier_name?: string | null;
    pickup_tracking_number?: string | null;
    pickup_tracking_url?: string | null;
    pickup_scheduled_date?: string | null;
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
  const [activeTab, setActiveTab] = useState<"orders" | "wallet" | "addresses" | "profile">("orders");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<CustomerWalletPayload | null>(null);
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
  const [returnReason, setReturnReason] = useState("Size / Fitting Issue (e.g. Ring too loose/tight, unsuitable length)");
  const [returnReasonDetail, setReturnReasonDetail] = useState("");
  const [returnRefundMode, setReturnRefundMode] = useState<"wallet" | "original_payment">("wallet");
  const [returnNotes, setReturnNotes] = useState("");
  const [returnImages, setReturnImages] = useState("");
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnFeedback, setReturnFeedback] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  function handleCopyAwb(code: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedAwb(code);
      showToast(`AWB ${code} copied to clipboard!`, "success");
      setTimeout(() => setCopiedAwb(null), 2500);
    }
  }

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

    Promise.allSettled([
      fetchCurrentCustomer(token),
      fetchCustomerAddresses(token),
      getCustomerOrders(token),
      fetchCustomerWallet(token)
    ])
      .then(([userResult, addressesResult, ordersResult, walletResult]) => {
        if (userResult.status === "fulfilled") {
          setUser(userResult.value);
        } else {
          clearCustomerToken();
          setError("Your session has expired. Please sign in again.");
        }

        if (addressesResult.status === "fulfilled") {
          setAddresses(addressesResult.value);
        }

        if (ordersResult.status === "fulfilled") {
          if (ordersResult.value.success && ordersResult.value.data) {
            setOrders(ordersResult.value.data as OrderSummary[]);
          }
        }

        if (walletResult.status === "fulfilled") {
          setWalletData(walletResult.value);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fetch orders specifically when switching to orders tab if not already loaded
  useEffect(() => {
    const token = getStoredCustomerToken();
    if (token && activeTab === "orders" && orders.length === 0 && !loadingOrders) {
      setLoadingOrders(true);
      getCustomerOrders(token)
        .then((res) => {
          if (res.success && res.data) {
            setOrders(res.data as OrderSummary[]);
          }
        })
        .catch((err) => {
          console.error("Failed to load customer orders:", err);
        })
        .finally(() => {
          setLoadingOrders(false);
        });
    }
  }, [activeTab]);

  useEffect(() => {
    const normalizedPincode = normalizeIndianPincode(addressForm.pincode);

    if (normalizedPincode.length !== 6) {
      addressPincodeLookupRef.current = "";
      setAddressPincodeStatus(null);
      return;
    }

    if (addressPincodeLookupRef.current === normalizedPincode) {
      return;
    }

    let isCancelled = false;
    addressPincodeLookupRef.current = normalizedPincode;
    setAddressPincodeStatus("Checking postal code…");

    fetchPincodeLocation(normalizedPincode).then((result) => {
      if (isCancelled) return;

      if (!result) {
        setAddressPincodeStatus("Unable to detect city/state for this postal code.");
        return;
      }

      setAddressForm((current) => {
        const nextCity = !current.city.trim() || current.city === result.city ? result.city : current.city;
        const nextState = !current.state.trim() || current.state === result.state ? result.state : current.state;

        return {
          ...current,
          city: nextCity,
          state: nextState,
        };
      });

      setAddressPincodeStatus(`Detected ${result.city}, ${result.state}`);
    });

    return () => {
      isCancelled = true;
    };
  }, [addressForm.pincode]);

  async function handleLogout() {
    const token = getStoredCustomerToken();
    if (token) {
      await logoutCustomer(token);
    }
    clearCustomerToken();
    setUser(null);
    setAddresses([]);
    setOrders([]);
    showToast("Signed out successfully.", "info");
  }

  function resetAddressForm() {
    setAddressForm(EMPTY_ADDRESS_FORM);
    setEditingAddressId(null);
    setAddressFeedback(null);
    setAddressPincodeStatus(null);
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
    setAddressFeedback(null);
    setAddressPincodeStatus(null);
  }

  async function handleSaveAddress() {
    const token = getStoredCustomerToken();
    if (!token) return;

    if (!addressForm.recipient_name.trim() || !addressForm.address_line1.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.pincode.trim()) {
      setAddressFeedback("Please fill in recipient name, address, city, state, and pincode.");
      return;
    }

    if (addressForm.phone && !isValidIndianPhone(addressForm.phone)) {
      setAddressFeedback("Please provide a valid 10-digit mobile number.");
      return;
    }

    setAddressLoading(true);
    setAddressFeedback(null);

    try {
      if (editingAddressId) {
        const updatedList = await updateCustomerAddress(token, editingAddressId, addressForm);
        setAddresses(updatedList);
        setAddressFeedback("Address updated successfully.");
        showToast("Address updated successfully.", "success");
      } else {
        const createdList = await createCustomerAddress(token, addressForm);
        setAddresses(createdList);
        setAddressFeedback("New address added successfully.");
        showToast("New address added successfully.", "success");
      }
      resetAddressForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save address.";
      setAddressFeedback(message);
      showToast(message, "error");
    } finally {
      setAddressLoading(false);
    }
  }

  async function handleDeleteAddress(addressId: number) {
    const token = getStoredCustomerToken();
    if (!token) return;

    setAddressLoading(true);
    try {
      const remainingList = await deleteCustomerAddress(token, addressId);
      setAddresses(remainingList);
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
        return { bg: "#dcfce7", text: "#166534" };
      case "cancelled":
        return { bg: "#fee2e2", text: "#991b1b" };
      case "shipped":
        return { bg: "#dbeafe", text: "#1e40af" };
      case "out for delivery":
      case "out_for_delivery":
        return { bg: "#e0e7ff", text: "#3730a3" };
      default:
        return { bg: "#fef3c7", text: "#92400e" };
    }
  };

  const canRequestReturn = Boolean(
    selectedOrder &&
      ["shipped", "delivered"].includes(selectedOrder.status.toLowerCase())
  );

  async function handleSubmitReturn() {
    const token = getStoredCustomerToken();
    if (!token || !selectedOrder) return;

    const items = Object.entries(returnQuantities)
      .map(([key, quantity]) => {
        const [productId, variantId] = key.split(":");
        return {
          product_id: Number(productId),
          variant_id: variantId === "0" ? undefined : Number(variantId),
          quantity: Number(quantity),
        };
      })
      .filter((item) => item.quantity > 0);

    if (items.length === 0) {
      setReturnFeedback("Please choose at least one item quantity to return.");
      return;
    }

    if (!returnReason.trim()) {
      setReturnFeedback("Please provide a reason for the return.");
      return;
    }

    setIsSubmittingReturn(true);
    setReturnFeedback(null);

    const parsedImages = returnImages
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    try {
      const res = await requestCustomerOrderReturn(token, selectedOrder.order_number, {
        reason: returnReason.trim(),
        reason_detail: returnReasonDetail.trim() || undefined,
        refund_mode: returnRefundMode,
        customer_notes: returnNotes.trim() || undefined,
        items,
        images: parsedImages.length > 0 ? parsedImages : undefined,
      });

      if (res && res.success && res.data) {
        showToast(`Return request ${res.data.return_number} submitted!`, "success");
        setReturnFeedback(`Return request ${res.data.return_number} submitted successfully! Our concierge team will review and approve doorstep pickup.`);
        const refreshed = await getCustomerOrderDetail(token, selectedOrder.order_number);
        if (refreshed && refreshed.success && refreshed.data) {
          setSelectedOrder(refreshed.data);
        }
      } else {
        setReturnFeedback(res.message || "Failed to submit return request.");
        showToast(res.message || "Failed to submit return request.", "error");
      }
    } catch (e: any) {
      console.error("Submit return error:", e);
      const msg = e?.message || "Something went wrong while submitting your return.";
      setReturnFeedback(msg);
      showToast(msg, "error");
    } finally {
      setIsSubmittingReturn(false);
    }
  }

  return (
    <main style={{ minHeight: "85vh", background: "#fcfbf9", padding: "3.5rem 1.5rem" }}>
      
      {/* Dynamic Toast Notifications */}
      {toasts.length > 0 && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 99999, display: "flex", flexDirection: "column", gap: "10px" }}>
          {toasts.map((toast) => (
            <div
              key={toast.id}
              style={{
                borderRadius: "14px",
                padding: "0.85rem 1.2rem",
                color: "#ffffff",
                background: toast.tone === "success" ? "#166534" : toast.tone === "error" ? "#991b1b" : "#0f172a",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.92rem",
                fontWeight: 600,
                animation: "slideUp 0.25s ease"
              }}
            >
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ maxWidth: "1120px", margin: "0 auto" }}>

        {/* GUEST VIEW (If not logged in) */}
        {!loading && !user && (
          <div style={{
            maxWidth: "520px",
            margin: "2rem auto",
            background: "#ffffff",
            borderRadius: "24px",
            border: "1px solid var(--line, #e2e8f0)",
            padding: "3rem 2.5rem",
            textAlign: "center",
            boxShadow: "0 10px 35px rgba(0,0,0,0.04)"
          }}>
            <p className="eyebrow" style={{ color: "var(--accent-deep, #b45309)", letterSpacing: "2px", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
              Kanakshi Member Access
            </p>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 700, margin: "0.4rem 0 1rem", color: "#0f172a" }}>
              Sign In to Your Account
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
              Access your fine jewellery purchase history, live courier tracking, doorstep returns, and saved delivery addresses.
            </p>
            <div style={{ display: "grid", gap: "1rem" }}>
              <Link
                href="/account/login"
                className="primary-button"
                style={{
                  padding: "0.9rem 1.5rem",
                  borderRadius: "14px",
                  background: "var(--accent-deep, #0f172a)",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "1rem"
                }}
              >
                Sign In to Account
              </Link>
              <Link
                href="/account/register"
                className="secondary-button"
                style={{
                  padding: "0.9rem 1.5rem",
                  borderRadius: "14px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#0f172a",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem"
                }}
              >
                Create New Account
              </Link>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <h2 style={{ fontSize: "1.2rem", color: "#64748b" }}>Loading your Kanakshi profile…</h2>
          </div>
        )}

        {/* LOGGED IN ACCOUNT COCKPIT */}
        {!loading && user && (
          <div style={{ display: "grid", gridTemplateColumns: "270px 1fr", gap: "2.5rem", alignItems: "start" }} className="account-main-grid">

            {/* SIDEBAR NAVIGATION */}
            <aside style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "1.8rem",
              border: "1px solid var(--line, #e2e8f0)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.03)"
            }}>
              {/* User Avatar Card */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.8rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e2e8f0" }}>
                <div style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                  color: "#92400e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  border: "2px solid #fef3c7"
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : "K"}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#0f172a", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                    {user.name}
                  </h2>
                  <span style={{ fontSize: "0.82rem", color: "#64748b" }}>{user.email}</span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav style={{ display: "grid", gap: "0.4rem" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.85rem 1rem",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    background: activeTab === "orders" ? "#f1f5f9" : "transparent",
                    color: activeTab === "orders" ? "#0f172a" : "#64748b",
                    fontWeight: activeTab === "orders" ? 700 : 500,
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease"
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  <span>Order History</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("wallet")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.85rem 1rem",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    background: activeTab === "wallet" ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "transparent",
                    color: activeTab === "wallet" ? "#78350f" : "#64748b",
                    fontWeight: activeTab === "wallet" ? 700 : 500,
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease"
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                  <span>Kanakshi Wallet</span>
                  <span style={{
                    marginLeft: "auto",
                    fontSize: "0.78rem",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: activeTab === "wallet" ? "#d97706" : "rgba(241, 167, 32, 0.18)",
                    color: activeTab === "wallet" ? "#ffffff" : "#b45309",
                    fontWeight: 700
                  }}>
                    ₹{Number(walletData?.wallet_balance ?? user.wallet_balance ?? 0).toLocaleString("en-IN")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("addresses")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.85rem 1rem",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    background: activeTab === "addresses" ? "#f1f5f9" : "transparent",
                    color: activeTab === "addresses" ? "#0f172a" : "#64748b",
                    fontWeight: activeTab === "addresses" ? 700 : 500,
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease"
                  }}
                >
                  <span>Saved Addresses</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.85rem 1rem",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    background: activeTab === "profile" ? "#f1f5f9" : "transparent",
                    color: activeTab === "profile" ? "#0f172a" : "#64748b",
                    fontWeight: activeTab === "profile" ? 700 : 500,
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease"
                  }}
                >
                  <span>Profile Details</span>
                </button>

                <Link
                  href="/track-order"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.85rem 1rem",
                    borderRadius: "12px",
                    color: "#64748b",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    transition: "all 0.2s ease"
                  }}
                >
                  <span>Live Track Tool</span>
                </Link>
              </nav>

              {/* Logout Button */}
              <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.8rem 1rem",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    background: "rgba(224, 90, 71, 0.08)",
                    color: "#b53a2c",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

              {/* TAB 1: ORDERS */}
              {activeTab === "orders" && (
                <section style={{ animation: "fadeIn 0.3s ease" }}>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p className="eyebrow" style={{ color: "var(--accent-deep, #b45309)", letterSpacing: "1.5px", fontSize: "0.8rem", fontWeight: 700 }}>
                      Kanakshi Atelier
                    </p>
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "2px 0 0", color: "#0f172a" }}>
                      My Orders &amp; Purchases
                    </h1>
                  </div>

                  {loadingOrders ? (
                    <div style={{ padding: "3rem", textAlign: "center", background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                      <p style={{ color: "#64748b", margin: 0 }}>Loading your purchase history…</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div style={{
                      padding: "4rem 2rem",
                      textAlign: "center",
                      border: "1px dashed #cbd5e1",
                      borderRadius: "24px",
                      background: "#ffffff"
                    }}>
                      <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem", color: "#0f172a" }}>No orders placed yet</h3>
                      <p style={{ color: "#64748b", maxWidth: "420px", margin: "0 auto 2rem", fontSize: "0.92rem", lineHeight: 1.6 }}>
                        You have not placed any fine jewellery orders yet. Discover our latest collections of 925 Sterling Silver and Lab Diamonds.
                      </p>
                      <Link
                        href="/shop"
                        className="primary-button"
                        style={{
                          display: "inline-block",
                          textDecoration: "none",
                          padding: "0.85rem 1.8rem",
                          borderRadius: "12px",
                          background: "var(--accent-deep, #0f172a)",
                          color: "#ffffff",
                          fontWeight: 700
                        }}
                      >
                        Explore Collections →
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: "1.5rem" }}>
                      {orders.map((order) => {
                        const badge = getStatusColor(order.status);
                        const trackingNumber = order.tracking_number;
                        const trackingUrl = order.tracking_url;

                        return (
                          <div
                            key={order.order_number}
                            style={{
                              border: "1px solid #e2e8f0",
                              borderRadius: "20px",
                              padding: "1.6rem",
                              background: "#ffffff",
                              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "1.2rem"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.2rem" }}>
                              {/* Left: Thumbnail & Details */}
                              <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
                                <div style={{ width: "65px", height: "65px", borderRadius: "12px", overflow: "hidden", position: "relative", border: "1px solid #e2e8f0", flexShrink: 0 }}>
                                  {order.first_item_image ? (
                                    <img
                                      src={resolveAssetUrl(order.first_item_image)}
                                      alt={order.first_item_name || "Item"}
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                  ) : (
                                    <div style={{ width: "100%", height: "100%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "#94a3b8" }}>ITEM</div>
                                  )}
                                </div>

                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                                    <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{order.order_number}</strong>
                                    <span style={{ fontSize: "0.78rem", background: badge.bg, color: badge.text, padding: "3px 10px", borderRadius: "8px", fontWeight: 700, textTransform: "uppercase" }}>
                                      {order.status}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: "0.85rem", color: "#64748b", display: "block" }}>
                                    Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {order.items_count} {order.items_count === 1 ? "item" : "items"}
                                  </span>
                                  <span style={{ fontSize: "0.95rem", color: "#0f172a", display: "block", marginTop: "3px", fontWeight: 700 }}>
                                    Total: {formatPrice(order.total_amount, "₹")}
                                  </span>
                                </div>
                              </div>

                              {/* Right: Courier Badge & Action Buttons */}
                              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                                {trackingNumber && (
                                  <div style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid #e2e8f0" }}>
                                    <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block", fontWeight: 700, textTransform: "uppercase" }}>
                                      {order.courier_name || 'Courier Partner'}
                                    </span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                                      <code style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2563eb" }}>{trackingNumber}</code>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyAwb(trackingNumber)}
                                        title="Copy AWB Code"
                                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.82rem", padding: "2px 6px", color: copiedAwb === trackingNumber ? "#16a34a" : "#64748b" }}
                                      >
                                        {copiedAwb === trackingNumber ? "Copied" : "Copy"}
                                      </button>
                                    </div>
                                    {trackingUrl && (
                                      <a href={trackingUrl} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: "0.8rem", color: "#2563eb", fontWeight: 700, marginTop: "2px", textDecoration: "underline" }}>
                                        Live Tracking ↗
                                      </a>
                                    )}
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleViewOrderDetail(order.order_number)}
                                  disabled={loadingOrderDetail !== null}
                                  className="secondary-button"
                                  style={{
                                    padding: "0.7rem 1.3rem",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    fontSize: "0.88rem",
                                    fontWeight: 700,
                                    border: "1px solid #cbd5e1",
                                    background: "#f8fafc",
                                    color: "#0f172a"
                                  }}
                                >
                                  {loadingOrderDetail === order.order_number ? "Loading…" : "View Order Details"}
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

              {/* TAB: KANAKSHI CASH WALLET */}
              {activeTab === "wallet" && (
                <section style={{ animation: "fadeIn 0.3s ease", display: "grid", gap: "2rem" }}>
                  <div>
                    <p className="eyebrow" style={{ color: "var(--accent-deep, #b45309)", letterSpacing: "1.5px", fontSize: "0.8rem", fontWeight: 700 }}>
                      Kanakshi Privé Rewards
                    </p>
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "2px 0 0", color: "#0f172a" }}>
                      My Wallet &amp; Loyalty Cashbacks
                    </h1>
                  </div>

                  {/* Wallet Balance Hero Card */}
                  <div style={{
                    borderRadius: "24px",
                    background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
                    padding: "2.2rem 2rem",
                    color: "#ffffff",
                    border: "1px solid rgba(241, 167, 32, 0.3)",
                    boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                      <div>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          background: "rgba(241, 167, 32, 0.15)",
                          border: "1px solid rgba(241, 167, 32, 0.3)",
                          color: "#f1a720",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          marginBottom: "0.8rem"
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          Privé Customer Cash
                        </span>
                        <div style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: 500 }}>Available Spendable Balance</div>
                        <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "#f8fafc", lineHeight: 1.1, marginTop: "0.3rem" }}>
                          ₹{Number(walletData?.wallet_balance ?? user.wallet_balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <Link
                        href="/shop/all"
                        className="primary-button"
                        style={{
                          padding: "0.85rem 1.6rem",
                          borderRadius: "14px",
                          background: "linear-gradient(135deg, #f1a720, #d97706)",
                          color: "#ffffff",
                          textDecoration: "none",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          boxShadow: "0 10px 25px rgba(241, 167, 32, 0.3)"
                        }}
                      >
                        <span>Shop &amp; Redeem Wallet Cash</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </Link>
                    </div>

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "1rem",
                      paddingTop: "1.5rem",
                      borderTop: "1px solid rgba(255, 255, 255, 0.1)"
                    }}>
                      <div>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Total Rewards Earned</span>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#38bdf8", marginTop: "2px" }}>
                          ₹{Number(walletData?.total_earned ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Total Spent at Checkout</span>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fbbf24", marginTop: "2px" }}>
                          ₹{Number(walletData?.total_spent ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Currency Ratio</span>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#4ade80", marginTop: "2px" }}>
                          1 Point = ₹1.00 INR
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Privilege Rules Info Card */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "1.2rem"
                  }}>
                    <div style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      padding: "1.5rem",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.6rem"
                    }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(241, 167, 32, 0.12)", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4Z"/></svg>
                      </div>
                      <strong style={{ color: "#0f172a", fontSize: "1rem" }}>Welcome Signup Bonus</strong>
                      <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
                        Every registered member gets instant welcome credit credited right to their account.
                      </p>
                    </div>

                    <div style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      padding: "1.5rem",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.6rem"
                    }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(34, 197, 94, 0.12)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                      </div>
                      <strong style={{ color: "#0f172a", fontSize: "1rem" }}>Post-Purchase Cashback</strong>
                      <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
                        Earn cashback rewards on kept orders. Credits unlock automatically 7 days after delivery once the return window closes.
                      </p>
                    </div>

                    <div style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      padding: "1.5rem",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.6rem"
                    }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.12)", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 5 5L20 7"/></svg>
                      </div>
                      <strong style={{ color: "#0f172a", fontSize: "1rem" }}>1-Click Checkout Deduction</strong>
                      <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
                        Toggle &ldquo;Use Wallet Balance&rdquo; during checkout to instantly reduce your payable total like real cash.
                      </p>
                    </div>
                  </div>

                  {/* Transaction Ledger Table */}
                  <div style={{
                    background: "#ffffff",
                    borderRadius: "24px",
                    padding: "2rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
                  }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.2rem" }}>
                      Wallet Activity Ledger
                    </h2>

                    {(!walletData?.transactions || walletData.transactions.length === 0) ? (
                      <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#94a3b8" }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 10px", opacity: 0.5 }}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                        <p style={{ margin: 0, fontSize: "0.95rem" }}>No wallet transactions recorded yet.</p>
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              <th style={{ padding: "0.75rem 1rem" }}>Date</th>
                              <th style={{ padding: "0.75rem 1rem" }}>Description</th>
                              <th style={{ padding: "0.75rem 1rem" }}>Type</th>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Amount</th>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Balance</th>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {walletData.transactions.map((tx) => {
                              const isCredit = tx.type === "credit";
                              return (
                                <tr key={tx.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                  <td style={{ padding: "1rem", whiteSpace: "nowrap", color: "#64748b", fontSize: "0.85rem" }}>
                                    {tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                  </td>
                                  <td style={{ padding: "1rem" }}>
                                    <strong style={{ color: "#0f172a", display: "block" }}>
                                      {tx.description || tx.source.replace("_", " ")}
                                    </strong>
                                    {tx.order_number && (
                                      <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Order #{tx.order_number}</span>
                                    )}
                                  </td>
                                  <td style={{ padding: "1rem" }}>
                                    <span style={{
                                      display: "inline-block",
                                      padding: "3px 8px",
                                      borderRadius: "6px",
                                      fontSize: "0.75rem",
                                      fontWeight: 700,
                                      textTransform: "uppercase",
                                      background: isCredit ? "#dcfce7" : "#fee2e2",
                                      color: isCredit ? "#15803d" : "#b91c1c"
                                    }}>
                                      {tx.type}
                                    </span>
                                  </td>
                                  <td style={{ padding: "1rem", textAlign: "right", fontWeight: 700, color: isCredit ? "#15803d" : "#b91c1c", whiteSpace: "nowrap" }}>
                                    {isCredit ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: "1rem", textAlign: "right", color: "#0f172a", fontWeight: 600, whiteSpace: "nowrap" }}>
                                    ₹{Number(tx.balance_after).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ padding: "1rem", textAlign: "center" }}>
                                    <span style={{
                                      display: "inline-block",
                                      padding: "3px 8px",
                                      borderRadius: "12px",
                                      fontSize: "0.75rem",
                                      fontWeight: 600,
                                      background: tx.status === "completed" ? "#f0fdf4" : tx.status === "pending_clearance" ? "#fefce8" : "#f1f5f9",
                                      color: tx.status === "completed" ? "#166534" : tx.status === "pending_clearance" ? "#854d0e" : "#475569",
                                      border: tx.status === "completed" ? "1px solid #bbf7d0" : tx.status === "pending_clearance" ? "1px solid #fef08a" : "1px solid #e2e8f0"
                                    }}>
                                      {tx.status === "pending_clearance" ? "Pending (7-Day Return)" : tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* TAB 2: ADDRESSES */}
              {activeTab === "addresses" && (
                <section style={{ animation: "fadeIn 0.3s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <div>
                      <p className="eyebrow" style={{ color: "var(--accent-deep, #b45309)", letterSpacing: "1.5px", fontSize: "0.8rem", fontWeight: 700 }}>
                        Shipping Destinations
                      </p>
                      <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "2px 0 0", color: "#0f172a" }}>
                        Saved Address Book
                      </h1>
                    </div>
                    {editingAddressId && (
                      <button
                        type="button"
                        onClick={resetAddressForm}
                        style={{ padding: "0.6rem 1.2rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
                      >
                        Cancel Editing
                      </button>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: "2rem" }}>
                    {/* Saved Addresses Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.2rem" }}>
                      {addresses.length === 0 ? (
                        <div style={{ gridColumn: "1 / -1", padding: "2.5rem", textAlign: "center", background: "#ffffff", borderRadius: "20px", border: "1px dashed #cbd5e1" }}>
                          <p style={{ color: "#64748b", margin: 0 }}>No saved addresses yet. Fill in the form below to save your preferred delivery address.</p>
                        </div>
                      ) : (
                        addresses.map((address) => (
                          <div key={address.id} style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 4px 18px rgba(0,0,0,0.02)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem", paddingBottom: "0.6rem", borderBottom: "1px solid #f1f5f9" }}>
                              <div>
                                <strong style={{ display: "block", textTransform: "capitalize", fontSize: "1rem", color: "#0f172a" }}>
                                  {address.type}{address.is_default ? " · Default" : ""}
                                </strong>
                                <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                                  {address.label || address.recipient_name}
                                </span>
                              </div>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button type="button" onClick={() => hydrateAddressForm(address)} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontWeight: 600, fontSize: "0.82rem" }}>Edit</button>
                                <button type="button" onClick={() => handleDeleteAddress(address.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b53a2c", fontWeight: 600, fontSize: "0.82rem" }}>Remove</button>
                              </div>
                            </div>
                            <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.5, color: "#334155" }}>
                              <strong>{address.recipient_name}</strong><br />
                              {address.address_line1}
                              {address.address_line2 ? <><br />{address.address_line2}</> : null}
                              <br />
                              {address.city}, {address.state} - <strong>{address.pincode}</strong>
                              {address.landmark ? <><br /><span style={{ color: "#64748b" }}>Landmark: {address.landmark}</span></> : null}
                              {address.phone ? <><br /><span style={{ color: "#64748b" }}>Phone: {address.phone}</span></> : null}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Address Form Card */}
                    <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 6px 24px rgba(0,0,0,0.03)" }}>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 1.5rem", color: "#0f172a" }}>
                        {editingAddressId ? "Edit Saved Address" : "Add New Delivery Address"}
                      </h3>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.2rem" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "#334155", marginBottom: "4px" }}>Address Type</label>
                          <select
                            value={addressForm.type}
                            onChange={(e) => setAddressForm((cur) => ({ ...cur, type: e.target.value as AddressFormState["type"] }))}
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: "0.92rem" }}
                          >
                            <option value="home">Home (All Day Delivery)</option>
                            <option value="office">Office / Commercial (10 AM - 6 PM)</option>
                            <option value="other">Other Destination</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "#334155", marginBottom: "4px" }}>Label (Optional)</label>
                          <input
                            value={addressForm.label}
                            onChange={(e) => setAddressForm((cur) => ({ ...cur, label: e.target.value }))}
                            placeholder="e.g. My Apartment, Studio, Parent's House"
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: "0.92rem" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "#334155", marginBottom: "4px" }}>Recipient Full Name *</label>
                          <input
                            value={addressForm.recipient_name}
                            onChange={(e) => setAddressForm((cur) => ({ ...cur, recipient_name: e.target.value }))}
                            placeholder="Full Name"
                            required
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: "0.92rem" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "#334155", marginBottom: "4px" }}>10-Digit Mobile Phone</label>
                          <input
                            type="tel"
                            maxLength={11}
                            value={formatIndianPhone(addressForm.phone)}
                            onChange={(e) => setAddressForm((cur) => ({ ...cur, phone: normalizeIndianPhone(e.target.value) }))}
                            placeholder="9876543210"
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: "0.92rem" }}
                          />
                        </div>

                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "#334155", marginBottom: "4px" }}>Flat / House / Building Address *</label>
                          <input
                            value={addressForm.address_line1}
                            onChange={(e) => setAddressForm((cur) => ({ ...cur, address_line1: e.target.value }))}
                            placeholder="Flat No, Wing, Building Name, Society"
                            required
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: "0.92rem" }}
                          />
                        </div>

                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "#334155", marginBottom: "4px" }}>Street / Area / Locality</label>
                          <input
                            value={addressForm.address_line2}
                            onChange={(e) => setAddressForm((cur) => ({ ...cur, address_line2: e.target.value }))}
                            placeholder="Main Road, Sector, Colony"
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: "0.92rem" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "#334155", marginBottom: "4px" }}>6-Digit Pincode *</label>
                          <input
                            maxLength={6}
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm((cur) => ({ ...cur, pincode: normalizeIndianPincode(e.target.value) }))}
                            placeholder="110001"
                            required
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: "0.92rem" }}
                          />
                          {addressPincodeStatus && (
                            <small style={{ display: "block", marginTop: "4px", color: addressPincodeStatus.includes("Detected") ? "#16a34a" : "#64748b", fontWeight: 600 }}>
                              {addressPincodeStatus}
                            </small>
                          )}
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "#334155", marginBottom: "4px" }}>City *</label>
                          <input
                            value={addressForm.city}
                            onChange={(e) => setAddressForm((cur) => ({ ...cur, city: e.target.value }))}
                            placeholder="City"
                            required
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: "0.92rem" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "#334155", marginBottom: "4px" }}>State *</label>
                          <input
                            value={addressForm.state}
                            onChange={(e) => setAddressForm((cur) => ({ ...cur, state: e.target.value }))}
                            placeholder="State"
                            required
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: "0.92rem" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "#334155", marginBottom: "4px" }}>Landmark (Optional)</label>
                          <input
                            value={addressForm.landmark}
                            onChange={(e) => setAddressForm((cur) => ({ ...cur, landmark: e.target.value }))}
                            placeholder="Near Metro, Opposite Park, etc."
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: "0.92rem" }}
                          />
                        </div>

                        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                          <input
                            type="checkbox"
                            id="is_default"
                            checked={addressForm.is_default}
                            onChange={(e) => setAddressForm((cur) => ({ ...cur, is_default: e.target.checked }))}
                            style={{ width: "18px", height: "18px", cursor: "pointer" }}
                          />
                          <label htmlFor="is_default" style={{ fontSize: "0.92rem", color: "#0f172a", cursor: "pointer", fontWeight: 600 }}>
                            Set as my default shipping address for faster checkout
                          </label>
                        </div>
                      </div>

                      {addressFeedback && (
                        <div style={{ marginTop: "1.2rem", padding: "0.8rem 1rem", borderRadius: "10px", background: addressFeedback.includes("successfully") ? "#dcfce7" : "#fee2e2", color: addressFeedback.includes("successfully") ? "#166534" : "#991b1b", fontSize: "0.9rem" }}>
                          {addressFeedback}
                        </div>
                      )}

                      <div style={{ marginTop: "1.5rem" }}>
                        <button
                          type="button"
                          onClick={handleSaveAddress}
                          disabled={addressLoading}
                          className="primary-button"
                          style={{
                            padding: "0.85rem 2rem",
                            borderRadius: "12px",
                            background: "var(--accent-deep, #0f172a)",
                            color: "#ffffff",
                            fontWeight: 700,
                            cursor: addressLoading ? "not-allowed" : "pointer"
                          }}
                        >
                          {addressLoading ? "Saving…" : editingAddressId ? "Update Address" : "Save Delivery Address"}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* TAB 3: PROFILE */}
              {activeTab === "profile" && (
                <section style={{ animation: "fadeIn 0.3s ease" }}>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p className="eyebrow" style={{ color: "var(--accent-deep, #b45309)", letterSpacing: "1.5px", fontSize: "0.8rem", fontWeight: 700 }}>
                      Kanakshi Membership
                    </p>
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "2px 0 0", color: "#0f172a" }}>
                      Profile &amp; Account Settings
                    </h1>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.2rem" }}>
                    <div style={{ background: "#ffffff", padding: "1.6rem", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 4px 18px rgba(0,0,0,0.02)" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>FULL NAME</span>
                      <strong style={{ fontSize: "1.15rem", color: "#0f172a" }}>{user.name}</strong>
                    </div>

                    <div style={{ background: "#ffffff", padding: "1.6rem", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 4px 18px rgba(0,0,0,0.02)" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>EMAIL ADDRESS</span>
                      <strong style={{ fontSize: "1.15rem", color: "#0f172a", overflowWrap: "anywhere" }}>{user.email}</strong>
                    </div>

                    <div style={{ background: "#ffffff", padding: "1.6rem", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 4px 18px rgba(0,0,0,0.02)" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>MOBILE NUMBER</span>
                      <strong style={{ fontSize: "1.15rem", color: "#0f172a" }}>{user.phone || "Not linked"}</strong>
                    </div>

                    <div style={{ background: "#ffffff", padding: "1.6rem", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 4px 18px rgba(0,0,0,0.02)" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>ACCOUNT SECURITY</span>
                      <strong style={{ fontSize: "1.1rem", color: "#16a34a" }}>
                        Active &amp; Verified
                      </strong>
                    </div>
                  </div>
                </section>
              )}

            </div>

          </div>
        )}

      </div>

      {/* DETAILED ORDER RECEIPT & TRACKING MODAL */}
      {selectedOrder && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          padding: "1.5rem",
          animation: "fadeIn 0.2s ease"
        }}>
          <div style={{
            width: "min(100%, 780px)",
            maxHeight: "88vh",
            background: "#ffffff",
            borderRadius: "28px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
                border: "none",
                background: "#f1f5f9",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                fontSize: "1.1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "#64748b"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {/* Modal Scrollable Content */}
            <div style={{ overflowY: "auto", flex: 1, paddingRight: "8px" }}>
              
              {/* Header */}
              <div style={{ marginBottom: "1.5rem", paddingBottom: "1.2rem", borderBottom: "1px solid #e2e8f0" }}>
                <span className="eyebrow" style={{ color: "var(--accent-deep, #b45309)", fontSize: "0.8rem", letterSpacing: "1.5px" }}>Official Order Receipt</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
                  <h3 style={{ fontSize: "1.7rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>{selectedOrder.order_number}</h3>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.78rem", color: "#64748b", display: "block", textTransform: "uppercase", fontWeight: 700 }}>PLACED DATE</span>
                    <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                      {new Date(selectedOrder.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div style={{
                background: getStatusColor(selectedOrder.status).bg,
                borderRadius: "16px",
                padding: "1rem 1.4rem",
                marginBottom: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem"
              }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", fontWeight: 700, textTransform: "uppercase" }}>ORDER STATUS</span>
                  <strong style={{ color: getStatusColor(selectedOrder.status).text, textTransform: "uppercase", fontSize: "1.05rem" }}>
                    {selectedOrder.status}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", fontWeight: 700, textTransform: "uppercase" }}>PAYMENT METHOD</span>
                  <strong style={{ textTransform: "uppercase", fontSize: "0.95rem", color: "#0f172a" }}>
                    {selectedOrder.payment_method} ({selectedOrder.payment_status})
                  </strong>
                </div>
              </div>

              {/* Items Summary */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.8rem" }}>Ordered Jewellery Items</h4>
                <div style={{ display: "grid", gap: "0.8rem" }}>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: "1rem", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.8rem" }}>
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
                        <h5 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 600, color: "#0f172a" }}>{item.name}</h5>
                        {item.variant_details && <small style={{ color: "#64748b" }}>{item.variant_details}</small>}
                      </div>
                      <div style={{ textAlign: "right", minWidth: "120px" }}>
                        <span style={{ fontSize: "0.82rem", color: "#64748b", display: "block" }}>
                          {item.quantity} x {formatPrice(item.price, "₹")}
                        </span>
                        <strong style={{ color: "#0f172a", fontSize: "0.95rem" }}>{formatPrice(item.line_total, "₹")}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address & Tracking Layout */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.2rem" }} className="account-detail-grid">
                
                {/* Shipping Details */}
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.6rem" }}>Delivery Address</h4>
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "#334155", lineHeight: 1.5 }}>
                    <strong>{selectedOrder.ship_name}</strong><br />
                    {selectedOrder.ship_address}<br />
                    {selectedOrder.ship_city}, {selectedOrder.ship_state} - {selectedOrder.ship_pincode}<br />
                    Phone: {selectedOrder.ship_phone}
                  </p>
                </div>

                {/* Tracking Details */}
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.6rem" }}>Shipment Tracking</h4>
                  {selectedOrder.tracking_number ? (
                    <div>
                      <p style={{ margin: "0 0 0.5rem", fontSize: "0.88rem", lineHeight: 1.6, color: "#334155" }}>
                        <strong>Carrier:</strong> {selectedOrder.courier_name || 'Courier Partner'}<br />
                        <strong>AWB / Tracking:</strong> <code style={{ fontSize: "0.95rem", color: "#2563eb", fontWeight: 700 }}>{selectedOrder.tracking_number}</code>
                        <button
                          type="button"
                          onClick={() => handleCopyAwb(selectedOrder.tracking_number!)}
                          style={{ marginLeft: "8px", background: "none", border: "none", cursor: "pointer", fontSize: "0.82rem", color: copiedAwb === selectedOrder.tracking_number ? "#16a34a" : "#64748b" }}
                        >
                          {copiedAwb === selectedOrder.tracking_number ? "Copied" : "Copy"}
                        </button>
                        {selectedOrder.estimated_delivery_date && (
                          <>
                            <br />
                            <strong>Est. Delivery:</strong> {new Date(selectedOrder.estimated_delivery_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </>
                        )}
                      </p>
                      {selectedOrder.tracking_url && (
                        <a href={selectedOrder.tracking_url} target="_blank" rel="noreferrer" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#2563eb", textDecoration: "underline" }}>
                          Track on {selectedOrder.courier_name || 'Courier'} Website ↗
                        </a>
                      )}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "#64748b" }}>
                      Shipment details will be updated as soon as the order is dispatched from our atelier.
                    </p>
                  )}
                </div>

              </div>

              {/* Milestone Updates Timeline */}
              {selectedOrder.tracking && selectedOrder.tracking.length > 0 && (
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.2rem", marginBottom: "1.5rem" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.8rem" }}>Activity Checkpoints</h4>
                  <div style={{ display: "grid", gap: "1rem", paddingLeft: "10px" }}>
                    {selectedOrder.tracking.map((track, i) => (
                      <div key={track.id} style={{ display: "flex", gap: "1rem", position: "relative" }}>
                        <div style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: i === 0 ? "#16a34a" : "#cbd5e1",
                          marginTop: "4px",
                          zIndex: 2
                        }} />

                        {i < selectedOrder.tracking.length - 1 && (
                          <div style={{
                            position: "absolute",
                            top: "16px",
                            left: "5px",
                            width: "2px",
                            height: "calc(100% + 4px)",
                            background: "#e2e8f0",
                            zIndex: 1
                          }} />
                        )}

                        <div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>{track.status}</strong>
                            {track.location && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>({track.location})</span>}
                          </div>
                          <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#64748b", lineHeight: 1.3 }}>{track.message}</p>
                          <small style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginTop: "2px" }}>
                            {new Date(track.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {new Date(track.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Returns & Refunds Cockpit */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.2rem", marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.8rem" }}>Returns &amp; Exchanges</h4>

                {selectedOrder.returns.length > 0 && (
                  <div style={{ display: "grid", gap: "0.8rem", marginBottom: "1rem" }}>
                    {selectedOrder.returns.map((request) => (
                      <div key={request.id} style={{ border: "1px solid #e2e8f0", borderRadius: "16px", padding: "1rem", background: "#f8fafc" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                          <div>
                            <strong style={{ color: "#0f172a" }}>{request.return_number}</strong>
                            <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "2px" }}>{request.reason}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block", fontWeight: 700 }}>STATUS</span>
                            <strong style={{ textTransform: "uppercase", color: request.status === "refunded" ? "#16a34a" : "#0f172a" }}>{request.status}</strong>
                          </div>
                        </div>

                        {request.pickup_tracking_number && (
                          <div style={{ marginTop: "0.8rem", padding: "0.7rem 0.9rem", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0", fontSize: "0.85rem" }}>
                            <span style={{ display: "block", fontWeight: 700, color: "#166534" }}>Reverse Pickup Assigned:</span>
                            <span>Carrier: <strong>{request.pickup_courier_name || 'Delhivery Reverse'}</strong></span> · <span>AWB: <code style={{ fontWeight: 700 }}>{request.pickup_tracking_number}</code></span>
                            {request.pickup_scheduled_date && (
                              <span style={{ display: "block", marginTop: "2px", color: "#166534" }}>Scheduled Date: <strong>{request.pickup_scheduled_date}</strong></span>
                            )}
                            {request.pickup_tracking_url && (
                              <a href={request.pickup_tracking_url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "4px", color: "#15803d", fontWeight: 700, textDecoration: "underline" }}>
                                Track Reverse Pickup ↗
                              </a>
                            )}
                          </div>
                        )}

                        {request.status === "refunded" && (
                          <div style={{ marginTop: "0.8rem", padding: "0.9rem", background: "rgba(241, 167, 32, 0.08)", border: "1px solid rgba(241, 167, 32, 0.3)", borderRadius: "12px" }}>
                            <strong style={{ color: "#b45309", fontSize: "0.9rem", display: "block" }}>
                              {request.refund_mode === "wallet" ? "Refund Credited to Your Kanakshi Wallet!" : "Refund Processed to Source Account"}
                            </strong>
                            <p style={{ margin: "3px 0 8px", fontSize: "0.82rem", color: "#64748b" }}>
                              {request.refund_mode === "wallet"
                                ? `₹${request.approved_amount} is available in your wallet. You can use it immediately at checkout!`
                                : `₹${request.approved_amount} has been initiated back to your original payment method.`}
                            </p>
                            {request.refund_mode === "wallet" && (
                              <Link
                                href="/shop"
                                style={{ display: "inline-block", padding: "5px 12px", background: "var(--accent, #f1a720)", color: "#191919", borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none" }}
                              >
                                Shop With Wallet Cash →
                              </Link>
                            )}
                          </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginTop: "0.6rem", fontSize: "0.85rem" }}>
                          <span>Requested: {formatPrice(request.requested_amount, "₹")}</span>
                          <span>Approved: {request.approved_amount > 0 ? formatPrice(request.approved_amount, "₹") : "Pending"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {canRequestReturn && selectedOrder.returns.length === 0 && (
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "18px", padding: "1.2rem", background: "#f8fafc" }}>
                    <p style={{ margin: "0 0 0.85rem", fontSize: "0.88rem", color: "#64748b" }}>
                      Eligible for 7-day hassle-free return or exchange. Select items you wish to send back:
                    </p>
                    <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
                      {selectedOrder.items.map((item) => {
                        const key = `${item.product_id}:${item.variant_id ?? 0}`;
                        return (
                          <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: "0.75rem", alignItems: "center" }}>
                            <div>
                              <strong style={{ display: "block", fontSize: "0.9rem", color: "#0f172a" }}>{item.name}</strong>
                              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Ordered qty: {item.quantity}</span>
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
                              style={{ padding: "0.5rem 0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", textAlign: "center" }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "grid", gap: "0.8rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                          Primary Reason for Return *
                        </label>
                        <select
                          value={returnReason}
                          onChange={(e) => setReturnReason(e.target.value)}
                          style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "0.88rem" }}
                        >
                          <option value="Size / Fitting Issue (e.g. Ring too loose/tight, unsuitable length)">Size / Fitting Issue (e.g. Ring too loose/tight, unsuitable length)</option>
                          <option value="Design / Color Different from Photos (e.g. Stone or plating in person)">Design / Color Different from Photos (e.g. Stone or plating in person)</option>
                          <option value="Received Defective or Damaged (e.g. Scratched surface, loose clasp/gem)">Received Defective or Damaged (e.g. Scratched surface, loose clasp/gem)</option>
                          <option value="Received Wrong Item / SKU (e.g. Different piece delivered)">Received Wrong Item / SKU (e.g. Different piece delivered)</option>
                          <option value="Quality / Weight Not as Expected">Quality / Weight Not as Expected</option>
                          <option value="Arrived Later than Needed (e.g. Missed occasion/gift date)">Arrived Later than Needed (e.g. Missed occasion/gift date)</option>
                          <option value="Want to Exchange for Another Design (Instant Wallet Credit)">Want to Exchange for Another Design (Instant Wallet Credit)</option>
                          <option value="Other Reason">Other Reason</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                          Specific Details (Optional)
                        </label>
                        <input
                          type="text"
                          value={returnReasonDetail}
                          onChange={(e) => setReturnReasonDetail(e.target.value)}
                          placeholder="e.g. Ring was size 12, need size 14"
                          style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "0.88rem" }}
                        />
                      </div>

                      {/* Refund Mode Choice */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                          Refund Settlement Method *
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                          <label
                            onClick={() => setReturnRefundMode("wallet")}
                            style={{
                              padding: "0.6rem 0.8rem",
                              borderRadius: "10px",
                              border: returnRefundMode === "wallet" ? "2px solid #b45309" : "1px solid #cbd5e1",
                              background: returnRefundMode === "wallet" ? "rgba(241, 167, 32, 0.08)" : "#fff",
                              cursor: "pointer",
                              fontSize: "0.82rem",
                              display: "block"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <input
                                type="radio"
                                name="account_refund_mode"
                                checked={returnRefundMode === "wallet"}
                                onChange={() => setReturnRefundMode("wallet")}
                                style={{ accentColor: "#b45309" }}
                              />
                              <strong style={{ color: "#0f172a" }}>Wallet Cash (Instant)</strong>
                            </div>
                            <span style={{ fontSize: "0.74rem", color: "#64748b", display: "block", marginTop: "2px" }}>
                              Shop immediately after inspection
                            </span>
                          </label>

                          <label
                            onClick={() => setReturnRefundMode("original_payment")}
                            style={{
                              padding: "0.6rem 0.8rem",
                              borderRadius: "10px",
                              border: returnRefundMode === "original_payment" ? "2px solid #b45309" : "1px solid #cbd5e1",
                              background: returnRefundMode === "original_payment" ? "rgba(241, 167, 32, 0.08)" : "#fff",
                              cursor: "pointer",
                              fontSize: "0.82rem",
                              display: "block"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <input
                                type="radio"
                                name="account_refund_mode"
                                checked={returnRefundMode === "original_payment"}
                                onChange={() => setReturnRefundMode("original_payment")}
                                style={{ accentColor: "#b45309" }}
                              />
                              <strong style={{ color: "#0f172a" }}>Original Source</strong>
                            </div>
                            <span style={{ fontSize: "0.74rem", color: "#64748b", display: "block", marginTop: "2px" }}>
                              Bank refund in 3–5 days
                            </span>
                          </label>
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                        placeholder="Additional notes for our quality inspection team (optional)"
                        style={{ padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "0.9rem", resize: "vertical" }}
                      />
                      {returnFeedback && (
                        <div style={{ fontSize: "0.85rem", color: returnFeedback.includes("submitted") ? "#166534" : "#991b1b" }}>
                          {returnFeedback}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleSubmitReturn}
                        disabled={isSubmittingReturn}
                        style={{ padding: "0.75rem 1.4rem", borderRadius: "10px", background: "var(--accent-deep, #0f172a)", color: "#ffffff", fontWeight: 700, border: "none", cursor: "pointer", justifySelf: "start" }}
                      >
                        {isSubmittingReturn ? "Submitting…" : "Request Return / Pickup"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Details */}
              <div style={{
                borderTop: "1px solid #e2e8f0",
                paddingTop: "1.2rem",
                marginTop: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "0.4rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "240px", fontSize: "0.88rem" }}>
                  <span style={{ color: "#64748b" }}>Subtotal</span>
                  <strong>{formatPrice(selectedOrder.subtotal, "₹")}</strong>
                </div>
                {selectedOrder.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", width: "240px", fontSize: "0.88rem", color: "#166534" }}>
                    <span>Discount Code Applied</span>
                    <strong>-{formatPrice(selectedOrder.discount, "₹")}</strong>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", width: "240px", fontSize: "0.88rem" }}>
                  <span style={{ color: "#64748b" }}>Shipping</span>
                  <strong>{selectedOrder.shipping_cost === 0 ? "FREE" : formatPrice(selectedOrder.shipping_cost, "₹")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", width: "240px", fontSize: "1.15rem", borderTop: "1px solid #e2e8f0", paddingTop: "0.6rem", marginTop: "0.3rem" }}>
                  <strong style={{ color: "#0f172a" }}>Total Paid</strong>
                  <strong style={{ color: "#16a34a" }}>{formatPrice(selectedOrder.total_amount, "₹")}</strong>
                </div>
              </div>

            </div>

            {/* Quick Track Link */}
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
              <a
                href={`/track-order?number=${encodeURIComponent(selectedOrder.order_number)}`}
                className="primary-button"
                style={{ flex: 1, textAlign: "center", textDecoration: "none", display: "flex", justifyContent: "center", alignItems: "center", padding: "0.85rem 1.5rem", borderRadius: "12px", background: "var(--accent-deep, #0f172a)", color: "#ffffff", fontWeight: 700 }}
              >
                Track Live Order Updates
              </a>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ flex: 0.5, cursor: "pointer", padding: "0.85rem 1.5rem", borderRadius: "12px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#0f172a", fontWeight: 600 }}
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
        @media (max-width: 860px) {
          .account-main-grid {
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
