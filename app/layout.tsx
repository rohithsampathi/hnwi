// app/layout.tsx

// app/layout.tsx
import type { Metadata, Viewport } from "next"
import type React from "react"
import { ThemeProvider } from "@/contexts/theme-context"
import { OnboardingProvider } from "@/contexts/onboarding-context"
import { AuthProvider } from "@/components/auth-provider"
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL("https://hnwichronicles.vercel.app"),
  title: "HNWI Chronicles | Global Wealth Intelligence Platform",
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
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png",
    shortcut: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png",
    apple: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hnwichronicles.vercel.app",
    siteName: "HNWI Chronicles",
    title: "HNWI Chronicles | Global Wealth Intelligence Platform",
    description:
      "Access exclusive wealth intelligence, strategic playbooks, and real-time market insights tailored for High-Net-Worth Individuals. HNWI Chronicles empowers wealth managers and HNWIs with data-driven strategies and competitive intelligence.",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png",
        width: 1200,
        height: 630,
        alt: "HNWI Chronicles - Global Wealth Intelligence Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HNWI Chronicles | Global Wealth Intelligence Platform",
    description:
      "Access exclusive wealth intelligence, strategic playbooks, and real-time market insights tailored for High-Net-Worth Individuals. HNWI Chronicles empowers wealth managers and HNWIs with data-driven strategies and competitive intelligence.",
    site: "@hnwichronicles",
    creator: "@hnwichronicles",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png"],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <OnboardingProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </OnboardingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}