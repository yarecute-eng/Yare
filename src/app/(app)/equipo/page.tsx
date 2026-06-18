import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import { Users, Trophy, TrendingUp, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { formatMonto } from "@/lib/utils"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Equipo — Princessitas Ceremonias" }

// ─── Types ───────────────────────────────────────────────────────────────────

interface VendedorStats {
  id: string
  nombre: string
  metaMensual: number
  clientesActivos: number
  clientesGanadosMes: number
  ingresosMes: number
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function EquipoPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Fetch all active vendedores (if VENDEDOR, only fetch self)
  const vendedores = await prisma.usuario.findMany({
    where: {
      activo: true,
      rol: "VENDEDOR",
      ...(esAdmin ? {} : { id: usuario.id }),
    },
    select: {
      id: true,
      nombre: true,
      metaMensual: true,
    },
  })

  // For each vendedor, compute stats in parallel
  const statsArray: VendedorStats[] = await Promise.all(
    vendedores.map(async (v) => {
      const [clientesActivos, clientesGanadosMes, ingresosAgg] = await Promise.all([
        prisma.cliente.count({
          where: {
            vendedorId: v.id,
            estado: "ACTIVO",
            eliminadoEn: null,
          },
        }),
        prisma.cliente.count({
          where: {
            vendedorId: v.id,
            ganadoEn: { gte: startOfMonth },
            eliminadoEn: null,
          },
        }),
        prisma.pago.aggregate({
          _sum: { monto: true },
          where: {
            eliminadoEn: null,
            estatus: "PAGADO",
            fechaPago: { gte: startOfMonth },
            cliente: { vendedorId: v.id },
          },
        }),
      ])

      return {
        id: v.id,
        nombre: v.nombre,
        metaMensual: v.metaMensual ?? 10,
        clientesActivos,
        clientesGanadosMes,
        ingresosMes: ingresosAgg._sum.monto ?? 0,
      }
    })
  )

  // Sort: most clients won this month first, then by revenue
  const ranking = [...statsArray].sort((a, b) => {
    if (b.clientesGanadosMes !== a.clientesGanadosMes) {
      return b.clientesGanadosMes - a.clientesGanadosMes
    }
    return b.ingresosMes - a.ingresosMes
  })

  const miStats = statsArray.find((s) => s.id === usuario.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a78bdb]/15">
          <Users className="h-5 w-5 text-[#7050ad]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Equipo</h1>
          <p className="text-sm text-gray-500">
            Ranking del mes · {now.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Tu meta — shown for VENDEDOR or as context for ADMIN viewing their own card */}
      {miStats && (
        <Card padding="lg" className="border-[#a78bdb]/30 bg-gradient-to-br from-[#a78bdb]/5 to-white dark:from-[#a78bdb]/10 dark:to-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-[#a78bdb]" />
            <h2 className="text-sm font-semibold text-[#7050ad] dark:text-[#c8a8f0]">
              {esAdmin ? `Tu progreso — ${miStats.nombre}` : "Tu meta este mes"}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {miStats.clientesGanadosMes}
                <span className="text-sm font-normal text-gray-400">/{miStats.metaMensual}</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Ganados / Meta</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {miStats.clientesActivos}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Activos</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatMonto(miStats.ingresosMes)}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Ingresos mes</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progreso hacia meta</span>
              <span>
                {Math.min(
                  100,
                  Math.round((miStats.clientesGanadosMes / miStats.metaMensual) * 100)
                )}
                %
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#a78bdb] to-[#7050ad] transition-all duration-500"
                style={{
                  width: `${Math.min(100, (miStats.clientesGanadosMes / miStats.metaMensual) * 100)}%`,
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Ranking list */}
      {esAdmin && ranking.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <TrendingUp className="h-4 w-4 text-[#a78bdb]" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ranking del equipo
            </h2>
          </div>
          <div className="space-y-3">
            {ranking.map((v, index) => {
              const rank = index + 1
              const pct = Math.min(
                100,
                miStats?.metaMensual
                  ? (v.clientesGanadosMes / v.metaMensual) * 100
                  : 0
              )
              const esPrimero = rank === 1
              const esMio = v.id === usuario.id

              return (
                <Card
                  key={v.id}
                  padding="md"
                  className={cn(
                    "transition-all",
                    esPrimero && "border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-900/10",
                    esMio && !esPrimero && "border-[#a78bdb]/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank badge */}
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        rank === 1 && "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
                        rank === 2 && "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                        rank === 3 && "bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400",
                        rank > 3 && "bg-gray-50 text-gray-400 dark:bg-gray-800/50 dark:text-gray-500"
                      )}
                    >
                      {rank === 1 ? <Trophy className="h-4 w-4" /> : `#${rank}`}
                    </div>

                    {/* Avatar + nombre */}
                    <Avatar nombre={v.nombre} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {v.nombre}
                        </p>
                        {esMio && (
                          <span className="rounded-full bg-[#a78bdb]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#7050ad] dark:text-[#c8a8f0]">
                            tú
                          </span>
                        )}
                      </div>
                      {/* Progress bar */}
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              rank === 1
                                ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                : "bg-gradient-to-r from-[#a78bdb] to-[#7050ad]"
                            )}
                            style={{
                              width: `${Math.min(100, (v.clientesGanadosMes / v.metaMensual) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {v.clientesGanadosMes}/{v.metaMensual}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatMonto(v.ingresosMes)}
                      </p>
                      <p className="text-xs text-gray-400">{v.clientesActivos} activos</p>
                    </div>
                  </div>

                  {/* Mobile stats row */}
                  <div className="mt-3 flex gap-4 sm:hidden">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatMonto(v.ingresosMes)}
                      </p>
                      <p className="text-xs text-gray-400">ingresos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {v.clientesActivos}
                      </p>
                      <p className="text-xs text-gray-400">activos</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Empty state for admin with no vendedores */}
      {esAdmin && ranking.length === 0 && (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Users className="h-10 w-10 text-gray-200 dark:text-gray-700" />
            <p className="text-gray-400 dark:text-gray-500">No hay vendedores activos aún</p>
          </div>
        </Card>
      )}
    </div>
  )
}
