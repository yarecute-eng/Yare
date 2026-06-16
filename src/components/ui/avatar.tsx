import { cn } from "@/lib/utils"

interface AvatarProps {
  nombre?: string | null
  src?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

function getIniciales(nombre: string): string {
  const partes = nombre.trim().split(" ")
  if (partes.length === 1) return partes[0][0]?.toUpperCase() ?? "?"
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

// Colores basados en el nombre para consistencia
function getColor(nombre: string): string {
  const colors = [
    "bg-[#a78bdb] text-white",
    "bg-blue-500 text-white",
    "bg-green-500 text-white",
    "bg-amber-500 text-white",
    "bg-pink-500 text-white",
    "bg-teal-500 text-white",
    "bg-indigo-500 text-white",
    "bg-orange-500 text-white",
  ]
  let hash = 0
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
}

export function Avatar({ nombre, src, size = "md", className }: AvatarProps) {
  const n = nombre ?? "?"
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold shrink-0 overflow-hidden",
        sizeMap[size],
        !src && getColor(n),
        className
      )}
    >
      {src ? (
        <img src={src} alt={n} className="h-full w-full object-cover" />
      ) : (
        <span>{getIniciales(n)}</span>
      )}
    </div>
  )
}
