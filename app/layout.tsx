import { Josefin_Sans } from "next/font/google";

import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { StructuredData } from "../components/structured-data";
import { CartProvider } from "../components/cart-provider";
import { WishlistProvider } from "../components/wishlist-provider";
import { FloatingWhatsappWidget } from "../components/floating-whatsapp-widget";
import { getLayoutData } from "../lib/api";
import { buildStoreMetadata, getSiteDescription, getSiteName, getSiteUrl } from "../lib/site";
import "./globals.css";

const headingFont = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading"
});

const bodyFont = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

export async function generateMetadata() {
  const { settings } = await getLayoutData();
  return buildStoreMetadata(settings);
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings, categories, headerMenu, footerMenu, socialLinks } = await getLayoutData();
  const brandName = getSiteName(settings);
  const siteUrl = getSiteUrl(settings);
  const siteDescription = getSiteDescription(settings);
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brandName,
    url: siteUrl,
    logo: settings.logo_url
      ? `${siteUrl}${settings.logo_url.startsWith("/") ? settings.logo_url : `/${settings.logo_url}`}`
      : `${siteUrl}/logo.jpg`,
    email: settings.site_email || undefined,
    telephone: settings.site_phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address_line1 || undefined,
      addressLocality: settings.city || undefined,
      postalCode: settings.pincode || undefined,
      addressCountry: settings.country || "IN"
    }
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brandName,
    url: siteUrl,
    description: siteDescription
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://checkout.razorpay.com" />
      </head>
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <CartProvider>
          <WishlistProvider>
            <StructuredData data={[organizationJsonLd, websiteJsonLd]} />
            <SiteHeader brandName={brandName} logoUrl={settings.logo_url} categories={categories} menuItems={headerMenu} settings={settings} />
            {children}
            <SiteFooter categories={categories} settings={settings} footerMenu={footerMenu} socialLinks={socialLinks} />
            <FloatingWhatsappWidget phone={settings.site_phone || "919999999999"} />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
