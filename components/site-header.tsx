import Link from "next/link";

type SiteHeaderProps = {
  brandName: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

export function SiteHeader({ brandName, categories }: SiteHeaderProps) {
  const navItems = categories.slice(0, 7);

  return (
    <>
      <div className="top-offer-bar">
        Handcrafted brass decor, gifting accents, and pooja essentials with all-India delivery
      </div>

      <header className="site-header">
        <div className="container header-shell">
          <div className="brand-lockup">
            <Link href="/" className="brand-mark">
              <img src="/logo.jpg" alt={brandName} className="brand-logo" />
            </Link>
          </div>

          <nav className="header-nav">
            {navItems.map((category) => (
              <Link key={category.id} href={`/shop?category=${category.slug}`}>
                {category.name}
              </Link>
            ))}
            <Link href="/shop" className="nav-highlight">
              Shop All
            </Link>
          </nav>

          <div className="header-tools" aria-label="Store tools">
            <Link href="/shop" aria-label="Search" className="header-tool-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13Zm0-2a8.5 8.5 0 1 1 5.33 15.12l4.52 4.53l-1.41 1.41l-4.53-4.52A8.5 8.5 0 0 1 10.5 2Z" />
              </svg>
            </Link>
            <span aria-label="Wishlist" className="header-tool-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 20.2 4.9 13.3a4.9 4.9 0 0 1 6.9-7l.2.2l.2-.2a4.9 4.9 0 0 1 6.9 7L12 20.2Zm0-2.8 5.7-5.5a2.9 2.9 0 1 0-4.1-4.1L12 9.4l-1.6-1.6a2.9 2.9 0 1 0-4.1 4.1L12 17.4Z" />
              </svg>
            </span>
            <span aria-label="Account" className="header-tool-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4 4 0 1 1 0-8a4 4 0 0 1 0 8Zm0 2c4.42 0 8 2.24 8 5v1H4v-1c0-2.76 3.58-5 8-5Zm0-2a2 2 0 1 0 0-4a2 2 0 0 0 0 4Zm0 4c-3.12 0-5.81 1.35-5.98 2H18c-.17-.65-2.86-2-6-2Z" />
              </svg>
            </span>
            <span aria-label="Cart" className="header-tool-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 6V5a5 5 0 0 1 10 0v1h3v14H4V6h3Zm2 0h6V5a3 3 0 0 0-6 0v1Zm9 2H6v10h12V8Z" />
              </svg>
            </span>
          </div>
        </div>
      </header>
    </>
  );
}
