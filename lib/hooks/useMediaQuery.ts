'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)

    // Create event listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add event listener
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
    }

    // Clean up
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        // Fallback for older browsers
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}

// Hook pour détecter le type d'appareil
export function useDeviceType() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch: typeof window !== 'undefined' && 'ontouchstart' in window
  }
}

// Hook pour gérer la sidebar responsive
export function useResponsiveSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isMobile, isTablet, isDesktop } = useDeviceType()

  useEffect(() => {
    // Auto-open sidebar on desktop
    if (isDesktop) {
      setIsOpen(true)
    } else if (isMobile) {
      // Auto-close on mobile
      setIsOpen(false)
    }
  }, [isMobile, isDesktop])

  const toggle = () => setIsOpen(prev => !prev)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return {
    isOpen,
    toggle,
    open,
    close,
    shouldShowOverlay: isMobile && isOpen,
    isCollapsible: isTablet
  }
}
