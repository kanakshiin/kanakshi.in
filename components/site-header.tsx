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
  const navItems = categories.slice(0, 6);

  return (
    <>
      <div className="top-offer-bar">
        Handcrafted brass decor, gifting accents, and pooja essentials with all-India delivery
      </div>

      <header className="site-header">
        <div className="container header-shell">
          <div className="brand-lockup">
            <Link href="/" className="brand-mark">
              {brandName}
            </Link>
          </div>

          <nav className="header-nav">
            {navItems.map((category) => (
              <Link key={category.id} href={`/shop?category=${category.slug}`}>
                {category.name}
              </Link>
            ))}
            <Link href="/shop">Shop All</Link>
          </nav>

          <div className="header-tools" aria-label="Store tools">
            <Link href="/shop">Search</Link>
            <span>Wishlist</span>
            <span>Account</span>
          </div>
        </div>
      </header>
    </>
  );
}
