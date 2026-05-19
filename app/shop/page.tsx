import Link from "next/link";

import { ProductCard } from "../../components/product-card";
import { getCategories, getProducts, getSettings } from "../../lib/api";

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [settings, categories] = await Promise.all([getSettings(), getCategories(12)]);
  const query = new URLSearchParams();

  query.set("per_page", "24");
  query.set("sort", "popular");

  if (params.category) {
    query.set("category", params.category);
  }

  const products = await getProducts(query.toString());
  const currencySymbol = settings.site_currency_symbol || "₹";
  const activeCategory = categories.find((category) => category.slug === params.category);

  return (
    <main className="page-shell">
      <section className="shop-hero">
        <div className="container">
          <div className="shop-hero-grid">
            <div>
              <p className="eyebrow">Shop The Collection</p>
              <h1 className="page-title">
                {activeCategory ? activeCategory.name : "Premium Decor For Home, Ritual, And Gifting"}
              </h1>
              <p className="shop-intro">
                Browse handcrafted accents, statement idols, festive gifting picks, and home styling pieces in a calmer,
                premium storefront flow.
              </p>
              <div className="shop-chip-row">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.slug}`}
                    className={category.slug === params.category ? "shop-chip active" : "shop-chip"}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="shop-summary-card">
              <span>{products.pagination.total} products ready to browse</span>
              <strong>Curated around festive display, sacred corners, and meaningful gifting.</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Featured Listing</p>
              <h2>{activeCategory ? `${activeCategory.name} Picks` : "Most Loved Pieces"}</h2>
            </div>
            <span className="listing-meta">Sorted by popularity</span>
          </div>

          <div className="product-grid">
            {products.items.map((product) => (
              <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
