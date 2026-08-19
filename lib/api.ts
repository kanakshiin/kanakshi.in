import { referenceAssets } from "./reference-assets";
import { liveContactDefaults, livePrivacyPolicyHtml, liveRefundPolicyHtml, liveTermsHtml } from "./legal-content";
import { Category, Coupon, HomepageSection, NavigationItem, Product, ProductListResponse, SiteSettings, SocialLink, BlogPost, BlogCategory, BlogTag, BlogAuthor } from "./types";


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://backend.kanakshi.in/api/v1";

const BACKEND_SITE_URL =
  process.env.NEXT_PUBLIC_BACKEND_SITE_URL ||
  process.env.BACKEND_SITE_URL ||
  "https://backend.kanakshi.in";

const STOREFRONT_FALLBACKS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_STOREFRONT_FALLBACKS === "true" ||
  process.env.NODE_ENV !== "production";

const IS_PRODUCTION_BUILD = process.env.NEXT_PHASE === "phase-production-build";
const PUBLIC_READ_REVALIDATE_SECONDS = 60;

export const PRODUCT_PLACEHOLDER_IMAGE = "/product-placeholder.svg";

const fallbackSettings: SiteSettings = {
  site_name: "Kanakshi Fine Jewellery",
  site_tagline: "Everyday Luxury Fine Jewellery | 925 Sterling Silver, Gold & Lab-Grown Diamonds",
  site_currency_symbol: "₹",
  default_shipping_cost: "0",
  min_order_free_shipping: "499",
  site_email: liveContactDefaults.email,
  site_phone: liveContactDefaults.phone,
  address_line1: liveContactDefaults.addressLine1,
  city: liveContactDefaults.city,
  state: liveContactDefaults.state,
  pincode: liveContactDefaults.pincode,
  country: liveContactDefaults.country,
  privacy_policy: livePrivacyPolicyHtml,
  terms_conditions: liveTermsHtml,
  return_policy: liveRefundPolicyHtml,
  show_topbar: true,
  topbar_offers: [
    "FLAT ₹500 OFF on Orders Above ₹2,999 | Code: SPARKLE500",
    "Free Insured Express Delivery Across India",
    "100% Certified 925 Sterling Silver & Hallmarked Gold",
    "Easy 7-Day Doorstep Returns Across India"
  ]
};

const fallbackHeaderMenu: NavigationItem[] = [
  {
    id: 20001,
    title: "All Jewellery",
    url: "/shop",
    children: [
      { id: 21001, title: "All Rings", url: "/shop?category=rings" },
      { id: 21002, title: "All Earrings", url: "/shop?category=earrings" },
      { id: 21003, title: "All Necklaces", url: "/shop?category=necklaces" },
      { id: 21004, title: "All Bracelets", url: "/shop?category=bracelets" },
      { id: 21005, title: "Solitaires", url: "/shop?category=solitaires" },
      { id: 21006, title: "Best Sellers", url: "/shop?sort=bestseller" }
    ]
  },
  {
    id: 20002,
    title: "Gold & Lab Diamonds",
    url: "/shop?category=gold-lab-diamonds",
    children: [
      { id: 22001, title: "14K & 18K Gold Rings", url: "/shop?category=gold-lab-diamonds&sub=rings" },
      { id: 22002, title: "Lab Diamond Pendants", url: "/shop?category=gold-lab-diamonds&sub=pendants" },
      { id: 22003, title: "Diamond Studs", url: "/shop?category=gold-lab-diamonds&sub=earrings" },
      { id: 22004, title: "Tennis Bracelets", url: "/shop?category=gold-lab-diamonds&sub=bracelets" },
      { id: 22005, title: "Solitaire Engagement", url: "/shop?category=gold-lab-diamonds&sub=engagement" }
    ]
  },
  {
    id: 20003,
    title: "925 Silver",
    url: "/shop?category=silver-jewellery",
    children: [
      { id: 23001, title: "Silver Rings", url: "/shop?category=rings" },
      { id: 23002, title: "Silver Earrings", url: "/shop?category=earrings" },
      { id: 23003, title: "Silver Pendants", url: "/shop?category=necklaces" },
      { id: 23004, title: "Silver Bracelets & Bangles", url: "/shop?category=bracelets" },
      { id: 23005, title: "Oxidised Silver", url: "/shop?category=silver-jewellery&sub=oxidised" }
    ]
  },
  {
    id: 20004,
    title: "Rings",
    url: "/shop?category=rings",
    children: [
      { id: 24001, title: "Solitaire Rings", url: "/shop?category=rings&type=solitaire" },
      { id: 24002, title: "Couple Promise Bands", url: "/shop?category=rings&type=couple" },
      { id: 24003, title: "Adjustable Rings", url: "/shop?category=rings&type=adjustable" },
      { id: 24004, title: "Floral & Heart Rings", url: "/shop?category=rings&type=heart" }
    ]
  },
  {
    id: 20005,
    title: "Earrings",
    url: "/shop?category=earrings",
    children: [
      { id: 25001, title: "Solitaire Studs", url: "/shop?category=earrings&type=studs" },
      { id: 25002, title: "Hoops & Huggies", url: "/shop?category=earrings&type=hoops" },
      { id: 25003, title: "Drops & Danglers", url: "/shop?category=earrings&type=drops" },
      { id: 25004, title: "Heritage Jhumkas", url: "/shop?category=earrings&type=jhumkas" }
    ]
  },
  {
    id: 20006,
    title: "Necklaces",
    url: "/shop?category=necklaces",
    children: [
      { id: 26001, title: "Heart & Infinity Pendants", url: "/shop?category=necklaces&type=heart" },
      { id: 26002, title: "Solitaire Necklaces", url: "/shop?category=necklaces&type=solitaire" },
      { id: 26003, title: "Modern Mangalsutras", url: "/shop?category=mangalsutra" },
      { id: 26004, title: "Personalised Name Necklaces", url: "/shop?category=personalised-jewellery" }
    ]
  },
  {
    id: 20007,
    title: "Men's Jewellery",
    url: "/shop?category=mens-jewellery",
    children: [
      { id: 27001, title: "Silver Chains", url: "/shop?category=mens-jewellery&type=chains" },
      { id: 27002, title: "Men's Bracelets", url: "/shop?category=mens-jewellery&type=bracelets" },
      { id: 27003, title: "Men's Rings", url: "/shop?category=mens-jewellery&type=rings" },
      { id: 27004, title: "Pendants for Men", url: "/shop?category=mens-jewellery&type=pendants" }
    ]
  },
  {
    id: 20008,
    title: "Gifts & Offers",
    url: "/shop?category=gifting-edits",
    children: [
      { id: 28001, title: "Gifts for Her", url: "/shop?category=gifts-for-her" },
      { id: 28002, title: "Gifts for Him", url: "/shop?category=mens-jewellery" },
      { id: 28003, title: "Under ₹1,999", url: "/shop?price=under-1999" },
      { id: 28004, title: "Under ₹2,999", url: "/shop?price=under-2999" },
      { id: 28005, title: "Luxury Box Sets", url: "/shop?category=gifting-edits" }
    ]
  }
];

const fallbackFooterMenu: NavigationItem[] = [
  { id: 30001, title: "About Us", url: "/pages/about-us" },
  { id: 30002, title: "Contact Us", url: "/pages/contact" },
  { id: 30003, title: "Track Your Order", url: "/track-order" },
  { id: 30004, title: "7-Day Returns & Exchange", url: "/pages/refund-policy" },
  { id: 30005, title: "Certificate of Authenticity", url: "/pages/about-us" },
  { id: 30006, title: "Jewellery Care Guide", url: "/pages/about-us" },
  { id: 30007, title: "Privacy Policy", url: "/pages/privacy-policy" },
  { id: 30008, title: "Terms & Conditions", url: "/pages/terms-conditions" },
  { id: 30009, title: "Shipping & Delivery Policy", url: "/pages/shipping-policy" }
];

const fallbackSocialLinks: SocialLink[] = [
  { id: 40001, platform: "Instagram", handle: "@kanakshi.in", url: "https://instagram.com/kanakshi.in" },
  { id: 40002, platform: "Facebook", handle: "kanakshi.in", url: "https://facebook.com/kanakshi.in" },
  { id: 40003, platform: "Pinterest", handle: "kanakshi.in", url: "https://pinterest.com/kanakshi.in" },
  { id: 40004, platform: "YouTube", handle: "@kanakshi.in", url: "https://youtube.com/@kanakshi.in" },
  { id: 40005, platform: "WhatsApp", handle: "+91 98765 43210", url: "https://wa.me/919876543210" }
];

const fallbackCategories: Category[] = [
  { id: 1, parent_id: null, name: "Rings", slug: "rings", image: referenceAssets.categories.rings, description: "Solitaires, couple bands, cocktail & everyday 925 silver rings." },
  { id: 2, parent_id: null, name: "Earrings", slug: "earrings", image: referenceAssets.categories.earrings, description: "Studs, hoops, huggies, drops & heritage jhumkas." },
  { id: 3, parent_id: null, name: "Necklaces & Pendants", slug: "necklaces", image: referenceAssets.categories.necklaces, description: "Heart lockets, chains, chokers & solitaire pendants." },
  { id: 4, parent_id: null, name: "Bracelets & Bangles", slug: "bracelets", image: referenceAssets.categories.bracelets, description: "Tennis bracelets, charm cuffs, evil eye & link bracelets." },
  { id: 5, parent_id: null, name: "Gold & Lab Diamonds", slug: "gold-lab-diamonds", image: referenceAssets.categories.gold, description: "14K & 18K real solid gold set with certified lab-grown diamonds." },
  { id: 6, parent_id: null, name: "925 Sterling Silver", slug: "silver-jewellery", image: referenceAssets.categories.silver, description: "Pure 925 sterling silver hallmarked with anti-tarnish rhodium finish." },
  { id: 7, parent_id: null, name: "Modern Mangalsutra", slug: "mangalsutra", image: referenceAssets.categories.mangalsutra, description: "Minimalist evil eye and solitaire daily-wear mangalsutras." },
  { id: 8, parent_id: null, name: "Men's Jewellery", slug: "mens-jewellery", image: referenceAssets.categories.men, description: "Cuban link chains, rugged rings, studs & bracelets for men." },
  { id: 9, parent_id: null, name: "Gifts & Hampers", slug: "gifting-edits", image: referenceAssets.categories.gifts, description: "Curated gift boxes with velvet pouch, message card & certificate." }
];

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Silver Classic Solitaire Ring",
    slug: "silver-classic-solitaire-ring",
    price: 3499,
    sale_price: 1999,
    effective_price: 1999,
    category_name: "Rings",
    category_slug: "rings",
    material: "925 Sterling Silver • AAA+ CZ Solitaire",
    avg_rating: 4.9,
    review_count: 1420,
    is_featured: true,
    is_sellable: true,
    short_desc: "A breathtaking 6-prong 1.5 Carat Solitaire ring crafted in pure 925 Sterling Silver with anti-tarnish rhodium plating.",
    description:
      "Nothing commands timeless elegance quite like a classic solitaire. The Silver Classic Solitaire Ring features a laser-cut AAA+ grade Cubic Zirconia stone set in a secure 6-prong 925 sterling silver basket. Engineered with high-shine rhodium plating that resists tarnishing, this ring is the perfect promise, engagement, or everyday statement piece. Comes with an Authenticity Certificate and signature velvet gift box.",
    bullet_points: [
      "925 Sterling Silver with Hallmarking stamp",
      "Brilliant 1.5 Carat AAA+ Cubic Zirconia centre stone",
      "Anti-Tarnish Rhodium Finish for lifelong shine",
      "Includes Certificate of Authenticity & Luxury Box",
      "Hypoallergenic & nickel-free for sensitive skin"
    ],
    images: [
      referenceAssets.products.solitaireRing1,
      referenceAssets.products.solitaireRing2,
      referenceAssets.categories.rings
    ]
  },
  {
    id: 2,
    name: "Rose Gold Eternal Heart Loop Necklace",
    slug: "rose-gold-heart-loop-necklace",
    price: 4299,
    sale_price: 2499,
    effective_price: 2499,
    category_name: "Necklaces & Pendants",
    category_slug: "necklaces",
    material: "925 Sterling Silver • 18K Rose Gold Plated",
    avg_rating: 4.8,
    review_count: 980,
    is_featured: true,
    is_sellable: true,
    short_desc: "Interlocking dual heart pendant accented with micro-pave crystals in warm 18K Rose Gold plating.",
    description:
      "Celebrate infinite affection with the Rose Gold Eternal Heart Loop Necklace. Two entwined hearts — one polished to a mirror shine, the other encrusted with dazzling micro-pavé stones — suspend from an adjustable fine silver chain. Coated with an e-coat protective layer to preserve the radiant blush finish forever.",
    bullet_points: [
      "Authentic 925 Sterling Silver core",
      "18K Rose Gold electro-plated with protective E-Coat",
      "Chain length: 16 inches + 2-inch extension",
      "Secured with sturdy lobster claw clasp",
      "6-Month Plating Guarantee included"
    ],
    images: [
      referenceAssets.products.heartNecklace1,
      referenceAssets.products.heartNecklace2,
      referenceAssets.categories.necklaces
    ]
  },
  {
    id: 3,
    name: "925 Silver Classic Tennis Charm Bracelet",
    slug: "classic-tennis-charm-bracelet",
    price: 5999,
    sale_price: 3299,
    effective_price: 3299,
    category_name: "Bracelets & Bangles",
    category_slug: "bracelets",
    material: "925 Sterling Silver • AAA+ Swiss CZ",
    avg_rating: 4.9,
    review_count: 750,
    is_featured: true,
    is_sellable: true,
    short_desc: "A seamless continuous line of brilliant-cut crystals bezel-set in flexible 925 Sterling Silver.",
    description:
      "The quintessential icon of glamour. Our Silver Classic Tennis Bracelet features individually hand-set brilliant stones linked by flexible articulated silver joints. Designed to sit effortlessly on the wrist whether styled solo for boardroom elegance or stacked for festive soirees.",
    bullet_points: [
      "Hallmarked 925 Sterling Silver structure",
      "Double safety clasp for secure wear",
      "Stone size: 3mm each, total 4.2 Carats",
      "Length: 7 inches with removable extender link",
      "Complimentary silver polishing cloth included"
    ],
    images: [
      referenceAssets.products.tennisBracelet1,
      referenceAssets.products.tennisBracelet2,
      referenceAssets.categories.bracelets
    ]
  },
  {
    id: 4,
    name: "Sparkling Solitaire Drop Earrings",
    slug: "sparkling-crystal-drop-earrings",
    price: 2999,
    sale_price: 1799,
    effective_price: 1799,
    category_name: "Earrings",
    category_slug: "earrings",
    material: "925 Sterling Silver • Pear-cut CZ",
    avg_rating: 4.8,
    review_count: 640,
    is_featured: true,
    is_sellable: true,
    short_desc: "Graceful teardrop crystals that catch the light with every movement, crafted in 925 Silver.",
    description:
      "Add instant radiance to your face with these Sparkling Solitaire Drop Earrings. Featuring a pear-cut crystal suspended beneath a sparkling stud, these earrings offer stunning fluid movement and high brilliance without weighing your earlobes down.",
    bullet_points: [
      "925 Pure Silver with BIS certification",
      "Lightweight ergonomic drop design (3.1 grams pair)",
      "Secure push-back butterfly closure",
      "Anti-allergenic rhodium polish",
      "Ideal for cocktails, weddings, and date nights"
    ],
    images: [
      referenceAssets.products.pearlEarrings1,
      referenceAssets.products.pearlEarrings2,
      referenceAssets.categories.earrings
    ]
  },
  {
    id: 5,
    name: "18K Solid Gold & Lab Diamond Pendant",
    slug: "18k-gold-lab-diamond-pendant",
    price: 14999,
    sale_price: 8999,
    effective_price: 8999,
    category_name: "Gold & Lab Diamonds",
    category_slug: "gold-lab-diamonds",
    material: "18K Yellow Gold (Hallmarked) • 0.50 Ct IGI Lab Diamond",
    avg_rating: 5.0,
    review_count: 320,
    is_featured: true,
    is_sellable: true,
    short_desc: "Real 18K solid yellow gold holding an IGI-certified 0.50 Ct brilliant round lab-grown diamond.",
    description:
      "Invest in conscious luxury with our flagship 18K Gold Lab Diamond Solitaire Pendant. Hand-set in certified 18K hallmarked solid yellow gold, this pendant showcases a DEF color, VVS clarity lab-grown diamond that delivers 100% identical optical, physical, and chemical brilliance of mined diamonds.",
    bullet_points: [
      "Real 18K Solid Gold (BIS Hallmarked)",
      "IGI Certificate of Authenticity card included",
      "0.50 Carat DEF Color, VVS Clarity Lab-Grown Diamond",
      "Comes with 18K gold purity certification card",
      "Lifetime exchange & buyback guarantee"
    ],
    images: [
      referenceAssets.categories.gold,
      referenceAssets.products.solitaireRing1,
      referenceAssets.products.roseGoldPendant1
    ]
  },
  {
    id: 6,
    name: "Rose Gold Evil Eye Charm Bracelet",
    slug: "evil-eye-protection-charm-bracelet",
    price: 2899,
    sale_price: 1699,
    effective_price: 1699,
    category_name: "Bracelets & Bangles",
    category_slug: "bracelets",
    material: "925 Sterling Silver • 18K Rose Gold • Blue Enamel",
    avg_rating: 4.8,
    review_count: 1120,
    is_featured: true,
    is_sellable: true,
    short_desc: "Protective Greek Evil Eye talisman with sapphire blue enamel and pave cubic zirconia.",
    description:
      "Wear your good vibes and ward off negativity. This dainty evil eye charm bracelet features rich hand-applied cobalt blue and turquoise enamel accented by pavé crystals, set on a lightweight adjustable 18K rose gold chain.",
    bullet_points: [
      "925 Sterling Silver with 18K Rose Gold Plating",
      "Handcrafted enamel evil eye talisman",
      "Adjustable sliding ball mechanism fits all wrist sizes",
      "Anti-tarnish protective barrier",
      "Top-rated gifting pick for birthdays & sister gifts"
    ],
    images: [
      referenceAssets.products.evilEyeBracelet1,
      referenceAssets.products.evilEyeBracelet2,
      referenceAssets.categories.bracelets
    ]
  },
  {
    id: 7,
    name: "Men's 925 Sterling Silver Cuban Chain",
    slug: "mens-cuban-link-silver-chain",
    price: 7499,
    sale_price: 4499,
    effective_price: 4499,
    category_name: "Men's Jewellery",
    category_slug: "mens-jewellery",
    material: "Solid 925 Sterling Silver (Heavy 14g)",
    avg_rating: 4.9,
    review_count: 510,
    is_featured: true,
    is_sellable: true,
    short_desc: "Heavy 5mm diamond-cut bevelled Cuban link chain in pure hallmarked 925 Sterling Silver.",
    description:
      "Bold, confident, and unapologetically stylish. Our Men's Cuban Chain is engineered from solid 925 sterling silver with diamond-cut bevels that catch the light from every angle. Finished with an oxidation-resistant high-polish shine.",
    bullet_points: [
      "Solid 925 Sterling Silver (approx 14.5 grams)",
      "5mm flat curb chain profile",
      "Length: 20 inches with heavy-duty lobster clasp",
      "Water-resistant & sweat-resistant coating",
      "Includes gift box & authenticity certificate"
    ],
    images: [
      referenceAssets.products.menChain1,
      referenceAssets.products.menChain2,
      referenceAssets.categories.men
    ]
  },
  {
    id: 8,
    name: "Forever Love Silver Couple Promise Bands",
    slug: "forever-love-couple-promise-rings",
    price: 6499,
    sale_price: 3799,
    effective_price: 3799,
    category_name: "Rings",
    category_slug: "rings",
    material: "Pair of 925 Sterling Silver Rings",
    avg_rating: 4.9,
    review_count: 890,
    is_featured: true,
    is_sellable: true,
    short_desc: "A matching pair of his & her adjustable promise rings engraved with subtle comfort-fit band.",
    description:
      "A symbol of shared dreams and unbreakable bonds. This pair of matching promise rings is crafted in pure 925 Sterling Silver. Both rings are adjustable to guarantee a perfect fit without knowing exact finger sizes.",
    bullet_points: [
      "Includes set of 2 rings (1 Men's band, 1 Women's Solitaire band)",
      "Free-size adjustable fit for both rings",
      "925 Sterling Silver hallmarked",
      "Micro-pavé stone setting that will never fall out",
      "Comes in a duo presentation love box"
    ],
    images: [
      referenceAssets.products.coupleBands1,
      referenceAssets.products.coupleBands2,
      referenceAssets.categories.rings
    ]
  },
  {
    id: 9,
    name: "Pure 925 Silver Brilliant Solitaire Ring",
    slug: "925-sterling-silver-solitaire-ring",
    price: 3299,
    sale_price: 1899,
    effective_price: 1899,
    category_name: "925 Sterling Silver",
    category_slug: "silver-jewellery",
    material: "Pure 925 Sterling Silver • Rhodium E-Coat",
    avg_rating: 4.9,
    review_count: 920,
    is_featured: true,
    is_sellable: true,
    short_desc: "Mirror-polished 925 Silver band featuring an ultra-sparkle cubic zirconia solitaire.",
    description: "Crafted from pure 925 sterling silver with a thick rhodium barrier to prevent oxidization and preserve pristine mirror shine.",
    bullet_points: [
      "BIS Hallmarked 925 Stamp",
      "Rhodium plated for tarnish resistance",
      "Free luxury velvet gift box"
    ],
    images: [
      "/jewellery/solitaire-ring.jpg",
      "/jewellery/tennis-bracelet.jpg"
    ]
  },
  {
    id: 10,
    name: "925 Sterling Silver Royal Tennis Necklace",
    slug: "925-silver-shimmer-tennis-necklace",
    price: 8999,
    sale_price: 4999,
    effective_price: 4999,
    category_name: "925 Sterling Silver",
    category_slug: "silver-jewellery",
    material: "925 Sterling Silver • Full Tennis CZ Collar",
    avg_rating: 4.9,
    review_count: 380,
    is_featured: true,
    is_sellable: true,
    short_desc: "A breathtaking all-around continuous river of sparkling crystals in solid 925 Silver.",
    description: "Turn every head with the Royal Tennis Necklace. A cascading line of flawless crystals that illuminates your collarbone with red-carpet glamour.",
    bullet_points: [
      "Solid 925 Sterling Silver framework",
      "Articulated bezel cups for fluid movement",
      "Double-locking luxury box clasp"
    ],
    images: [
      "/jewellery/tennis-bracelet.jpg",
      "/jewellery/heart-necklace.jpg"
    ]
  },
  {
    id: 11,
    name: "Modern Solitaire 925 Silver Mangalsutra",
    slug: "modern-solitaire-black-bead-mangalsutra",
    price: 3999,
    sale_price: 2299,
    effective_price: 2299,
    category_name: "Modern Mangalsutra",
    category_slug: "mangalsutra",
    material: "925 Sterling Silver • Traditional Black Beads",
    avg_rating: 4.9,
    review_count: 780,
    is_featured: true,
    is_sellable: true,
    short_desc: "A contemporary 1-Carat solitaire pendant balanced by sacred black beads on a silver chain.",
    description: "Redefining marital jewellery for the modern woman. This sleek solitaire mangalsutra effortlessly complements western formals as well as ethnic wear.",
    bullet_points: [
      "925 Pure Silver with Rhodium protection",
      "Authentic sacred black spinel beads",
      "Chain length: 16 inches + 2 inches extender"
    ],
    images: [
      "/jewellery/heart-necklace.jpg",
      "/jewellery/gold-pendant.jpg"
    ]
  },
  {
    id: 12,
    name: "Daily Wear Black Bead Mangalsutra Bracelet",
    slug: "dainty-black-bead-mangalsutra-bracelet",
    price: 2999,
    sale_price: 1799,
    effective_price: 1799,
    category_name: "Modern Mangalsutra",
    category_slug: "mangalsutra",
    material: "925 Sterling Silver • 18K Rose Gold • Black Beads",
    avg_rating: 4.8,
    review_count: 610,
    is_featured: true,
    is_sellable: true,
    short_desc: "Minimalist modern wrist mangalsutra with alternating gold links and black beads.",
    description: "A chic everyday wrist alternative to the traditional neckpiece. Lightweight, comfortable, and meaningful.",
    bullet_points: [
      "18K Rose Gold plated 925 Silver",
      "Adjustable slide closure mechanism",
      "Hypoallergenic for 24/7 daily wear"
    ],
    images: [
      "/jewellery/evil-eye-bracelet.jpg",
      "/jewellery/tennis-bracelet.jpg"
    ]
  },
  {
    id: 13,
    name: "Couple's Forever Promise Luxury Gift Hamper",
    slug: "couples-forever-promise-luxury-hamper",
    price: 7999,
    sale_price: 4999,
    effective_price: 4999,
    category_name: "Gifts & Hampers",
    category_slug: "gifting-edits",
    material: "Set of 2 925 Silver Rings + Velvet Presentation Box",
    avg_rating: 5.0,
    review_count: 640,
    is_featured: true,
    is_sellable: true,
    short_desc: "The ultimate gifting combo: Matching promise rings, luxury velvet box, scented candle & certificate.",
    description: "Designed to create unforgettable memories. This gift hamper includes matching 925 Silver Promise Bands packaged in an LED-lit velvet presentation box with authenticity certificate.",
    bullet_points: [
      "Includes pair of adjustable 925 Silver rings",
      "Luxury LED velvet keepsake gift box",
      "Personalized gift message card included"
    ],
    images: [
      "/jewellery/couple-promise-rings.jpg",
      "/jewellery/solitaire-ring.jpg"
    ]
  },
  {
    id: 14,
    name: "Royal Solitaire Pendant & Earrings Gift Set",
    slug: "royal-solitaire-pendant-earrings-combo",
    price: 5999,
    sale_price: 3499,
    effective_price: 3499,
    category_name: "Gifts & Hampers",
    category_slug: "gifting-edits",
    material: "925 Sterling Silver Combo Set",
    avg_rating: 4.9,
    review_count: 820,
    is_featured: true,
    is_sellable: true,
    short_desc: "Matching solitaire pendant necklace and stud earrings in a signature pink velvet box.",
    description: "Give the complete ensemble. A 1.0 Carat solitaire pendant paired with matching solitaire studs in hallmarked 925 Sterling Silver.",
    bullet_points: [
      "Complete 2-piece fine jewellery set",
      "925 Sterling Silver with Rhodium protection",
      "Signature luxury velvet unboxing experience"
    ],
    images: [
      "/jewellery/heart-necklace.jpg",
      "/jewellery/drop-earrings.jpg"
    ]
  },
  {
    id: 15,
    name: "Classic 925 Silver Solitaire Studs",
    slug: "classic-solitaire-silver-studs",
    price: 2499,
    sale_price: 1399,
    effective_price: 1399,
    category_name: "Earrings",
    category_slug: "earrings",
    material: "925 Sterling Silver • 1.0 Ct AAA+ CZ Studs",
    avg_rating: 4.9,
    review_count: 1830,
    is_featured: false,
    is_sellable: true,
    short_desc: "Essential 1.0 Carat solitaire ear studs in hypoallergenic rhodium-plated sterling silver.",
    description: "The ultimate everyday fine jewellery staple. Clean, brilliant 4-prong basket studs that elevate your boardroom look and dinner dates alike.",
    bullet_points: [
      "100% 925 Sterling Silver certified",
      "1.00 Carat brilliant round cut stones",
      "Hypoallergenic for 24/7 comfortable wear"
    ],
    images: [
      "/jewellery/drop-earrings.jpg",
      "/jewellery/gold-pendant.jpg"
    ]
  },
  {
    id: 16,
    name: "Men's Solid Silver Bold Signet Ring",
    slug: "mens-oxidised-lion-shield-ring",
    price: 3999,
    sale_price: 2499,
    effective_price: 2499,
    category_name: "Men's Jewellery",
    category_slug: "mens-jewellery",
    material: "Solid 925 Sterling Silver (Heavy Band)",
    avg_rating: 4.8,
    review_count: 390,
    is_featured: false,
    is_sellable: true,
    short_desc: "Subtle brushed matte top with mirror-polished bevelled edges in solid silver.",
    description: "A statement of quiet masculine strength. Features a solid 925 silver core with comfortable curved inner profile for all-day wear.",
    bullet_points: [
      "Solid Hallmarked 925 Silver",
      "Comfort-fit inner core",
      "Resistant to scratches and everyday wear"
    ],
    images: [
      "/jewellery/mens-cuban-chain.jpg",
      "/jewellery/solitaire-ring.jpg"
    ]
  }
];

function isNextDynamicUsageSignal(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    "digest" in error &&
    (error as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

type ReadFetchOptions = {
  noStore?: boolean;
  revalidate?: number;
};

function getReadFetchOptions(revalidate = PUBLIC_READ_REVALIDATE_SECONDS): ReadFetchOptions {
  if (typeof window === "undefined") {
    return { revalidate };
  }

  return { noStore: true };
}

async function fetchJson<T>(path: string, options: ReadFetchOptions = { noStore: true }): Promise<T | null> {
  try {
    const requestOptions: RequestInit & { next?: { revalidate: number } } = {
      headers: {
        Accept: "application/json"
      }
    };

    if (options.noStore) {
      requestOptions.cache = "no-store";
    } else if (typeof options.revalidate === "number") {
      requestOptions.next = { revalidate: options.revalidate };
    }

    const response = await fetch(`${API_BASE_URL}${path}`, requestOptions);

    if (!response.ok) {
      if (!IS_PRODUCTION_BUILD) {
        console.error(`Storefront API request failed: ${path} (${response.status})`);
      }
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (isNextDynamicUsageSignal(error)) {
      throw error;
    }

    if (!IS_PRODUCTION_BUILD) {
      console.error(`Storefront API request failed: ${path}`, error);
    }
    return null;
  }
}

type PublicSettingsPayload = {
  data?: SiteSettings & {
    header_menu?: NavigationItem[];
    footer_menu?: NavigationItem[];
    mobile_menu?: NavigationItem[];
    social_links?: SocialLink[];
  };
};

type PublicCouponsPayload = {
  data?: Coupon[];
};

export function resolveAssetUrl(path?: string | null): string {
  if (!path) {
    return "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/storage/")) {
    return `${BACKEND_SITE_URL}${path}`;
  }

  if (path.startsWith("storage/")) {
    return `${BACKEND_SITE_URL}/${path}`;
  }

  if (path.startsWith("/")) {
    return path;
  }

  return `${BACKEND_SITE_URL}/${path.replace(/^\/+/, "")}`;
}

export function containsHtmlMarkup(value?: string | null): boolean {
  return Boolean(value && /<[^>]+>/.test(value));
}

export function stripHtmlContent(value?: string | null): string {
  if (!value) {
    return "";
  }

  const withoutTags = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ");

  return withoutTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseProductImages(images?: Product["images"]): string[] {
  if (Array.isArray(images)) {
    return images.filter(Boolean);
  }

  if (typeof images === "string" && images.trim() !== "") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [images];
    }
  }

  return [];
}

export function parseBulletPoints(bullets?: Product["bullet_points"]): string[] {
  let list: string[] = [];

  if (Array.isArray(bullets)) {
    list = bullets.map(String).filter(Boolean);
  } else if (typeof bullets === "string" && bullets.trim() !== "") {
    const trimmed = bullets.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          list = parsed.map(String).filter(Boolean);
        }
      } catch {
        // Not valid JSON array, fallback to newline split
        list = trimmed.split(/\r?\n/).filter(Boolean);
      }
    } else {
      // Split by newlines or list tags
      list = trimmed.split(/\r?\n/).filter(Boolean);
    }
  }

  // Clean, limit characters to 150, and slice to max 10 bullet points
  return list
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => item.slice(0, 150))
    .slice(0, 10);
}

export function getPrimaryImage(product: Product): string {
  const [firstImage] = parseProductImages(product.images);
  return firstImage ? resolveAssetUrl(firstImage) : PRODUCT_PLACEHOLDER_IMAGE;
}

export function isProductSellable(product: Product): boolean {
  return product.is_sellable !== false;
}

export function formatPrice(value: number | string | null | undefined, symbol = "Rs."): string {
  const amount = Number(value || 0);
  return `${symbol}${amount.toLocaleString("en-IN")}`;
}

export function discountPercent(product: Product): number | null {
  const price = Number(product.price || 0);
  const salePrice = Number(product.sale_price || 0);

  if (!price || !salePrice || salePrice >= price) {
    return null;
  }

  return Math.round(((price - salePrice) / price) * 100);
}

export async function getSettings(): Promise<SiteSettings> {
  const payload = await fetchJson<PublicSettingsPayload>("/settings/public", getReadFetchOptions());
  if (payload?.data && Object.keys(payload.data).length > 0) {
    return payload.data;
  }

  return STOREFRONT_FALLBACKS_ENABLED ? fallbackSettings : {};
}

export async function getLayoutData() {
  const [settingsPayload, categories] = await Promise.all([
    fetchJson<PublicSettingsPayload>("/settings/public", getReadFetchOptions()),
    getCategories(8, getReadFetchOptions())
  ]);

  const data = settingsPayload?.data || {};

  return {
    settings: Object.keys(data).length > 0
      ? (data as SiteSettings)
      : (STOREFRONT_FALLBACKS_ENABLED ? fallbackSettings : {}),
    categories,
    headerMenu: data.header_menu?.length
      ? data.header_menu
      : (STOREFRONT_FALLBACKS_ENABLED ? fallbackHeaderMenu : []),
    mobileMenu: data.mobile_menu?.length
      ? data.mobile_menu
      : (data.header_menu?.length
        ? data.header_menu
        : (STOREFRONT_FALLBACKS_ENABLED ? fallbackHeaderMenu : [])),
    footerMenu: data.footer_menu?.length
      ? data.footer_menu
      : (STOREFRONT_FALLBACKS_ENABLED ? fallbackFooterMenu : []),
    socialLinks: data.social_links?.length
      ? data.social_links
      : (STOREFRONT_FALLBACKS_ENABLED ? fallbackSocialLinks : [])
  };
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const payload = await fetchJson<{ data?: HomepageSection[] }>("/settings/homepage-sections", getReadFetchOptions());
  return payload?.data?.length ? payload.data : [];
}

export async function getCategories(limit = 8, fetchOptions: ReadFetchOptions = getReadFetchOptions()): Promise<Category[]> {
  const payload = await fetchJson<{ data?: Category[] }>(`/catalog/categories?limit=${limit}`, fetchOptions);
  if (payload?.data) {
    return payload.data;
  }

  return STOREFRONT_FALLBACKS_ENABLED ? fallbackCategories.slice(0, limit) : [];
}

export async function getProducts(query = "", fetchOptions: ReadFetchOptions = getReadFetchOptions()): Promise<ProductListResponse> {
  const payload = await fetchJson<{ data?: ProductListResponse }>(`/catalog/products${query ? `?${query}` : ""}`, fetchOptions);
  if (payload?.data) {
    return payload.data;
  }

  if (!STOREFRONT_FALLBACKS_ENABLED) {
    return {
      items: [],
      pagination: {
        current_page: 1,
        per_page: 0,
        total: 0,
        last_page: 1
      }
    };
  }

  return {
    items: fallbackProducts,
    pagination: {
      current_page: 1,
      per_page: fallbackProducts.length,
      total: fallbackProducts.length,
      last_page: 1
    }
  };
}

export async function getProduct(slug: string, fetchOptions: ReadFetchOptions = getReadFetchOptions()): Promise<Product | null> {
  const payload = await fetchJson<{ data?: Product }>(`/catalog/products/${slug}`, fetchOptions);
  if (payload?.data) {
    return payload.data;
  }

  return STOREFRONT_FALLBACKS_ENABLED
    ? fallbackProducts.find((product) => product.slug === slug) || null
    : null;
}

export async function getActiveCoupons(): Promise<Coupon[]> {
  const payload = await fetchJson<PublicCouponsPayload>("/marketing/coupons", getReadFetchOptions());
  return payload?.data?.length ? payload.data : [];
}

async function resolveProductRail(
  section: HomepageSection | undefined,
  fallbackQuery: string,
  fetchOptions: ReadFetchOptions = getReadFetchOptions()
): Promise<Product[]> {
  if (!section) {
    return (await getProducts(fallbackQuery, fetchOptions)).items;
  }

  const config = (section.config as {
    source_type?: "featured" | "newest" | "manual" | "category";
    product_count?: number;
    product_ids?: number[];
    category_slug?: string | null;
  } | null) || { source_type: "featured", product_count: 8, product_ids: [] };

  const count = Math.min(Math.max(Number(config.product_count || 8), 1), 24);

  if (config.source_type === "manual" && config.product_ids?.length) {
    return (await getProducts(`ids=${config.product_ids.join(",")}&per_page=${count}`, fetchOptions)).items.slice(0, count);
  }

  if (config.source_type === "category" && config.category_slug) {
    return (await getProducts(`category=${encodeURIComponent(config.category_slug)}&per_page=${count}&sort=newest`, fetchOptions)).items.slice(0, count);
  }

  if (config.source_type === "newest") {
    return (await getProducts(`per_page=${count}&sort=newest`, fetchOptions)).items.slice(0, count);
  }

  return (await getProducts(`featured=1&per_page=${count}&sort=popular`, fetchOptions)).items.slice(0, count);
}

export async function getHomePageData() {
  const fetchOptions = getReadFetchOptions();
  const [layoutData, homepageSections] = await Promise.all([
    getLayoutData(),
    getHomepageSections()
  ]);

  const { settings, categories, socialLinks } = layoutData;

  const sectionMap = new Map(homepageSections.map((section) => [section.section_key, section]));
  const [featuredProducts, newestProducts] = await Promise.all([
    resolveProductRail(sectionMap.get("best-sellers"), "featured=1&per_page=8&sort=popular", fetchOptions),
    resolveProductRail(sectionMap.get("new-arrivals-products"), "per_page=4&sort=newest", fetchOptions),
  ]);

  return {
    settings,
    categories,
    socialLinks,
    featuredProducts,
    newestProducts,
    homepageSections
  };
}

export interface PlaceOrderInput {
  ship_name: string;
  ship_email: string;
  ship_phone: string;
  ship_alt_phone?: string;
  ship_address: string;
  save_address?: boolean;
  address_type?: "home" | "office" | "other";
  address_label?: string;
  address_line1?: string;
  address_line2?: string;
  address_landmark?: string;
  address_is_default?: boolean;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  payment_method: "cod" | "razorpay" | "phonepe";
  payment_id?: string;
  coupon_code?: string;
  notes?: string;
  items: Array<{
    product_id: number;
    variant_id?: number | null;
    quantity: number;
  }>;
}

export async function placeOrder(data: PlaceOrderInput, token?: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    order_number: string;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    ship_name: string;
    ship_email: string;
    ship_phone: string;
    ship_alt_phone?: string | null;
    estimated_delivery: string;
    customer_auth?: {
      token: string;
      token_type: string;
      expires_at?: string | null;
      user: {
        id: number;
        name: string;
        email: string;
        phone?: string | null;
        address?: string | null;
        city?: string | null;
        state?: string | null;
        pincode?: string | null;
        email_verified_at?: string | null;
        role?: string;
      };
    } | null;
    gateway_config?: {
      public_key: string | null;
      merchant_id: string | null;
      is_test_mode: boolean;
      provider_order_id: string | null;
      pending_access_token?: string | null;
      checkout_url?: string | null;
    } | null;
  };
}> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      cache: "no-store"
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while placing order."
    };
  }
}

export async function verifyPayment(
  data: {
    order_number: string;
    payment_method: "razorpay" | "phonepe";
    access_token?: string;
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    transaction_id?: string;
    provider_reference_id?: string;
  },
  token?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/checkout/verify-payment`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      cache: "no-store"
    });

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to verify payment."
    };
  }
}

export async function cancelOrder(orderNumber: string, token?: string, accessToken?: string): Promise<{ success: boolean; message: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/checkout/cancel-order`, {
      method: "POST",
      headers,
      body: JSON.stringify({ order_number: orderNumber, access_token: accessToken }),
      cache: "no-store"
    });

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to cancel order."
    };
  }
}

export async function trackOrder(orderNumber: string, contact: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    order_number: string;
    status: string;
    ship_name: string;
    ship_city: string;
    ship_state: string;
    created_at: string;
    courier_name?: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    dispatched_at?: string | null;
    estimated_delivery_date?: string | null;
    payment_method: string;
    payment_status: string;
    total_amount: number;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
      image: string | null;
      size: string | null;
      color: string | null;
      variant_details: string | null;
    }>;
    tracking_milestones: Array<{
      id: number;
      status: string;
      location: string | null;
      message: string | null;
      created_at: string;
    }>;
  };
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/orders/track?number=${encodeURIComponent(orderNumber)}&contact=${encodeURIComponent(contact)}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store"
      }
    );

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong while fetching tracking information."
    };
  }
}

export async function getCustomerOrders(token: string): Promise<{
  success: boolean;
  message: string;
  data?: Array<{
    id: number;
    order_number: string;
    status: string;
    subtotal: number;
    discount: number;
    tax: number;
    shipping_cost: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    ship_name: string;
    created_at: string;
    items_count: number;
    first_item_image: string | null;
    first_item_name: string | null;
    courier_name?: string | null;
    tracking_number?: string | null;
    tracking_url?: string | null;
    dispatched_at?: string | null;
    estimated_delivery_date?: string | null;
  }>;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/customer/orders`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Could not retrieve order history."
    };
  }
}

export async function getCustomerOrderDetail(token: string, orderNumber: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    id: number;
    order_number: string;
    status: string;
    subtotal: number;
    discount: number;
    tax: number;
    shipping_cost: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    payment_id: string | null;
    ship_name: string;
    ship_email: string;
    ship_phone: string;
    ship_alt_phone?: string | null;
    ship_address: string;
    ship_city: string;
    ship_state: string;
    ship_pincode: string;
    notes: string | null;
    courier_name?: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    dispatched_at?: string | null;
    estimated_delivery_date?: string | null;
    created_at: string;
    items: Array<{
      id: number;
      product_id: number;
      variant_id: number | null;
      name: string;
      price: number;
      quantity: number;
      image: string | null;
      size: string | null;
      color: string | null;
      variant_details: string | null;
      line_total: number;
      sku: string | null;
    }>;
    tracking: Array<{
      id: number;
      status: string;
      location: string | null;
      message: string | null;
      created_at: string;
    }>;
    returns: Array<{
      id: number;
      return_number: string;
      status: string;
      reason: string;
      pickup_courier_name?: string | null;
      pickup_tracking_number?: string | null;
      pickup_tracking_url?: string | null;
      pickup_scheduled_date?: string | null;
      requested_amount: number;
      approved_amount: number;
      requested_at: string | null;
      resolved_at: string | null;
    }>;
  };
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/customer/orders/${orderNumber}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Could not retrieve order details."
    };
  }
}

export async function requestCustomerOrderReturn(
  token: string,
  orderNumber: string,
  data: {
    reason: string;
    reason_detail?: string;
    refund_mode?: "wallet" | "original_payment";
    customer_notes?: string;
    items: Array<{
      product_id: number;
      variant_id?: number | null;
      quantity: number;
    }>;
    images?: string[];
  }
): Promise<{
  success: boolean;
  message: string;
  data?: {
    return_number: string;
    status: string;
    refund_mode?: string;
  };
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/customer/orders/${orderNumber}/returns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
      cache: "no-store"
    });

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Could not submit the return request."
    };
  }
}

export async function lookupOrderForReturn(data: {
  order_number: string;
  identifier: string;
}): Promise<{
  success: boolean;
  message: string;
  data?: {
    order_number: string;
    status: string;
    created_at?: string;
    subtotal: number;
    total_amount: number;
    ship_name: string;
    ship_email: string;
    ship_phone: string;
    is_return_eligible: boolean;
    items: Array<{
      id: number;
      product_id: number;
      variant_id?: number | null;
      name: string;
      quantity: number;
      price: number;
      image: string | null;
      size: string | null;
      color: string | null;
      sku: string | null;
    }>;
    existing_return?: {
      id: number;
      return_number: string;
      status: string;
      reason: string;
      customer_notes?: string | null;
      requested_items?: any[];
      requested_amount: number;
      approved_amount: number;
      admin_notes?: string | null;
      requested_at?: string | null;
      resolved_at?: string | null;
    } | null;
  };
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/returns/lookup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(data),
      cache: "no-store"
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Unable to lookup order for return."
    };
  }
}

export async function submitPublicOrderReturn(data: {
  order_number: string;
  identifier: string;
  reason: string;
  reason_detail?: string;
  refund_mode?: "wallet" | "original_payment";
  customer_notes?: string;
  items: Array<{
    product_id: number;
    variant_id?: number | null;
    quantity: number;
  }>;
  images?: string[];
}): Promise<{
  success: boolean;
  message: string;
  data?: {
    return_number: string;
    status: string;
    refund_mode?: string;
    requested_amount: number;
  };
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/returns/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(data),
      cache: "no-store"
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Could not submit return request."
    };
  }
}

export async function getBlogPosts(params: {
  category?: string;
  tag?: string;
  author?: string;
  search?: string;
  page?: number;
  per_page?: number;
} = {}): Promise<{
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: BlogPost[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}> {
  try {
    const url = new URL(`${API_BASE_URL}/blog/posts`);
    if (params.category) url.searchParams.append("category", params.category);
    if (params.tag) url.searchParams.append("tag", params.tag);
    if (params.author) url.searchParams.append("author", params.author);
    if (params.search) url.searchParams.append("search", params.search);
    if (params.page) url.searchParams.append("page", String(params.page));
    if (params.per_page) url.searchParams.append("per_page", String(params.per_page));

    const response = await fetch(url.toString(), {
      cache: "no-store", // Keep it fresh, or revalidate in background
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Could not retrieve blog posts.",
      data: {
        current_page: 1,
        data: [],
        first_page_url: "",
        from: 0,
        last_page: 1,
        last_page_url: "",
        next_page_url: null,
        path: "",
        per_page: 9,
        prev_page_url: null,
        to: 0,
        total: 0,
      },
    };
  }
}

export async function getBlogPost(slug: string): Promise<{
  success: boolean;
  message: string;
  data: BlogPost | null;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/posts/${slug}`, {
      cache: "no-store",
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Could not retrieve blog post details.",
      data: null,
    };
  }
}

export async function getBlogCategories(): Promise<{
  success: boolean;
  message: string;
  data: BlogCategory[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/categories`, {
      cache: "no-store",
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Could not retrieve blog categories.",
      data: [],
    };
  }
}

export async function getBlogTags(): Promise<{
  success: boolean;
  message: string;
  data: BlogTag[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/tags`, {
      cache: "no-store",
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Could not retrieve blog tags.",
      data: [],
    };
  }
}

export async function getBlogTag(slug: string): Promise<{
  success: boolean;
  message: string;
  data: BlogTag | null;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/tags/${slug}`, {
      cache: "no-store",
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Could not retrieve blog tag details.",
      data: null,
    };
  }
}

export async function getBlogAuthors(): Promise<{
  success: boolean;
  message: string;
  data: BlogAuthor[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/authors`, {
      cache: "no-store",
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Could not retrieve blog authors.",
      data: [],
    };
  }
}

export async function getBlogCategory(slug: string): Promise<{
  success: boolean;
  message: string;
  data: BlogCategory | null;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/categories/${slug}`, {
      cache: "no-store",
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Could not retrieve blog category details.",
      data: null,
    };
  }
}

export async function getBlogAuthor(slug: string): Promise<{
  success: boolean;
  message: string;
  data: BlogAuthor | null;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/authors/${slug}`, {
      cache: "no-store",
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Could not retrieve blog author details.",
      data: null,
    };
  }
}

export async function subscribeNewsletter(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong. Please try again later.",
    };
  }
}

export type ContactInquiryPayload = {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
};

export async function submitContactInquiry(data: ContactInquiryPayload): Promise<{
  success: boolean;
  message: string;
  inquiry_id?: number;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Unable to send message right now. Please call or WhatsApp us.",
    };
  }
}
