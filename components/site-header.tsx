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
        <div className="header-utility">
          <div className="container header-utility-shell">
            <span>Free shipping on Indian orders</span>
            <span>9910212007</span>
            <span>Track your order</span>
          </div>
        </div>

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
            <Link href="/shop" className="nav-highlight">
              Shop All
            </Link>
          </nav>

          <div className="header-tools" aria-label="Store tools">
            <Link href="/shop">Search</Link>
            <span>Wishlist</span>
            <span>Account</span>
            <span>Cart</span>
          </div>
        </div>
      </header>
    </>
  );
}
