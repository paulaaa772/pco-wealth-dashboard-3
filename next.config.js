/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    NEXT_PUBLIC_POLYGON_API_KEY: 'B2IYP3Pd1DdpKo9XSIkoQVlzp1sdDNHK'
  },
  // Ensure environment variables are available at build time
  publicRuntimeConfig: {
    NEXT_PUBLIC_POLYGON_API_KEY: process.env.NEXT_PUBLIC_POLYGON_API_KEY,
  },
}

module.exports = nextConfig
