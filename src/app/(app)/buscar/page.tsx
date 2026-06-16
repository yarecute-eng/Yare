import { Metadata } from "next"

export const metadata: Metadata = { title: "Buscar" }

export default function BuscarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">buscar</h1>
        <p className="text-gray-500 text-sm">Cargando...</p>
      </div>
      <div className="rounded-xl border bg-white dark:bg-gray-900 p-8 text-center text-gray-400">
        Sección en construcción
      </div>
    </div>
  )
}
