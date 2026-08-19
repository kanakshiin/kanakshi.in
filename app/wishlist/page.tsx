import { Metadata } from "next";
import { WishlistView } from "../../components/wishlist-view";
import { getProducts, getSettings } from "../../lib/api";

export const metadata: Metadata = {
  title: "My Wishlist | Kanakshi Fine Jewellery",
  description: "View and manage your saved 925 sterling silver rings, necklaces, earrings, and lab-grown diamond jewellery pieces."
};

export default async function WishlistPage() {
  const [settings, productsResponse] = await Promise.all([
    getSettings(),
    getProducts("featured=1&per_page=4&sort=popular")
  ]);

  const recommendedProducts = productsResponse.items || [];

  return (
    <main style={{ minHeight: "80vh", backgroundColor: "#ffffff" }}>
      <WishlistView settings={settings} recommendedProducts={recommendedProducts} />
    </main>
  );
}
