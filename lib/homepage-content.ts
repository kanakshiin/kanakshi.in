import { referenceAssets } from "./reference-assets";

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
  product?: string;
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
    eyebrow: "Trending Categories",
    title: "Shop By Fine Jewellery Category",
    button_text: "View All Jewellery",
    button_url: "/shop",
    items: [
      { title: "Rings & Solitaires", subtitle: "925 Silver & Lab Diamonds", image: referenceAssets.categories.rings, href: "/shop?category=rings" },
      { title: "Necklaces & Pendants", subtitle: "Everyday Sparkle & Chains", image: referenceAssets.categories.necklaces, href: "/shop?category=necklaces" },
      { title: "Earrings & Studs", subtitle: "Hoops, Drops & Solitaires", image: referenceAssets.categories.earrings, href: "/shop?category=earrings" },
      { title: "Bracelets & Bangles", subtitle: "Tennis Cuffs & Charm Links", image: referenceAssets.categories.bracelets, href: "/shop?category=bracelets" },
    ],
  },
  occasions: {
    is_active: true,
    eyebrow: "Curated For You",
    title: "Shop By Recipient & Occasion",
    items: [
      { title: "Gifts for Her", image: referenceAssets.categories.gifts, href: "/shop?category=gifts-for-her" },
      { title: "Gifts for Him", image: referenceAssets.categories.men, href: "/shop?category=mens-jewellery" },
      { title: "Anniversary & Romance", image: referenceAssets.hero.valentines, href: "/shop?category=anniversary-gifts" },
      { title: "Everyday Minimalist", image: referenceAssets.categories.silver, href: "/shop?category=everyday-silver" },
      { title: "Under ₹1,999", image: referenceAssets.categories.rings, href: "/shop?price=under-1999" },
    ],
  },
  editorial_picks: {
    is_active: true,
    items: [
      { badge: "Bestseller", title: "925 Sterling Silver", description: "Crafted in hallmarked pure 925 silver with rhodium anti-tarnish coating.", image: referenceAssets.categories.silver, href: "/shop?category=silver-jewellery" },
      { badge: "Lab-Grown", title: "18K Gold & Diamonds", description: "Ethically grown sparkling lab diamonds set in 14K & 18K real solid gold.", image: referenceAssets.categories.gold, href: "/shop?category=gold-lab-diamonds" },
      { badge: "Romantic", title: "Rose Gold Elegance", description: "Flattering blush tones designed for modern romance and effortless layering.", image: referenceAssets.products.roseGoldPendant1, href: "/shop?category=rose-gold" },
    ],
  },
  about_brand: {
    is_active: true,
    eyebrow: "The Kanakshi Promise",
    title: "Everyday Luxury Made Accessible & Genuine",
    paragraph_one: "At Kanakshi, we believe fine jewellery shouldn't be locked away in bank lockers. We craft exquisite 925 sterling silver, 18K gold, and certified lab-grown diamonds designed to be worn and celebrated every single day.",
    paragraph_two: "Every piece comes with a BIS Hallmark and Certificate of Authenticity, backed by our signature Anti-Tarnish Rhodium Finish and 7-Day Easy Returns. Loved by over 200,000 discerning jewellery lovers across India.",
    button_text: "Discover Our Story",
    button_url: "/pages/about-us",
    image: referenceAssets.hero.primary,
  },
  founders: {
    is_active: true,
    eyebrow: "Our Craftsmanship",
    title: "Master Artisans, Precision Polish & Anti-Tarnish Finish",
    content: "Each design begins with hand-sketched concepts, cast in hypoallergenic alloys, set with brilliant AAA+ Cubic Zirconia or IGI-certified lab diamonds, and finished with multi-layer anti-tarnish rhodium plating to preserve everlasting mirror shine.",
    button_text: "Shop the Bestsellers",
    button_url: "/shop",
    main_image: referenceAssets.products.solitaireRing1,
    side_image: referenceAssets.products.heartNecklace1,
  },
  testimonials: {
    is_active: true,
    eyebrow: "Loved by 2,00,000+ Customers",
    title: "What Our Sparkle Club Says",
    items: [
      { title: "Stunning Solitaire!", quote: "The diamond brilliance is mind-blowing! I wear it daily to office and it hasn't tarnished at all. Beautiful packaging too.", author: "Ananya Sharma", stars: "★★★★★", product: "Silver Classic Solitaire Ring" },
      { title: "Perfect Anniversary Gift", quote: "Got the rose gold heart pendant for my wife. She absolutely loved the velvet box and authenticity card. 10/10!", author: "Rohan Malhotra", stars: "★★★★★", product: "Rose Gold Heart Loop Necklace" },
      { title: "Real 925 Silver Feel", quote: "Heavy, premium, and hallmarked. The 7-day doorstep return policy gave me total peace of mind. Will order again!", author: "Pooja Hegde", stars: "★★★★★", product: "Tennis Charm Bracelet" },
    ],
  },
  newsletter: {
    is_active: true,
    eyebrow: "Join the Sparkle Club",
    title: "Get ₹500 OFF On Your First Jewellery Purchase",
    description: "Be the first to know about new collection drops, flash sales, personalized gifting edits, and secret VIP coupons.",
    button_text: "Claim ₹500 Voucher",
    placeholder: "Enter your email address",
    footnote: "Valid on orders above ₹1,999. Use code SPARKLE500 at checkout.",
  },
  instagram: {
    is_active: true,
    eyebrow: "#KanakshiSparkle",
    title: "Styled By You on Instagram",
    profile_url: "https://instagram.com/kanakshi.in",
    profile_label: "@kanakshi.in",
    tiles: [
      { image: referenceAssets.products.solitaireRing1, alt: "Solitaire ring worn with elegant manicure" },
      { image: referenceAssets.products.heartNecklace1, alt: "Heart pendant styled with evening dress" },
      { image: referenceAssets.products.pearlEarrings1, alt: "Pearl studs styled for festive look" },
      { image: referenceAssets.products.tennisBracelet1, alt: "Tennis bracelet stacked on wrist" },
      { image: referenceAssets.products.roseGoldPendant1, alt: "Rose gold locket worn daily" },
      { image: referenceAssets.products.evilEyeBracelet1, alt: "Evil eye charm bracelet close up" },
    ],
  },
  stats: {
    is_active: true,
    eyebrow: "Trust By Numbers",
    title: "India's Favorite Fine Jewellery Destination",
    items: [
      { value: "2,00,000+", label: "Happy Customers" },
      { value: "100%", label: "BIS Hallmarked & Certified" },
      { value: "4.8 ★", label: "Average Review Rating" },
      { value: "7 Days", label: "Hassle-Free Returns" },
    ],
  },
  festive_edits: {
    is_active: true,
    eyebrow: "Curated Collections",
    title: "Explore Signature Fine Jewellery Edits",
    button_text: "Explore All Collections",
    button_url: "/shop",
    items: [
      { title: "The Solitaire Edit", subtitle: "Timeless brilliant cut rings & studs", image: referenceAssets.hero.solitaire, href: "/shop?category=solitaires" },
      { title: "Everyday 925 Silver", subtitle: "Lightweight, anti-tarnish everyday picks", image: referenceAssets.hero.silver, href: "/shop?category=silver-jewellery" },
      { title: "Romance & Valentines", subtitle: "Heart lockets, couple bands & infinity loops", image: referenceAssets.hero.valentines, href: "/shop?category=gifts-for-her" },
    ],
  },
};

export function resolveFullHomepageContent(customConfig?: Record<string, unknown> | null): FullHomepageContent {
  if (!customConfig || Object.keys(customConfig).length === 0) {
    return defaultFullHomepageContent;
  }

  // Merge custom config cleanly with default fine jewellery structure
  return {
    ...defaultFullHomepageContent,
    ...customConfig,
  } as FullHomepageContent;
}
