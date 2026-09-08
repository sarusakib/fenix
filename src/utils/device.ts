export type DeviceType =
  | 'mobile'
  | 'tablet'
  | 'desktop'

export type ScreenOrientation =
  | 'portrait'
  | 'landscape'

export interface DeviceInfo {
  device: DeviceType
  orientation: ScreenOrientation
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouch: boolean
  width: number
  height: number
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
      width: 0,
      height: 0,
    }
  }

  const width = window.innerWidth
  const height = window.innerHeight

  /*
   * Orientation is based on the browser viewport.
   *
   * width <= height
   * → portrait
   *
   * width > height
   * → landscape
   */
  const orientation: ScreenOrientation =
    height >= width ? 'portrait' : 'landscape'

  /*
   * Device classification.
   *
   * Mobile:
   *   viewport width < 768px
   *
   * Tablet:
   *   768px - 1023px
   *
   * Desktop:
   *   1024px+
   *
   * These are layout categories, not exact hardware detection.
   */
  let device: DeviceType

  if (width < 768) {
    device = 'mobile'
  } else if (width < 1024) {
    device = 'tablet'
  } else {
    device = 'desktop'
  }

  const isTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0

  return {
    device,
    orientation,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
    isTouch,
    width,
    height,
  }
}
