import type { Metadata } from "next";

import { Product, SiteSettings } from "./types";

const fallbackSiteUrl = "https://littledivinity.in";
const fallbackSiteName = "Little Divinity";
const fallbackSiteDescription =
  "Handcrafted brass decor, pooja accents, and meaningful gifting pieces for home styling and festive gifting.";
const fallbackBackendSiteUrl =
  process.env.NEXT_PUBLIC_BACKEND_SITE_URL ||
  process.env.BACKEND_SITE_URL ||
  "https://ecombeckend.saaszo.in";

function normalizeUrl(value?: string | null): string {
  const raw =
    value ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    fallbackSiteUrl;

  const withProtocol = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

export function getSiteUrl(settings?: SiteSettings | null): string {
  return normalizeUrl(settings?.custom_domain);
}

export function getSiteName(settings?: SiteSettings | null): string {
  return settings?.site_name || fallbackSiteName;
}

export function getSiteDescription(settings?: SiteSettings | null): string {
  return settings?.meta_description || settings?.site_tagline || fallbackSiteDescription;
}

export function getCanonicalUrl(pathname = "/", settings?: SiteSettings | null): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getSiteUrl(settings)}${path}`;
}

export function getAbsoluteMediaUrl(
  path?: string | null,
  settings?: SiteSettings | null
): string | null {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const backendBaseUrl = fallbackBackendSiteUrl.replace(/\/+$/, "");

  if (path.startsWith("/storage/")) {
    return `${backendBaseUrl}${path}`;
  }

  if (path.startsWith("storage/")) {
    return `${backendBaseUrl}/${path}`;
  }

  const siteUrl = getSiteUrl(settings);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

export function getProductPath(product: Pick<Product, "slug" | "category_slug">): string {
  if (product.category_slug) {
    return `/shop/${product.category_slug}/${product.slug}`;
  }

  return `/product/${product.slug}`;
}

export function getProductRenderKey(product: Product): string {
  return product.slug || `${product.id}-${product.name}`;
}

export function buildStoreMetadata(settings?: SiteSettings | null): Metadata {
  const siteName = getSiteName(settings);
  const description = getSiteDescription(settings);
  const siteUrl = getSiteUrl(settings);
  const title = settings?.meta_title || siteName;
  const ogTitle = settings?.og_title || settings?.meta_title || siteName;
  const ogDescription = settings?.og_description || description;
  const ogImage = getAbsoluteMediaUrl(settings?.og_image || settings?.logo_url, settings) || `${siteUrl}/logo.jpg`;
  const twitterTitle = settings?.twitter_title || settings?.og_title || settings?.meta_title || siteName;
  const twitterDescription = settings?.twitter_description || settings?.og_description || description;
  const twitterImage = getAbsoluteMediaUrl(settings?.twitter_image || settings?.og_image || settings?.logo_url, settings) || ogImage;
  const twitterHandle = settings?.twitter_handle?.trim() || undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`
    },
    description,
    applicationName: siteName,
    alternates: {
      canonical: "/"
    },
    keywords: [
      "brass decor",
      "god idols",
      "pooja decor",
      "home decor",
      "festive gifting",
      "wooden collection",
      siteName
    ],
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName,
      title: ogTitle,
      description: ogDescription,
      images: [
        {
          url: ogImage,
          alt: settings?.seasonal_campaign_name || siteName
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      images: [twitterImage],
      site: twitterHandle,
      creator: twitterHandle
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1
      }
    }
  };
}
