/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // allows static export
  experimental: {
    appDir: true
  },
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig;
