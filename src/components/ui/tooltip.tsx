"use client"
import { useState, useRef, ReactNode } from "react"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: ReactNode
  content: ReactNode
  side?: "top" | "bottom" | "left" | "right"
}

export function Tooltip({ children, content, side = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            "absolute z-50 w-64 rounded-lg bg-gray-900 dark:bg-gray-100 px-3 py-2 text-xs",
            "text-white dark:text-gray-900 shadow-lg pointer-events-none",
            side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
            side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
            side === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
            side === "right" && "left-full top-1/2 -translate-y-1/2 ml-2"
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}

// Ícono de información con tooltip de consejo de ventas
interface InfoTooltipProps {
  texto: string
  consejo?: string
  side?: "top" | "bottom" | "left" | "right"
}

export function InfoTooltip({ texto, consejo, side = "top" }: InfoTooltipProps) {
  return (
    <Tooltip
      side={side}
      content={
        <div className="space-y-1">
          <p>{texto}</p>
          {consejo && (
            <p className="opacity-80 border-t border-white/20 dark:border-gray-300/20 pt-1">
              💡 {consejo}
            </p>
          )}
        </div>
      }
    >
      <button
        type="button"
        className="inline-flex text-gray-400 hover:text-[#a78bdb] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#a78bdb] rounded"
        aria-label="Más información"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
    </Tooltip>
  )
}
