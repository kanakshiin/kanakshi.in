/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://kanakshi.in",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 7000,
  exclude: [
    "/admin",
    "/admin/*",
    "/account",
    "/account/*",
    "/checkout",
    "/checkout/*",
    "/cart",
    "/api/*"
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/account", "/checkout", "/api/*"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/jewellery/*", "/images/*", "/*.jpg", "/*.png", "/*.svg"],
      },
    ],
    additionalSitemaps: [
      "https://kanakshi.in/sitemap.xml",
      "https://kanakshi.in/api/google-shopping-feed"
    ],
  },
};
