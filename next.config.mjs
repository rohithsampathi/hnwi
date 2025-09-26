import withPWA from 'next-pwa'

let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    optimizeCss: true,
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
      
      // Optimize CSS preloading in development
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            styles: {
              name: 'styles',
              type: 'css/mini-extract',
              chunks: 'all',
              enforce: true,
            },
          },
        },
      }
    }
    return config
  },
}

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: false,
  sw: '/sw.js',
  publicExcludes: ['!**/*'],
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  dynamicStartUrl: false,
  fallbacks: {
    document: '/offline',
  },
  // Advanced runtime caching strategies
  runtimeCaching: [
    {
      // Next.js build manifest - always fresh
      urlPattern: /\/_next\/app-build-manifest\.json$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-build-manifest',
        networkTimeoutSeconds: 3,
      },
    },
    {
      // Auth endpoints - NEVER cache authentication
      urlPattern: /\/api\/auth\//,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'no-cache',
      },
    },
    {
      // Non-auth API routes - Network first with background sync
      urlPattern: /\/api\/(?!auth)/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        backgroundSync: {
          name: 'api-queue',
          options: {
            maxRetentionTime: 24 * 60, // 24 hours
          },
        },
      },
    },
    {
      // Intelligence data - Stale while revalidate
      urlPattern: /\/api\/(intelligence|rohith|crown-vault|opportunities)/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'intelligence-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 15 * 60, // 15 minutes
        },
      },
    },
    {
      // Static assets - Cache first with long expiration
      urlPattern: /\/_next\/static\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      // Images and media - Cache first with size limit
      urlPattern: /\.(png|jpg|jpeg|gif|webp|svg|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    {
      // Fonts - Cache first with long expiration
      urlPattern: /\.(woff|woff2|eot|ttf|otf)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
        },
      },
    },
    {
      // External APIs - Network first with short cache
      urlPattern: /^https:\/\/external-api\./,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'external-apis',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 2 * 60, // 2 minutes
        },
      },
    },
    {
      // Documents and pages - Network first
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
  // Advanced Workbox options
  skipWaiting: true,
  clientsClaim: true,
  // Background sync for failed network requests
  navigationPreload: true,
  cleanupOutdatedCaches: true,
})

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

export default pwaConfig(nextConfig)
