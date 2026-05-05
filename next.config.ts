import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow images from external sources if needed
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'kpjhealth.com.my' },
    ],
  },
}

export default nextConfig
