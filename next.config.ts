import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "n1-bucket-s3.s3.sa-east-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  // Turbopack usa a configuração do tsconfig.json para aliases
  // Não é necessário configurar webpack no Next.js 16 com Turbopack
};

export default nextConfig;
