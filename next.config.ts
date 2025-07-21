import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {   
    unoptimized: true,
  },
  noimplicitAny: true,  
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },    
  eslint: {
    ignoreDuringBuilds: true,
  },  
  output: "export",   
  // else  
  reactStrictMode: false,
};

export default nextConfig;  