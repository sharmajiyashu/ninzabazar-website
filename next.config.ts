import type { NextConfig } from 'next'
import path from 'path'
import { ROUTES } from './src/lib/routes/paths'

const nextConfig: NextConfig = {
  // Fix PM2/build when another package-lock.json exists in parent folders on server
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      {
        source: ROUTES.seller.home,
        destination: ROUTES.seller.dashboard,
        permanent: true,
      },
      {
        source: '/seller/orders',
        destination: ROUTES.seller.sales,
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // for dev
      },
      {
        protocol: 'https',
        hostname: 'example.com', // for dev
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // for Google profile images
      },
      {
        protocol: 'https',
        hostname: 'bghqdupqpzsstmilyzas.supabase.co', // for product images from supabase DEV
      },
      {
        protocol: 'https',
        hostname: 'sbvnhnztaqoskkmnbbnu.supabase.co', // for product images from supabase PROD
      },
      {
        protocol: 'https',
        hostname: 'oyvvcjxvyrgxtbxfkurc.supabase.co', // for product images from supabase
      },
    ],
  },
}

export default nextConfig
