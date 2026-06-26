import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Shield,
  Users,
  Activity,
  Settings,
  CheckCircle2,
  Circle,
} from "lucide-react"
import CrearUsuarioForm from "./crear-usuario-form"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { formatFecha, formatMonto, cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "usuarios" | "auditoria" | "configuracion"

interface PageProps {
  searchParams: Promise<{ tab?: string; auditPage?: string }>
}

// ---------------------------------------------------------------------------
// Helper: colour-code audit actions
// ---------------------------------------------------------------------------

function accionColor(accion: string): string {
  const a = accion.toUpperCase()
  if (a.includes("CREAR")) return "text-emerald-600"
  if (a.includes("ELIMINAR")) return "text-rose-600"
  if (a.includes("ACTUALIZAR")) return "text-blue-600"
  return "text-gray-500"
}

function accionBg(accion: string): string {
  const a = accion.toUpperCase()
  if (a.includes("CREAR")) return "bg-emerald-50 border-emerald-200"
  if (a.includes("ELIMINAR")) return "bg-rose-50 border-rose-200"
  if (a.includes("ACTUALIZAR")) return "bg-blue-50 border-blue-200"
  return "bg-gray-50 border-gray-200"
}

// ---------------------------------------------------------------------------
// Sub-components (server-safe, no "use client")
// ---------------------------------------------------------------------------

// --- Stat Card --------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <Card padding="md">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </Card>
  )
}

// --- Tab link ---------------------------------------------------------------

function TabLink({
  href,
  active,
  icon: Icon,
  label,
}: {
  href: string
  active: boolean
  icon: React.ElementType
  label: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-[#a78bdb]/10 text-[#a78bdb]"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminPage({ searchParams }: PageProps) {
  const session = await auth()
  const usuario = session?.user

  if (!usuario || usuario.rol !== "ADMIN") {
    redirect("/dashboard")
  }

  const params = await searchParams
  const tab: Tab = (params.tab as Tab) ?? "usuarios"
  const auditPage = Math.max(1, parseInt(params.auditPage ?? "1", 10))
  const AUDIT_PAGE_SIZE = 50

  // -------------------------------------------------------------------------
  // Global stats (always fetched — shown at top of configuracion tab,
  // and also useful for the header badge)
  // -------------------------------------------------------------------------
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalClientesActivos, totalUsuariosActivos, pagosMes] =
    await Promise.all([
      prisma.cliente.count({ where: { estado: "ACTIVO", eliminadoEn: null } }),
      prisma.usuario.count({ where: { activo: true } }),
      prisma.pago.aggregate({
        _sum: { monto: true },
        where: {
          estatus: "PAGADO",
          fechaPago: { gte: startOfMonth },
          eliminadoEn: null,
        },
      }),
    ])

  const totalPagosMes = pagosMes._sum.monto ?? 0

  // -------------------------------------------------------------------------
  // Tab-specific data
  // -------------------------------------------------------------------------

  let usuarios: Awaited<ReturnType<typeof prisma.usuario.findMany>> = []
  let registros: Awaited<ReturnType<typeof prisma.registroAuditoria.findMany>> =
    []
  let totalRegistros = 0
  let config: Awaited<
    ReturnType<typeof prisma.configuracionNegocio.findUnique>
  > | null = null

  if (tab === "usuarios") {
    usuarios = await prisma.usuario.findMany({
      orderBy: { creadoEn: "desc" },
    })
  } else if (tab === "auditoria") {
    const skip = (auditPage - 1) * AUDIT_PAGE_SIZE
    ;[registros, totalRegistros] = await Promise.all([
      prisma.registroAuditoria.findMany({
        orderBy: { fecha: "desc" },
        take: AUDIT_PAGE_SIZE,
        skip,
      }),
      prisma.registroAuditoria.count(),
    ])
  } else if (tab === "configuracion") {
    config = await prisma.configuracionNegocio.findUnique({
      where: { id: "singleton" },
    })
  }

  const vendedoresActivos = usuarios.filter(
    (u) => u.rol === "VENDEDOR" && u.activo
  ).length

  const totalPages = Math.ceil(totalRegistros / AUDIT_PAGE_SIZE)

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ----------------------------------------------------------------- */}
        {/* Page header                                                        */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a78bdb]/10">
            <Shield className="h-5 w-5 text-[#a78bdb]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Panel de administración
            </h1>
            <p className="text-sm text-gray-500">
              Princessitas Ceremonias · {usuario.nombre}
            </p>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Tab navigation                                                     */}
        {/* ----------------------------------------------------------------- */}
        <nav className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm w-fit">
          <TabLink
            href="/admin?tab=usuarios"
            active={tab === "usuarios"}
            icon={Users}
            label="Usuarios"
          />
          <TabLink
            href="/admin?tab=auditoria"
            active={tab === "auditoria"}
            icon={Activity}
            label="Auditoría"
          />
          <TabLink
            href="/admin?tab=configuracion"
            active={tab === "configuracion"}
            icon={Settings}
            label="Configuración"
          />
        </nav>

        {/* ================================================================= */}
        {/* TAB: USUARIOS                                                       */}
        {/* ================================================================= */}
        {tab === "usuarios" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-800">
                  {vendedoresActivos}
                </span>{" "}
                {vendedoresActivos === 1
                  ? "vendedor activo"
                  : "vendedores activos"}
              </p>
              <p className="text-xs text-gray-400">
                {usuarios.length} usuarios en total
              </p>
              <CrearUsuarioForm />
            </div>

            <Card padding="md">
              <div className="overflow-x-auto -mx-4 sm:-mx-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Usuario
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                        Correo
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Rol
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Estado
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                        Meta mensual
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                        Registrado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {usuarios.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar nombre={u.nombre} size="sm" />
                            <span className="font-medium text-gray-900 whitespace-nowrap">
                              {u.nombre}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-500 hidden sm:table-cell">
                          {u.correo}
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <Badge
                            variant={
                              u.rol === "ADMIN" ? "default" : "info"
                            }
                            className={cn(
                              "text-xs font-medium",
                              u.rol === "ADMIN"
                                ? "bg-[#a78bdb]/10 text-[#a78bdb] border-[#a78bdb]/20"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            )}
                          >
                            {u.rol}
                          </Badge>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex items-center gap-1.5">
                            {u.activo ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-xs text-emerald-600 font-medium">
                                  Activo
                                </span>
                              </>
                            ) : (
                              <>
                                <Circle className="h-3.5 w-3.5 text-gray-300" />
                                <span className="text-xs text-gray-400">
                                  Inactivo
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-right hidden md:table-cell">
                          {u.metaMensual != null ? (
                            <span className="text-gray-700 font-medium">
                              {u.metaMensual}
                              <span className="text-gray-400 text-xs ml-0.5">
                                clientes
                              </span>
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-right text-gray-400 text-xs hidden lg:table-cell">
                          {formatFecha(u.creadoEn)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

          </section>
        )}

        {/* ================================================================= */}
        {/* TAB: AUDITORÍA                                                      */}
        {/* ================================================================= */}
        {tab === "auditoria" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Mostrando{" "}
                <span className="font-semibold text-gray-800">
                  {registros.length}
                </span>{" "}
                de {totalRegistros} registros
              </p>
              {totalPages > 1 && (
                <p className="text-xs text-gray-400">
                  Página {auditPage} / {totalPages}
                </p>
              )}
            </div>

            <Card padding="md">
              {registros.length === 0 ? (
                <div className="py-12 text-center">
                  <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Sin registros de auditoría
                  </p>
                </div>
              ) : (
                <ol className="relative space-y-0">
                  {registros.map((r, idx) => (
                    <li key={r.id} className="flex gap-4 group">
                      {/* Timeline spine */}
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "mt-1 h-2.5 w-2.5 rounded-full border-2 shrink-0",
                            r.accion.toUpperCase().includes("CREAR")
                              ? "border-emerald-400 bg-emerald-100"
                              : r.accion.toUpperCase().includes("ELIMINAR")
                                ? "border-rose-400 bg-rose-100"
                                : r.accion.toUpperCase().includes("ACTUALIZAR")
                                  ? "border-blue-400 bg-blue-100"
                                  : "border-gray-300 bg-gray-100"
                          )}
                        />
                        {idx < registros.length - 1 && (
                          <div className="w-px flex-1 bg-gray-100 mt-1" />
                        )}
                      </div>

                      {/* Content */}
                      <div
                        className={cn(
                          "mb-3 flex-1 rounded-lg border px-4 py-3 text-sm",
                          accionBg(r.accion)
                        )}
                      >
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span
                            className={cn(
                              "font-bold tracking-wide text-xs uppercase",
                              accionColor(r.accion)
                            )}
                          >
                            {r.accion}
                          </span>
                          <span className="text-gray-600 text-xs">
                            {r.entidad}
                          </span>
                          {r.entidadId && (
                            <code className="text-gray-400 text-[10px] font-mono truncate max-w-[120px]">
                              #{r.entidadId.slice(-8)}
                            </code>
                          )}
                          <span className="ml-auto text-gray-400 text-[11px] shrink-0">
                            {formatFecha(r.fecha)}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                          {r.usuarioNombre && (
                            <span className="font-medium text-gray-700">
                              {r.usuarioNombre}
                            </span>
                          )}
                          {r.detalle && (
                            <span className="text-gray-400 truncate max-w-xs">
                              {r.detalle}
                            </span>
                          )}
                          {r.ip && (
                            <span className="text-gray-300 font-mono text-[10px]">
                              {r.ip}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-1">
                {auditPage > 1 && (
                  <Link
                    href={`/admin?tab=auditoria&auditPage=${auditPage - 1}`}
                    className="text-sm text-[#a78bdb] hover:underline"
                  >
                    ← Anterior
                  </Link>
                )}
                {auditPage < totalPages && (
                  <Link
                    href={`/admin?tab=auditoria&auditPage=${auditPage + 1}`}
                    className="text-sm text-[#a78bdb] hover:underline"
                  >
                    Ver más →
                  </Link>
                )}
              </div>
            )}
          </section>
        )}

        {/* ================================================================= */}
        {/* TAB: CONFIGURACIÓN                                                  */}
        {/* ================================================================= */}
        {tab === "configuracion" && (
          <section className="space-y-6">
            {/* Stats summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Clientes activos"
                value={totalClientesActivos}
                sub="sin eliminar"
              />
              <StatCard
                label="Usuarios activos"
                value={totalUsuariosActivos}
                sub="en el sistema"
              />
              <StatCard
                label="Pagos del mes"
                value={formatMonto(totalPagosMes)}
                sub="pagados este mes"
              />
            </div>

            {/* Config display */}
            {config ? (
              <Card padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-gray-900 text-base">
                    Configuración del negocio
                  </h2>
                  <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-xs">
                    Solo lectura
                  </Badge>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  {/* Nombre */}
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Nombre del negocio
                    </dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {config.nombre}
                    </dd>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      WhatsApp del negocio
                    </dt>
                    <dd className="text-sm text-gray-800 font-mono">
                      {config.whatsappNegocio ?? (
                        <span className="text-gray-300">No configurado</span>
                      )}
                    </dd>
                  </div>

                  {/* Meta mensual */}
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Meta mensual
                    </dt>
                    <dd className="text-sm text-gray-800">
                      <span className="font-semibold">{config.metaMensual}</span>
                      <span className="text-gray-400 ml-1">clientes</span>
                    </dd>
                  </div>

                  {/* Comisión global */}
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Comisión global
                    </dt>
                    <dd className="text-sm text-gray-800">
                      {config.comisionGlobal != null ? (
                        <>
                          <span className="font-semibold">
                            {config.comisionGlobal}
                          </span>
                          <span className="text-gray-400 ml-0.5">%</span>
                        </>
                      ) : (
                        <span className="text-gray-300">No configurada</span>
                      )}
                    </dd>
                  </div>

                  {/* Umbral de estancamiento */}
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Umbral de estancamiento
                    </dt>
                    <dd className="text-sm text-gray-800">
                      <span className="font-semibold">
                        {config.umbralEstancamiento}
                      </span>
                      <span className="text-gray-400 ml-1">días</span>
                    </dd>
                  </div>

                  {/* Horario */}
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Horario de atención
                    </dt>
                    <dd className="text-sm text-gray-800 font-mono">
                      {config.horarioInicio} – {config.horarioFin}
                    </dd>
                  </div>

                  {/* Duración de cita */}
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Duración de cita
                    </dt>
                    <dd className="text-sm text-gray-800">
                      <span className="font-semibold">
                        {config.duracionCita}
                      </span>
                      <span className="text-gray-400 ml-1">minutos</span>
                    </dd>
                  </div>

                  {/* Color de marca */}
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Color de marca
                    </dt>
                    <dd className="flex items-center gap-2">
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-white shadow"
                        style={{ backgroundColor: config.colorMarca }}
                      />
                      <span className="text-sm font-mono text-gray-700">
                        {config.colorMarca}
                      </span>
                    </dd>
                  </div>

                  {/* Motivos de pérdida — full width */}
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Motivos de pérdida
                    </dt>
                    <dd className="flex flex-wrap gap-2">
                      {config.motivosPerdida
                        .split(",")
                        .map((m) => m.trim())
                        .filter(Boolean)
                        .map((motivo) => (
                          <Badge
                            key={motivo}
                            className="bg-[#a78bdb]/10 text-[#a78bdb] border-[#a78bdb]/20 text-xs font-medium"
                          >
                            {motivo}
                          </Badge>
                        ))}
                    </dd>
                  </div>
                </dl>
              </Card>
            ) : (
              <Card padding="lg">
                <div className="py-10 text-center">
                  <Settings className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    No se encontró la configuración del negocio.
                  </p>
                </div>
              </Card>
            )}

            <p className="text-center text-xs text-gray-400 py-1">
              Edición de configuración próximamente
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
