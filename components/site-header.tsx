import Link from "next/link";

type SiteHeaderProps = {
  brandName: string;
};

export function SiteHeader({ brandName }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="container header-shell">
        <Link href="/" className="brand-mark">
          {brandName}
        </Link>

        <nav className="header-nav">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <a href="#collections">Collections</a>
          <a href="#bestsellers">Bestsellers</a>
        </nav>
      </div>
    </header>
  );
}
