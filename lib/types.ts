export type SiteSettings = {
  site_name?: string;
  site_tagline?: string;
  business_name?: string | null;
  business_email?: string | null;
  business_phone?: string | null;
  support_email?: string | null;
  support_phone?: string | null;
  whatsapp_number?: string | null;
  site_email?: string;
  site_phone?: string;
  default_shipping_cost?: string | number;
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
  google_tag_manager_id?: string | null;
  facebook_pixel_id?: string | null;
  seasonal_campaign_name?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image?: string | null;
  twitter_handle?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  invoice_footer_note?: string | null;
  footer_copyright_text?: string | null;
  show_logo_on_invoice?: boolean;
  custom_header_scripts?: string | null;
  custom_footer_scripts?: string | null;
  show_topbar?: boolean;
  topbar_bg_color?: string | null;
  topbar_text_color?: string | null;
  topbar_offers?: string[];
  payment_gateways?: PaymentGatewayPublic[];
  registry_allow_buyback?: boolean;
  registry_warranty_duration_months?: number;
  registry_allowed_sources?: string[];
  registry_allowed_upload_size_mb?: number;
  registry_allowed_file_types?: string[];
  registry_auto_verify_website_orders?: boolean;
};

export type PaymentGatewayPublic = {
  provider: "cod" | "razorpay" | "phonepe" | "paytm" | string;
  display_name: string;
  is_test_mode?: boolean;
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
  weight?: number | string | null;
  weight_unit?: string | null;
  length?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;
  dimension_unit?: string | null;
  size_label?: string | null;
  material?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  meta_title?: string | null;
  meta_desc?: string | null;
  custom_schema?: string | null;
  avg_rating?: number | string | null;
  review_count?: number | string | null;
  is_featured?: boolean;
  is_sellable?: boolean;
  shipping_type?: "default" | "custom" | "free" | string | null;
  shipping_fee?: number | string | null;
  amazon_link?: string | null;
  amazon_button_enabled?: boolean;
  amazon_price?: number | string | null;
  amazon_price_fetched_at?: string | null;
};

export type ProductReview = {
  id: number;
  rating: number;
  comment: string;
  images: string[];
  is_verified_purchase: boolean;
  customer_name: string;
  created_at?: string | null;
  is_published?: boolean;
  published_at?: string | null;
  moderated_at?: string | null;
};

export type ProductReviewEligibility = {
  is_authenticated: boolean;
  has_purchased: boolean;
  can_submit: boolean;
  reason?: string | null;
};

export type ProductReviewFeed = {
  summary: {
    avg_rating: number;
    review_count: number;
    rating_breakdown: Record<string, number> | Record<number, number>;
  };
  items: ProductReview[];
  eligibility: ProductReviewEligibility;
  viewer_review?: ProductReview | null;
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
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  email_verified_at?: string | null;
  role?: string;
};

export type CustomerAddress = {
  id: number;
  type: "home" | "office" | "other";
  label?: string | null;
  recipient_name: string;
  phone?: string | null;
  alternate_phone?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark?: string | null;
  is_default: boolean;
  created_at?: string | null;
  updated_at?: string | null;
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

export type BlogAuthor = {
  id: number;
  name: string;
  slug: string;
  bio?: string | null;
  avatar?: string | null;
  avatar_alt?: string | null;
  twitter_handle?: string | null;
  posts_count?: number;
};

export type BlogCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  posts_count?: number;
};

export type BlogTag = {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  blog_author_id?: number | null;
  blog_category_id?: number | null;
  status: "draft" | "scheduled" | "published";
  published_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image?: string | null;
  primary_keyword?: string | null;
  secondary_keywords?: string | null;
  reading_time?: number | null;
  seo_noindex?: boolean;
  seo_nofollow?: boolean;
  schema_type?: "BlogPosting" | "Article" | "NewsArticle";
  faq_json?: Array<{ question: string; answer: string }> | null;
  related_products_json?: number[] | null;
  author?: BlogAuthor | null;
  category?: BlogCategory | null;
  tags?: BlogTag[];
  created_at: string;
  updated_at: string;
  related_products?: Product[];
  related_posts?: BlogPost[];
};
