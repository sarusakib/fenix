'use client'

import { createClient } from '@/utils/supabase/client'

/**
 * FeniX Intelligent Image Composer
 *
 * There is no product-level source-size cap here. Very large files should be
 * transported with resumable/chunked upload by the caller before decoding.
 *
 * The stored image targets ~300 KB while keeping the best perceptual quality
 * the browser encoder can achieve at that size. If 100 KB would be too
 * destructive, the optimizer can fall back up to 400 KB rather than creating
 * a visibly broken image.
 */
export const TARGET_IMAGE_BYTES = 300 * 1024
export const MAX_IMAGE_UPLOAD_BYTES = TARGET_IMAGE_BYTES
export const HARD_IMAGE_UPLOAD_BYTES = 400 * 1024

// Adaptive quality: prefer ~300 KB, but never exceed 400 KB for stored delivery images.

export type OptimizedImage = {
  file: File
  width: number
  height: number
  byteSize: number
  mimeType: string
  sourceByteSize?: number
  compressionRatio?: number
  /** SHA-256 of the original source bytes; useful for duplicate detection and media observability. */
  sourceDigest?: string
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

async function sha256File(file: File) {
  const bytes = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof window === 'undefined') {
    throw new Error('Image upload is only available in the browser.')
  }

  if ('createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(
        file,
        { imageOrientation: 'from-image' } as ImageBitmapOptions,
      )
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      }
    } catch {
      // Fall through to HTMLImageElement for browser compatibility.
    }
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(
        new Error('This image format could not be decoded by this browser.'),
      )
      element.src = objectUrl
    })

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      cleanup: () => URL.revokeObjectURL(objectUrl),
    }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw error
  }
}

function encodeCanvas(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality)
  })
}

function getEncoderCandidates() {
  // Keep the production path compatible with the existing Supabase buckets.
  // WebP is preferred; JPEG is the universal fallback.
  return ['image/webp', 'image/jpeg']
}

async function findBestBlob(
  canvas: HTMLCanvasElement,
  targetBytes: number,
) {
  let best: { blob: Blob; mimeType: string } | null = null

  for (const mimeType of getEncoderCandidates()) {
    let low = 0.28
    let high = 0.94
    let bestUnderTarget: Blob | null = null
    let smallest: Blob | null = null

    for (let attempt = 0; attempt < 14; attempt += 1) {
      const quality = (low + high) / 2
      const blob = await encodeCanvas(canvas, mimeType, quality)
      if (!blob) break

      if (!smallest || blob.size < smallest.size) {
        smallest = blob
      }

      if (blob.size <= targetBytes) {
        bestUnderTarget = blob
        low = quality
      } else {
        high = quality
      }
    }

    const candidate = bestUnderTarget ?? smallest
    if (!candidate) continue

    if (
      !best ||
      (candidate.size <= targetBytes && best.blob.size > targetBytes) ||
      (candidate.size <= targetBytes &&
        best.blob.size <= targetBytes &&
        candidate.size > best.blob.size)
    ) {
      best = { blob: candidate, mimeType }
    }

  }

  return best
}

function makeFileName(name: string, extension: string) {
  const baseName = name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .slice(0, 48) || 'fenix-image'

  return baseName + '.' + extension
}

export async function optimizeImageFile(
  file: File,
  options: OptimizeOptions = {},
): Promise<OptimizedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }

  const targetBytes = Math.min(
    HARD_IMAGE_UPLOAD_BYTES,
    Math.max(TARGET_IMAGE_BYTES, options.targetBytes ?? TARGET_IMAGE_BYTES),
  )
  const maxDimension = Math.max(360, options.maxDimension ?? 2560)
  const minDimension = options.minDimension ?? 360
  const sourceDigest = await sha256File(file)
  const decoded = await decodeImage(file)

  try {
    // Never degrade an already-small modern image just to hit an arbitrary
    // target. This preserves user-uploaded quality when it already fits.
    if (
      file.size <= targetBytes &&
      Math.max(decoded.width, decoded.height) <= maxDimension &&
      ['image/webp', 'image/jpeg'].includes(file.type)
    ) {
      return {
        file,
        width: decoded.width,
        height: decoded.height,
        byteSize: file.size,
        mimeType: file.type,
        sourceByteSize: file.size,
        compressionRatio: 1,
        sourceDigest,
      }
    }

    let longestSide = Math.min(
      Math.max(decoded.width, decoded.height),
      maxDimension,
    )

    // Re-render at progressively smaller resolutions only when the current
    // resolution cannot reach the target. This protects detail whenever
    // bitrate alone is enough.
    for (let pass = 0; pass < 10; pass += 1) {
      const scale = longestSide / Math.max(decoded.width, decoded.height)
      const width = Math.max(1, Math.round(decoded.width * scale))
      const height = Math.max(1, Math.round(decoded.height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d', { alpha: true })
      if (!context) {
        throw new Error('Your browser could not prepare this image.')
      }

      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'

      // A very gentle finishing pass keeps the optimized image crisp without
      // amplifying compression artifacts.
      if ('filter' in context) {
        context.filter = 'contrast(1.01) saturate(1.01)'
      }
      context.drawImage(decoded.source, 0, 0, width, height)
      if ('filter' in context) {
        context.filter = 'none'
      }

      const result = await findBestBlob(canvas, targetBytes)

      if (result?.blob && result.blob.size <= HARD_IMAGE_UPLOAD_BYTES) {
        const extension = result.mimeType === 'image/webp' ? 'webp' : 'jpg'
        const optimizedFile = new File(
          [result.blob],
          makeFileName(file.name, extension),
          {
            type: result.mimeType,
            lastModified: Date.now(),
          },
        )

        return {
          file: optimizedFile,
          width,
          height,
          byteSize: optimizedFile.size,
          mimeType: result.mimeType,
          sourceByteSize: file.size,
          compressionRatio: file.size / Math.max(1, optimizedFile.size),
          sourceDigest,
        }
      }

      if (longestSide <= minDimension) break
      longestSide = Math.max(
        minDimension,
        Math.floor(longestSide * 0.88),
      )
    }
  } finally {
    decoded.cleanup()
  }

  throw new Error(
    'This image could not be optimized within the FeniX media quality limit.',
  )
}

export async function uploadOptimizedPublicImage(
  client: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
  optimized: OptimizedImage,
) {
  if (optimized.byteSize > HARD_IMAGE_UPLOAD_BYTES) {
    throw new Error('The optimized image is still above the FeniX storage limit.')
  }
  if (!optimized.mimeType || !['image/jpeg', 'image/webp'].includes(optimized.mimeType)) {
    throw new Error('Unsupported optimized image format.')
  }

  const { error } = await client.storage.from(bucket).upload(
    path,
    optimized.file,
    {
      cacheControl: '31536000',
      contentType: optimized.mimeType,
      upsert: false,
    },
  )

  if (error) throw error

  const { data } = client.storage.from(bucket).getPublicUrl(path)
  return {
    path,
    publicUrl: data.publicUrl,
    ...optimized,
  }
}

export async function removePublicImage(
  client: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
) {
  if (!path) return
  await client.storage.from(bucket).remove([path])
}
