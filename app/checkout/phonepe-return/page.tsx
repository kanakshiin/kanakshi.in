"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { getStoredCustomerToken } from "../../../lib/customer-auth";
import { verifyPayment } from "../../../lib/api";
import { useCart } from "../../../components/cart-provider";

function PhonePeReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [message, setMessage] = useState("Confirming your prepaid payment with PhonePe…");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const orderNumber = searchParams.get("order_number") || "";
    const orderContact = searchParams.get("contact") || "";
    const token = getStoredCustomerToken() || undefined;

    if (!orderNumber) {
      setStatus("error");
      setMessage("We could not find the order reference for this PhonePe payment.");
      return;
    }

    let active = true;

    verifyPayment(
      {
        order_number: orderNumber,
        payment_method: "phonepe",
        order_contact: orderContact || undefined,
      },
      token
    ).then((result) => {
      if (!active) return;

      if (result.success) {
        clearCart();
        setStatus("success");
        setMessage("PhonePe payment verified successfully. Redirecting to your order confirmation…");
        window.setTimeout(() => {
          router.replace(`/checkout/success?order_number=${encodeURIComponent(orderNumber)}`);
        }, 1200);
        return;
      }

      setStatus("error");
      setMessage(result.message || "PhonePe payment is not confirmed yet. Please try again in a moment.");
    }).catch(() => {
      if (!active) return;
      setStatus("error");
      setMessage("We could not verify your PhonePe payment right now. Please try again in a moment.");
    });

    return () => {
      active = false;
    };
  }, [clearCart, router, searchParams]);

  return (
    <main className="content-section auth-page" style={{ minHeight: "70vh", justifyContent: "center" }}>
      <div className="auth-card" style={{ maxWidth: "620px", textAlign: "center" }}>
        <p className="eyebrow">PhonePe Return</p>
        <h1 className="auth-title" style={{ fontSize: "2.2rem" }}>
          {status === "loading" ? "Verifying Payment" : status === "success" ? "Payment Confirmed" : "Verification Pending"}
        </h1>
        <p className="auth-muted">{message}</p>
        {status === "error" ? (
          <div className="auth-link-row" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
            <Link href="/checkout" className="primary-button">Back to Checkout</Link>
            <Link href="/account" className="secondary-button">View Account</Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function PhonePeReturnPage() {
  return (
    <Suspense fallback={
      <main className="content-section auth-page" style={{ minHeight: "70vh", justifyContent: "center" }}>
        <div className="auth-card" style={{ maxWidth: "620px", textAlign: "center" }}>
          <p className="eyebrow">PhonePe Return</p>
          <h1 className="auth-title" style={{ fontSize: "2.2rem" }}>Verifying Payment</h1>
          <p className="auth-muted">Loading payment details...</p>
        </div>
      </main>
    }>
      <PhonePeReturnContent />
    </Suspense>
  );
}

