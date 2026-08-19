import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSettings } from "../../../lib/api";
import { livePrivacyPolicyHtml, liveRefundPolicyHtml, liveShippingPolicyHtml, liveTermsHtml } from "../../../lib/legal-content";
import { getCanonicalUrl, getSiteName } from "../../../lib/site";
import { ContactUsView } from "../../../components/contact-us-view";
import { KanakshiTrustBadges } from "../../../components/kanakshi-trust-badges";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const pageContent = {
  "about-us": {
    eyebrow: "About Us",
    title: "Handcrafted everyday fine jewellery for the modern soul.",
    body: [
      "Kanakshi Fine Jewellery creates authentic, certified, everyday fine jewellery in 100% BIS Hallmarked 925 Sterling Silver, 18K Real Gold, and Ethical Lab-Grown Diamonds.",
      "Our mission is to make fine jewellery accessible, wearable, and everlasting. Every piece comes with an anti-tarnish rhodium coating, 7-day hassle-free home trial returns, and a certificate of authenticity."
    ]
  },
  contact: {
    eyebrow: "Contact Us",
    title: "We're here to assist your jewellery journey.",
    body: [
      "Have a question about ring sizing, custom gifting hampers, order tracking, or 7-day returns & exchanges? Reach out to our dedicated jewellery care team."
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
  "shipping-policy": {
    eyebrow: "Shipping Policy",
    title: "Domestic and international shipping details.",
    body: []
  },
} as const;

const policyDescriptions = {
  "privacy-policy": "Read how Kanakshi Fine Jewellery collects, uses, and protects your personal information.",
  "terms-conditions": "Read the store use, ordering, billing, and service terms for Kanakshi Fine Jewellery.",
  "refund-policy": "Read the return, exchange, and refund process for Kanakshi Fine Jewellery orders.",
  "shipping-policy": "Read the domestic and international shipping timelines, tracking, and delivery information for Kanakshi Fine Jewellery orders.",
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
    title: `${content.eyebrow} | ${getSiteName(settings)}`,
    description: policyDescriptions[slug as keyof typeof policyDescriptions] || content.body[0] || "Learn more about Kanakshi Fine Jewellery.",
    alternates: {
      canonical: `/pages/${slug}`
    },
    openGraph: {
      title: `${content.eyebrow} | ${getSiteName(settings)}`,
      description: policyDescriptions[slug as keyof typeof policyDescriptions] || content.body[0] || "Learn more about Kanakshi Fine Jewellery.",
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

  // Dedicated Rich Contact Us Experience
  if (slug === "contact") {
    return <ContactUsView settings={settings} />;
  }

  const configuredPolicyHtml =
    slug === "privacy-policy"
      ? settings.privacy_policy
      : slug === "terms-conditions"
        ? settings.terms_conditions
        : slug === "refund-policy"
          ? settings.return_policy
          : slug === "shipping-policy"
            ? liveShippingPolicyHtml
          : null;

  const policyFallbackHtml =
    slug === "privacy-policy"
      ? livePrivacyPolicyHtml
      : slug === "terms-conditions"
      ? liveTermsHtml
      : slug === "refund-policy"
        ? liveRefundPolicyHtml
        : slug === "shipping-policy"
          ? liveShippingPolicyHtml
        : null;

  const policyHtml =
    configuredPolicyHtml && configuredPolicyHtml.replace(/<[^>]+>/g, "").trim().length > 500
      ? configuredPolicyHtml
      : policyFallbackHtml;

  return (
    <div className="kanakshi-container" style={{ paddingTop: "24px", paddingBottom: "72px" }}>
      {/* Breadcrumbs */}
      <nav style={{ display: "flex", gap: "8px", fontSize: "0.82rem", color: "var(--kanakshi-text-muted)", marginBottom: "20px" }}>
        <Link href="/" style={{ color: "var(--kanakshi-text-muted)" }}>Home</Link>
        <span>/</span>
        <span style={{ color: "var(--kanakshi-pink)", fontWeight: "600" }}>{content.eyebrow}</span>
      </nav>

      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #fff0f3 0%, #fff9fa 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "36px 32px",
          marginBottom: "36px",
          border: "1px solid rgba(233, 113, 139, 0.15)",
        }}
      >
        <span className="kanakshi-badge kanakshi-badge-pink" style={{ marginBottom: "12px", display: "inline-block" }}>
          Kanakshi Fine Jewellery
        </span>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", fontWeight: "600", color: "var(--kanakshi-black)", lineHeight: "1.2", marginBottom: "10px" }}>
          {content.title}
        </h1>
      </div>

      {/* Content Body */}
      <div
        style={{
          background: "#ffffff",
          padding: "36px 32px",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--kanakshi-border)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "48px",
        }}
      >
        {policyHtml ? (
          <div
            style={{ display: "grid", gap: "1.2rem", color: "var(--kanakshi-text-body)", fontSize: "0.95rem", lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: policyHtml }}
          />
        ) : (
          <div style={{ display: "grid", gap: "1.2rem", color: "var(--kanakshi-text-body)", fontSize: "0.95rem", lineHeight: 1.8 }}>
            {content.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}

        <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--kanakshi-border)" }}>
          <Link href="/shop" className="kanakshi-btn kanakshi-btn-primary" style={{ display: "inline-block", textDecoration: "none", padding: "10px 24px" }}>
            Explore Fine Jewellery Collection →
          </Link>
        </div>
      </div>

      {/* Trust Badges */}
      <KanakshiTrustBadges />
    </div>
  );
}
