// hooks/use-page-title.ts
// Client-side page title and meta tag management for Next.js 14 App Router

import { useEffect } from 'react'

interface PageMetadata {
  title: string
  description?: string
  image?: string
  url?: string
}

/**
 * Helper function to update or create a meta tag
 */
function updateMetaTag(property: string, content: string, isName = false) {
  if (typeof document === 'undefined') return

  const attribute = isName ? 'name' : 'property'
  let element = document.querySelector(`meta[${attribute}="${property}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, property)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

/**
 * Hook to set the page title and meta tags dynamically in client components
 * Automatically appends " | HNWI Chronicles" suffix to title
 *
 * @param title - The page-specific title (e.g., "Home", "Privé Exchange")
 * @param description - Optional meta description for SEO and social previews
 * @param dependencies - Optional array of dependencies to re-run the effect
 */
export function usePageTitle(title: string, description?: string, dependencies: any[] = []) {
  useEffect(() => {
    if (typeof document === 'undefined') return

    // Set the full title with suffix
    const fullTitle = title ? `${title} | HNWI Chronicles` : 'HNWI Chronicles'
    document.title = fullTitle

    // Set meta description if provided
    if (description) {
      updateMetaTag('description', description, true)

      // OpenGraph tags
      updateMetaTag('og:title', fullTitle)
      updateMetaTag('og:description', description)
      updateMetaTag('og:type', 'website')
      updateMetaTag('og:site_name', 'HNWI Chronicles')
      updateMetaTag('og:image', 'https://hnwichronicles.com/logo.png')

      // Twitter Card tags
      updateMetaTag('twitter:card', 'summary_large_image', true)
      updateMetaTag('twitter:title', fullTitle, true)
      updateMetaTag('twitter:description', description, true)
      updateMetaTag('twitter:image', 'https://hnwichronicles.com/logo.png', true)

      // Set current URL if available
      if (typeof window !== 'undefined') {
        updateMetaTag('og:url', window.location.href)
      }
    }

    // Cleanup: restore default title when component unmounts
    return () => {
      document.title = 'HNWI Chronicles'
    }
  }, [title, description, ...dependencies])
}

/**
 * Hook to set a simple page title without the suffix
 * Use this only for special pages like login where you want full control
 *
 * @param title - The complete page title
 * @param description - Optional meta description for SEO and social previews
 * @param dependencies - Optional array of dependencies to re-run the effect
 */
export function usePageTitleSimple(title: string, description?: string, dependencies: any[] = []) {
  useEffect(() => {
    if (typeof document === 'undefined') return

    document.title = title

    // Set meta description if provided
    if (description) {
      updateMetaTag('description', description, true)

      // OpenGraph tags
      updateMetaTag('og:title', title)
      updateMetaTag('og:description', description)
      updateMetaTag('og:type', 'website')
      updateMetaTag('og:site_name', 'HNWI Chronicles')
      updateMetaTag('og:image', 'https://hnwichronicles.com/logo.png')

      // Twitter Card tags
      updateMetaTag('twitter:card', 'summary_large_image', true)
      updateMetaTag('twitter:title', title, true)
      updateMetaTag('twitter:description', description, true)
      updateMetaTag('twitter:image', 'https://hnwichronicles.com/logo.png', true)

      // Set current URL if available
      if (typeof window !== 'undefined') {
        updateMetaTag('og:url', window.location.href)
      }
    }

    // Cleanup: restore default title when component unmounts
    return () => {
      document.title = 'HNWI Chronicles'
    }
  }, [title, description, ...dependencies])
}
