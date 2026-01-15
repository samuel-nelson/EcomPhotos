/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.photoroom.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
