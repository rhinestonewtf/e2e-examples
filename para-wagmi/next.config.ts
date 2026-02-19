import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@getpara/web-sdk", "@getpara/react-sdk"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
