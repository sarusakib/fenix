'use client'

import { createClient } from '@/utils/supabase/client'

/**
 * FeniX Intelligent Image Composer
 *
 * User-facing uploads have no product-level source-size cap. The transport
 * layer can still use resumable/chunked uploads for very large files.
 *
 * The stored image is optimized toward ~100 KB using content-independent,
 * browser-native perceptual encoding. 100 KB is a target, not a guarantee
 * that every source can preserve every original detail at that size.
 */
export const TARGET_IMAGE_BYTES = 100 * 1024
export const MAX_IMAGE_UPLOAD_BYTES = TARGET_IMAGE_BYTES
export const HARD_IMAGE_UPLOAD_BYTES = 200 * 1024

export type OptimizedImage = {
  file: File
  width: number
  height: number
  byteSize: number
  mimeType: string
  sourceByteSize: number
  compressionRatio: number
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

function getEncoderCandidates(sourceType: string) {
  // Prefer AVIF when the browser exposes a canvas encoder, then WebP,
  // then JPEG for maximum compatibility.
  if (sourceType === 'image/png' || sourceType === 'image/gif') {
    return ['image/avif', 'image/webp', 'image/jpeg']
  }
  return ['image/avif', 'image/webp', 'image/jpeg']
}

async function findBestBlob(
  canvas: HTMLCanvasElement,
  sourceType: string,
  targetBytes: number,
) {
  let best: { blob: Blob; mimeType: string } | null = null

  for (const mimeType of getEncoderCandidates(sourceType)) {
    let low = 0.28
    let high = 0.94
    let bestUnderTarget: Blob | null = null
    let smallest: Blob | null = null

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const quality = (low + high) / 2
      const blob = await encodeCanvas(canvas, mimeType, quality)
      if (!blob) break

      if (!smallest || blob.size < smallest.size) smallest = blob

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

    if (bestUnderTarget && bestUnderTarget.size <= targetBytes) {
      // Prefer the first modern format that reaches the target at the
      // highest quality found by binary search.
      break
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

  const targetBytes = options.targetBytes ?? TARGET_IMAGE_BYTES
  const maxDimension = options.maxDimension ?? 2048
  const minDimension = options.minDimension ?? 360
  const decoded = await decodeImage(file)

  try {
    // Never degrade an already-small image just to hit an arbitrary target.
    if (
      file.size <= targetBytes &&
      Math.max(decoded.width, decoded.height) <= maxDimension &&
      ['image/webp', 'image/avif', 'image/jpeg'].includes(file.type)
    ) {
      return {
        file,
        width: decoded.width,
        height: decoded.height,
        byteSize: file.size,
        mimeType: file.type,
        sourceByteSize: file.size,
        compressionRatio: 1,
      }
    }

    let longestSide = Math.min(
      Math.max(decoded.width, decoded.height),
      maxDimension,
    )

    for (let pass = 0; pass < 9; pass += 1) {
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
      context.drawImage(decoded.source, 0, 0, width, height)

      const result = await findBestBlob(canvas, file.type, targetBytes)

      if (result?.blob && result.blob.size <= HARD_IMAGE_UPLOAD_BYTES) {
        const extension =
          result.mimeType === 'image/avif'
            ? 'avif'
            : result.mimeType === 'image/webp'
              ? 'webp'
              : 'jpg'

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
        }
      }

      if (longestSide <= minDimension) break
      longestSide = Math.max(
        minDimension,
        Math.floor(longestSide * 0.80),
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
