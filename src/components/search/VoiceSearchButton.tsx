'use client'

import { useEffect, useRef, useState } from 'react'
import { Microphone, X } from '@phosphor-icons/react'

type RecognitionResult = Event & {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

type RecognitionInstance = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: RecognitionResult) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

export default function VoiceSearchButton() {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<RecognitionInstance | null>(null)

  useEffect(() => {
    const browser = window as unknown as {
      SpeechRecognition?: new () => RecognitionInstance
      webkitSpeechRecognition?: new () => RecognitionInstance
    }
    setSupported(Boolean(browser.SpeechRecognition || browser.webkitSpeechRecognition))
  }, [])

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort()
      } catch {
        // Ignore teardown errors.
      }
    }
  }, [])

  if (!supported) return null

  function startListening() {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const browser = window as unknown as {
      SpeechRecognition?: new () => RecognitionInstance
      webkitSpeechRecognition?: new () => RecognitionInstance
    }
    const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition
    if (!Recognition) return

    const recognition = new Recognition()
    recognition.lang = 'bn-BD'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = (event) => {
      const transcript = String(event.results[0]?.[0]?.transcript || '').trim()
      setListening(false)
      recognitionRef.current = null
      if (transcript) {
        window.location.assign('/guide?q=' + encodeURIComponent(transcript.slice(0, 120)))
      }
    }

    recognition.onerror = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    setListening(true)

    try {
      recognition.start()
    } catch {
      setListening(false)
      recognitionRef.current = null
    }
  }

  return (
    <button
      type="button"
      onClick={startListening}
      aria-label={listening ? 'Stop Bangla voice search' : 'Start Bangla voice search'}
      title={listening ? 'Listening…' : 'Bangla voice search'}
      className="fixed bottom-[5.6rem] right-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] text-[var(--fx-primary-strong)] shadow-lg backdrop-blur-xl transition hover:scale-105 sm:bottom-6 sm:right-6"
    >
      {listening ? <X size={18} weight="bold" /> : <Microphone size={19} weight="bold" />}
      <span className="sr-only">{listening ? 'Listening…' : 'Bangla voice search'}</span>
    </button>
  )
}
