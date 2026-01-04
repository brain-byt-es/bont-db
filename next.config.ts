import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  env: {
    PRISMA_SCHEMA_VERSION: "1",
  },
  images: {
    qualities: [75, 100],
  },
};

export default nextConfig;
