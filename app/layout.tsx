// app/layout.tsx
import type { Metadata, Viewport } from "next"
import type React from "react"
import { headers } from "next/headers"
import { ThemeProvider } from "@/contexts/theme-context"
import { BusinessModeProvider } from "@/contexts/business-mode-context"
import { OnboardingProvider } from "@/contexts/onboarding-context"
import { AuthProvider } from "@/components/auth-provider"
import { AuthPopupProvider } from "@/contexts/auth-popup-context"
import { StepUpMfaProvider } from "@/contexts/step-up-mfa-context"
import { AuthSyncProvider } from "@/components/auth-sync-provider"
import PWAInstallPrompt from "@/components/pwa-install-prompt"
import { ServiceWorkerUpdateManager } from "@/components/sw-update-manager"
import './globals.css'

const siteUrl = "https://app.hnwichronicles.com"
const ogImage = `${siteUrl}/logo.png`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "HNWI Chronicles",
    template: "%s | HNWI Chronicles",
  },

  description:
    "Invite-only intelligence platform for HNWIs and family offices — tracked signals, insider briefs, and curated opportunities across real assets and alternative wealth.",

  applicationName: "HNWI Chronicles",
  authors: [{ name: "Montaigne Smart Business Solutions Pvt Ltd" }],
  creator: "Montaigne Smart Business Solutions Pvt Ltd",
  publisher: "Montaigne Smart Business Solutions Pvt Ltd",
  category: "Finance",

  keywords: [
    "HNWI",
    "family office",
    "single family office",
    "multi family office",
    "wealth intelligence",
    "alternative assets",
    "real assets",
    "private markets",
    "cross-border",
    "regulatory",
  ],

  alternates: {
    canonical: "/",
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  manifest: "/manifest.json",

  icons: {
    icon: "/logo.png",
    shortcut: "/Rohith.ico",
    apple: "/logo.png",
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "HNWI Chronicles",
    locale: "en_US",
    title: "HNWI Chronicles",
    description:
      "Invite-only intelligence platform for HNWIs and family offices — tracked signals, insider briefs, and curated opportunities across real assets and alternative wealth.",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "HNWI Chronicles",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@hnwichronicles",
    creator: "@hnwichronicles",
    title: "HNWI Chronicles",
    description:
      "Invite-only intelligence platform for HNWIs and family offices — tracked signals, insider briefs, and curated opportunities across real assets and alternative wealth.",
    images: [ogImage],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
  viewportFit: "cover", // Enable safe area support for iOS notches
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get nonce from middleware for CSP
  const headersList = headers()
  const nonce = headersList.get('X-CSP-Nonce') || undefined
  
  return (
    <html lang="en">
      <head>
        {/* Suppress known Razorpay and service worker errors - load first */}
        <script
          src="/suppress-errors.js"
          nonce={nonce || undefined}
          suppressHydrationWarning={true}
        />
        <script
          nonce={nonce || undefined}
          suppressHydrationWarning={true}
          dangerouslySetInnerHTML={{
            __html: `
              // Clear all caches and service workers on localhost to prevent stale manifest errors
              if (location.hostname.includes('localhost')) {
                (async function clearAllCaches() {
                  try {
                    // Unregister all service workers
                    if ('serviceWorker' in navigator) {
                      const registrations = await navigator.serviceWorker.getRegistrations();
                      for (const registration of registrations) {
                        await registration.unregister();
                      }
                    }
                    // Clear all caches
                    if ('caches' in window) {
                      const cacheNames = await caches.keys();
                      for (const cacheName of cacheNames) {
                        await caches.delete(cacheName);
                      }
                    }
                  } catch (e) {
                    // Silent fail
                  }
                })();
              }

              // Register service worker in production only
              if ('serviceWorker' in navigator && !location.hostname.includes('localhost')) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .catch(() => {});
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <AuthSyncProvider>
            <OnboardingProvider>
              <ThemeProvider>
                <BusinessModeProvider>
                  <AuthPopupProvider>
                    <StepUpMfaProvider>
                      {children}
                      <PWAInstallPrompt />
                      <ServiceWorkerUpdateManager />
                      <div id="toast-container" className="fixed top-0 right-0 z-50">
                        {/* Toast container for notifications */}
                      </div>
                    </StepUpMfaProvider>
                  </AuthPopupProvider>
                </BusinessModeProvider>
              </ThemeProvider>
            </OnboardingProvider>
          </AuthSyncProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
