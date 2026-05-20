export type SiteSettings = {
  site_name?: string;
  site_tagline?: string;
  site_email?: string;
  site_phone?: string;
  site_currency_symbol?: string;
  site_currency?: string;
  min_order_free_shipping?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  custom_domain?: string;
  logo_url?: string | null;
  favicon_url?: string | null;
};

export type NavigationItem = {
  id: number;
  location?: "header" | "footer" | "mobile";
  title: string;
  url: string;
  target?: string;
  icon?: string | null;
  css_class?: string | null;
  sort_order?: number;
  config?: Record<string, unknown> | null;
  children?: NavigationItem[];
};

export type SocialLink = {
  id: number;
  platform: string;
  title?: string | null;
  handle?: string | null;
  url?: string | null;
  icon?: string | null;
  sort_order?: number;
};

export type HomepageSection = {
  id: number;
  section_key: string;
  section_type?: string;
  label?: string | null;
  title?: string | null;
  subtitle?: string | null;
  heading?: string | null;
  content?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  image_url?: string | null;
  mobile_image_url?: string | null;
  side_image_url?: string | null;
  side_secondary_image_url?: string | null;
  config?: Record<string, unknown> | null;
  sort_order?: number;
  is_active?: boolean;
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
  meta_title?: string | null;
  meta_desc?: string | null;
  custom_schema?: string | null;
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
