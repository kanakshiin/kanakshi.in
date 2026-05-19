import type { Metadata } from "next";
import { Josefin_Sans, Manrope } from "next/font/google";

import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { getCategories, getSettings } from "../lib/api";
import "./globals.css";

const headingFont = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading"
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
  const [settings, categories] = await Promise.all([getSettings(), getCategories(8)]);
  const brandName = settings.site_name || "Little Divinity";

  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <SiteHeader brandName={brandName} categories={categories} />
        {children}
        <SiteFooter categories={categories} settings={settings} />
      </body>
    </html>
  );
}
