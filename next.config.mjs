let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['react-leaflet', '@react-leaflet/core'],
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    optimizeCss: true,
  },

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
        ],
      },
      {
        // Public pages — cache for OG meta tags and social sharing
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
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
  
  // Suppress development warnings
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  
  // Reduce webpack warnings in development
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devtool = 'eval-source-map'
      // Suppress specific warnings
      config.ignoreWarnings = [
        /Critical dependency: the request of a dependency is an expression/,
        /webpack\/lib\/cache\/PackFileCacheStrategy/,
        /was preloaded using link preload but not used/,
      ]
    }
    return config
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
