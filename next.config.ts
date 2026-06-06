import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
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
