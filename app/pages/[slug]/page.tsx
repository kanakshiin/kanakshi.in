import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSettings } from "../../../lib/api";
import { getCanonicalUrl, getSiteName } from "../../../lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const pageContent = {
  "about-us": {
    eyebrow: "About Us",
    title: "A handcrafted home for meaningful decor and gifting.",
    body: [
      "Little Divinity curates brass decor, pooja accents, and gifting pieces with a warmer, handcrafted visual language. The idea is simple: products should feel personal, display-worthy, and rooted in Indian craft culture.",
      "Our storefront brings together sacred pieces, home styling accents, and festive gifting options so customers can browse one place with confidence. Over time, these sections can be fully driven from admin or CMS data."
    ]
  },
  contact: {
    eyebrow: "Contact",
    title: "Reach the Little Divinity team.",
    body: [
      "For product questions, order help, gifting support, or wholesale conversations, customers can contact the store using the details below.",
      "If you want, we can next connect this page to a real contact form with backend submission storage and admin notifications."
    ]
  },
  "privacy-policy": {
    eyebrow: "Privacy Policy",
    title: "How store information is handled.",
    body: [
      "We only use customer information for order processing, account access, customer support, and essential communication related to the storefront.",
      "Payment processing, delivery updates, and account verification may require sharing limited information with payment gateways, couriers, and verification providers strictly for service delivery."
    ]
  },
  "terms-conditions": {
    eyebrow: "Terms & Conditions",
    title: "Store use, ordering, and service terms.",
    body: [
      "Product pricing, availability, and delivery estimates may change based on stock, logistics, and store updates. Orders are confirmed only after successful processing by the storefront system.",
      "Customers are expected to provide accurate shipping, contact, and payment details. Fraudulent or abusive use of the storefront may lead to cancellation, account blocking, or service refusal."
    ]
  }
} as const;

type ContentPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = pageContent[slug as keyof typeof pageContent];
  const settings = await getSettings();

  if (!content) {
    return {
      title: "Page Not Found"
    };
  }

  return {
    title: content.eyebrow,
    description: content.body[0],
    alternates: {
      canonical: `/pages/${slug}`
    },
    openGraph: {
      title: `${content.eyebrow} | ${getSiteName(settings)}`,
      description: content.body[0],
      url: getCanonicalUrl(`/pages/${slug}`, settings)
    }
  };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = await params;
  const content = pageContent[slug as keyof typeof pageContent];
  const settings = await getSettings();

  if (!content) {
    notFound();
  }

  return (
    <main className="page-shell">
      <section className="content-section white-section">
        <div className="container" style={{ maxWidth: "960px" }}>
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 className="page-title" style={{ maxWidth: "14ch" }}>{content.title}</h1>
          <div style={{ display: "grid", gap: "1rem", maxWidth: "52rem", color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.8 }}>
            {content.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {slug === "contact" ? (
            <div style={{ display: "grid", gap: "0.8rem", marginTop: "2rem", padding: "1.4rem 1.5rem", border: "1px solid var(--line)", borderRadius: "28px", background: "rgba(255,255,255,0.74)", maxWidth: "34rem" }}>
              <p><strong>Email:</strong> {settings.site_email || "hello@littledivinity.com"}</p>
              <p><strong>Phone:</strong> {settings.site_phone || "+91 9910212007"}</p>
              <p><strong>Address:</strong> {settings.address_line1 || "E-3, Ground Floor Sector -3"}, {settings.city || "Noida"} {settings.pincode || "201301"}</p>
            </div>
          ) : null}

          <div style={{ marginTop: "2rem" }}>
            <Link href="/shop" className="text-link">Continue browsing the collection</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
