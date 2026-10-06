import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // As fotos já vêm otimizadas pelos CDNs do Grupo Boticário (Cloudinary / sgi).
    unoptimized: true,
  },
};

export default nextConfig;
