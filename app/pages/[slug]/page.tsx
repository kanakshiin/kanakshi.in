import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSettings } from "../../../lib/api";
import { liveContactDefaults, livePrivacyPolicyHtml, liveRefundPolicyHtml, liveTermsHtml } from "../../../lib/legal-content";
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
      "For product questions, order help, gifting support, or wholesale conversations, customers can contact the store using the details below."
    ]
  },
  "privacy-policy": {
    eyebrow: "Privacy Policy",
    title: "How store information is handled.",
    body: []
  },
  "terms-conditions": {
    eyebrow: "Terms & Conditions",
    title: "Store use, ordering, and service terms.",
    body: []
  },
  "refund-policy": {
    eyebrow: "Refund Policy",
    title: "Returns, exchanges, and refunds.",
    body: []
  },
} as const;

const policyDescriptions = {
  "privacy-policy": "Read how Little Divinity collects, uses, and protects your personal information.",
  "terms-conditions": "Read the store use, ordering, billing, and service terms for Little Divinity.",
  "refund-policy": "Read the return, exchange, and refund process for Little Divinity orders.",
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
    description: policyDescriptions[slug as keyof typeof policyDescriptions] || content.body[0] || "Learn more about Little Divinity.",
    alternates: {
      canonical: `/pages/${slug}`
    },
    openGraph: {
      title: `${content.eyebrow} | ${getSiteName(settings)}`,
      description: policyDescriptions[slug as keyof typeof policyDescriptions] || content.body[0] || "Learn more about Little Divinity.",
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

  const configuredPolicyHtml =
    slug === "privacy-policy"
      ? settings.privacy_policy
      : slug === "terms-conditions"
        ? settings.terms_conditions
        : slug === "refund-policy"
          ? settings.return_policy
          : null;

  const policyFallbackHtml =
    slug === "privacy-policy"
      ? livePrivacyPolicyHtml
      : slug === "terms-conditions"
        ? liveTermsHtml
        : slug === "refund-policy"
          ? liveRefundPolicyHtml
          : null;

  const policyHtml =
    configuredPolicyHtml && configuredPolicyHtml.replace(/<[^>]+>/g, "").trim().length > 500
      ? configuredPolicyHtml
      : policyFallbackHtml;

  return (
    <main className="page-shell">
      <section className="content-section white-section">
        <div className="container" style={{ maxWidth: "960px" }}>
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 className="page-title" style={{ maxWidth: "14ch" }}>{content.title}</h1>
          {policyHtml ? (
            <div
              style={{ display: "grid", gap: "1rem", maxWidth: "52rem", color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: policyHtml }}
            />
          ) : (
            <div style={{ display: "grid", gap: "1rem", maxWidth: "52rem", color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.8 }}>
              {content.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}

          {slug === "contact" ? (
            <div style={{ display: "grid", gap: "0.8rem", marginTop: "2rem", padding: "1.4rem 1.5rem", border: "1px solid var(--line)", borderRadius: "28px", background: "rgba(255,255,255,0.74)", maxWidth: "34rem" }}>
              <p><strong>Trade name:</strong> {settings.site_name || liveContactDefaults.tradeName}</p>
              <p><strong>Email:</strong> {settings.site_email || liveContactDefaults.email}</p>
              <p><strong>Phone:</strong> {settings.site_phone || liveContactDefaults.phone}</p>
              <p><strong>Address:</strong> {settings.address_line1 || liveContactDefaults.addressLine1}, {settings.city || liveContactDefaults.city} {settings.pincode || liveContactDefaults.pincode}, {settings.country || liveContactDefaults.country}</p>
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
