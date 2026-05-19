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
  const navItems = categories.slice(0, 5);

  return (
    <>
      <div className="top-offer-bar">
        Avail 10% Off, Use Code - ADVITYA10 + Get Extra 5% on Prepaid Orders
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
            <Link href="/shop">More</Link>
          </nav>

          <div className="header-tools" aria-label="Store tools">
            <span>Search</span>
            <span>Bag</span>
            <span>Account</span>
          </div>
        </div>
      </header>
    </>
  );
}
