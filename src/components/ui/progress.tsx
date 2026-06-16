import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number // 0-100
  className?: string
  color?: "brand" | "green" | "amber" | "red"
  showLabel?: boolean
  size?: "sm" | "md"
}

export function Progress({ value, className, color = "brand", showLabel, size = "md" }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const colors = {
    brand: "bg-[#a78bdb]",
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  }
  const heights = { sm: "h-1.5", md: "h-2.5" }
  
  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden", heights[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-gray-500">{clampedValue.toFixed(0)}%</p>
      )}
    </div>
  )
}
