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
            <strong>Free Delivery</strong>
            <span>on Indian Orders</span>
          </div>
          <div className="footer-usp-item">
            <strong>Reach Us At</strong>
            <span>{settings.site_phone || "+91 9910212007"}</span>
          </div>
          <div className="footer-usp-item">
            <strong>COD Available</strong>
            <span>Across major pin codes</span>
          </div>
          <div className="footer-usp-item">
            <strong>Payment 100% Secure</strong>
            <span>Trusted checkout experience</span>
          </div>
        </div>
      </section>

      <div className="container footer-shell">
        <div className="footer-column footer-contact">
          <h3>Customer Service</h3>
          <p>Address: E-3, Ground Floor Sector -3, Noida 201301</p>
          <p>Phone: {settings.site_phone || "+91 9910212007"}</p>
          <p>E-mail: {settings.site_email || "hello@theadvitya.com"}</p>
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
          <h3>Newsletter Signup</h3>
          <p>Subscribe to our newsletter and get 10 off on your first order.</p>
          <form className="footer-newsletter-form">
            <input type="email" placeholder="Enter your e-mail" />
            <button type="button">Get!</button>
          </form>
          <div className="footer-socials">
            <span>Facebook</span>
            <span>Instagram</span>
            <span>YouTube</span>
            <span>LinkedIn</span>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© The Advitya 2023. All Rights Reserved</span>
        <span>MasterCard · Visa · RuPay · Paytm · PayPal</span>
      </div>
    </footer>
  );
}
