'use client'

import { useEffect, useState } from 'react'
import {
  DeviceInfo,
  getDeviceInfo,
} from './device'

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => ({
    device: 'desktop',
    orientation: 'landscape',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    width: 0,
    height: 0,
  }))

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo(getDeviceInfo())
    }

    updateDeviceInfo()

    const orientationQuery = window.matchMedia(
      '(orientation: portrait)'
    )

    const handleChange = () => {
      updateDeviceInfo()
    }

    window.addEventListener('resize', handleChange)

    orientationQuery.addEventListener(
      'change',
      handleChange
    )

    return () => {
      window.removeEventListener(
        'resize',
        handleChange
      )

      orientationQuery.removeEventListener(
        'change',
        handleChange
      )
    }
  }, [])

  return deviceInfo
}
