import type { Metadata } from "next";

import { Product, SiteSettings } from "./types";

const fallbackSiteUrl = "https://littledivinity.in";
const fallbackSiteName = "Little Divinity";
const fallbackSiteDescription =
  "Handcrafted brass decor, pooja accents, and meaningful gifting pieces for home styling and festive gifting.";

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
  return settings?.site_tagline || fallbackSiteDescription;
}

export function getCanonicalUrl(pathname = "/", settings?: SiteSettings | null): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getSiteUrl(settings)}${path}`;
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

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
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
      title: siteName,
      description
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description
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
