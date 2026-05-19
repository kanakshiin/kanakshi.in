type SiteFooterProps = {
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  settings: {
    site_email?: string;
    site_phone?: string;
  };
};

export function SiteFooter({ categories, settings }: SiteFooterProps) {
  const footerCategories = categories.slice(0, 8);

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
          <h3>Little Divinity</h3>
          <p className="footer-copy">
            Crafted for homes that want warmth, symbolism, and gifting pieces that feel memorable.
          </p>
          <p>Address: E-3, Ground Floor Sector -3, Noida 201301</p>
          <p>Phone: {settings.site_phone || "+91 9910212007"}</p>
          <p>E-mail: {settings.site_email || "hello@littledivinity.com"}</p>
        </div>

        <div className="footer-column">
          <h3>Information</h3>
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
          <a href="#">Track Your Order</a>
        </div>

        <div className="footer-column">
          <h3>Categories</h3>
          {footerCategories.map((category) => (
            <a key={category.id} href={`/shop?category=${category.slug}`}>
              {category.name}
            </a>
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
            <a href="#" aria-label="Facebook" className="footer-social-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.3-.1-2.4-.1c-2.4 0-4 1.4-4 4.1V11H8v3h2.4v8h3.1Z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="footer-social-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Zm5 2.5A4.5 4.5 0 1 1 7.5 12A4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12A2.5 2.5 0 0 0 12 9.5Zm5.25-3.1a1.1 1.1 0 1 1-1.1 1.1a1.1 1.1 0 0 1 1.1-1.1Z" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube" className="footer-social-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21.6 7.2a2.96 2.96 0 0 0-2.1-2.1C17.8 4.6 12 4.6 12 4.6s-5.8 0-7.5.5a2.96 2.96 0 0 0-2.1 2.1C2 9 2 12 2 12s0 3 .4 4.8a2.96 2.96 0 0 0 2.1 2.1c1.7.5 7.5.5 7.5.5s5.8 0 7.5-.5a2.96 2.96 0 0 0 2.1-2.1C22 15 22 12 22 12s0-3-.4-4.8ZM10 15.5v-7l6 3.5l-6 3.5Z" />
              </svg>
            </a>
            <a href="#" aria-label="Pinterest" className="footer-social-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.1 3a8.9 8.9 0 0 0-3.2 17.2c0-.7 0-1.8.2-2.6l1.4-5.8s-.4-.8-.4-1.9c0-1.8 1-3.2 2.3-3.2c1.1 0 1.6.8 1.6 1.8c0 1.1-.7 2.8-1 4.3c-.3 1.2.6 2.1 1.7 2.1c2 0 3.5-2.1 3.5-5.1c0-2.7-1.9-4.5-4.7-4.5c-3.2 0-5.1 2.4-5.1 4.9c0 1 .4 2 .9 2.6c.1.1.1.2.1.4l-.3 1.2c0 .2-.2.3-.4.2c-1.4-.6-2.2-2.3-2.2-4.7c0-3.8 2.8-7.3 8-7.3c4.2 0 7.5 3 7.5 7c0 4.2-2.6 7.6-6.3 7.6c-1.2 0-2.4-.6-2.8-1.4l-.8 3c-.3 1-.9 2.2-1.3 3a8.8 8.8 0 0 0 3.7.8A8.9 8.9 0 0 0 12.1 3Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© Little Divinity 2026. All Rights Reserved</span>
        <span>MasterCard · Visa · RuPay · Paytm · PayPal</span>
      </div>
    </footer>
  );
}
