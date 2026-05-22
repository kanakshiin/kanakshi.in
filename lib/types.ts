export type SiteSettings = {
  site_name?: string;
  site_tagline?: string;
  site_email?: string;
  site_phone?: string;
  privacy_policy?: string | null;
  terms_conditions?: string | null;
  return_policy?: string | null;
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
  footer_copyright_text?: string | null;
  show_topbar?: boolean;
  topbar_bg_color?: string | null;
  topbar_text_color?: string | null;
  topbar_offers?: string[];
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
  bullet_points?: string[] | string | null;
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

export type Coupon = {
  id: number;
  title: string;
  code: string;
  type: string;
  value: number | string;
  min_order_amount?: number | string | null;
  description?: string | null;
  badge_text?: string | null;
};

export type CustomerUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  email_verified_at?: string | null;
  role?: string;
};

export type CustomerAuthConfig = {
  email_verification_enabled: boolean;
  mobile_verification_enabled: boolean;
  email_otp_enabled: boolean;
  sms_otp_enabled: boolean;
  whatsapp_otp_enabled: boolean;
  default_otp_channel: "email" | "sms" | "whatsapp";
  otp_length: number;
  otp_expiry_minutes: number;
  resend_wait_seconds: number;
  customer_email_active: boolean;
};
