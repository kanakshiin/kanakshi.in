import { ProductCard } from "../../components/product-card";
import { getProducts, getSettings } from "../../lib/api";

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const settings = await getSettings();
  const query = new URLSearchParams();

  query.set("per_page", "24");
  query.set("sort", "popular");

  if (params.category) {
    query.set("category", params.category);
  }

  const products = await getProducts(query.toString());
  const currencySymbol = settings.site_currency_symbol || "Rs.";

  return (
    <main className="page-shell">
      <section className="content-section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Shop</p>
              <h1 className="page-title">
                {params.category ? `Category: ${params.category}` : "All Products"}
              </h1>
            </div>
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
