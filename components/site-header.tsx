"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { resolveAssetUrl } from "../lib/api";
import { NavigationItem, SiteSettings } from "../lib/types";
import { useCart } from "./cart-provider";
import { useWishlist } from "./wishlist-provider";

type SiteHeaderProps = {
  brandName: string;
  logoUrl?: string | null;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  menuItems: NavigationItem[];
  mobileMenuItems?: NavigationItem[];
  settings: SiteSettings;
};

type NavDisplayItem = {
  id: number;
  name: string;
  slug: string;
  href: string;
  submenu: Array<{
    id: number;
    name: string;
    href: string;
  }>;
};

export function SiteHeader({ brandName, logoUrl, categories, menuItems, mobileMenuItems = [], settings }: SiteHeaderProps) {
  const [offerVisible, setOfferVisible] = useState(true);
  const [offerIndex, setOfferIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSectionId, setOpenMobileSectionId] = useState<number | null>(null);
  const pathname = usePathname();
  const isRegistryRoute =
    pathname === "/warranty-portal" ||
    pathname === "/warranty-status" ||
    pathname === "/service-claim" ||
    pathname === "/buyback-request";
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [cartPop, setCartPop] = useState(false);
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setOpenMobileSectionId(null);
  };

  useEffect(() => {
    if (count > 0) {
      setCartPop(true);
      const timer = setTimeout(() => setCartPop(false), 450);
      return () => clearTimeout(timer);
    }
  }, [count]);
  const offers = useMemo(() => {
    const list = settings.topbar_offers?.filter((offer) => typeof offer === "string" && offer.trim().length > 0) ?? [];
    return list.length ? list : ["Avail 10% Off, Use Code - LITTLEDIVINITY10 + Get Extra 5% on Prepaid Orders"];
  }, [settings.topbar_offers]);
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));
  const menuSeed: NavDisplayItem[] = menuItems.length
    ? menuItems.map((item, index) => ({
        id: item.id || index,
        name: item.title,
        slug: item.url?.includes("?category=") ? item.url.split("?category=")[1] || "" : item.url?.replace(/^\/+/, "") || "",
        href: typeof item.url === "string" ? item.url : "/shop",
        submenu:
          item.children?.map((child, childIndex) => ({
            id: child.id || Number(`${item.id}${childIndex + 1}`),
            name: child.title,
            href: typeof child.url === "string" && child.url.length > 0 ? child.url : (typeof item.url === "string" ? item.url : "/shop")
          })) || []
      }))
    : categories.slice(0, 6).map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        href: `/shop?category=${category.slug}`,
        submenu: []
      }));
  const fullNavItems: NavDisplayItem[] = menuSeed.map((item) => {
    const matchedCategory = categoryMap.get(item.slug);
    return {
      ...item,
      submenu: item.submenu || [],
      slug: matchedCategory?.slug || item.slug,
      href: item.href || `/shop?category=${matchedCategory?.slug || item.slug}`
    };
  });
  const mobileSeed = (mobileMenuItems.length ? mobileMenuItems : menuItems).map((item, index) => ({
    id: item.id || index,
    name: item.title,
    slug: item.url?.includes("?category=") ? item.url.split("?category=")[1] || "" : item.url?.replace(/^\/+/, "") || "",
    href: typeof item.url === "string" ? item.url : "/shop",
    submenu:
      item.children?.map((child, childIndex) => ({
        id: child.id || Number(`${item.id}${childIndex + 1}`),
        name: child.title,
        href: typeof child.url === "string" && child.url.length > 0 ? child.url : (typeof item.url === "string" ? item.url : "/shop")
      })) || []
  }));
  const mobileNavItems: NavDisplayItem[] = mobileSeed.map((item) => {
    const matchedCategory = categoryMap.get(item.slug);
    return {
      ...item,
      submenu: item.submenu || [],
      slug: matchedCategory?.slug || item.slug,
      href: item.href || `/shop?category=${matchedCategory?.slug || item.slug}`
    };
  });

  useEffect(() => {
    if (offers.length <= 1 || !offerVisible) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setOfferIndex((current) => (current + 1) % offers.length);
    }, 3200);

    return () => window.clearInterval(intervalId);
  }, [offers, offerVisible]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenMobileSectionId(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (isRegistryRoute) {
    return (
      <header className="site-header registry-header">
        <div className="container registry-header-shell">
          <Link href="/" className="registry-brand-mark" aria-label={`${brandName} home`}>
            <Image
              src={logoUrl ? resolveAssetUrl(logoUrl) : "/logo.jpg"}
              alt={brandName}
              className="brand-logo"
              width={150}
              height={52}
              priority
              sizes="150px"
            />
          </Link>

          <nav className="registry-header-nav" aria-label="Registry navigation">
            <Link href="/warranty-portal?tab=register">Activate</Link>
            <Link href="/warranty-portal?tab=status">Status</Link>
            <Link href="/warranty-portal?tab=claim">Service Claim</Link>
            <Link href="/warranty-portal?tab=buyback">Buyback</Link>
          </nav>

          <div className="registry-header-actions">
            <Link href="/shop" className="registry-header-link">
              Return to Storefront
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {offerVisible && settings.show_topbar !== false ? (
        <div
          className="top-offer-bar"
          style={{
            background: settings.topbar_bg_color || "#0f0f0f",
            color: settings.topbar_text_color || "#ffffff"
          }}
        >
          <span key={`${offerIndex}-${offers[offerIndex]}`} className="top-offer-text">
            {offers[offerIndex]}
          </span>
          <button
            type="button"
            className="top-offer-close"
            aria-label="Dismiss notification"
            onClick={() => setOfferVisible(false)}
          >
            ×
          </button>
        </div>
      ) : null}

      <header className="site-header">
        <div className="container header-shell">
          <div className="brand-lockup">
            <Link href="/" className="brand-mark">
              <Image
                src={logoUrl ? resolveAssetUrl(logoUrl) : "/logo.jpg"}
                alt={brandName}
                className="brand-logo"
                width={170}
                height={58}
                priority
                sizes="170px"
              />
            </Link>
          </div>

          <nav className="header-nav">
            {fullNavItems.map((category) => {
              const hasSubmenu = category.submenu.length > 0;

              return (
                <div key={category.id} className={`nav-item-with-menu${hasSubmenu ? "" : " nav-item-plain"}`}>
                  <Link href={category.href} className={hasSubmenu ? "nav-link-with-icon" : "nav-link-plain"}>
                    <span>{category.name}</span>
                    {hasSubmenu ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-chevron">
                        <path d="M7 10.5 12 15l5-4.5" />
                      </svg>
                    ) : null}
                  </Link>

                  {hasSubmenu ? (
                    <div className="nav-submenu">
                      {category.submenu.map((item) => (
                        <Link
                          key={`${category.slug}-${item.id}`}
                          href={item.href}
                          className="nav-submenu-link"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="header-tools header-tools--desktop" aria-label="Store tools">
            <Link href="/shop" aria-label="Search" className="header-tool-icon header-tool-icon--desktop-only">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5" />
              </svg>
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="header-tool-icon header-tool-icon--desktop-only header-wishlist-link">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 20s-6.5-4.3-8.5-8.1C2 9.4 3 6.5 5.7 5.4c2-.8 4.2-.2 5.3 1.5c1.1-1.7 3.3-2.3 5.3-1.5C19 6.5 20 9.4 18.5 11.9C16.5 15.7 12 20 12 20Z" />
              </svg>
              {wishlistCount > 0 ? (
                <span className="header-cart-count header-wishlist-count">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
            <Link href="/account" aria-label="Account" className="header-tool-icon header-tool-icon--desktop-only">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8.5" r="3.2" />
                <path d="M5.5 18.5c1.6-2.6 4-3.9 6.5-3.9s4.9 1.3 6.5 3.9" />
              </svg>
            </Link>
            <Link href="/cart" aria-label="Cart" className="header-tool-icon header-tool-icon--desktop-only header-cart-link">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 8.5h10l-.7 10H7.7L7 8.5Z" />
                <path d="M9.5 8.5V7.3c0-1.4 1.1-2.6 2.5-2.6s2.5 1.2 2.5 2.6v1.2" />
              </svg>
              {count > 0 ? (
                <span className={`header-cart-count${cartPop ? " cart-pop-animate" : ""}`}>
                  {count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

      </header>

      <div className={`mobile-nav-layer${mobileMenuOpen ? " is-open" : ""}`} aria-hidden={!mobileMenuOpen}>
        <button
          type="button"
          className="mobile-nav-backdrop"
          aria-label="Close menu"
          onClick={closeMobileMenu}
        />

        <aside className={`mobile-nav-panel${mobileMenuOpen ? " is-open" : ""}`} aria-label="Mobile menu">
          <div className="mobile-nav-panel-head">
            <div className="mobile-nav-profile">
              <span className="mobile-nav-avatar" aria-hidden="true">
                {brandName.trim().charAt(0) || "L"}
              </span>
              <div className="mobile-nav-profile-copy">
                <strong>{brandName}</strong>
                <span>Shop, wishlist and account in one place</span>
              </div>
            </div>

            <button type="button" className="mobile-nav-close" aria-label="Close menu" onClick={closeMobileMenu}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="mobile-nav-quicklinks">
            <Link href="/account" className="mobile-nav-quicklink" onClick={closeMobileMenu}>
              Account
            </Link>
            <Link href="/wishlist" className="mobile-nav-quicklink" onClick={closeMobileMenu}>
              Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
            </Link>
            <Link href="/cart" className="mobile-nav-quicklink" onClick={closeMobileMenu}>
              Cart{count > 0 ? ` (${count})` : ""}
            </Link>
          </div>

          <div className="mobile-nav-inner">
            <div className="mobile-nav-list">
              {mobileNavItems.map((item) => {
                const hasSubmenu = item.submenu.length > 0;
                const isOpen = openMobileSectionId === item.id;

                return (
                  <div key={item.id} className="mobile-nav-entry">
                    <div className="mobile-nav-row">
                      <Link href={item.href} className="mobile-nav-link" onClick={closeMobileMenu}>
                        {item.name}
                      </Link>

                      {hasSubmenu ? (
                        <button
                          type="button"
                          className={`mobile-submenu-toggle${isOpen ? " is-open" : ""}`}
                          aria-label={`Toggle ${item.name} submenu`}
                          aria-expanded={isOpen}
                          onClick={() =>
                            setOpenMobileSectionId((current) => (current === item.id ? null : item.id))
                          }
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-chevron">
                            <path d="M7 10.5 12 15l5-4.5" />
                          </svg>
                        </button>
                      ) : null}
                    </div>

                    {hasSubmenu ? (
                      <div className={`mobile-nav-submenu${isOpen ? " is-open" : ""}`}>
                        {item.submenu.map((submenuItem) => (
                          <Link
                            key={`${item.slug}-${submenuItem.id}`}
                            href={submenuItem.href}
                            className="mobile-nav-submenu-link"
                            onClick={closeMobileMenu}
                          >
                            {submenuItem.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Mobile quick navigation">
        <Link href="/" className={`mobile-bottom-link${pathname === "/" ? " is-active" : ""}`} onClick={closeMobileMenu}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />
          </svg>
          <span>Home</span>
        </Link>
        <Link
          href="/shop"
          className={`mobile-bottom-link${pathname.startsWith("/shop") ? " is-active" : ""}`}
          onClick={closeMobileMenu}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4.5 7.5h15" />
            <path d="M6.5 7.5l1.2 10h8.6l1.2-10" />
            <path d="M9 11h6" />
          </svg>
          <span>Shop</span>
        </Link>
        <button
          type="button"
          className={`mobile-bottom-link mobile-bottom-link--menu${mobileMenuOpen ? " is-active" : ""}`}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((current) => !current)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 7h14" />
            <path d="M5 12h14" />
            <path d="M5 17h14" />
          </svg>
          <span>Menu</span>
        </button>
        <Link
          href="/wishlist"
          className={`mobile-bottom-link${pathname.startsWith("/wishlist") ? " is-active" : ""}`}
          onClick={closeMobileMenu}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20s-6.5-4.3-8.5-8.1C2 9.4 3 6.5 5.7 5.4c2-.8 4.2-.2 5.3 1.5c1.1-1.7 3.3-2.3 5.3-1.5C19 6.5 20 9.4 18.5 11.9C16.5 15.7 12 20 12 20Z" />
          </svg>
          <span>Wishlist</span>
          {wishlistCount > 0 ? <em>{wishlistCount}</em> : null}
        </Link>
        <Link
          href="/account"
          className={`mobile-bottom-link${pathname.startsWith("/account") ? " is-active" : ""}`}
          onClick={closeMobileMenu}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8.5" r="3.2" />
            <path d="M5.5 18.5c1.6-2.6 4-3.9 6.5-3.9s4.9 1.3 6.5 3.9" />
          </svg>
          <span>Account</span>
        </Link>
      </nav>
    </>
  );
}
