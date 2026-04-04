// app/layout.tsx
import type { Metadata, Viewport } from "next"
import type React from "react"
import { headers } from "next/headers"
import Script from "next/script"
import localFont from "next/font/local"
import './globals.css'

const inter = localFont({
  src: [
    {
      path: "../public/fonts/Inter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Inter-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Inter-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Inter-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
})

const siteUrl = "https://app.hnwichronicles.com"
// Logo optimized to 650x650 (275KB) with cache-busting for WhatsApp
const ogImage = `${siteUrl}/logo.png?v=20241220e`

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

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
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
        width: 650,
        height: 650,
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
  const nonce =
    process.env.NODE_ENV === "production"
      ? headers().get("X-CSP-Nonce") || undefined
      : undefined
  
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <head>
        <Script
          src="/suppress-errors.js"
          strategy="beforeInteractive"
          nonce={nonce || undefined}
        />
      </head>
      <body>
        {children}
        <div id="toast-container" className="fixed top-0 right-0 z-50">
          {/* Toast container for notifications */}
        </div>
      </body>
    </html>
  )
}
