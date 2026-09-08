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

  const orientation: ScreenOrientation =
    height >= width ? 'portrait' : 'landscape'

  const touch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0

  /*
   * Normal responsive viewport classification.
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
   * Extra heuristic for phones using "Desktop site".
   *
   * Desktop-site mode can make a phone report a wider
   * CSS viewport than its normal mobile viewport.
   *
   * We therefore keep touch/mobile signals as an
   * additional hint instead of relying only on width.
   */
  const ua = navigator.userAgent || navigator.vendor || ''

  const mobileUserAgent =
    /Android.*Mobile|iPhone|iPod|Windows Phone|Opera Mini|IEMobile/i.test(
      ua
    )

  const likelyMobile =
    mobileUserAgent &&
    touch

  /*
   * iPadOS can sometimes identify itself like macOS.
   * Touch + Mac platform is therefore treated as tablet-like.
   */
  const ipadLike =
    touch &&
    /Macintosh/i.test(navigator.platform || '')

  if (likelyMobile) {
    device = 'mobile'
  } else if (ipadLike) {
    device = 'tablet'
  }

  return {
    device,
    orientation,

    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',

    isTouch: touch,
    isLikelyMobile: likelyMobile,

    width,
    height,

    pixelRatio: window.devicePixelRatio || 1,
  }
}
