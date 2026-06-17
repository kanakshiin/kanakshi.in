type HomepageLinkCard = {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  image: string;
  href: string;
};

type HomepageStat = {
  value: string;
  label: string;
};

type HomepageTestimonial = {
  title: string;
  quote: string;
  author: string;
  stars: string;
};

type HomepageInstagramTile = {
  image: string;
  alt: string;
};

export type FullHomepageContent = {
  collections: {
    is_active: boolean;
    eyebrow: string;
    title: string;
    button_text: string;
    button_url: string;
    items: HomepageLinkCard[];
  };
  occasions: {
    is_active: boolean;
    eyebrow: string;
    title: string;
    items: HomepageLinkCard[];
  };
  editorial_picks: {
    is_active: boolean;
    items: HomepageLinkCard[];
  };
  about_brand: {
    is_active: boolean;
    eyebrow: string;
    title: string;
    paragraph_one: string;
    paragraph_two: string;
    button_text: string;
    button_url: string;
    image: string;
  };
  founders: {
    is_active: boolean;
    eyebrow: string;
    title: string;
    content: string;
    button_text: string;
    button_url: string;
    main_image: string;
    side_image: string;
  };
  testimonials: {
    is_active: boolean;
    eyebrow: string;
    title: string;
    items: HomepageTestimonial[];
  };
  newsletter: {
    is_active: boolean;
    eyebrow: string;
    title: string;
    description: string;
    button_text: string;
    placeholder: string;
    footnote: string;
  };
  instagram: {
    is_active: boolean;
    eyebrow: string;
    title: string;
    profile_url: string;
    profile_label: string;
    tiles: HomepageInstagramTile[];
  };
  stats: {
    is_active: boolean;
    eyebrow: string;
    title: string;
    items: HomepageStat[];
  };
  festive_edits: {
    is_active: boolean;
    eyebrow: string;
    title: string;
    button_text: string;
    button_url: string;
    items: HomepageLinkCard[];
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const asString = (value: unknown, fallback = ""): string => typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
const asBool = (value: unknown, fallback: boolean): boolean => typeof value === "boolean" ? value : fallback;
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

export const defaultFullHomepageContent: FullHomepageContent = {
  collections: {
    is_active: true,
    eyebrow: "Collections",
    title: "Shop By Category",
    button_text: "View all",
    button_url: "/shop",
    items: [
      { title: "God Idols", subtitle: "Temple-inspired classics", image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_1_86f2e0a3_a3c3_4425_a004/screen.png", href: "/shop?category=god-idols" },
      { title: "Home Decor", subtitle: "Statement brass accents", image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_1_3758284a_c859_469d_be0a/screen.png", href: "/shop?category=wall-decor" },
      { title: "Pooja Decor", subtitle: "Sacred corner essentials", image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_1_0b0cbc19_17a3_496c_8345/screen.png", href: "/shop?category=pooja-decor" },
      { title: "Kitchen & Utility", subtitle: "Functional heirloom pieces", image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_1_600x.jpg_v_1683015923/screen.png", href: "/shop?category=home-kitchen" },
    ],
  },
  occasions: {
    is_active: true,
    eyebrow: "Shop By Occasion",
    title: "Festival Categories",
    items: [
      { title: "Ganesh Chaturthi", image: "/reference-assets/image_from_https_cdn.shopify.com_s_files_1_0709_7421_0333_files_ganesh/screen.png", href: "/shop?category=ganesh-chaturthi" },
      { title: "Janmashtami", image: "/reference-assets/image_from_https_cdn.shopify.com_s_files_1_0709_7421_0333_files_janmasthami.jpg/screen.png", href: "/shop?category=janmashtami" },
      { title: "Navratri", image: "/reference-assets/image_from_https_cdn.shopify.com_s_files_1_0709_7421_0333_files_navratri.png_v/screen.png", href: "/shop?category=navratri" },
      { title: "Diwali", image: "/reference-assets/image_from_https_cdn.shopify.com_s_files_1_0709_7421_0333_files_diwali.jpg_v/screen.png", href: "/shop?category=diwali" },
      { title: "Dhanteras", image: "/reference-assets/image_from_https_cdn.shopify.com_s_files_1_0709_7421_0333_files_dhanteras.png_v/screen.png", href: "/shop?category=dhanteras" },
    ],
  },
  editorial_picks: {
    is_active: true,
    items: [
      { badge: "Editorial Pick", title: "God Idols", description: "Discover our curated god idols collection — handcrafted with care for your home and sacred spaces.", image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_1_86f2e0a3_a3c3_4425_a004/screen.png", href: "/shop?category=god-idols" },
      { badge: "Editorial Pick", title: "Wall Decor", description: "Discover our curated wall decor collection — handcrafted with care for your home and sacred spaces.", image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_whatsapp_image_2026_04_15_at/screen.png", href: "/shop?category=wall-decor" },
      { badge: "Editorial Pick", title: "Table Decor", description: "Discover our curated table decor collection — handcrafted with care for your home and sacred spaces.", image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_brass_superfine_shiva_idol/screen.png", href: "/shop?category=table-decor" },
    ],
  },
  about_brand: {
    is_active: true,
    eyebrow: "About The Brand",
    title: "A Home For Handcrafted Brass And Heritage Decor",
    paragraph_one: "Kanakshi.in is a home for handcrafted brass idols, home decor, pooja essentials, and meaningful gifting pieces. Every product is made by skilled Indian artisans using traditional techniques passed down through generations.",
    paragraph_two: "Whether you're decorating a sacred corner, gifting a housewarming, or adding warmth to your living space — we curate only the finest pieces in solid brass, wood, and stone. Trusted by over 45,000 happy customers across India.",
    button_text: "Explore Our Collection",
    button_url: "/shop",
    image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_banner_4ab_copy_1_800x.jpg_v/screen.png",
  },
  founders: {
    is_active: true,
    eyebrow: "About The Founders",
    title: "Built Around Craft, Story, And Artisan Heritage",
    content: "Every piece begins with a craftsperson's hands. We work directly with artisan families across Rajasthan and Uttar Pradesh — preserving ancient metalworking traditions while bringing their finest work to homes across India. Our 30+ years of craft expertise ensures every product meets the highest standards of quality and authenticity.",
    button_text: "Shop Handcrafted Pieces",
    button_url: "/shop",
    main_image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_chatgpt_image_mar_5_2026_04_30/screen.png",
    side_image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_gemini_generated_image/screen.png",
  },
  testimonials: {
    is_active: true,
    eyebrow: "Testimonials",
    title: "Customers Love Our Products",
    items: [
      { title: "Excellent Quality", quote: "The finish, weight, and carving detail immediately made the piece feel premium and gift-worthy.", author: "Saikat Gaur", stars: "★★★★★" },
      { title: "Great Collection", quote: "A strong mix of god idols, decor, and gifting items that feels like a complete handcrafted store.", author: "Sunita", stars: "★★★★★" },
      { title: "Beautiful Design", quote: "The styling and product presentation made it easy to pick a statement piece for our living room.", author: "Rita Paria", stars: "★★★★★" },
    ],
  },
  newsletter: {
    is_active: true,
    eyebrow: "The Divinity Circle",
    title: "Unlock 10% Off Your First Order",
    description: "Subscribe to get early access to festive edits, curated gifting guides, care instructions, and exclusive subscriber-only collections.",
    button_text: "Claim Discount",
    placeholder: "Enter your email address",
    footnote: "Join 45,000+ happy homes. Free shipping above ₹999 nationwide.",
  },
  instagram: {
    is_active: true,
    eyebrow: "Follow Us On",
    title: "Instagram",
    profile_url: "https://kanakshi.in",
    profile_label: "kanakshi.in",
    tiles: [
      { image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_1_3758284a_c859_469d_be0a/screen.png", alt: "Brass god idol handcrafted" },
      { image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_untitled_design_2025_10_1/screen.png", alt: "Home decor brass collection" },
      { image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_51_e49ec306_c8b1_411b_937b/screen.png", alt: "Peacock brass wall art" },
      { image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_brass_buddha_statue_intricate/screen.png", alt: "Buddha statue brass" },
      { image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_13_86d4189e_e6d5_4292_8326/screen.png", alt: "Candle stand brass" },
      { image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_1_86f2e0a3_a3c3_4425_a004/screen.png", alt: "God idols collection" },
    ],
  },
  stats: {
    is_active: true,
    eyebrow: "Trusted By Thousands",
    title: "Why Customers Choose Kanakshi.in",
    items: [
      { value: "50000+", label: "Orders Fulfilled" },
      { value: "45000+", label: "Happy Customers" },
      { value: "30+", label: "Years Experience" },
      { value: "10000+", label: "Products Available" },
    ],
  },
  festive_edits: {
    is_active: true,
    eyebrow: "Festive Edits",
    title: "Occasions, Gifting, And Seasonal Stories",
    button_text: "View All",
    button_url: "/shop",
    items: [
      { badge: "Curated Edit", title: "Ganesh Chaturthi Edit", image: "/reference-assets/image_from_https_cdn.shopify.com_s_files_1_0709_7421_0333_files_ganesh/screen.png", href: "/shop?category=gifting-edit" },
      { badge: "Curated Edit", title: "Diwali Styling Picks", image: "/reference-assets/image_from_https_cdn.shopify.com_s_files_1_0709_7421_0333_files_diwali.jpg_v/screen.png", href: "/shop?category=gifting-edit" },
      { badge: "Curated Edit", title: "Wedding Gifting", image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_whatsapp_image_2026_02_20_at_5/screen.png", href: "/shop?category=gifting-edit" },
      { badge: "Curated Edit", title: "Artisan Craft Story", image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_chatgpt_image_mar_5_2026_04_30/screen.png", href: "/shop?category=gifting-edit" },
    ],
  },
};

export function resolveFullHomepageContent(rawConfig: Record<string, unknown> | null | undefined): FullHomepageContent {
  const raw = isRecord(rawConfig) ? rawConfig : {};
  const defaults = defaultFullHomepageContent;

  const mapLinkCards = (value: unknown, fallback: HomepageLinkCard[]): HomepageLinkCard[] =>
    fallback.map((base, index) => {
      const entry = asArray(value)[index];
      const item = isRecord(entry) ? entry : {};
      return {
        title: asString(item.title, base.title),
        subtitle: asString(item.subtitle, base.subtitle || ""),
        description: asString(item.description, base.description || ""),
        badge: asString(item.badge, base.badge || ""),
        image: asString(item.image, base.image),
        href: asString(item.href, base.href),
      };
    });

  const mapTestimonials = (value: unknown, fallback: HomepageTestimonial[]): HomepageTestimonial[] =>
    fallback.map((base, index) => {
      const entry = asArray(value)[index];
      const item = isRecord(entry) ? entry : {};
      return {
        title: asString(item.title, base.title),
        quote: asString(item.quote, base.quote),
        author: asString(item.author, base.author),
        stars: asString(item.stars, base.stars),
      };
    });

  const mapStats = (value: unknown, fallback: HomepageStat[]): HomepageStat[] =>
    fallback.map((base, index) => {
      const entry = asArray(value)[index];
      const item = isRecord(entry) ? entry : {};
      return {
        value: asString(item.value, base.value),
        label: asString(item.label, base.label),
      };
    });

  const mapInstagramTiles = (value: unknown, fallback: HomepageInstagramTile[]): HomepageInstagramTile[] =>
    fallback.map((base, index) => {
      const entry = asArray(value)[index];
      const item = isRecord(entry) ? entry : {};
      return {
        image: asString(item.image, base.image),
        alt: asString(item.alt, base.alt),
      };
    });

  const collections = isRecord(raw.collections) ? raw.collections : {};
  const occasions = isRecord(raw.occasions) ? raw.occasions : {};
  const editorialPicks = isRecord(raw.editorial_picks) ? raw.editorial_picks : {};
  const aboutBrand = isRecord(raw.about_brand) ? raw.about_brand : {};
  const founders = isRecord(raw.founders) ? raw.founders : {};
  const testimonials = isRecord(raw.testimonials) ? raw.testimonials : {};
  const newsletter = isRecord(raw.newsletter) ? raw.newsletter : {};
  const instagram = isRecord(raw.instagram) ? raw.instagram : {};
  const stats = isRecord(raw.stats) ? raw.stats : {};
  const festiveEdits = isRecord(raw.festive_edits) ? raw.festive_edits : {};

  return {
    collections: {
      is_active: asBool(collections.is_active, defaults.collections.is_active),
      eyebrow: asString(collections.eyebrow, defaults.collections.eyebrow),
      title: asString(collections.title, defaults.collections.title),
      button_text: asString(collections.button_text, defaults.collections.button_text),
      button_url: asString(collections.button_url, defaults.collections.button_url),
      items: mapLinkCards(collections.items, defaults.collections.items),
    },
    occasions: {
      is_active: asBool(occasions.is_active, defaults.occasions.is_active),
      eyebrow: asString(occasions.eyebrow, defaults.occasions.eyebrow),
      title: asString(occasions.title, defaults.occasions.title),
      items: mapLinkCards(occasions.items, defaults.occasions.items),
    },
    editorial_picks: {
      is_active: asBool(editorialPicks.is_active, defaults.editorial_picks.is_active),
      items: mapLinkCards(editorialPicks.items, defaults.editorial_picks.items),
    },
    about_brand: {
      is_active: asBool(aboutBrand.is_active, defaults.about_brand.is_active),
      eyebrow: asString(aboutBrand.eyebrow, defaults.about_brand.eyebrow),
      title: asString(aboutBrand.title, defaults.about_brand.title),
      paragraph_one: asString(aboutBrand.paragraph_one, defaults.about_brand.paragraph_one),
      paragraph_two: asString(aboutBrand.paragraph_two, defaults.about_brand.paragraph_two),
      button_text: asString(aboutBrand.button_text, defaults.about_brand.button_text),
      button_url: asString(aboutBrand.button_url, defaults.about_brand.button_url),
      image: asString(aboutBrand.image, defaults.about_brand.image),
    },
    founders: {
      is_active: asBool(founders.is_active, defaults.founders.is_active),
      eyebrow: asString(founders.eyebrow, defaults.founders.eyebrow),
      title: asString(founders.title, defaults.founders.title),
      content: asString(founders.content, defaults.founders.content),
      button_text: asString(founders.button_text, defaults.founders.button_text),
      button_url: asString(founders.button_url, defaults.founders.button_url),
      main_image: asString(founders.main_image, defaults.founders.main_image),
      side_image: asString(founders.side_image, defaults.founders.side_image),
    },
    testimonials: {
      is_active: asBool(testimonials.is_active, defaults.testimonials.is_active),
      eyebrow: asString(testimonials.eyebrow, defaults.testimonials.eyebrow),
      title: asString(testimonials.title, defaults.testimonials.title),
      items: mapTestimonials(testimonials.items, defaults.testimonials.items),
    },
    newsletter: {
      is_active: asBool(newsletter.is_active, defaults.newsletter.is_active),
      eyebrow: asString(newsletter.eyebrow, defaults.newsletter.eyebrow),
      title: asString(newsletter.title, defaults.newsletter.title),
      description: asString(newsletter.description, defaults.newsletter.description),
      button_text: asString(newsletter.button_text, defaults.newsletter.button_text),
      placeholder: asString(newsletter.placeholder, defaults.newsletter.placeholder),
      footnote: asString(newsletter.footnote, defaults.newsletter.footnote),
    },
    instagram: {
      is_active: asBool(instagram.is_active, defaults.instagram.is_active),
      eyebrow: asString(instagram.eyebrow, defaults.instagram.eyebrow),
      title: asString(instagram.title, defaults.instagram.title),
      profile_url: asString(instagram.profile_url, defaults.instagram.profile_url),
      profile_label: asString(instagram.profile_label, defaults.instagram.profile_label),
      tiles: mapInstagramTiles(instagram.tiles, defaults.instagram.tiles),
    },
    stats: {
      is_active: asBool(stats.is_active, defaults.stats.is_active),
      eyebrow: asString(stats.eyebrow, defaults.stats.eyebrow),
      title: asString(stats.title, defaults.stats.title),
      items: mapStats(stats.items, defaults.stats.items),
    },
    festive_edits: {
      is_active: asBool(festiveEdits.is_active, defaults.festive_edits.is_active),
      eyebrow: asString(festiveEdits.eyebrow, defaults.festive_edits.eyebrow),
      title: asString(festiveEdits.title, defaults.festive_edits.title),
      button_text: asString(festiveEdits.button_text, defaults.festive_edits.button_text),
      button_url: asString(festiveEdits.button_url, defaults.festive_edits.button_url),
      items: mapLinkCards(festiveEdits.items, defaults.festive_edits.items),
    },
  };
}
