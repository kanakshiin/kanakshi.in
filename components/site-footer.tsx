export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <div>
          <p className="footer-kicker">Frontend Repo</p>
          <h3>Next.js storefront ready for Vercel deployment.</h3>
        </div>
        <p className="footer-copy">
          Connect this frontend to the Laravel API with <code>NEXT_PUBLIC_API_BASE_URL</code> and
          <code> NEXT_PUBLIC_BACKEND_SITE_URL</code>.
        </p>
      </div>
    </footer>
  );
}
