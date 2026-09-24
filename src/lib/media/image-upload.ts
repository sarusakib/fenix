'use client'

import { createClient } from '@/utils/supabase/client'

export const MAX_IMAGE_UPLOAD_BYTES = 190 * 1024
export const HARD_IMAGE_UPLOAD_BYTES = 200 * 1024
export const MAX_SOURCE_IMAGE_BYTES = 15 * 1024 * 1024

export type OptimizedImage = {
  file: File
  width: number
  height: number
  byteSize: number
  mimeType: string
}

type OptimizeOptions = {
  maxDimension?: number
  targetBytes?: number
  minDimension?: number
}

type DecodedImage = {
  source: ImageBitmap | HTMLImageElement
  width: number
  height: number
  cleanup: () => void
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof window === 'undefined') throw new Error('Image upload is only available in the browser.')

  if ('createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions)
      return { source: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close() }
    } catch {
      // Fall back to an HTMLImageElement for browsers with limited ImageBitmap support.
    }
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('This image format could not be decoded by the browser.'))
      element.src = objectUrl
    })
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, cleanup: () => URL.revokeObjectURL(objectUrl) }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw error
  }
}

function encodeCanvas(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, quality))
}

async function findBestBlob(
  canvas: HTMLCanvasElement,
  preferredMime: string,
  targetBytes: number,
) {
  let mimeType = preferredMime
  let low = 0.34
  let high = 0.94
  let best: Blob | null = null

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const quality = (low + high) / 2
    let blob = await encodeCanvas(canvas, mimeType, quality)

    if (!blob && mimeType !== 'image/jpeg') {
      mimeType = 'image/jpeg'
      blob = await encodeCanvas(canvas, mimeType, quality)
    }
    if (!blob) break

    if (blob.size <= targetBytes) {
      best = blob
      low = quality
    } else {
      high = quality
    }
  }

  if (!best) {
    const fallbackQuality = 0.34
    best = await encodeCanvas(canvas, mimeType, fallbackQuality)
  }

  return { blob: best, mimeType }
}

export async function optimizeImageFile(file: File, options: OptimizeOptions = {}): Promise<OptimizedImage> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
  if (file.size > MAX_SOURCE_IMAGE_BYTES) throw new Error('Please choose an image smaller than 15MB.')

  const targetBytes = options.targetBytes ?? MAX_IMAGE_UPLOAD_BYTES
  const maxDimension = options.maxDimension ?? 1600
  const minDimension = options.minDimension ?? 360
  const decoded = await decodeImage(file)

  try {
    if ((file.type === 'image/webp' || file.type === 'image/jpeg') && file.size <= targetBytes && Math.max(decoded.width, decoded.height) <= maxDimension) {
      return { file, width: decoded.width, height: decoded.height, byteSize: file.size, mimeType: file.type }
    }

    let longestSide = Math.min(Math.max(decoded.width, decoded.height), maxDimension)

    for (let pass = 0; pass < 7; pass += 1) {
      const scale = longestSide / Math.max(decoded.width, decoded.height)
      const width = Math.max(1, Math.round(decoded.width * scale))
      const height = Math.max(1, Math.round(decoded.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d', { alpha: true })
      if (!context) throw new Error('Your browser could not prepare this image.')
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(decoded.source, 0, 0, width, height)

      const preferredMime = 'image/webp'
      const result = await findBestBlob(canvas, preferredMime, targetBytes)
      if (result.blob && result.blob.size <= targetBytes && result.blob.size <= HARD_IMAGE_UPLOAD_BYTES) {
        const extension = result.mimeType === 'image/webp' ? 'webp' : 'jpg'
        const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 48) || 'fenix-image'
        const optimizedFile = new File([result.blob], baseName + '.' + extension, { type: result.mimeType, lastModified: Date.now() })
        return { file: optimizedFile, width, height, byteSize: optimizedFile.size, mimeType: result.mimeType }
      }

      if (longestSide <= minDimension) break
      longestSide = Math.max(minDimension, Math.floor(longestSide * 0.78))
    }
  } finally {
    decoded.cleanup()
  }

  throw new Error('This photo could not be compressed below 200KB without excessive quality loss. Please choose a different photo.')
}

export async function uploadOptimizedPublicImage(
  client: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
  optimized: OptimizedImage,
) {
  if (optimized.byteSize > HARD_IMAGE_UPLOAD_BYTES) throw new Error('The optimized image is still above the 200KB limit.')
  const { error } = await client.storage.from(bucket).upload(path, optimized.file, {
    cacheControl: '31536000',
    contentType: optimized.mimeType,
    upsert: false,
  })
  if (error) throw error
  const { data } = client.storage.from(bucket).getPublicUrl(path)
  return { path, publicUrl: data.publicUrl, ...optimized }
}

export async function removePublicImage(client: ReturnType<typeof createClient>, bucket: string, path: string) {
  if (!path) return
  await client.storage.from(bucket).remove([path])
}