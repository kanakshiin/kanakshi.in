import { CartView } from "../../components/cart-view";
import { getActiveCoupons, getSettings } from "../../lib/api";

export default async function CartPage() {
  const [settings, offers] = await Promise.all([getSettings(), getActiveCoupons()]);

  return (
    <main className="page-shell">
      <section className="content-section">
        <div className="container">
          <CartView settings={settings} offers={offers} />
        </div>
      </section>
    </main>
  );
}
