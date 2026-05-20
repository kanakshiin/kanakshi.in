import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";

import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { getLayoutData } from "../lib/api";
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

export const metadata: Metadata = {
  title: "Little Divinity",
  description: "Premium brass decor and gifting storefront powered by a reusable ecommerce API."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings, categories, headerMenu, footerMenu, socialLinks } = await getLayoutData();
  const brandName = settings.site_name || "Little Divinity";

  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <SiteHeader brandName={brandName} logoUrl={settings.logo_url} categories={categories} menuItems={headerMenu} />
        {children}
        <SiteFooter categories={categories} settings={settings} footerMenu={footerMenu} socialLinks={socialLinks} />
      </body>
    </html>
  );
}
