import Link from "next/link";

import { HeroSlider } from "../components/hero-slider";
import { ProductCard } from "../components/product-card";
import { formatPrice, getHomePageData, resolveAssetUrl } from "../lib/api";
import { referenceAssets } from "../lib/reference-assets";

export default async function HomePage() {
  const { settings, categories, featuredProducts, newestProducts } = await getHomePageData();
  const brandName = settings.site_name || "Little Divinity";
  const tagline =
    settings.site_tagline ||
    "Handcrafted brass decor, pooja accents, and meaningful gifting pieces with a category-first storefront.";
  const currencySymbol = settings.site_currency_symbol || "₹";
  const freeShipping = formatPrice(settings.min_order_free_shipping || "499", currencySymbol);
  const curatedCollections = [
    {
      title: "God Idols",
      subtitle: "Temple-inspired classics",
      image: referenceAssets.collections.godIdols,
      href: "/shop?category=god-idols"
    },
    {
      title: "Home Decor",
      subtitle: "Statement brass accents",
      image: referenceAssets.collections.homeDecor,
      href: "/shop?category=wall-decor"
    },
    {
      title: "Pooja Decor",
      subtitle: "Sacred corner essentials",
      image: referenceAssets.collections.poojaDecor,
      href: "/shop?category=pooja-decor"
    },
    {
      title: "Kitchen & Utility",
      subtitle: "Functional heirloom pieces",
      image: referenceAssets.collections.homeKitchen,
      href: "/shop?category=home-kitchen"
    }
  ];

  const festiveMoments = [
    { title: "Ganesh Chaturthi Edit", image: referenceAssets.occasions.ganeshChaturthi },
    { title: "Diwali Styling Picks", image: referenceAssets.occasions.diwali },
    { title: "Wedding Gifting", image: referenceAssets.founderAndBrand.weddingGift },
    { title: "Artisan Craft Story", image: referenceAssets.founderAndBrand.artisans }
  ];

  const heroPromos = [
    {
      title: "Wall Decor Collection",
      subtitle: "Designed for thoughtful spaces",
      image: referenceAssets.hero.wallDecor,
      href: "/shop?category=wall-decor"
    },
    {
      title: "Candle Stand Collection",
      subtitle: "Explore our latest classics",
      image: referenceAssets.hero.candleStand,
      href: "/shop?category=table-decor"
    },
    {
      title: "Stonework Collection",
      subtitle: "Timeless pieces for every space",
      image: referenceAssets.hero.stonework,
      href: "/shop?category=home-decor"
    }
  ];

  const heroSlides = [
    {
      alt: "Mother's Day gifting collection",
      eyebrow: "A Curated Edit",
      title: "Mother's Day Gifting Collection",
      subtitle: "Warm brass decor and meaningful gifting pieces",
      image: referenceAssets.hero.primary
    },
    {
      alt: "Brass English watch collection",
      eyebrow: "Best Seller",
      title: "Brass English Watch",
      subtitle: "A statement piece for every corner",
      image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_2/screen.png"
    },
    {
      alt: "Sacred incense decor",
      eyebrow: "Pooja Decor",
      title: "Ritual Essentials",
      subtitle: "Temple-style accents for daily devotion",
      image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_whatsapp_image_2026_02_20_at_2/screen.png"
    },
    {
      alt: "Buddha collection",
      eyebrow: "Spiritual Decor",
      title: "Buddha Collection",
      subtitle: "Calming statement idols with handcrafted detailing",
      image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_your_paragraph_text_2025_10_2/screen.png"
    },
    {
      alt: "Wooden collection",
      eyebrow: "Home Kitchen",
      title: "Wooden Collection",
      subtitle: "Texture-rich utility and gifting favourites",
      image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_whatsapp_image_2026_02_20_at_3/screen.png"
    }
  ];

  const circularCategories = [
    {
      title: "Ganesh Chaturthi",
      image: referenceAssets.occasions.ganeshChaturthi,
      href: "/shop?category=ganesh-chaturthi"
    },
    {
      title: "Janmashtami",
      image: referenceAssets.occasions.janmashtami,
      href: "/shop?category=janmashtami"
    },
    {
      title: "Navratri",
      image: referenceAssets.occasions.navratri,
      href: "/shop?category=navratri"
    },
    {
      title: "Diwali",
      image: referenceAssets.occasions.diwali,
      href: "/shop?category=diwali"
    },
    {
      title: "Dhanteras",
      image: referenceAssets.occasions.dhanteras,
      href: "/shop?category=dhanteras"
    }
  ];

  const twinPromos = [
    {
      title: "Serving Boxes & Trays",
      image: referenceAssets.founderAndBrand.weddingGift,
      href: "/shop?category=home-kitchen"
    },
    {
      title: "Wooden Collection",
      image: referenceAssets.founderAndBrand.woodenDecor,
      href: "/shop?category=wooden-collection"
    }
  ];

  const testimonials = [
    {
      title: "Excellent Quality",
      quote: "The finish, weight, and carving detail immediately made the piece feel premium and gift-worthy.",
      author: "Saikat Gaur"
    },
    {
      title: "Great Collection",
      quote: "A strong mix of god idols, decor, and gifting items that feels like a complete handcrafted store.",
      author: "Sunita"
    },
    {
      title: "Beautiful Design",
      quote: "The styling and product presentation made it easy to pick a statement piece for our living room.",
      author: "Rita Paria"
    }
  ];

  const instagramTiles = [
    referenceAssets.collections.homeDecor,
    referenceAssets.hero.stonework,
    referenceAssets.productHighlights.peacock,
    referenceAssets.productHighlights.buddha,
    referenceAssets.hero.candleStand,
    referenceAssets.collections.godIdols
  ];

  return (
    <main>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-visual">
            <HeroSlider slides={heroSlides} />
          </div>

          <div className="hero-promo-stack">
            {heroPromos.map((promo) => (
              <Link key={promo.title} href={promo.href} className="hero-promo-card">
                <img src={promo.image} alt={promo.title} />
                <div className="hero-promo-copy">
                  <small>{promo.subtitle}</small>
                  <strong>{promo.title}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section" id="collections">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Collections</p>
              <h2>Shop By Category</h2>
            </div>
            <Link href="/shop" className="text-link">
              View all
            </Link>
          </div>

          <div className="category-grid">
            {curatedCollections.map((collection) => (
              <Link key={collection.title} href={collection.href} className="category-card">
                <img src={collection.image} alt={collection.title} />
                <div>
                  <small>{collection.subtitle}</small>
                  <strong>{collection.title}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section circle-category-section">
        <div className="container">
          <div className="section-head section-head-center">
            <div>
              <p className="eyebrow">Shop By Occasion</p>
              <h2>Festival Categories</h2>
            </div>
          </div>

          <div className="circle-category-grid">
            {circularCategories.map((category) => (
              <Link key={category.title} href={category.href} className="circle-category-card">
                <span className="circle-category-image">
                  <img src={category.image} alt={category.title} />
                </span>
                <strong>{category.title}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section soft-section">
        <div className="container story-grid">
          {categories.slice(0, 3).map((category, index) => (
            <Link key={category.id} href={`/shop?category=${category.slug}`} className={`story-card story-card-${index}`}>
              <img
                src={
                  [
                    referenceAssets.collections.godIdols,
                    referenceAssets.founderAndBrand.woodenDecor,
                    referenceAssets.productHighlights.superfineShiva
                  ][index] || resolveAssetUrl(category.image || null)
                }
                alt={category.name}
              />
              <div className="story-overlay" />
              <div className="story-copy">
                <small>Editorial Pick</small>
                <h3>{category.name}</h3>
                <p>Styled with stronger storytelling, warmer overlays, and a more premium discovery rhythm.</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section" id="bestsellers">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Best Sellers</p>
              <h2>Most Loved Across The Storefront</h2>
            </div>
            <Link href="/shop" className="text-link">
              Shop all
            </Link>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} />
            ))}
          </div>
        </div>
      </section>

      <section className="content-section white-section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">About The Brand</p>
              <h2>A Home For Handcrafted Brass And Heritage Decor</h2>
            </div>
          </div>

          <div className="about-brand-grid">
            <div className="about-brand-image">
              <img src={referenceAssets.hero.primary} alt="About the brand" />
            </div>
            <div className="about-brand-copy">
              <p>
                The storefront is now moving closer to that handcrafted multi-section ecommerce rhythm: stronger hero
                merchandising, category-first discovery, festive edits, and product rails that feel denser and more
                gift-led.
              </p>
              <p>
                We are shaping it around brass idols, home decor, pooja accents, wooden pieces, and gifting so the
                homepage feels layered like a real handcrafted retail brand instead of a generic template.
              </p>
              <Link href="/shop" className="text-link">
                Read More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section artisan-section">
        <div className="container artisan-grid">
          <div className="artisan-copy">
            <p className="eyebrow">About The Founders</p>
            <h2>Built Around Craft, Story, And Storefront Warmth</h2>
            <p className="hero-text">
              This section now carries the founder-story feel from the reference direction, with image-led storytelling,
              softer editorial copy, and stronger handcrafted-brand positioning.
            </p>
            <Link href="/shop" className="primary-button">
              Read More
            </Link>
          </div>
          <div className="artisan-stack">
            <img src={referenceAssets.founderAndBrand.artisans} alt="Artisans" className="artisan-main" />
            <img src={referenceAssets.founderAndBrand.founder} alt="Founder" className="artisan-side" />
          </div>
        </div>
      </section>

      <section className="content-section white-section">
        <div className="container twin-promo-grid">
          {twinPromos.map((promo) => (
            <Link key={promo.title} href={promo.href} className="twin-promo-card">
              <img src={promo.image} alt={promo.title} />
              <div className="twin-promo-copy">
                <small>Curated Promotion</small>
                <strong>{promo.title}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">New Arrivals</p>
              <h2>Fresh Pieces Worth A First Look</h2>
            </div>
          </div>

          <div className="product-grid">
            {newestProducts.map((product) => (
              <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} />
            ))}
          </div>
        </div>
      </section>

      <section className="content-section white-section">
        <div className="container">
          <div className="section-head section-head-center">
            <div>
              <p className="eyebrow">Testimonials</p>
              <h2>Customers Love Our Products</h2>
            </div>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <article key={testimonial.author} className="testimonial-card">
                <span className="testimonial-stars">★★★★★</span>
                <h3>{testimonial.title}</h3>
                <p>{testimonial.quote}</p>
                <strong>{testimonial.author}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section instagram-section">
        <div className="container">
          <div className="section-head section-head-center">
            <div>
              <p className="eyebrow">@ Follow Us On</p>
              <h2>Instagram</h2>
            </div>
          </div>

          <div className="instagram-grid">
            {instagramTiles.map((tile, index) => (
              <a key={`${tile}-${index}`} href="#" className="instagram-tile">
                <img src={tile} alt={`Instagram tile ${index + 1}`} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section white-section stats-section">
        <div className="container">
          <div className="section-head section-head-center">
            <div>
              <p className="eyebrow">Such As</p>
              <h2>Storefront Highlights</h2>
            </div>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <strong>50000+</strong>
              <span>Orders Fulfilled</span>
            </article>
            <article className="stat-card">
              <strong>45000+</strong>
              <span>Happy Customers</span>
            </article>
            <article className="stat-card">
              <strong>30+</strong>
              <span>Years Experience</span>
            </article>
            <article className="stat-card">
              <strong>10000+</strong>
              <span>Products Available</span>
            </article>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Festive Edits</p>
              <h2>Occasions, Gifting, And Seasonal Stories</h2>
            </div>
          </div>

          <div className="occasion-grid">
            {festiveMoments.map((moment) => (
              <article key={moment.title} className="occasion-card">
                <img src={moment.image} alt={moment.title} />
                <div>
                  <small>Curated Edit</small>
                  <strong>{moment.title}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
