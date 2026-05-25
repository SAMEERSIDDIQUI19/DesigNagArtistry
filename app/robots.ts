import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/api/",
          "/cart",
          "/checkout",
          "/order-success",
          "/login",
          "/register",
          "/track-order",
        ],
      },
    ],
    sitemap: "https://www.designagartistry.com/sitemap.xml",
  };
}
