"use client"

import { useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { Button } from "@/components/ui/button"

export function QRScanner({
  onResult,
}: {
  onResult: (text: string) => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    let stopped = false

    async function start() {
      if (!videoRef.current) return
      try {
        setActive(true)
        const controls = await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (stopped) return
          if (result) {
            onResult(result.getText())
          }
        })
        return () => {
          stopped = true
          controls?.stop()
          setActive(false)
        }
      } catch (e) {
        console.error("[v0] scanner error", e)
      }
    }

    let cleanup: (() => void) | undefined
    start().then((c) => {
      cleanup = c
    })

    return () => {
      cleanup?.()
    }
  }, [onResult])

  return (
    <div className="space-y-2">
      <video ref={videoRef} className="w-full rounded-md border border-border" />
      {!active && (
        <Button
          variant="secondary"
          onClick={() => {
            /* re-render restarts */
          }}
        >
          Mulai Scan
        </Button>
      )}
    </div>
  )
}
