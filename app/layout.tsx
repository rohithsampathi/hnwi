// app/layout.tsx
import type { Metadata, Viewport } from "next"
import type React from "react"
import { headers } from "next/headers"
import { ThemeProvider } from "@/contexts/theme-context"
import { BusinessModeProvider } from "@/contexts/business-mode-context"
import { OnboardingProvider } from "@/contexts/onboarding-context"
import { AuthProvider } from "@/components/auth-provider"
import { AuthPopupProvider } from "@/contexts/auth-popup-context"
import PWAInstallPrompt from "@/components/pwa-install-prompt"
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL("https://app.hnwichronicles.com"),
  title: "HNWI Chronicles - What the world's top 1% realise before others know",
  description:
    "Access exclusive wealth intelligence, strategic playbooks, and real-time market insights tailored for High-Net-Worth Individuals. HNWI Chronicles empowers wealth managers and HNWIs with data-driven strategies and competitive intelligence.",
  keywords: ["HNWI", "wealth management", "financial intelligence", "strategic insights", "market analysis"],
  authors: [{ name: "Montaigne Smart Business Solutions Private Limited" }],
  creator: "Montaigne Smart Business Solutions Private Limited",
  publisher: "Montaigne Smart Business Solutions Private Limited",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app.hnwichronicles.com",
    siteName: "HNWI Chronicles",
    title: "HNWI Chronicles - What the world's top 1% realise before others know",
    description:
      "Access exclusive wealth intelligence, strategic playbooks, and real-time market insights tailored for High-Net-Worth Individuals. HNWI Chronicles empowers wealth managers and HNWIs with data-driven strategies and competitive intelligence.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "HNWI Chronicles - What the world's top 1% realise before others know",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HNWI Chronicles - What the world's top 1% realise before others know",
    description:
      "Access exclusive wealth intelligence, strategic playbooks, and real-time market insights tailored for High-Net-Worth Individuals. HNWI Chronicles empowers wealth managers and HNWIs with data-driven strategies and competitive intelligence.",
    site: "@hnwichronicles",
    creator: "@hnwichronicles",
    images: ["/logo.png"],
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
  verification: {
    google: "your-google-site-verification",
  },
  generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
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
        <script
          nonce={nonce || undefined}
          suppressHydrationWarning={true}
          dangerouslySetInnerHTML={{
            __html: `
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
          <OnboardingProvider>
            <ThemeProvider>
              <BusinessModeProvider>
                <AuthPopupProvider>
                  {children}
                  <PWAInstallPrompt />
                  <div id="toast-container" className="fixed top-0 right-0 z-50">
                    {/* Toast container for notifications */}
                  </div>
                </AuthPopupProvider>
              </BusinessModeProvider>
            </ThemeProvider>
          </OnboardingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}