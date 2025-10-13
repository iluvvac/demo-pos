"use client"
import QRCode from "react-qr-code"

export function OrderQRCode({ value, size = 128 }: { value: string; size?: number }) {
  return (
    <div className="bg-card p-3 rounded-lg inline-block">
      <QRCode value={value} size={size} />
      <p className="sr-only">{"Kode untuk scanning status order"}</p>
    </div>
  )
}
