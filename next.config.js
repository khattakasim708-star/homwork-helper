/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // enables static export for Pages
  experimental: {
    appDir: true,
  },
  images: {
    unoptimized: true, // Cloudflare Pages doesn't need next/image optimization
  },
};

module.exports = nextConfig;
