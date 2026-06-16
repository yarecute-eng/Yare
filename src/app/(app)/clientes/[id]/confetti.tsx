"use client"
import { useEffect, useState } from "react"
import { formatMonto } from "@/lib/utils"

interface ConfettiProps {
  nombre: string
  valor?: number | null
}

export default function Confetti({ nombre, valor }: ConfettiProps) {
  const [piezas, setPiezas] = useState<Array<{ id: number; x: number; color: string; delay: number; size: number }>>([])

  useEffect(() => {
    // Respeta prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const colores = ["#a78bdb", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#ef4444"]
    setPiezas(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colores[Math.floor(Math.random() * colores.length)],
        delay: Math.random() * 2,
        size: Math.random() * 8 + 4,
      }))
    )
  }, [])

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Mensaje de celebración */}
      <div className="relative z-10 text-center">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800 mx-4">
          <p className="text-5xl mb-3">🎉</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ¡Cerraste a {nombre}!
          </h2>
          {valor && (
            <p className="text-xl text-green-600 font-semibold mt-1">
              +{formatMonto(valor)}
            </p>
          )}
          <p className="text-gray-500 mt-2 text-sm">Sumando al mes 🚀</p>
        </div>
      </div>

      {/* Confeti */}
      {piezas.map((p) => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confetti-fall ${1.5 + p.delay}s linear ${p.delay * 0.3}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
