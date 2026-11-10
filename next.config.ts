import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // End-to-end tests run their own server alongside `pnpm dev`, so they need their own build folder
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  devIndicators: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default withPayload(nextConfig)
