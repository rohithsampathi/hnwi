// lib/services/web-share-service.ts
// Web Share API service for native sharing capabilities

export interface ShareData {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

export class WebShareService {
  // Check if Web Share API is supported
  static isSupported(): boolean {
    return 'share' in navigator
  }

  // Check if Web Share API Level 2 (files) is supported
  static isFileShareSupported(): boolean {
    return 'canShare' in navigator && 'share' in navigator
  }

  // Check if specific data can be shared
  static canShare(data: ShareData): boolean {
    if (!this.isSupported()) return false

    if ('canShare' in navigator) {
      return navigator.canShare(data)
    }

    // Fallback check for basic data
    return !!(data.title || data.text || data.url)
  }

  // Share content using Web Share API
  static async share(data: ShareData): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Web Share API not supported')
    }

    if (!this.canShare(data)) {
      throw new Error('Cannot share the provided data')
    }

    try {
      await navigator.share(data)
      return true
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled the share
        return false
      }
      throw error
    }
  }

  // Share opportunity with context
  static async shareOpportunity(
    opportunityId: string,
    title: string,
    description: string,
    baseUrl: string = window.location.origin
  ): Promise<boolean> {
    const shareData: ShareData = {
      title: `HNWI Chronicles: ${title}`,
      text: `Exclusive opportunity: ${description}`,
      url: `${baseUrl}/share/opportunity/${opportunityId}`
    }

    return this.share(shareData)
  }

  // Share Rohith conversation
  static async shareConversation(
    shareId: string,
    title: string,
    baseUrl: string = window.location.origin
  ): Promise<boolean> {
    const shareData: ShareData = {
      title: `HNWI Chronicles: ${title}`,
      text: 'Insights from Rohith, your intelligence ally',
      url: `${baseUrl}/share/rohith/${shareId}`
    }

    return this.share(shareData)
  }

  // Share intelligence insight
  static async shareInsight(
    title: string,
    insight: string,
    url?: string
  ): Promise<boolean> {
    const shareData: ShareData = {
      title: `HNWI Chronicles: ${title}`,
      text: insight,
      url: url || window.location.href
    }

    return this.share(shareData)
  }

  // Fallback to clipboard if Web Share API is not available
  static async shareViaClipboard(data: ShareData): Promise<boolean> {
    if (!('clipboard' in navigator)) {
      throw new Error('Neither Web Share API nor Clipboard API supported')
    }

    const shareText = [
      data.title,
      data.text,
      data.url
    ].filter(Boolean).join('\n\n')

    try {
      await navigator.clipboard.writeText(shareText)
      return true
    } catch (error) {
      throw new Error('Failed to copy to clipboard')
    }
  }

  // Smart share: tries Web Share API first, falls back to clipboard
  static async smartShare(data: ShareData): Promise<{ method: 'share' | 'clipboard', success: boolean }> {
    if (this.isSupported() && this.canShare(data)) {
      try {
        const success = await this.share(data)
        return { method: 'share', success }
      } catch (error) {
        // Fall back to clipboard
      }
    }

    try {
      const success = await this.shareViaClipboard(data)
      return { method: 'clipboard', success }
    } catch (error) {
      throw new Error('No sharing method available')
    }
  }
}