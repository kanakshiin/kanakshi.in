import type { Metadata } from "next";
import Link from "next/link";

import { getSettings } from "../../lib/api";
import { getCanonicalUrl, getSiteName } from "../../lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: "Track Order",
    description: "Track your Little Divinity order status using your order details.",
    alternates: {
      canonical: "/track-order"
    },
    openGraph: {
      title: `Track Order | ${getSiteName(settings)}`,
      description: "Check order progress and delivery updates.",
      url: getCanonicalUrl("/track-order", settings)
    }
  };
}

export default async function TrackOrderPage() {
  return (
    <main className="page-shell">
      <section className="content-section white-section">
        <div className="container" style={{ maxWidth: "900px" }}>
          <p className="eyebrow">Track Order</p>
          <h1 className="page-title" style={{ maxWidth: "11ch" }}>Check your order status.</h1>
          <p className="shop-intro" style={{ maxWidth: "48rem" }}>
            This route is now live so the footer link works properly. We can next connect it to a real order lookup by
            order ID, phone number, email, and shipment tracking details from the backend.
          </p>

          <div style={{ display: "grid", gap: "1rem", marginTop: "1.2rem", padding: "1.5rem", border: "1px solid var(--line)", borderRadius: "28px", background: "rgba(255,255,255,0.76)", maxWidth: "40rem" }}>
            <p><strong>Coming next:</strong> order search, shipment timeline, courier link, and delivery status.</p>
            <Link href="/shop" className="text-link">Shop while your order is on the way</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
