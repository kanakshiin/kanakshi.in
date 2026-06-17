"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FooterNewsletterForm } from "./footer-newsletter-form";
import { liveContactDefaults } from "../lib/legal-content";

type SiteFooterProps = {
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  settings: {
    site_email?: string;
    site_phone?: string;
    support_email?: string | null;
    support_phone?: string | null;
    whatsapp_number?: string | null;
    address_line1?: string;
    city?: string;
    pincode?: string;
    site_name?: string;
    site_tagline?: string;
    business_name?: string | null;
    footer_copyright_text?: string | null;
    registry_allow_buyback?: boolean;
    payment_gateways?: Array<{
      provider: string;
      display_name: string;
      is_test_mode?: boolean;
    }>;
  };
  footerMenu: Array<{ id: number; title: string; url: string; target?: string; css_class?: string | null }>;
  socialLinks: Array<{ id: number; platform: string; title?: string | null; handle?: string | null; url?: string | null }>;
};

export function SiteFooter({ categories, settings, footerMenu, socialLinks }: SiteFooterProps) {
  const pathname = usePathname();
  const isRegistryRoute =
    pathname === "/warranty-portal" ||
    pathname === "/warranty-status" ||
    pathname === "/service-claim" ||
    pathname === "/buyback-request";
  const footerCategories = categories.slice(0, 8);
  
  const paymentMethods = [
    {
      key: "cod",
      label: "Cash on Delivery",
      logo: (
        <svg viewBox="0 0 44 28" aria-hidden="true">
          <rect x="4" y="5" width="36" height="18" rx="4" fill="#191919" fillOpacity="0.08" stroke="#191919" strokeOpacity="0.18" />
          <text x="22" y="17" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#191919" fontFamily="Arial, sans-serif">
            CASH
          </text>
        </svg>
      )
    },
    {
      key: "razorpay",
      label: "Razorpay",
      logo: (
        <svg viewBox="0 0 44 28" aria-hidden="true">
          <path d="M12 20 19.8 8h7.2L19.2 20H12Z" fill="#2b6df8" />
          <path d="M21.2 20 29 8h3L24.2 20h-3Z" fill="#1d4ed8" />
        </svg>
      )
    },
    {
      key: "phonepe",
      label: "PhonePe",
      logo: (
        <svg viewBox="0 0 44 28" aria-hidden="true">
          <circle cx="22" cy="14" r="9" fill="#5f259f" />
          <text x="22" y="17.4" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">
            पे
          </text>
        </svg>
      )
    },
    {
      key: "mastercard",
      label: "Mastercard",
      logo: (
        <svg viewBox="0 0 44 28" aria-hidden="true">
          <circle cx="18" cy="14" r="8.5" fill="#eb001b" />
          <circle cx="26" cy="14" r="8.5" fill="#f79e1b" fillOpacity="0.92" />
          <path d="M22 7.2a8.5 8.5 0 0 1 0 13.6a8.5 8.5 0 0 1 0-13.6Z" fill="#ff5f00" />
        </svg>
      )
    },
    {
      key: "visa",
      label: "Visa",
      logo: (
        <svg viewBox="0 0 44 28" aria-hidden="true">
          <text x="22" y="18" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1434cb" fontFamily="Arial, sans-serif">
            VISA
          </text>
        </svg>
      )
    },
    {
      key: "rupay",
      label: "RuPay",
      logo: (
        <svg viewBox="0 0 44 28" aria-hidden="true">
          <path d="M10 20L18 8h15l-8 12H10Z" fill="#1f3f95" />
          <path d="M16 20l7-10h11l-7 10H16Z" fill="#33a457" fillOpacity="0.92" />
          <text x="22" y="17.5" textAnchor="middle" fontSize="7.3" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">
            RuPay
          </text>
        </svg>
      )
    },
    {
      key: "paytm",
      label: "Paytm",
      logo: (
        <svg viewBox="0 0 44 28" aria-hidden="true">
          <text x="19" y="18" textAnchor="middle" fontSize="10" fontWeight="800" fill="#00baf2" fontFamily="Arial, sans-serif">
            pay
          </text>
          <text x="30" y="18" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0f4a8a" fontFamily="Arial, sans-serif">
            tm
          </text>
        </svg>
      )
    }
  ];
  const activePaymentMethods = settings.payment_gateways?.length
    ? paymentMethods.filter((method) =>
        settings.payment_gateways?.some((gateway) => gateway.provider.toLowerCase() === method.key)
      )
    : paymentMethods.filter((method) => ["cod", "razorpay", "phonepe"].includes(method.key));
  const footerEmail = settings.support_email || settings.site_email || liveContactDefaults.email;
  const footerPhone = settings.support_phone || settings.site_phone || liveContactDefaults.phone;
  const whatsappNumber = settings.whatsapp_number?.replace(/\D/g, "") || "";
  const footerSummary =
    settings.site_tagline ||
    "Crafted for homes that want warmth, symbolism, and gifting pieces that feel memorable.";
  const registryBuybackEnabled = settings.registry_allow_buyback !== false;


  const socialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.3-.1-2.4-.1c-2.4 0-4 1.4-4 4.1V11H8v3h2.4v8h3.1Z" />;
      case "instagram":
        return <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Zm5 2.5A4.5 4.5 0 1 1 7.5 12A4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12A2.5 2.5 0 0 0 12 9.5Zm5.25-3.1a1.1 1.1 0 1 1-1.1 1.1a1.1 1.1 0 0 1 1.1-1.1Z" />;
      case "youtube":
        return <path d="M21.6 7.2a2.96 2.96 0 0 0-2.1-2.1C17.8 4.6 12 4.6 12 4.6s-5.8 0-7.5.5a2.96 2.96 0 0 0-2.1 2.1C2 9 2 12 2 12s0 3 .4 4.8a2.96 2.96 0 0 0 2.1 2.1c1.7.5 7.5.5 7.5.5s5.8 0 7.5-.5a2.96 2.96 0 0 0 2.1-2.1C22 15 22 12 22 12s0-3-.4-4.8ZM10 15.5v-7l6 3.5l-6 3.5Z" />;
      case "linkedin":
        return <path d="M6.2 8.8H3.2V21h3V8.8ZM4.7 3A1.8 1.8 0 1 0 4.8 6.6A1.8 1.8 0 0 0 4.7 3Zm16.1 10.4c0-3.6-1.9-5.2-4.5-5.2c-2.1 0-3 .9-3.5 1.6V8.8H9.9c0 .8 0 12.2 0 12.2h3V14.2c0-.4 0-.8.2-1.1c.3-.8 1-1.6 2.2-1.6c1.5 0 2.1 1.1 2.1 2.8V21h3v-7.6Z" />;
      default:
        return <circle cx="12" cy="12" r="8" />;
    }
  };

  if (isRegistryRoute) {
    return (
      <footer className="site-footer registry-footer">
        <div className="container registry-footer-shell">
          <div>
            <strong>{settings.site_name || "Kanakshi.in"}</strong>
            <p>
              Official ownership registry, warranty service,
              {registryBuybackEnabled ? " and buyback verification " : " and product verification "}
              for handcrafted brass pieces.
            </p>
          </div>
          <Link href="/shop" className="registry-footer-link">
            Return to Storefront
          </Link>
        </div>
        <div className="container footer-bottom">
          <span>{settings.footer_copyright_text || "© 2026 Tadpole Story LLP. All rights reserved"}</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <section className="footer-usp-band">
        <div className="container footer-usp-grid">
          <div className="footer-usp-item">
            <strong>Pan India Shipping</strong>
            <span>carefully packed and dispatched</span>
          </div>
          <div className="footer-usp-item">
            <strong>Talk To Us</strong>
            <span>{footerPhone}</span>
          </div>
          <div className="footer-usp-item">
            <strong>Festive Gifting Ready</strong>
            <span>ideal for weddings and celebrations</span>
          </div>
          <div className="footer-usp-item">
            <strong>Secure Payments</strong>
            <span>trusted checkout experience</span>
          </div>
        </div>
      </section>

      <div className="container footer-shell">
        <div className="footer-column footer-contact">
          <h3>{settings.business_name || settings.site_name || "Kanakshi.in"}</h3>
          <p className="footer-copy">
            {footerSummary}
          </p>
          {settings.address_line1 || liveContactDefaults.addressLine1 ? (
            <p>
              Address:{" "}
              <Link href="/pages/contact">
                {settings.address_line1 || liveContactDefaults.addressLine1}
                {settings.city || liveContactDefaults.city ? `, ${settings.city || liveContactDefaults.city}` : ""}
                {settings.pincode || liveContactDefaults.pincode ? ` ${settings.pincode || liveContactDefaults.pincode}` : ""}
              </Link>
            </p>
          ) : null}
          {footerPhone ? (
            <p>
              Phone: <a href={`tel:${footerPhone.replace(/\s+/g, "")}`}>{footerPhone}</a>
            </p>
          ) : null}
          <p>
            E-mail: <a href={`mailto:${footerEmail}`}>{footerEmail}</a>
          </p>
          {whatsappNumber ? (
            <p>
              WhatsApp: <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">+{whatsappNumber}</a>
            </p>
          ) : null}
        </div>

        <div className="footer-column">
          <h3>Information</h3>
          {footerMenu.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              target={item.target || undefined}
              rel={item.target === "_blank" ? "noreferrer" : undefined}
              className={item.css_class || undefined}
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="footer-column">
          <h3>Categories</h3>
          {footerCategories.map((category) => (
            <Link key={category.id} href={`/shop?category=${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </div>

        <div className="footer-column footer-newsletter">
          <h3>Join The List</h3>
          <p>Get new arrivals, festive edits, and gifting ideas in your inbox.</p>
          <FooterNewsletterForm email={settings.site_email || liveContactDefaults.email} />
          <div className="footer-socials">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.url || "/pages/contact"}
                aria-label={social.title || social.handle || social.platform}
                title={social.title || social.handle || social.platform}
                className="footer-social-icon"
                target={social.url ? "_blank" : undefined}
                rel={social.url ? "noreferrer" : undefined}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {socialIcon(social.platform)}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>{settings.footer_copyright_text || "© 2026 Tadpole Story LLP. All rights reserved"}</span>
        <div className="footer-payment-strip" aria-label="Accepted payment methods">
          {activePaymentMethods.map((method) => (
            <span key={method.key} className="footer-payment-badge" title={method.label} aria-label={method.label}>
              {method.logo}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
