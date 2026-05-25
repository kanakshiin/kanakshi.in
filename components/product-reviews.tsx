export function ProductReviews({ productName }: { productName: string }) {
  return (
    <section className="product-reviews-section" style={{ borderTop: "1px solid var(--line)", paddingTop: "4rem", marginTop: "4rem" }}>
      <div className="container" style={{ maxWidth: "880px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <p className="eyebrow">Customer Reviews</p>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2.2rem", fontWeight: 600, color: "var(--accent-deep)", margin: 0 }}>
            Verified purchase feedback is coming soon
          </h2>
        </div>

        <div
          className="reviews-summary-grid"
          style={{
            display: "grid",
            gap: "1.5rem",
            padding: "2rem",
            background: "var(--white)",
            borderRadius: "24px",
            border: "1px solid var(--line)"
          }}
        >
          <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.8, margin: 0 }}>
            We are connecting reviews to completed customer orders so that only genuine, purchase-backed feedback
            appears for <strong style={{ color: "var(--text)" }}>{productName}</strong>. Once that flow is live,
            ratings, written reviews, and verified buyer badges will show here automatically.
          </p>

          <div style={{ display: "grid", gap: "0.75rem", color: "var(--muted)", fontSize: "0.95rem" }}>
            <div>• Verified purchase badges will only appear after real order confirmation.</div>
            <div>• Review submission will open once the account-to-order review system is connected.</div>
            <div>• Until then, product details, dispatch information, and care notes remain the reliable reference.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
