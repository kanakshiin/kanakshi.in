import Link from "next/link";

import { NotFoundBackButton } from "../components/not-found-back-button";
import { ProductCard } from "../components/product-card";
import { getProducts, getSettings } from "../lib/api";

export default async function NotFound() {
  const [settings, productResponse] = await Promise.all([
    getSettings(),
    getProducts("featured=1&per_page=4&sort=popular"),
  ]);

  const currencySymbol = settings.site_currency_symbol || "₹";
  const suggestedProducts = productResponse.items.slice(0, 4);

  return (
    <main
      className="content-section"
      style={{
        minHeight: "72vh",
        background: "linear-gradient(180deg, rgba(250, 248, 245, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%)",
        padding: "4rem 0 5rem",
      }}
    >
      <div className="container" style={{ display: "grid", gap: "2rem" }}>
        <section
          style={{
            padding: "3rem",
            borderRadius: "32px",
            border: "1px solid var(--line)",
            background: "rgba(255,255,255,0.8)",
            boxShadow: "var(--shadow)",
            backdropFilter: "blur(12px)",
            textAlign: "center",
          }}
        >
          <p className="eyebrow" style={{ marginBottom: "0.85rem", color: "var(--accent-deep)" }}>
            Error 404
          </p>
          <h1
            style={{
              margin: "0 0 1rem",
              fontSize: "clamp(2.5rem, 6vw, 4.75rem)",
              lineHeight: 0.96,
            }}
          >
            This page could not be found.
          </h1>
          <p className="shop-intro" style={{ maxWidth: "680px", margin: "0 auto 1.75rem" }}>
            The link may be outdated, the page may have moved, or the address may be incorrect.
            You can head back, return home, or keep shopping from these picks.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.9rem",
              flexWrap: "wrap",
              marginBottom: "1.2rem",
            }}
          >
            <NotFoundBackButton />
            <Link href="/" className="primary-button">
              Back to Home
            </Link>
            <Link href="/shop" className="secondary-button">
              Continue Shopping
            </Link>
          </div>
        </section>

        <section
          style={{
            padding: "2rem",
            borderRadius: "32px",
            border: "1px solid var(--line)",
            background: "rgba(255,255,255,0.68)",
            boxShadow: "var(--shadow-soft)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "space-between",
              gap: "1rem",
              marginBottom: "1.4rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p className="eyebrow" style={{ marginBottom: "0.45rem" }}>
                Recommended
              </p>
              <h2 style={{ margin: 0, fontSize: "1.9rem" }}>Popular Products</h2>
            </div>
            <Link href="/shop" className="text-link">
              View full catalog
            </Link>
          </div>

          {suggestedProducts.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.2rem",
              }}
            >
              {suggestedProducts.map((product) => (
                <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} />
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "1.4rem",
                borderRadius: "20px",
                border: "1px solid var(--line)",
                background: "rgba(255,255,255,0.6)",
                color: "var(--muted)",
              }}
            >
              No featured products are available right now. Please head back to the home page or browse the shop.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
