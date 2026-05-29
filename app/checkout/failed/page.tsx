"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CheckoutFailedContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order_number") || "";
  const paymentMethod = searchParams.get("payment_method") || "";
  const reason = searchParams.get("reason") || "Your payment did not complete successfully.";
  const retryHref = `/checkout${paymentMethod ? `?payment=${encodeURIComponent(paymentMethod)}` : ""}`;

  return (
    <main className="content-section auth-page" style={{ minHeight: "72vh", justifyContent: "center" }}>
      <div className="auth-card" style={{ maxWidth: "760px" }}>
        <p className="eyebrow">Payment Status</p>
        <h1 className="auth-title" style={{ fontSize: "2.3rem" }}>Payment Failed or Cancelled</h1>
        <p className="auth-muted" style={{ marginBottom: "1.25rem" }}>{reason}</p>

        {(orderNumber || paymentMethod) ? (
          <div style={{ display: "grid", gap: "0.55rem", padding: "1rem 1.1rem", border: "1px solid var(--line)", borderRadius: "18px", background: "rgba(255,255,255,0.66)", marginBottom: "1.5rem" }}>
            {orderNumber ? <div><strong>Order:</strong> {orderNumber}</div> : null}
            {paymentMethod ? <div><strong>Payment Method:</strong> {paymentMethod.toUpperCase()}</div> : null}
          </div>
        ) : null}

        <div className="auth-link-row" style={{ justifyContent: "flex-start", flexWrap: "wrap", gap: "0.9rem" }}>
          <Link href={retryHref} className="primary-button">Retry Payment</Link>
          <Link href="/cart" className="secondary-button">Back to Cart</Link>
          <Link href="/account" className="secondary-button">Go to Account</Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={
      <main className="content-section auth-page" style={{ minHeight: "72vh", justifyContent: "center" }}>
        <div className="auth-card" style={{ maxWidth: "760px" }}>
          <p className="eyebrow">Payment Status</p>
          <h1 className="auth-title" style={{ fontSize: "2.3rem" }}>Loading Payment Status</h1>
          <p className="auth-muted">Preparing your payment result…</p>
        </div>
      </main>
    }>
      <CheckoutFailedContent />
    </Suspense>
  );
}
