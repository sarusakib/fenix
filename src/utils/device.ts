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
    let animationFrame = 0

    const updateDeviceInfo = () => {
      cancelAnimationFrame(animationFrame)

      animationFrame = requestAnimationFrame(() => {
        setDeviceInfo(getDeviceInfo())
      })
    }

    updateDeviceInfo()

    const orientationQuery =
      window.matchMedia('(orientation: portrait)')

    window.addEventListener(
      'resize',
      updateDeviceInfo,
      { passive: true }
    )

    window.addEventListener(
      'orientationchange',
      updateDeviceInfo,
      { passive: true }
    )

    orientationQuery.addEventListener(
      'change',
      updateDeviceInfo
    )

    return () => {
      cancelAnimationFrame(animationFrame)

      window.removeEventListener(
        'resize',
        updateDeviceInfo
      )

      window.removeEventListener(
        'orientationchange',
        updateDeviceInfo
      )

      orientationQuery.removeEventListener(
        'change',
        updateDeviceInfo
      )
    }
  }, [])

  return deviceInfo
}
