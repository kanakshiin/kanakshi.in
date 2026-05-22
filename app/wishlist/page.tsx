import { WishlistView } from "../../components/wishlist-view";
import { getSettings } from "../../lib/api";

export default async function WishlistPage() {
  const settings = await getSettings();

  return (
    <main className="page-shell">
      <section className="content-section">
        <div className="container">
          <WishlistView settings={settings} />
        </div>
      </section>
    </main>
  );
}
