import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "n1-bucket-s3.s3.sa-east-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "app-n1-bucket-s3.s3.sa-east-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  // Configuração do Turbopack para resolução de módulos
  turbopack: {
    resolveAlias: {
      "@": "./",
    },
    resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
};

export default nextConfig;