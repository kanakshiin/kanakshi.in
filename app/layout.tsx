import type { Metadata } from "next";

import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { getSettings } from "../lib/api";
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
  const settings = await getSettings();
  const brandName = settings.site_name || "Ecommerce Frontend";

  return (
    <html lang="en">
      <body>
        <SiteHeader brandName={brandName} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
