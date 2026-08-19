import { CartView } from "../../components/cart-view";
import { getActiveCoupons, getProducts, getSettings } from "../../lib/api";

export default async function CartPage() {
  const [settings, offers, productsRes] = await Promise.all([
    getSettings(),
    getActiveCoupons(),
    getProducts("per_page=4&sort=popular").catch(() => ({ items: [], pagination: { current_page: 1, per_page: 0, total: 0, last_page: 1 } })),
  ]);

  return (
    <main className="page-shell" style={{ backgroundColor: "#faf8f5", minHeight: "80vh" }}>
      <CartView
        settings={settings}
        offers={offers}
        recommendedProducts={productsRes?.items || []}
      />
    </main>
  );
}

