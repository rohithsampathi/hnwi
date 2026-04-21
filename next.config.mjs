let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // StrictMode intentionally re-runs Effects in development, which can flood
  // this client-heavy app with duplicate authenticated fetches during local work.
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: isProd ? './tsconfig.build.json' : './tsconfig.json',
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['react-leaflet', '@react-leaflet/core'],

  // Cache control headers for OG meta tags and social sharing
  async headers() {
    return [
      {
        // API routes — NEVER browser-cache (auth-dependent, dynamic data)
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          {
            key: 'Vary',
            value: 'Cookie, Authorization',
          },
        ],
      },
      {
        // Authenticated app pages — private, never cache
        // These are user-specific; caching them causes stale data and cross-user leaks
        source: '/(dashboard|hnwi-world|ask-rohith|prive-exchange|crown-vault|social-hub|war-room|simulation|profile|calendar|playbooks|invest-scan|trusted-network|tactics-lab|opportunity|playbook)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, must-revalidate',
          },
          {
            key: 'Vary',
            value: 'Cookie, Authorization',
          },
        ],
      },
      {
        // Authenticated app pages (top-level, no sub-path)
        source: '/(dashboard|hnwi-world|ask-rohith|prive-exchange|crown-vault|social-hub|war-room|simulation|profile|calendar|playbooks|invest-scan|trusted-network|tactics-lab)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, must-revalidate',
          },
          {
            key: 'Vary',
            value: 'Cookie, Authorization',
          },
        ],
      },
      {
        // Specific cache control for logo/OG images
        source: '/logo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, immutable',
          },
        ],
      },
    ];
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
