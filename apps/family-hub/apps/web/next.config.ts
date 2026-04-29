import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,

  async headers() {
    return [
      {
        // Assets versionnés (hash dans le nom) — immutable, 1 an
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Fichiers publics statiques (icons, manifest, sw)
        source: "/:path*\\.(ico|png|webp|svg|woff|woff2|manifest)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
