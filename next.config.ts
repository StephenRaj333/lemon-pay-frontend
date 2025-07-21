import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["flowbite.com","res.cloudinary.com"], // Add the domain here  
    unoptimized: true,
  },
  output: "export",
  rules: {
    'react/no-unescaped-entities': 'off',
    '@next/next/no-page-custom-font': 'off',
  },  
  // else  
  reactStrictMode: false,
};

export default nextConfig;  