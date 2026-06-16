import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
  glass?: boolean
  hover?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

export function Card({ children, className, glass, hover, padding = "md" }: CardProps) {
  const paddingMap = { none: "", sm: "p-4", md: "p-5", lg: "p-6" }
  return (
    <div
      className={cn(
        "rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800",
        glass && "glass dark:glass",
        hover && "transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-lg font-semibold text-gray-900 dark:text-white", className)}>{children}</h3>
}
