export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export type ScreenOrientation = 'portrait' | 'landscape'

export interface DeviceInfo {
  device: DeviceType
  orientation: ScreenOrientation

  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean

  isTouch: boolean
  isLikelyMobile: boolean

  width: number
  height: number

  pixelRatio: number
}

function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  )
}

function detectMobileUserAgent(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }

  const userAgent = navigator.userAgent || ''

  return /Android.*Mobile|iPhone|iPod|Windows Phone|Opera Mini|IEMobile/i.test(
    userAgent
  )
}

function detectIPadLikeDevice(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }

  /*
   * Some iPads identify themselves as Macintosh.
   * Touch support helps identify those devices.
   */
  return (
    detectTouchDevice() &&
    /Macintosh/i.test(navigator.platform || '')
  )
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      device: 'desktop',
      orientation: 'landscape',

      isMobile: false,
      isTablet: false,
      isDesktop: true,

      isTouch: false,
      isLikelyMobile: false,

      width: 0,
      height: 0,

      pixelRatio: 1,
    }
  }

  const width = window.innerWidth
  const height = window.innerHeight

  /*
   * Orientation is determined independently
   * from device type.
   */
  const orientation: ScreenOrientation =
    height >= width ? 'portrait' : 'landscape'

  const isTouch = detectTouchDevice()
  const isMobileUA = detectMobileUserAgent()
  const isIPadLike = detectIPadLikeDevice()

  /*
   * First classify by viewport.
   */
  let device: DeviceType

  if (width < 768) {
    device = 'mobile'
  } else if (width < 1024) {
    device = 'tablet'
  } else {
    device = 'desktop'
  }

  /*
   * Improve detection for mobile browsers using
   * "Desktop site".
   */
  const isLikelyMobile =
    isMobileUA && isTouch

  if (isLikelyMobile) {
    device = 'mobile'
  } else if (isIPadLike) {
    device = 'tablet'
  }

  return {
    device,
    orientation,

    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',

    isTouch,
    isLikelyMobile,

    width,
    height,

    pixelRatio: window.devicePixelRatio || 1,
  }
}
