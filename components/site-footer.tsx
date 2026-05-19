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
            <span>Facebook</span>
            <span>Instagram</span>
            <span>YouTube</span>
            <span>Pinterest</span>
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
