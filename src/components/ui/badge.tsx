import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral" | "brand"

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[#a78bdb]/15 text-[#7050ad] dark:bg-[#a78bdb]/20 dark:text-[#c8a8f0]",
  success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  neutral: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  brand: "bg-[#a78bdb] text-white",
}

export function Badge({ children, variant = "default", className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", {
          "bg-[#a78bdb]": variant === "default" || variant === "brand",
          "bg-green-500": variant === "success",
          "bg-amber-500": variant === "warning",
          "bg-red-500": variant === "danger",
          "bg-blue-500": variant === "info",
          "bg-gray-400": variant === "neutral",
        })} />
      )}
      {children}
    </span>
  )
}

// Badge de estado del cliente
export function EstadoBadge({ estado }: { estado: string }) {
  const configs: Record<string, { label: string; variant: BadgeVariant }> = {
    ACTIVO: { label: "Activo", variant: "default" },
    GANADO: { label: "✓ Ganado", variant: "success" },
    PERDIDO: { label: "✗ Perdido", variant: "neutral" },
    ARCHIVADO: { label: "Archivado", variant: "neutral" },
  }
  const config = configs[estado] ?? { label: estado, variant: "neutral" as BadgeVariant }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

// Badge de temperatura
export function TempBadge({ temp }: { temp: string }) {
  const labels: Record<string, string> = {
    CALIENTE: "🔥 Caliente",
    TIBIO: "🟡 Tibio",
    FRIO: "🔵 Frío",
  }
  const variants: Record<string, BadgeVariant> = {
    CALIENTE: "danger",
    TIBIO: "warning",
    FRIO: "info",
  }
  return (
    <Badge variant={variants[temp] ?? "neutral"}>
      {labels[temp] ?? temp}
    </Badge>
  )
}
