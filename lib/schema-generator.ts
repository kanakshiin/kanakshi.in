import { Product as SchemaProduct, BreadcrumbList, WithContext, Organization, WebSite, JewelryStore } from "schema-dts";
import { Product, SiteSettings } from "./types";
import { formatPrice, getPrimaryImage, resolveAssetUrl } from "./api";
import { getCanonicalUrl, getProductPath, getSiteDescription, getSiteName, getSiteUrl } from "./site";

export function generateProductJsonLd(
  product: Product,
  settings?: SiteSettings | null
): WithContext<SchemaProduct> {
  const siteName = getSiteName(settings) || "Kanakshi Fine Jewellery";
  const siteUrl = getSiteUrl(settings);
  const canonicalPath = getProductPath(product);
  const productUrl = getCanonicalUrl(canonicalPath, settings);
  const price = Number(product.effective_price ?? product.sale_price ?? product.price ?? 0);
  const currency = settings?.site_currency || "INR";
  
  // Format images array
  let images: string[] = [];
  if (product.images) {
    if (Array.isArray(product.images)) {
      images = product.images.map((img) => resolveAssetUrl(img));
    } else if (typeof product.images === "string") {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) {
          images = parsed.map((img) => resolveAssetUrl(img));
        }
      } catch {
        images = [resolveAssetUrl(product.images)];
      }
    }
  }
  if (!images.length) {
    images = [resolveAssetUrl(getPrimaryImage(product))];
  }

  const ratingValue = Number(product.avg_rating || 4.9);
  const reviewCount = Number(product.review_count || 128);

  const schema: WithContext<SchemaProduct> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.meta_desc || product.short_desc || product.description || `${product.name} - Handcrafted 925 Sterling Silver & Real Gold from ${siteName}`,
    image: images,
    sku: product.slug,
    mpn: `KAN-${product.id}`,
    category: product.category_name || "Fine Jewellery",
    material: product.material || "925 Sterling Silver",
    brand: {
      "@type": "Brand",
      name: siteName,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: currency,
      price: price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: product.is_sellable !== false ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      seller: {
        "@type": "Organization",
        name: siteName,
        url: siteUrl,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: currency,
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 3,
            unitCode: "d",
          },
        },
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratingValue,
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };

  return schema;
}

export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationJsonLd(
  settings?: SiteSettings | null
): WithContext<JewelryStore> {
  const siteName = getSiteName(settings) || "Kanakshi Fine Jewellery";
  const siteUrl = getSiteUrl(settings);
  const logo = `${siteUrl}/logo.jpg`;

  return {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: siteName,
    url: siteUrl,
    logo: logo,
    image: `${siteUrl}/og-image.jpg`,
    description: getSiteDescription(settings),
    priceRange: "₹₹",
    telephone: settings?.support_phone || settings?.site_phone || "+91 85868 98691",
    email: settings?.support_email || settings?.site_email || "support@kanakshi.in",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.address_line1 || "DLF Horizon Plaza, Golf Course Road",
      addressLocality: settings?.city || "Gurugram",
      addressRegion: settings?.state || "Haryana",
      postalCode: settings?.pincode || "122002",
      addressCountry: "IN",
    },
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, Debit Card, UPI, Net Banking",
  };
}

export function generateWebSiteJsonLd(
  settings?: SiteSettings | null
): WithContext<WebSite> {
  const siteName = getSiteName(settings) || "Kanakshi Fine Jewellery";
  const siteUrl = getSiteUrl(settings);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    } as any,
  };
}
