"use client"
import Link from "next/link"
import {
  Users, CalendarDays, Wallet, ListChecks, TrendingUp, TrendingDown,
  AlertCircle, Trophy, Target, Sparkles, ChevronRight
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatMonto } from "@/lib/utils"

interface Stats {
  totalClientes: number
  clientesNuevosMes: number
  clientesGanados: number
  citasHoy: number
  pagosVencidos: number
  clientesSinAccion: number
  metaMensual: number
  porcMeta: number
  ingresosDelMes: number
  clientesMesAnterior: number
}

interface Props {
  stats: Stats
  usuario: { nombre: string; rol: string; id: string }
}

export default function DashboardClient({ stats, usuario }: Props) {
  const {
    totalClientes, clientesNuevosMes, clientesGanados, citasHoy,
    pagosVencidos, clientesSinAccion, metaMensual, porcMeta,
    ingresosDelMes, clientesMesAnterior,
  } = stats

  const crecimiento = clientesMesAnterior > 0
    ? Math.round(((clientesGanados - clientesMesAnterior) / clientesMesAnterior) * 100)
    : clientesGanados > 0 ? 100 : 0

  const semaforoMeta = porcMeta >= 80 ? "green" : porcMeta >= 50 ? "amber" : "red"
  const diasMes = new Date().getDate()
  const diasTotales = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const diasFaltan = diasTotales - diasMes

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tablero
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">¿Vas a cerrar el mes?</p>
        </div>
        <Link href="/seguimiento">
          <Button variant="primary" size="md" icon={<ListChecks className="h-4 w-4" />}>
            Ver seguimiento
          </Button>
        </Link>
      </div>

      {/* Alertas activas */}
      {(pagosVencidos > 0 || clientesSinAccion > 0) && (
        <div className="space-y-2">
          {pagosVencidos > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">
                <strong>{pagosVencidos}</strong> pago{pagosVencidos !== 1 ? "s" : ""} vencido{pagosVencidos !== 1 ? "s" : ""} — ya te dijeron que sí, solo falta cobrar.{" "}
                <Link href="/pagos?estatus=VENCIDO" className="underline font-medium">Ver pagos</Link>
              </p>
            </div>
          )}
          {clientesSinAccion > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                🟠 <strong>{clientesSinAccion}</strong> cliente{clientesSinAccion !== 1 ? "s" : ""} activo{clientesSinAccion !== 1 ? "s" : ""} sin próxima acción — se enfrían solos.{" "}
                <Link href="/clientes?sinAccion=true" className="underline font-medium">Asignarles una</Link>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Meta del mes — la tarjeta más importante */}
      <Card className="border-2 border-[#a78bdb]/20" padding="lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-5 w-5 text-[#a78bdb]" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Meta del mes</h2>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {clientesGanados}
              <span className="text-xl text-gray-400 font-normal"> / {metaMensual}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">clientes cerrados este mes</p>
          </div>
          <div className="text-right">
            <Badge variant={semaforoMeta === "green" ? "success" : semaforoMeta === "amber" ? "warning" : "danger"}>
              {semaforoMeta === "green" ? "🟢 ¡Vas muy bien!" : semaforoMeta === "amber" ? "🟡 Vas ajustado" : "🔴 Te falta acelerar"}
            </Badge>
            <p className="text-xs text-gray-400 mt-1">{diasFaltan} días restantes</p>
          </div>
        </div>
        <Progress value={porcMeta} color={semaforoMeta === "green" ? "green" : semaforoMeta === "amber" ? "amber" : "red"} size="md" />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">{porcMeta}% completado</span>
          <span className="text-xs text-gray-500">
            {metaMensual - clientesGanados > 0 ? `Necesitas ${metaMensual - clientesGanados} más` : "¡Meta alcanzada! 🎉"}
          </span>
        </div>
      </Card>

      {/* Bento grid de números clave */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          href="/clientes"
          icon={<Users className="h-5 w-5 text-blue-500" />}
          label="Clientes activos"
          value={totalClientes}
          sub={`+${clientesNuevosMes} este mes`}
        />
        <StatCard
          href="/agenda"
          icon={<CalendarDays className="h-5 w-5 text-green-500" />}
          label="Citas hoy"
          value={citasHoy}
          sub="Ver agenda"
        />
        <StatCard
          href="/pagos"
          icon={<Wallet className="h-5 w-5 text-emerald-500" />}
          label="Cobrado este mes"
          value={formatMonto(ingresosDelMes)}
          sub={crecimiento !== 0 ? `${crecimiento > 0 ? "▲" : "▼"} ${Math.abs(crecimiento)}% vs mes anterior` : "Primer mes"}
          crecimiento={crecimiento}
          isMoneda
        />
        <StatCard
          href="/completados"
          icon={<Trophy className="h-5 w-5 text-green-600" />}
          label="Ganados"
          value={clientesGanados}
          sub={`Meta: ${metaMensual}`}
          crecimiento={crecimiento}
        />
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/clientes/nuevo", label: "Agregar cliente", icon: Users, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
            { href: "/agenda/nuevo", label: "Agendar cita", icon: CalendarDays, color: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" },
            { href: "/pagos/nuevo", label: "Registrar pago", icon: Wallet, color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
            { href: "/seguimiento", label: "Hoy te toca", icon: ListChecks, color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
          ].map((a) => (
            <Link key={a.href} href={a.href}>
              <div className={`rounded-xl p-4 ${a.color} flex flex-col items-center gap-2 text-center cursor-pointer hover:opacity-90 transition-opacity min-h-[80px] justify-center`}>
                <a.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Asistente IA - promo */}
      <Card className="bg-gradient-to-r from-[#a78bdb]/10 to-transparent border-[#a78bdb]/20">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#a78bdb] flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">Asistente de IA disponible</p>
            <p className="text-sm text-gray-500">Redacta mensajes, clasifica clientes y sugiere próximas acciones.</p>
          </div>
          <Link href="/clientes">
            <Button variant="outline" size="sm" iconRight={<ChevronRight className="h-4 w-4" />}>
              Ver clientes
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

function StatCard({
  href, icon, label, value, sub, crecimiento, isMoneda
}: {
  href: string
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  crecimiento?: number
  isMoneda?: boolean
}) {
  return (
    <Link href={href}>
      <Card hover padding="md" className="h-full">
        <div className="flex items-center justify-between mb-3">
          {icon}
          {crecimiento !== undefined && crecimiento !== 0 && (
            <span className={`text-xs font-medium ${crecimiento > 0 ? "text-green-600" : "text-red-500"}`}>
              {crecimiento > 0 ? "▲" : "▼"} {Math.abs(crecimiento)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </Card>
    </Link>
  )
}
