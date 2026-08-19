import { NextResponse } from "next/server";
import { getProducts, getSettings, getPrimaryImage, resolveAssetUrl, parseProductImages } from "../../../lib/api";
import { getCanonicalUrl, getProductPath, getSiteName, getSiteUrl } from "../../../lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // revalidate every 1 hour

export async function GET() {
  try {
    const [settings, productsResponse] = await Promise.all([
      getSettings(),
      getProducts("per_page=1000&sort=newest"),
    ]);

    const siteUrl = getSiteUrl(settings);
    const siteName = getSiteName(settings) || "Kanakshi Fine Jewellery";
    const currency = settings.site_currency || "INR";

    const escapeXml = (unsafe: string | null | undefined) => {
      if (!unsafe) return "";
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    let itemsXml = "";

    for (const product of productsResponse.items) {
      const productPath = getProductPath(product);
      const productLink = getCanonicalUrl(productPath, settings);
      const primaryImg = resolveAssetUrl(getPrimaryImage(product));
      const fullImgUrl = primaryImg.startsWith("http") ? primaryImg : `${siteUrl}${primaryImg.startsWith("/") ? primaryImg : `/${primaryImg}`}`;

      const price = Number(product.price || 0);
      const effectivePrice = Number(product.effective_price ?? product.sale_price ?? price);
      const hasDiscount = effectivePrice < price && effectivePrice > 0;
      const isAvailable = product.is_sellable !== false;

      // Additional images
      const extraImages = parseProductImages(product.images)
        .slice(1, 10)
        .map((img) => {
          const res = resolveAssetUrl(img);
          const full = res.startsWith("http") ? res : `${siteUrl}${res.startsWith("/") ? res : `/${res}`}`;
          return `<g:additional_image_link>${escapeXml(full)}</g:additional_image_link>`;
        })
        .join("\n        ");

      itemsXml += `
    <item>
      <g:id>KAN-${product.id}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(product.meta_desc || product.short_desc || product.description || product.name)}</g:description>
      <g:link>${escapeXml(productLink)}</g:link>
      <g:image_link>${escapeXml(fullImgUrl)}</g:image_link>
      ${extraImages ? `\n      ${extraImages}` : ""}
      <g:availability>${isAvailable ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${price.toFixed(2)} ${currency}</g:price>
      ${hasDiscount ? `<g:sale_price>${effectivePrice.toFixed(2)} ${currency}</g:sale_price>` : ""}
      <g:brand>${escapeXml(siteName)}</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>188</g:google_product_category>
      <g:product_type>${escapeXml(product.category_name || "Fine Jewellery")}</g:product_type>
      <g:material>${escapeXml(product.material || "925 Sterling Silver")}</g:material>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Express Insured Delivery</g:service>
        <g:price>0.00 ${currency}</g:price>
      </g:shipping>
    </item>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(siteName)} - Google Merchant Center Product Feed</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Official Google Shopping Feed for ${escapeXml(siteName)} (Everyday Luxury 925 Sterling Silver, 18K Real Gold &amp; Certified Lab Diamonds)</description>
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml.trim(), {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title></channel></rss>`,
      { status: 500, headers: { "Content-Type": "application/xml" } }
    );
  }
}
