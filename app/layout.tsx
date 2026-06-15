import { Josefin_Sans } from "next/font/google";
import Script from "next/script";

import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { StructuredData } from "../components/structured-data";
import { CartProvider } from "../components/cart-provider";
import { WishlistProvider } from "../components/wishlist-provider";
import { FloatingWhatsappWidget } from "../components/floating-whatsapp-widget";
import { AddToCartPopup } from "../components/add-to-cart-popup";
import { getLayoutData } from "../lib/api";
import { buildStoreMetadata, getAbsoluteMediaUrl, getSiteDescription, getSiteName, getSiteUrl } from "../lib/site";
import "./globals.css";

function BodyHtmlSnippet({ html }: { html?: string | null }) {
  if (!html || html.trim() === "") {
    return null;
  }

  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}

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
  const { settings, categories, headerMenu, mobileMenu, footerMenu, socialLinks } = await getLayoutData();
  const brandName = getSiteName(settings);
  const siteUrl = getSiteUrl(settings);
  const siteDescription = getSiteDescription(settings);
  const gtmId = settings.google_tag_manager_id?.trim() || "";
  const pixelId = settings.facebook_pixel_id?.trim() || "";
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.business_name || brandName,
    url: siteUrl,
    logo: getAbsoluteMediaUrl(settings.logo_url, settings) || `${siteUrl}/logo.jpg`,
    email: settings.support_email || settings.site_email || undefined,
    telephone: settings.support_phone || settings.site_phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address_line1 || undefined,
      addressLocality: settings.city || undefined,
      addressRegion: settings.state || undefined,
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
        {gtmId && (
          <Script
            id="gtm-base"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`,
            }}
          />
        )}
        {pixelId && (
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(pixelId)});
fbq('track', 'PageView');`,
            }}
          />
        )}
      </head>
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {pixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}
        <BodyHtmlSnippet html={settings.custom_header_scripts} />
        <CartProvider>
          <WishlistProvider>
            <StructuredData data={[organizationJsonLd, websiteJsonLd]} />
            <SiteHeader
              brandName={brandName}
              logoUrl={settings.logo_url}
              categories={categories}
              menuItems={headerMenu}
              mobileMenuItems={mobileMenu}
              settings={settings}
            />
            {children}
            <SiteFooter categories={categories} settings={settings} footerMenu={footerMenu} socialLinks={socialLinks} />
            <FloatingWhatsappWidget phone={settings.whatsapp_number || settings.site_phone || "919999999999"} />
            <AddToCartPopup />
          </WishlistProvider>
        </CartProvider>
        <BodyHtmlSnippet html={settings.custom_footer_scripts} />
      </body>
    </html>
  );
}
