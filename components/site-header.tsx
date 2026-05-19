"use client";

import Link from "next/link";
import { useState } from "react";

type SiteHeaderProps = {
  brandName: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

export function SiteHeader({ brandName, categories }: SiteHeaderProps) {
  const [offerVisible, setOfferVisible] = useState(true);
  const fallbackMenu = [
    {
      id: 20001,
      name: "Hindu Deities",
      slug: "hindu-dieties",
      submenu: ["Ganesha Idols", "Krishna Idols", "Ram Darbar"]
    },
    {
      id: 20002,
      name: "Home Kitchen",
      slug: "home-kitchen",
      submenu: ["Spice Boxes", "Serving Trays", "Utility Decor"]
    },
    {
      id: 20003,
      name: "Home Decor",
      slug: "home-decor",
      submenu: ["Wall Decor", "Table Decor", "Candle Stands"]
    },
    {
      id: 20004,
      name: "Pooja Decor",
      slug: "pooja-decor",
      submenu: [
        "Brass Singhasan",
        "Incense Stand",
        "Brass Spoon",
        "Diya",
        "Brass Chowki",
        "Bells",
        "Pooja Thali",
        "Wooden Mandir Decor"
      ]
    },
    {
      id: 20005,
      name: "Mother's Day collection",
      slug: "mothers-day-collection",
      submenu: ["Gifting Picks", "Wall Decor", "Home Styling"]
    },
    {
      id: 20006,
      name: "More",
      slug: "more",
      submenu: ["New Arrivals", "Festival Categories", "All Collections"]
    }
  ];

  const categoryMap = new Map(categories.map((category) => [category.slug, category]));
  const fullNavItems = fallbackMenu.map((item) => {
    const matchedCategory = categoryMap.get(item.slug);

    return {
      ...item,
      slug: matchedCategory?.slug || item.slug
    };
  });

  return (
    <>
      {offerVisible ? (
        <div className="top-offer-bar">
          <span>Avail 10% Off, Use Code - ADVITYA10 + Get Extra 5% on Prepaid Orders</span>
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
              <img src="/logo.jpg" alt={brandName} className="brand-logo" />
            </Link>
          </div>

          <nav className="header-nav">
            {fullNavItems.map((category) => (
              <div key={category.id} className="nav-item-with-menu">
                <Link href={`/shop?category=${category.slug}`} className="nav-link-with-icon">
                  <span>{category.name}</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-chevron">
                    <path d="M7 10.5 12 15l5-4.5" />
                  </svg>
                </Link>

                <div className="nav-submenu">
                  {category.submenu.map((item) => (
                    <Link
                      key={`${category.slug}-${item}`}
                      href={`/shop?category=${category.slug}`}
                      className="nav-submenu-link"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="header-tools" aria-label="Store tools">
            <Link href="/shop" aria-label="Search" className="header-tool-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5" />
              </svg>
            </Link>
            <span aria-label="Wishlist" className="header-tool-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 20s-6.5-4.3-8.5-8.1C2 9.4 3 6.5 5.7 5.4c2-.8 4.2-.2 5.3 1.5c1.1-1.7 3.3-2.3 5.3-1.5C19 6.5 20 9.4 18.5 11.9C16.5 15.7 12 20 12 20Z" />
              </svg>
            </span>
            <span aria-label="Account" className="header-tool-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8.5" r="3.2" />
                <path d="M5.5 18.5c1.6-2.6 4-3.9 6.5-3.9s4.9 1.3 6.5 3.9" />
              </svg>
            </span>
            <span aria-label="Cart" className="header-tool-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 8.5h10l-.7 10H7.7L7 8.5Z" />
                <path d="M9.5 8.5V7.3c0-1.4 1.1-2.6 2.5-2.6s2.5 1.2 2.5 2.6v1.2" />
              </svg>
            </span>
          </div>
        </div>
      </header>
    </>
  );
}
