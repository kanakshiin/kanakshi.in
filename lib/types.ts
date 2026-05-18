export type SiteSettings = {
  site_name?: string;
  site_tagline?: string;
  site_email?: string;
  site_phone?: string;
  site_currency_symbol?: string;
  min_order_free_shipping?: string;
};

export type Category = {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  short_desc?: string | null;
  images?: string[] | string | null;
  price: number | string;
  sale_price?: number | string | null;
  effective_price?: number | string;
  category_name?: string | null;
  category_slug?: string | null;
  avg_rating?: number | string | null;
  review_count?: number | string | null;
  is_featured?: boolean;
};

export type ProductListResponse = {
  items: Product[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};
