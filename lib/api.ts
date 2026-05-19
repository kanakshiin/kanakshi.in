import { referenceAssets } from "./reference-assets";
import { Category, Product, ProductListResponse, SiteSettings } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://ecombeckend.saaszo.in/api/v1";

const BACKEND_SITE_URL =
  process.env.NEXT_PUBLIC_BACKEND_SITE_URL ||
  process.env.BACKEND_SITE_URL ||
  "https://ecombeckend.saaszo.in";

const fallbackSettings: SiteSettings = {
  site_name: "Little Divinity",
  site_tagline: "Handcrafted brass decor, pooja accents, and meaningful gifting pieces.",
  site_currency_symbol: "₹",
  min_order_free_shipping: "499"
};

const fallbackCategories: Category[] = [
  { id: 1, parent_id: null, name: "God Idols", slug: "god-idols", image: referenceAssets.collections.godIdols },
  { id: 2, parent_id: null, name: "Wall Decor", slug: "wall-decor", image: referenceAssets.hero.wallDecor },
  { id: 3, parent_id: null, name: "Table Decor", slug: "table-decor", image: referenceAssets.productHighlights.frame },
  { id: 4, parent_id: null, name: "Pooja Decor", slug: "pooja-decor", image: referenceAssets.collections.poojaDecor },
  { id: 5, parent_id: null, name: "Home Kitchen", slug: "home-kitchen", image: referenceAssets.collections.homeKitchen },
  { id: 6, parent_id: null, name: "Gifting Edit", slug: "gifting-edit", image: referenceAssets.founderAndBrand.weddingGift }
];

const fallbackProducts: Product[] = [
  {
    id: 101,
    name: "Little Divinity Brass Decor Demo",
    slug: "little-divinity-brass-decor-demo",
    price: 11999,
    sale_price: 7999,
    effective_price: 7999,
    category_name: "Demo Product",
    short_desc: "A real product photo from your local collection so the storefront card can be checked visually.",
    description:
      "This demo product is added only to preview how real Little Divinity photography looks inside the current shop and product page design.",
    images: ["/demo-products/little-divinity-real-1.jpg"]
  },
  {
    id: 1,
    name: "Brass Protection Buddha",
    slug: "brass-protection-buddha",
    price: 14999,
    sale_price: 11499,
    effective_price: 11499,
    category_name: "Best Seller",
    short_desc: "An ornate brass centrepiece created to anchor meditation corners and entry consoles.",
    description:
      "Layered carving, rich antique finish, and a calm seated form make this a statement accent for gifting or everyday styling.",
    images: [referenceAssets.productHighlights.buddha]
  },
  {
    id: 2,
    name: "Vintage Floral Brass Photo Frame",
    slug: "vintage-brass-photo-frame",
    price: 17999,
    sale_price: 8599,
    effective_price: 8599,
    category_name: "Table Decor",
    short_desc: "A warm brass photo frame with floral detailing for sideboards, mandirs, and memory shelves.",
    description:
      "Designed for festive gifting and curated tabletops, this frame blends handcrafted texture with heirloom-inspired styling.",
    images: [referenceAssets.productHighlights.frame]
  },
  {
    id: 3,
    name: "Kalpavriksha Brass Wall Piece",
    slug: "kalpavriksha-brass-wall-piece",
    price: 14999,
    sale_price: 7499,
    effective_price: 7499,
    category_name: "Wall Decor",
    short_desc: "A symbolic wall piece crafted for dramatic living room and foyer styling.",
    description:
      "Its sculptural silhouette and deep finish help create a gallery-like wall story rooted in Indian craft vocabulary.",
    images: [referenceAssets.collections.homeDecor]
  },
  {
    id: 4,
    name: "Brass Yali Singhasan",
    slug: "brass-yali-singhasan",
    price: 9999,
    sale_price: 5999,
    effective_price: 5999,
    category_name: "Pooja Decor",
    short_desc: "A temple-inspired pedestal built to elevate pooja idols and ceremonial styling.",
    description:
      "Detailed yali forms, layered metalwork, and a compact display footprint make it ideal for festive arrangements.",
    images: [referenceAssets.productHighlights.throne]
  },
  {
    id: 5,
    name: "Superfine Shiva Idol",
    slug: "superfine-shiva-idol",
    price: 8999,
    sale_price: 4699,
    effective_price: 4699,
    category_name: "God Idols",
    short_desc: "A premium Shiva idol with denser carving and a display-ready antique brass finish.",
    description:
      "Crafted for sacred corners and statement consoles, this piece brings a stronger festive-storefront presence.",
    images: [referenceAssets.productHighlights.superfineShiva]
  },
  {
    id: 6,
    name: "Peacock Brass Accent",
    slug: "peacock-brass-accent",
    price: 12999,
    sale_price: 7899,
    effective_price: 7899,
    category_name: "Home Decor",
    short_desc: "An ornate peacock sculpture designed for sideboards, foyers, and premium gifting moments.",
    description:
      "The jewel-toned detailing and elevated silhouette give this piece a richer handcrafted decor personality.",
    images: [referenceAssets.productHighlights.peacock]
  },
  {
    id: 7,
    name: "Brass Candle Stand Pair",
    slug: "brass-candle-stand-pair",
    price: 9999,
    sale_price: 6299,
    effective_price: 6299,
    category_name: "Table Decor",
    short_desc: "Tall brass candle stands suited to festive dining tables and layered living-room styling.",
    description:
      "Balanced proportions and carved details make this pair feel giftable, decorative, and occasion-ready.",
    images: [referenceAssets.productHighlights.candleStand]
  },
  {
    id: 8,
    name: "Brass Wall Elephant",
    slug: "brass-wall-elephant",
    price: 7599,
    sale_price: 4899,
    effective_price: 4899,
    category_name: "Wall Decor",
    short_desc: "A dramatic elephant wall accent for gallery walls, entryways, and conversation corners.",
    description:
      "Its carved texture and sculptural profile create a denser wall story without feeling overpowering.",
    images: [referenceAssets.hero.wallDecor]
  },
  {
    id: 9,
    name: "Wooden Spice Box",
    slug: "wooden-spice-box",
    price: 5999,
    sale_price: 3499,
    effective_price: 3499,
    category_name: "Home Kitchen",
    short_desc: "A handcrafted wooden masala box that blends utility with gifting-led styling.",
    description:
      "Built for warm kitchens and heritage-inspired tabletops, it adds texture, function, and retail appeal.",
    images: [referenceAssets.collections.homeKitchen]
  },
  {
    id: 10,
    name: "Brass Pooja Thali Set",
    slug: "brass-pooja-thali-set",
    price: 6999,
    sale_price: 4299,
    effective_price: 4299,
    category_name: "Pooja Decor",
    short_desc: "A coordinated pooja thali set for ceremonies, gifting hampers, and devotional styling.",
    description:
      "The curated set format makes it ideal for festive shopping pages and more complete ritual displays.",
    images: [referenceAssets.collections.poojaDecor]
  },
  {
    id: 11,
    name: "Handcrafted Gift Hamper Accent",
    slug: "handcrafted-gift-hamper-accent",
    price: 8499,
    sale_price: 5799,
    effective_price: 5799,
    category_name: "Gifting Edit",
    short_desc: "A warm handcrafted decor piece selected for festive hampers and premium gifting bundles.",
    description:
      "Made to feel elevated yet versatile, this piece helps the shop grid look fuller and more curated.",
    images: [referenceAssets.founderAndBrand.weddingGift]
  },
  {
    id: 12,
    name: "Wooden Mandir Decor Panel",
    slug: "wooden-mandir-decor-panel",
    price: 10999,
    sale_price: 6999,
    effective_price: 6999,
    category_name: "Wooden Collection",
    short_desc: "A wooden decorative panel with ceremonial warmth for pooja walls and gifting stories.",
    description:
      "The layered handcrafted finish helps balance spiritual styling with a stronger premium decor presence.",
    images: [referenceAssets.founderAndBrand.woodenDecor]
  }
];

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Accept: "application/json"
      },
      next: {
        revalidate: 120
      }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function resolveAssetUrl(path?: string | null): string {
  if (!path) {
    return "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return path;
  }

  return `${BACKEND_SITE_URL}/${path.replace(/^\/+/, "")}`;
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

export function getPrimaryImage(product: Product): string {
  const [firstImage] = parseProductImages(product.images);
  return resolveAssetUrl(firstImage || null);
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
  const payload = await fetchJson<{ data?: SiteSettings }>("/settings/public");
  return payload?.data && Object.keys(payload.data).length > 0 ? payload.data : fallbackSettings;
}

export async function getCategories(limit = 8): Promise<Category[]> {
  const payload = await fetchJson<{ data?: Category[] }>(`/catalog/categories?limit=${limit}`);
  return payload?.data?.length ? payload.data : fallbackCategories.slice(0, limit);
}

export async function getProducts(query = ""): Promise<ProductListResponse> {
  const payload = await fetchJson<{ data?: ProductListResponse }>(`/catalog/products${query ? `?${query}` : ""}`);
  const items = payload?.data?.items?.length ? payload.data.items : fallbackProducts;
  const mergedItems =
    items.length >= 8 ? items : [...items, ...fallbackProducts.filter((product) => !items.some((item) => item.slug === product.slug))];

  return (
    (payload?.data && {
      ...payload.data,
      items: mergedItems
    }) || {
      items: mergedItems,
      pagination: {
        current_page: 1,
        per_page: mergedItems.length,
        total: mergedItems.length,
        last_page: 1
      }
    }
  );
}

export async function getProduct(slug: string): Promise<Product | null> {
  const payload = await fetchJson<{ data?: Product }>(`/catalog/products/${slug}`);
  return payload?.data || fallbackProducts.find((product) => product.slug === slug) || null;
}

export async function getHomePageData() {
  const [settings, categories, featuredProducts, newestProducts] = await Promise.all([
    getSettings(),
    getCategories(8),
    getProducts("featured=1&per_page=8&sort=popular"),
    getProducts("per_page=4&sort=newest")
  ]);

  return {
    settings,
    categories,
    featuredProducts: featuredProducts.items,
    newestProducts: newestProducts.items
  };
}
