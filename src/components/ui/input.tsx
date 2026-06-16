import { forwardRef, InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900",
              "placeholder:text-gray-400 transition-colors",
              "dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:border-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-[#a78bdb] focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-200 hover:border-gray-300 dark:hover:border-gray-600",
              icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export function Textarea({
  label,
  error,
  hint,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  hint?: string
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900",
          "placeholder:text-gray-400 transition-colors resize-none",
          "dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:border-gray-700",
          "focus:outline-none focus:ring-2 focus:ring-[#a78bdb] focus:border-transparent",
          error ? "border-red-400" : "border-gray-200",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
