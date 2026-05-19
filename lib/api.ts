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
  { id: 1, parent_id: null, name: "God Idols", slug: "god-idols", image: null },
  { id: 2, parent_id: null, name: "Wall Decor", slug: "wall-decor", image: null },
  { id: 3, parent_id: null, name: "Table Decor", slug: "table-decor", image: null },
  { id: 4, parent_id: null, name: "Pooja Decor", slug: "pooja-decor", image: null },
  { id: 5, parent_id: null, name: "Home Kitchen", slug: "home-kitchen", image: null },
  { id: 6, parent_id: null, name: "Gifting Edit", slug: "gifting-edit", image: null }
];

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Brass Protection Buddha",
    slug: "brass-protection-buddha",
    price: 14999,
    sale_price: 11499,
    effective_price: 11499,
    category_name: "Best Seller",
    images: []
  },
  {
    id: 2,
    name: "Vintage Floral Brass Photo Frame",
    slug: "vintage-brass-photo-frame",
    price: 17999,
    sale_price: 8599,
    effective_price: 8599,
    category_name: "Table Decor",
    images: []
  },
  {
    id: 3,
    name: "Kalpavriksha Brass Wall Piece",
    slug: "kalpavriksha-brass-wall-piece",
    price: 14999,
    sale_price: 7499,
    effective_price: 7499,
    category_name: "Wall Decor",
    images: []
  },
  {
    id: 4,
    name: "Brass Yali Singhasan",
    slug: "brass-yali-singhasan",
    price: 9999,
    sale_price: 5999,
    effective_price: 5999,
    category_name: "Pooja Decor",
    images: []
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
  return (
    payload?.data || {
      items: fallbackProducts,
      pagination: {
        current_page: 1,
        per_page: fallbackProducts.length,
        total: fallbackProducts.length,
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
