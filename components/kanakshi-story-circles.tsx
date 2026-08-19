import Link from "next/link";
import { Category } from "../lib/types";
import { referenceAssets } from "../lib/reference-assets";

type StoryCirclesProps = {
  categories?: Category[];
};

export function KanakshiStoryCircles({ categories = [] }: StoryCirclesProps) {
  const defaultItems = [
    { title: "Rings", slug: "rings", image: "/jewellery/solitaire-ring.jpg", href: "/shop/rings" },
    { title: "Earrings", slug: "earrings", image: "/jewellery/drop-earrings.jpg", href: "/shop/earrings" },
    { title: "Necklaces", slug: "necklaces", image: "/jewellery/heart-necklace.jpg", href: "/shop/necklaces" },
    { title: "Bracelets", slug: "bracelets", image: "/jewellery/tennis-bracelet.jpg", href: "/shop/bracelets" },
    { title: "Gold & Lab", slug: "gold-lab-diamonds", image: "/jewellery/gold-pendant.jpg", href: "/shop/gold-lab-diamonds" },
    { title: "925 Silver", slug: "silver-jewellery", image: "/jewellery/drop-earrings.jpg", href: "/shop/silver-jewellery" },
    { title: "Mangalsutra", slug: "mangalsutra", image: "/jewellery/heart-necklace.jpg", href: "/shop/mangalsutra" },
    { title: "Men's", slug: "mens-jewellery", image: "/jewellery/mens-cuban-chain.jpg", href: "/shop/mens-jewellery" },
    { title: "Gift Sets", slug: "gifting-edits", image: "/jewellery/couple-promise-rings.jpg", href: "/shop/gifting-edits" },
    { title: "Evil Eye", slug: "bracelets", image: "/jewellery/evil-eye-bracelet.jpg", href: "/shop/bracelets" }
  ];

  const items = categories.length > 0
    ? categories.map((cat) => ({
        title: cat.name,
        slug: cat.slug,
        image: cat.image || referenceAssets.categories.rings,
        href: `/shop/${encodeURIComponent(cat.slug)}`
      }))
    : defaultItems;

  return (
    <section className="kanakshi-stories-wrapper" aria-label="Top Categories">
      <div className="kanakshi-container">
        <div className="kanakshi-top-categories-header">
          <h2 className="kanakshi-top-categories-title">Top Categories</h2>
        </div>
      </div>

      {/* Infinite Loop Story Marquee (4 continuous tracks for 100% seamless zero-gap loop) */}
      <div className="kanakshi-stories-infinite-container">
        <div className="kanakshi-stories-infinite-track">
          {[1, 2, 3, 4].map((setNum) =>
            items.map((item, index) => (
              <Link
                key={`story-${setNum}-${item.slug || index}`}
                href={item.href}
                className="kanakshi-story-item"
                aria-hidden={setNum > 1 ? "true" : undefined}
              >
                <div className="kanakshi-story-avatar-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="kanakshi-story-img"
                    loading="lazy"
                  />
                </div>
                <span className="kanakshi-story-label">{item.title}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
