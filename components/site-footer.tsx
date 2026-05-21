import Link from "next/link";

type SiteFooterProps = {
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  settings: {
    site_email?: string;
    site_phone?: string;
    address_line1?: string;
    city?: string;
    pincode?: string;
    site_name?: string;
    footer_copyright_text?: string | null;
  };
  footerMenu: Array<{ id: number; title: string; url: string }>;
  socialLinks: Array<{ id: number; platform: string; url?: string | null }>;
};

export function SiteFooter({ categories, settings, footerMenu, socialLinks }: SiteFooterProps) {
  const footerCategories = categories.slice(0, 8);

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
            <span>{settings.site_phone || "+91 9910212007"}</span>
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
          <h3>{settings.site_name || "Little Divinity"}</h3>
          <p className="footer-copy">
            Crafted for homes that want warmth, symbolism, and gifting pieces that feel memorable.
          </p>
          <p>Address: {settings.address_line1 || "E-3, Ground Floor Sector -3"}, {settings.city || "Noida"} {settings.pincode || "201301"}</p>
          <p>Phone: {settings.site_phone || "+91 9910212007"}</p>
          <p>E-mail: {settings.site_email || "hello@littledivinity.com"}</p>
        </div>

        <div className="footer-column">
          <h3>Information</h3>
          {footerMenu.map((item) => (
            <Link key={item.id} href={item.url}>
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
          <form className="footer-newsletter-form">
            <input type="email" placeholder="Enter your e-mail" />
            <button type="button">Join</button>
          </form>
          <div className="footer-socials">
            {socialLinks.map((social) => (
              <a key={social.id} href={social.url || "#"} aria-label={social.platform} className="footer-social-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {socialIcon(social.platform)}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>{settings.footer_copyright_text || "© Little Divinity 2026. All Rights Reserved"}</span>
        <span>MasterCard · Visa · RuPay · Paytm · PayPal</span>
      </div>
    </footer>
  );
}
