import { CartView } from "../../components/cart-view";
import { getSettings } from "../../lib/api";

export default async function CartPage() {
  const settings = await getSettings();

  return (
    <main className="page-shell">
      <section className="content-section">
        <div className="container">
          <CartView settings={settings} />
        </div>
      </section>
    </main>
  );
}
