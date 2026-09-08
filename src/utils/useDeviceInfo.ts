'use client'

import { useEffect, useState } from 'react'
import {
  DeviceInfo,
  getDeviceInfo,
} from './device'

const DEFAULT_DEVICE_INFO: DeviceInfo = {
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

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] =
    useState<DeviceInfo>(DEFAULT_DEVICE_INFO)

  useEffect(() => {
    let frame = 0

    const update = () => {
      cancelAnimationFrame(frame)

      frame = requestAnimationFrame(() => {
        setDeviceInfo(getDeviceInfo())
      })
    }

    update()

    const orientationQuery = window.matchMedia(
      '(orientation: portrait)'
    )

    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)

    orientationQuery.addEventListener('change', update)

    return () => {
      cancelAnimationFrame(frame)

      window.removeEventListener('resize', update)
      window.removeEventListener(
        'orientationchange',
        update
      )

      orientationQuery.removeEventListener(
        'change',
        update
      )
    }
  }, [])

  return deviceInfo
}
