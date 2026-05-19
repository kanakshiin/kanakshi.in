import type { Metadata } from "next";

import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { getCategories, getSettings } from "../lib/api";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecommerce Frontend",
  description: "Next.js storefront prepared for Vercel deployment."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories(8)]);
  const brandName = settings.site_name || "Ecommerce Frontend";

  return (
    <html lang="en">
      <body>
        <SiteHeader brandName={brandName} categories={categories} />
        {children}
        <SiteFooter categories={categories} settings={settings} />
      </body>
    </html>
  );
}
