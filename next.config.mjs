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
  // SOTA Runtime Caching - Let HTTP headers control caching, SW just enforces
  runtimeCaching: [
    {
      // Auth endpoints - NEVER cache (network only)
      urlPattern: /\/api\/auth/,
      handler: 'NetworkOnly',
      options: {
        fetchOptions: {
          credentials: 'include',
        },
      },
    },
    {
      // All API endpoints - StaleWhileRevalidate with error filtering
      // CRITICAL: Serves cached data immediately, updates in background
      // CRITICAL: Don't cache errors (401/403/500) - fixes reauth loop bug
      urlPattern: /\/api\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api',
        fetchOptions: {
          credentials: 'include',
        },
        plugins: [
          {
            // SOTA: Don't cache error responses (critical for auth flow)
            cacheWillUpdate: async ({ response }) => {
              // Only cache successful responses
              if (response && response.status < 400) {
                return response;
              }
              return null;
            },
          },
        ],
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 5 * 60, // 5 minutes - cache is auto-refreshed in background
        },
      },
    },
    {
      // Static assets - aggressive caching
      urlPattern: /\/_next\/static\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      // Images - cache first
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
      // Fonts - cache first
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
      // Pages - network first
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        fetchOptions: {
          credentials: 'include',
        },
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
  // Disabled navigationPreload to prevent "preloadResponse cancelled" warnings on hard refresh
  navigationPreload: false,
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
