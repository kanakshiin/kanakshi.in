import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
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
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from "../lib/schema-generator";
import "./globals.css";

function BodyHtmlSnippet({ html }: { html?: string | null }) {
  if (!html || html.trim() === "") {
    return null;
  }

  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading"
});

const bodyFont = Plus_Jakarta_Sans({
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
  const organizationJsonLd = generateOrganizationJsonLd(settings);
  const websiteJsonLd = generateWebSiteJsonLd(settings);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" sizes="180x180" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="manifest" href="/site.webmanifest?v=2" />
        <meta name="theme-color" content="#e9718b" />
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
