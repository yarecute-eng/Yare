import Link from "next/link"
import { Crown, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-[#a78bdb]/10 flex items-center justify-center">
          <Crown className="h-8 w-8 text-[#a78bdb]" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Página no encontrada
        </h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          Esta página no existe o la liga cambió. No te preocupes, tu información está guardada.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-[#a78bdb] px-6 py-3 text-white font-medium hover:bg-[#8b6cc7] transition-colors"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
