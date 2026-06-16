"use client"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Algo salió mal
        </h1>
        <p className="text-gray-500 mb-6 max-w-sm">
          Ocurrió un error inesperado. Tus datos están seguros — intenta de nuevo.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-[#a78bdb] px-6 py-3 text-white font-medium hover:bg-[#8b6cc7] transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    </div>
  )
}
