import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { Search, User, Calendar, CreditCard } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { etapaLabel, formatMonto, formatFecha } from "@/lib/utils"

export const metadata: Metadata = { title: "Buscar — Princessitas Ceremonias" }

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"

  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const hayBusqueda = q.length >= 2

  let clientes: any[] = []
  let citas: any[] = []
  let pagos: any[] = []

  if (hayBusqueda) {
    const clienteWhere: any = {
      eliminadoEn: null,
      OR: [
        { nombre: { contains: q } },
        { telefono: { contains: q } },
        { correo: { contains: q } },
        { empresa: { contains: q } },
      ],
    }
    if (!esAdmin) clienteWhere.vendedorId = usuario.id

    ;[clientes, citas, pagos] = await Promise.all([
      prisma.cliente.findMany({
        where: clienteWhere,
        select: {
          id: true,
          nombre: true,
          telefono: true,
          etapa: true,
          empresa: true,
        },
        take: 10,
      }),
      prisma.cita.findMany({
        where: {
          eliminadoEn: null,
          titulo: { contains: q },
        },
        select: {
          id: true,
          titulo: true,
          fecha: true,
          clienteId: true,
          cliente: { select: { nombre: true } },
        },
        take: 5,
      }),
      prisma.pago.findMany({
        where: {
          eliminadoEn: null,
          concepto: { contains: q },
        },
        select: {
          id: true,
          monto: true,
          concepto: true,
          clienteId: true,
          cliente: { select: { nombre: true } },
        },
        take: 5,
      }),
    ])
  }

  const totalResultados = clientes.length + citas.length + pagos.length
  const sinResultados = hayBusqueda && totalResultados === 0

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a78bdb]/15">
          <Search className="h-5 w-5 text-[#7050ad]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buscar</h1>
          <p className="text-sm text-gray-500">Clientes, citas y pagos</p>
        </div>
      </div>

      {/* Search form — pure HTML GET, no JS needed */}
      <form action="/buscar" method="GET">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Nombre, teléfono, correo, empresa..."
            autoFocus
            autoComplete="off"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-[#a78bdb] focus:ring-2 focus:ring-[#a78bdb]/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
          {q && (
            <a
              href="/buscar"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              Limpiar
            </a>
          )}
        </div>
      </form>

      {/* Empty prompt */}
      {!hayBusqueda && (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Search className="h-10 w-10 text-gray-200 dark:text-gray-700" />
            <p className="text-gray-400 dark:text-gray-500">Escribe para buscar...</p>
            <p className="text-xs text-gray-300 dark:text-gray-600">Mínimo 2 caracteres</p>
          </div>
        </Card>
      )}

      {/* No results */}
      {sinResultados && (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Search className="h-10 w-10 text-gray-200 dark:text-gray-700" />
            <p className="font-medium text-gray-600 dark:text-gray-400">
              Sin resultados para &ldquo;{q}&rdquo;
            </p>
            <p className="text-xs text-gray-400">Intenta con otro nombre, teléfono o correo</p>
          </div>
        </Card>
      )}

      {/* Results */}
      {hayBusqueda && totalResultados > 0 && (
        <div className="space-y-6">
          {/* Clientes */}
          {clientes.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <User className="h-4 w-4 text-[#a78bdb]" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Clientes
                  <span className="ml-1.5 text-xs font-normal text-gray-400">
                    ({clientes.length})
                  </span>
                </h2>
              </div>
              <Card padding="none">
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {clientes.map((cliente) => (
                    <li key={cliente.id}>
                      <Link
                        href={`/clientes/${cliente.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-[#a78bdb]/5 dark:hover:bg-[#a78bdb]/10"
                      >
                        <Avatar nombre={cliente.nombre} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {cliente.nombre}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {cliente.telefono}
                            {cliente.empresa && (
                              <span className="ml-2 text-gray-400">· {cliente.empresa}</span>
                            )}
                          </p>
                        </div>
                        <Badge variant="neutral" className="shrink-0 text-xs">
                          {etapaLabel[cliente.etapa] ?? cliente.etapa}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          {/* Citas */}
          {citas.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Calendar className="h-4 w-4 text-[#a78bdb]" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Citas
                  <span className="ml-1.5 text-xs font-normal text-gray-400">
                    ({citas.length})
                  </span>
                </h2>
              </div>
              <Card padding="none">
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {citas.map((cita) => (
                    <li key={cita.id}>
                      <Link
                        href={`/clientes/${cita.clienteId}`}
                        className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-[#a78bdb]/5 dark:hover:bg-[#a78bdb]/10"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <Calendar className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {cita.titulo}
                          </p>
                          <p className="truncate text-xs text-gray-500">{cita.cliente.nombre}</p>
                        </div>
                        <span className="shrink-0 text-xs text-gray-400">
                          {formatFecha(cita.fecha)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          {/* Pagos */}
          {pagos.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <CreditCard className="h-4 w-4 text-[#a78bdb]" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Pagos
                  <span className="ml-1.5 text-xs font-normal text-gray-400">
                    ({pagos.length})
                  </span>
                </h2>
              </div>
              <Card padding="none">
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {pagos.map((pago) => (
                    <li key={pago.id}>
                      <Link
                        href={`/clientes/${pago.clienteId}`}
                        className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-[#a78bdb]/5 dark:hover:bg-[#a78bdb]/10"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                          <CreditCard className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {pago.concepto ?? "Sin concepto"}
                          </p>
                          <p className="truncate text-xs text-gray-500">{pago.cliente.nombre}</p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-green-600 dark:text-green-400">
                          {formatMonto(pago.monto)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
