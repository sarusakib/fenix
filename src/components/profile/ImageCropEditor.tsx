'use client'

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

type CropKind = 'avatar' | 'cover'

type ImageCropEditorProps = {
  file: File
  kind: CropKind
  locale: 'bn' | 'en'
  onCancel: () => void
  onConfirm: (file: File) => void | Promise<void>
}

type Point = { x: number; y: number }

async function loadBitmap(file: File) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions)
    } catch {
      // Fall through to HTMLImageElement.
    }
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('এই ছবিটি browser-এ edit করা যাচ্ছে না।'))
      image.src = objectUrl
    })
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
  }
}

export default function ImageCropEditor({ file, kind, locale, onCancel, onConfirm }: ImageCropEditorProps) {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ start: Point; offset: Point } | null>(null)
  const [sourceUrl, setSourceUrl] = useState('')
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')

  const aspect = kind === 'avatar' ? 1 : 2.63

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSourceUrl(url)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setError('')
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (!sourceUrl) return
    const image = new Image()
    image.onload = () => setImageSize({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => setError(locale === 'bn' ? 'এই ছবিটি edit করা যাচ্ছে না। অন্য photo দিন।' : 'This image cannot be edited in this browser.')
    image.src = sourceUrl
  }, [sourceUrl, locale])

  const layout = useMemo(() => {
    const frame = frameRef.current?.getBoundingClientRect()
    if (!frame || !imageSize.width || !imageSize.height) return null

    const frameWidth = frame.width
    const frameHeight = frameWidth / aspect
    const scale = Math.max(frameWidth / imageSize.width, frameHeight / imageSize.height) * zoom
    const width = imageSize.width * scale
    const height = imageSize.height * scale
    const maxX = Math.max(0, (width - frameWidth) / 2)
    const maxY = Math.max(0, (height - frameHeight) / 2)
    return { frameWidth, frameHeight, scale, width, height, maxX, maxY }
  }, [aspect, imageSize.height, imageSize.width, zoom])

  useEffect(() => {
    if (!layout) return
    setOffset((current) => ({
      x: Math.max(-layout.maxX, Math.min(layout.maxX, current.x)),
      y: Math.max(-layout.maxY, Math.min(layout.maxY, current.y)),
    }))
  }, [layout])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!layout || working) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { start: { x: event.clientX, y: event.clientY }, offset }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || !layout) return
    setOffset({
      x: Math.max(-layout.maxX, Math.min(layout.maxX, drag.offset.x + event.clientX - drag.start.x)),
      y: Math.max(-layout.maxY, Math.min(layout.maxY, drag.offset.y + event.clientY - drag.start.y)),
    })
  }

  const stopDrag = () => {
    dragRef.current = null
  }

  const confirm = async () => {
    if (!layout || !imageSize.width || !imageSize.height || working) return
    setWorking(true)
    setError('')
    try {
      const source = await loadBitmap(file)
      const sourceWidth = source instanceof ImageBitmap ? source.width : source.naturalWidth
      const sourceHeight = source instanceof ImageBitmap ? source.height : source.naturalHeight
      const sourceScale = layout.scale
      const left = (layout.frameWidth - layout.width) / 2 + offset.x
      const top = (layout.frameHeight - layout.height) / 2 + offset.y
      const sourceX = Math.max(0, Math.min(sourceWidth, -left / sourceScale))
      const sourceY = Math.max(0, Math.min(sourceHeight, -top / sourceScale))
      const sourceCropWidth = Math.min(sourceWidth - sourceX, layout.frameWidth / sourceScale)
      const sourceCropHeight = Math.min(sourceHeight - sourceY, layout.frameHeight / sourceScale)

      const outputWidth = kind === 'avatar' ? 1200 : 1600
      const outputHeight = Math.round(outputWidth / aspect)
      const canvas = document.createElement('canvas')
      canvas.width = outputWidth
      canvas.height = outputHeight

      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas প্রস্তুত করা যায়নি।')
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(source as CanvasImageSource, sourceX, sourceY, sourceCropWidth, sourceCropHeight, 0, 0, outputWidth, outputHeight)

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/webp', 0.94)
      })
      const fallbackBlob = blob ?? await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.94)
      })
      if (!fallbackBlob) throw new Error('ছবিটি তৈরি করা যায়নি। আবার চেষ্টা করুন।')

      const type = fallbackBlob.type === 'image/webp' ? 'image/webp' : 'image/jpeg'
      const extension = type === 'image/webp' ? 'webp' : 'jpg'
      await onConfirm(new File([fallbackBlob], (kind === 'avatar' ? 'profile-photo' : 'cover-photo') + '.' + extension, {
        type,
        lastModified: Date.now(),
      }))

      if ('close' in source && typeof source.close === 'function') source.close()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : (locale === 'bn' ? 'Photo edit করা যায়নি।' : 'Could not edit the photo.'))
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-label={locale === 'bn' ? 'Profile photo crop editor' : 'Profile photo crop editor'} className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1020] text-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55">FeniX</p>
            <h2 className="mt-1 text-base font-black sm:text-lg">{kind === 'avatar' ? (locale === 'bn' ? 'Profile photo crop' : 'Profile photo crop') : (locale === 'bn' ? 'Cover photo crop' : 'Cover photo crop')}</h2>
          </div>
          <button type="button" onClick={onCancel} disabled={working} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl disabled:opacity-40" aria-label={locale === 'bn' ? 'বন্ধ করুন' : 'Close'}>×</button>
        </div>

        <div className="p-4 sm:p-6">
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            className={'relative mx-auto w-full max-w-2xl select-none touch-none overflow-hidden rounded-[1.5rem] bg-black ' + (kind === 'avatar' ? 'aspect-square max-w-[560px]' : 'aspect-[2.63]')}
          >
            {sourceUrl && imageSize.width > 0 && layout ? (
              <img
                src={sourceUrl}
                alt=""
                draggable={false}
                className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
                style={{ width: layout.width, height: layout.height, transform: 'translate(-50%, -50%) translate(' + offset.x + 'px,' + offset.y + 'px)' }}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-sm text-white/60">{locale === 'bn' ? 'Photo প্রস্তুত হচ্ছে…' : 'Preparing photo…'}</div>
            )}
            <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-white/30" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_49.7%,rgba(255,255,255,.16)_50%,transparent_50.3%),linear-gradient(to_right,transparent_49.7%,rgba(255,255,255,.16)_50%,transparent_50.3%)]" />
            {kind === 'avatar' && <div className="pointer-events-none absolute inset-0 rounded-full ring-[999px] ring-black/35" />}
          </div>

          <p className="mt-3 text-center text-xs text-white/60">{locale === 'bn' ? 'Photo টেনে position ঠিক করুন, তারপর zoom দিয়ে fit করুন।' : 'Drag the photo to position it, then use zoom to fit it.'}</p>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-lg" aria-hidden="true">−</span>
            <input aria-label={locale === 'bn' ? 'Photo zoom' : 'Photo zoom'} type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="min-w-0 flex-1 accent-[var(--fx-primary-strong)]" disabled={working} />
            <span className="text-lg" aria-hidden="true">+</span>
          </div>

          {error && <p className="mt-3 rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">{error}</p>}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" onClick={onCancel} disabled={working} className="min-h-12 rounded-xl border border-white/15 bg-white/5 text-sm font-bold disabled:opacity-40">{locale === 'bn' ? 'Cancel' : 'Cancel'}</button>
            <button type="button" onClick={() => void confirm()} disabled={working || !layout} className="min-h-12 rounded-xl bg-[var(--fx-primary-strong)] text-sm font-black text-white disabled:opacity-40">{working ? (locale === 'bn' ? 'প্রস্তুত হচ্ছে…' : 'Preparing…') : (locale === 'bn' ? 'Crop & continue' : 'Crop & continue')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
