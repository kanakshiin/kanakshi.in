import Link from "next/link";

import { StructuredData } from "../components/structured-data";
import { HeroSlider } from "../components/hero-slider";
import { ProductCard } from "../components/product-card";
import { HomepageNewsletter } from "../components/homepage-newsletter";
import { getHomePageData, resolveAssetUrl } from "../lib/api";
import { referenceAssets } from "../lib/reference-assets";
import { getCanonicalUrl, getProductPath, getProductRenderKey, getSiteDescription, getSiteName } from "../lib/site";

export const revalidate = 60;

export default async function HomePage() {
  const { settings, categories, socialLinks, featuredProducts, newestProducts, homepageSections } = await getHomePageData();
  const currencySymbol = settings.site_currency_symbol || "₹";
  const siteName = getSiteName(settings);
  const instagramLink = socialLinks.find((link) => link.platform.toLowerCase() === "instagram");
  const instagramUrl = instagramLink?.url || "https://www.instagram.com/the_advitya/";
  const instagramLabel = instagramLink?.handle
    ? (instagramLink.handle.startsWith("@") ? instagramLink.handle : `@${instagramLink.handle}`)
    : "@littledivinity";
  const sectionMap = new Map(homepageSections.map((section) => [section.section_key, section]));
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
      show_text: true,
      image: referenceAssets.hero.wallDecor,
      href: "/shop?category=wall-decor"
    },
    {
      title: "Stonework Collection",
      subtitle: "Timeless pieces for every space",
      show_text: true,
      image: referenceAssets.hero.stonework,
      href: "/shop?category=home-decor"
    }
  ];

  const heroSlides = [
    {
      alt: "Mother's Day gifting collection",
      title: "Mother's Day Collection",
      image: referenceAssets.hero.primary
    },
    {
      alt: "Brass English watch collection",
      title: "Brass English Watch",
      image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_2/screen.png"
    },
    {
      alt: "Sacred incense decor",
      title: "Ritual Essentials",
      image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_whatsapp_image_2026_02_20_at_2/screen.png"
    },
    {
      alt: "Buddha collection",
      title: "Buddha Collection",
      image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_your_paragraph_text_2025_10_2/screen.png"
    },
    {
      alt: "Wooden collection",
      title: "Wooden Collection",
      image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_whatsapp_image_2026_02_20_at_3/screen.png"
    }
  ];

  const heroSection = sectionMap.get("hero");
  const bestSellerSection = sectionMap.get("best-sellers");
  const newArrivalsSection = sectionMap.get("new-arrivals");
  const newArrivalsProductsSection = sectionMap.get("new-arrivals-products");

  const heroConfig = (heroSection?.config as {
    slider_settings?: { show_text?: boolean; show_dots?: boolean; show_arrows?: boolean; autoplay_ms?: number; nav_gap?: number };
    slides?: Array<{ title?: string; image?: string; alt?: string; href?: string; is_active?: boolean }>;
    promos?: Array<{ title?: string; subtitle?: string; image?: string; href?: string; show_text?: boolean; is_active?: boolean }>;
  } | null) || { slides: [], promos: [] };

  const resolvedHeroSlides =
    heroConfig.slides?.filter((slide) => slide.image && slide.is_active !== false).map((slide, index) => ({
      alt: slide.alt || slide.title || `Hero slide ${index + 1}`,
      title: slide.title,
      href: slide.href,
      image: resolveAssetUrl(slide.image || "")
    })) || [];

  const resolvedHeroPromos =
    heroConfig.promos?.filter((promo) => promo.image && promo.is_active !== false).map((promo) => ({
      title: promo.title || "",
      subtitle: promo.subtitle || "",
      show_text: promo.show_text !== false,
      image: resolveAssetUrl(promo.image || ""),
      href: promo.href || "/shop"
    })) || [];

  const finalHeroSlides = resolvedHeroSlides.length
    ? resolvedHeroSlides
    : heroSlides.map((slide) => ({ ...slide, image: resolveAssetUrl(slide.image) }));
  const finalHeroPromos = resolvedHeroPromos.length
    ? resolvedHeroPromos
    : heroPromos.map((promo) => ({ ...promo, image: resolveAssetUrl(promo.image) }));

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

  const finalNewArrivalPromos = [
    {
      title: (newArrivalsSection?.config as { left_title?: string } | null)?.left_title || twinPromos[0].title,
      image: resolveAssetUrl(newArrivalsSection?.image_url || twinPromos[0].image),
      href: (newArrivalsSection?.config as { left_href?: string } | null)?.left_href || twinPromos[0].href
    },
    {
      title: (newArrivalsSection?.config as { right_title?: string } | null)?.right_title || twinPromos[1].title,
      image: resolveAssetUrl(newArrivalsSection?.side_image_url || twinPromos[1].image),
      href: (newArrivalsSection?.config as { right_href?: string } | null)?.right_href || twinPromos[1].href
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
  const homePageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: siteName,
    description: getSiteDescription(settings),
    url: getCanonicalUrl("/", settings),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: featuredProducts.slice(0, 8).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getCanonicalUrl(getProductPath(product), settings),
        name: product.name
      }))
    }
  };

  return (
    <main>
      <StructuredData data={homePageJsonLd} />
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-visual">
            <HeroSlider
              slides={finalHeroSlides}
              autoplayMs={heroConfig.slider_settings?.autoplay_ms || 3500}
              navGap={heroConfig.slider_settings?.nav_gap || 34}
              showArrows={false}
              showDots={heroConfig.slider_settings?.show_dots === true}
              showText={false}
            />
            <div className="hero-cta-overlay">
              <h1 className="hero-cta-headline">Sacred Craft. Pure Brass. Pan-India Delivery.</h1>
              <p className="hero-cta-sub">Handcrafted god idols, home decor &amp; festive gifting — trusted by 45,000+ customers across India.</p>
              <div className="hero-cta-actions">
                <Link href="/shop" className="primary-button">Shop the Collection →</Link>
                <Link href="/shop?category=gifting-edit" className="secondary-button">Explore Gifting Picks</Link>
              </div>
            </div>
          </div>

          <div className="hero-promo-stack">
            {finalHeroPromos.map((promo) => (
              <Link key={promo.title} href={promo.href} className="hero-promo-card">
                <img src={promo.image} alt={promo.title} />
                {promo.show_text !== false ? (
                  <div className="hero-promo-copy">
                    <small>{promo.subtitle}</small>
                    <strong>{promo.title}</strong>
                  </div>
                ) : null}
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
                <p>Discover our curated {category.name.toLowerCase()} collection — handcrafted with care for your home and sacred spaces.</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section" id="bestsellers">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">{bestSellerSection?.subtitle || "Best Sellers"}</p>
              <h2>{bestSellerSection?.title || "Most Loved Across The Storefront"}</h2>
            </div>
            <Link href={bestSellerSection?.button_url || "/shop"} className="text-link">
              {bestSellerSection?.button_text || "Shop all"}
            </Link>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={getProductRenderKey(product)} product={product} currencySymbol={currencySymbol} />
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
                Little Divinity is a home for handcrafted brass idols, home decor, pooja essentials, and meaningful
                gifting pieces. Every product is made by skilled Indian artisans using traditional techniques passed
                down through generations.
              </p>
              <p>
                Whether you&apos;re decorating a sacred corner, gifting a housewarming, or adding warmth to your living
                space — we curate only the finest pieces in solid brass, wood, and stone. Trusted by over 45,000
                happy customers across India.
              </p>
              <Link href="/shop" className="text-link">
                Explore Our Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section artisan-section">
        <div className="container artisan-grid">
          <div className="artisan-copy">
            <p className="eyebrow">About The Founders</p>
            <h2>Built Around Craft, Story, And Artisan Heritage</h2>
            <p className="hero-text">
              Every piece begins with a craftsperson&apos;s hands. We work directly with artisan families across
              Rajasthan and Uttar Pradesh — preserving ancient metalworking traditions while bringing their finest
              work to homes across India. Our 30+ years of craft expertise ensures every product meets the highest
              standards of quality and authenticity.
            </p>
            <Link href="/shop" className="primary-button">
              Shop Handcrafted Pieces
            </Link>
          </div>
          <div className="artisan-stack">
            <img src={referenceAssets.founderAndBrand.artisans} alt="Artisans" className="artisan-main" />
            <img src={referenceAssets.founderAndBrand.founder} alt="Founder" className="artisan-side" />
          </div>
        </div>
      </section>

      <section className="content-section white-section new-arrivals-showcase">
        <div className="container new-arrivals-showcase-shell">
          <div className="section-head new-arrivals-heading">
            <div>
              <p className="eyebrow">{newArrivalsSection?.subtitle || "New Arrivals"}</p>
              <h2>{newArrivalsSection?.title || "Fresh Pieces Worth A First Look"}</h2>
            </div>
          </div>

          <div className="twin-promo-grid new-arrivals-grid">
            {finalNewArrivalPromos.map((promo) => (
              <Link key={promo.title} href={promo.href} className="twin-promo-card">
                <img src={promo.image} alt={promo.title} />
                <div className="twin-promo-copy">
                  <small>Curated Promotion</small>
                  <strong>{promo.title}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section new-arrivals-products">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">{newArrivalsProductsSection?.subtitle || "New Arrivals"}</p>
              <h2>{newArrivalsProductsSection?.title || "Latest From The Craft Table"}</h2>
            </div>
            <Link href={newArrivalsProductsSection?.button_url || "/shop"} className="text-link">
              {newArrivalsProductsSection?.button_text || "Explore all"}
            </Link>
          </div>
          <div className="product-grid">
            {newestProducts.map((product) => (
              <ProductCard key={getProductRenderKey(product)} product={product} currencySymbol={currencySymbol} />
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

      {/* Premium Homepage Lead Opt-in Banner */}
      <HomepageNewsletter />

      <section className="content-section instagram-section">
        <div className="container">
          <div className="section-head section-head-center">
            <div>
              <p className="eyebrow">Follow Us On</p>
              <h2>Instagram</h2>
            </div>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-link">{instagramLabel}</a>
          </div>

          <div className="instagram-grid">
            {instagramTiles.map((tile, index) => (
              <a key={`${tile}-${index}`} href={instagramUrl} target="_blank" rel="noopener noreferrer" className="instagram-tile" aria-label={`View on Instagram — post ${index + 1}`}>
                <img src={tile} alt={["Brass god idol handcrafted","Home decor brass collection","Peacock brass wall art","Buddha statue brass","Candle stand brass","God idols collection"][index] || `Handcrafted product ${index + 1}`} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section white-section stats-section">
        <div className="container">
          <div className="section-head section-head-center">
            <div>
              <p className="eyebrow">Trusted By Thousands</p>
              <h2>Why Customers Choose Little Divinity</h2>
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
            <Link href="/shop" className="text-link">View All</Link>
          </div>

          <div className="occasion-grid">
            {festiveMoments.map((moment) => (
              <Link key={moment.title} href="/shop?category=gifting-edit" className="occasion-card">
                <img src={resolveAssetUrl(moment.image)} alt={moment.title} />
                <div>
                  <small>Curated Edit</small>
                  <strong>{moment.title}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
