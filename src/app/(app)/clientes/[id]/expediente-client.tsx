"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Phone, Mail, Edit3, Trophy, XCircle, Archive,
  MessageSquare, Calendar, CreditCard, FileText, Clock,
  Sparkles, AlertCircle, CheckCircle, RotateCcw, Building2,
  MapPin, Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge, TempBadge, EstadoBadge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Modal, ConfirmModal } from "@/components/ui/modal"
import { useToast } from "@/components/ui/toast"
import { InfoTooltip } from "@/components/ui/tooltip"
import {
  etapaLabel, formatMonto, formatFecha, formatFechaCompleta, diasSinContacto, cn,
} from "@/lib/utils"
import {
  marcarGanado, marcarPerdido, archivarCliente, restaurarCliente,
} from "@/app/actions/clientes"
import Confetti from "./confetti"

interface Props {
  cliente: any
  usuario: { id: string; rol: string; nombre: string }
  config: any
}

export default function ExpedienteClient({ cliente, usuario, config }: Props) {
  const router = useRouter()
  const { success, error: showError, toast } = useToast()
  const [showGanado, setShowGanado] = useState(false)
  const [showPerdido, setShowPerdido] = useState(false)
  const [showArchivar, setShowArchivar] = useState(false)
  const [showCelebracion, setShowCelebracion] = useState(false)
  const [motivoPerdida, setMotivoPerdida] = useState("")
  const [loadingAccion, setLoadingAccion] = useState(false)

  const totalPagado = cliente.pagos
    .filter((p: any) => p.estatus === "PAGADO")
    .reduce((acc: number, p: any) => acc + p.monto, 0)

  const totalPendiente = cliente.pagos
    .filter((p: any) => p.estatus !== "PAGADO")
    .reduce((acc: number, p: any) => acc + p.monto, 0)

  const valorTotal = cliente.valorEstimado ?? 0
  const porcPagado = valorTotal > 0 ? Math.min(100, (totalPagado / valorTotal) * 100) : 0

  const dias = diasSinContacto(cliente.ultimoContacto)
  const accionVencida = cliente.proximaAccionFecha && new Date(cliente.proximaAccionFecha) < new Date()

  async function handleGanado() {
    setLoadingAccion(true)
    const result = await marcarGanado(cliente.id)
    setLoadingAccion(false)
    setShowGanado(false)
    if (result.error) { showError(result.error); return }
    setShowCelebracion(true)
    setTimeout(() => {
      setShowCelebracion(false)
      router.refresh()
    }, 2500)
  }

  async function handlePerdido() {
    if (!motivoPerdida) { showError("Elige el motivo"); return }
    setLoadingAccion(true)
    const result = await marcarPerdido(cliente.id, motivoPerdida)
    setLoadingAccion(false)
    setShowPerdido(false)
    if (result.error) { showError(result.error); return }
    toast("info", "Cliente movido a Perdidos", {
      label: "Deshacer",
      onClick: () => restaurarCliente(cliente.id).then(() => router.refresh()),
    })
    router.refresh()
  }

  async function handleArchivar() {
    setLoadingAccion(true)
    const result = await archivarCliente(cliente.id)
    setLoadingAccion(false)
    setShowArchivar(false)
    if (result.error) { showError(result.error); return }
    toast("info", "Cliente archivado", {
      label: "Deshacer",
      onClick: () => restaurarCliente(cliente.id).then(() => router.refresh()),
    })
    router.push("/clientes")
  }

  const waUrl = `https://wa.me/${cliente.telefono}`
  const mailUrl = `mailto:${cliente.correo}?subject=Hola ${cliente.nombre}&body=Hola ${cliente.nombre}, `

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {showCelebracion && <Confetti nombre={cliente.nombre} valor={cliente.valorEstimado} />}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/clientes">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Clientes
          </Button>
        </Link>
        <span className="text-gray-300 dark:text-gray-700">/</span>
        <span className="text-sm text-gray-500 truncate">{cliente.nombre}</span>
      </div>

      {/* Encabezado del cliente */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Avatar nombre={cliente.nombre} size="xl" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{cliente.nombre}</h1>
              {cliente.empresa && (
                <p className="text-gray-500 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {cliente.empresa}
                  {cliente.cargo && ` • ${cliente.cargo}`}
                </p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                <EstadoBadge estado={cliente.estado} />
                <TempBadge temp={cliente.temperatura} />
                <Badge variant="default">{etapaLabel[cliente.etapa] ?? cliente.etapa}</Badge>
              </div>
            </div>
          </div>

          {/* Botones de contacto + acciones */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {cliente.telefono && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="success" size="sm" icon={<Phone className="h-4 w-4" />}>
                    WhatsApp
                  </Button>
                </a>
              )}
              {cliente.correo && (
                <a href={mailUrl}>
                  <Button variant="outline" size="sm" icon={<Mail className="h-4 w-4" />}>
                    Correo
                  </Button>
                </a>
              )}
            </div>
            {cliente.estado === "ACTIVO" && (
              <div className="flex gap-2">
                <Button
                  variant="success"
                  size="sm"
                  icon={<Trophy className="h-4 w-4" />}
                  onClick={() => setShowGanado(true)}
                >
                  Ganado 🎉
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<XCircle className="h-4 w-4" />}
                  onClick={() => setShowPerdido(true)}
                >
                  Perdido
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Archive className="h-4 w-4" />}
                  onClick={() => setShowArchivar(true)}
                >
                  Archivar
                </Button>
              </div>
            )}
            {(cliente.estado === "GANADO" || cliente.estado === "PERDIDO" || cliente.estado === "ARCHIVADO") && (
              <Button
                variant="outline"
                size="sm"
                icon={<RotateCcw className="h-4 w-4" />}
                onClick={() => restaurarCliente(cliente.id).then(() => router.refresh())}
              >
                Reactivar
              </Button>
            )}
          </div>
        </div>

        {/* Alertas de seguimiento */}
        {cliente.estado === "ACTIVO" && (
          <div className="mt-4 space-y-2">
            {dias > 0 && dias < 999 && (
              <div className={cn(
                "flex items-center gap-2 text-sm rounded-lg px-3 py-2",
                dias > 7 ? "bg-red-50 dark:bg-red-900/20 text-red-600" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
              )}>
                <Clock className="h-4 w-4 shrink-0" />
                <span>Último contacto hace <strong>{dias} días</strong></span>
              </div>
            )}
            {accionVencida && (
              <div className="flex items-center gap-2 text-sm rounded-lg px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  ⚠️ Acción vencida: <strong>{cliente.proximaAccion}</strong>
                </span>
              </div>
            )}
            {!cliente.proximaAccion && (
              <div className="flex items-center gap-2 text-sm rounded-lg px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>🟠 Sin próxima acción — define una para no perder este cliente</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Columna izquierda — datos */}
        <div className="md:col-span-2 space-y-4">
          {/* Información de venta */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Información de venta</h2>
              <Link href={`/clientes/${cliente.id}/editar`}>
                <Button variant="ghost" size="sm" icon={<Edit3 className="h-4 w-4" />}>
                  Editar
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoField
                label="Valor estimado"
                value={cliente.valorEstimado ? formatMonto(cliente.valorEstimado) : "No definido"}
                tooltip={{ texto: "Cuánto dinero representa si cierra.", consejo: "Sirve para saber a quién priorizar." }}
              />
              <InfoField label="Origen" value={cliente.origen ?? "—"} />
              <InfoField label="Producto de interés" value={cliente.productoInteres ?? "—"} />
              <InfoField label="Tallas / preferencias" value={cliente.tallas ?? "—"} />
              {cliente.objecionPrincipal && (
                <InfoField
                  label="Objeción principal"
                  value={cliente.objecionPrincipal}
                  highlight
                  tooltip={{
                    texto: "Lo que frena la compra.",
                    consejo: "Esta es tu tarea: vencer esta objeción para cerrar.",
                  }}
                />
              )}
            </div>
          </Card>

          {/* Próxima acción */}
          <Card padding="lg">
            <div className="flex items-center gap-1.5 mb-3">
              <h2 className="font-semibold text-gray-900 dark:text-white">Próxima acción</h2>
              <InfoTooltip
                texto="El siguiente paso con este cliente y cuándo."
                consejo="Si lo dejas vacío, el cliente se te enfría. Siempre déjale una."
              />
            </div>
            {cliente.proximaAccion ? (
              <div className={cn("rounded-lg p-3", accionVencida ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-50 dark:bg-gray-800")}>
                <p className={cn("font-medium", accionVencida ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-white")}>
                  {cliente.proximaAccion}
                </p>
                {cliente.proximaAccionFecha && (
                  <p className={cn("text-xs mt-1", accionVencida ? "text-red-500" : "text-gray-500")}>
                    {accionVencida ? "⚠️ Vencida: " : "📅 "}
                    {formatFechaCompleta(cliente.proximaAccionFecha)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-amber-500 text-sm">🟠 Sin próxima acción definida</p>
            )}
          </Card>

          {/* Pagos */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                Pagos
              </h2>
              <Link href={`/pagos/nuevo?clienteId=${cliente.id}`}>
                <Button variant="outline" size="sm">+ Registrar pago</Button>
              </Link>
            </div>
            {valorTotal > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500">
                    Cobrado: <strong className="text-gray-900 dark:text-white">{formatMonto(totalPagado)}</strong>
                  </span>
                  <span className="text-gray-500">
                    Total: <strong>{formatMonto(valorTotal)}</strong>
                  </span>
                </div>
                <Progress value={porcPagado} color={porcPagado >= 100 ? "green" : "brand"} />
                {totalPendiente > 0 && (
                  <p className="text-xs text-amber-500 mt-1.5">Falta cobrar: {formatMonto(totalPendiente)}</p>
                )}
              </div>
            )}
            {cliente.pagos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin pagos registrados</p>
            ) : (
              <div className="space-y-2">
                {cliente.pagos.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{formatMonto(p.monto)}</p>
                      <p className="text-xs text-gray-500">{p.concepto ?? p.metodo} · {p.fechaPago ? formatFechaCompleta(p.fechaPago) : "Sin fecha"}</p>
                    </div>
                    <Badge variant={p.estatus === "PAGADO" ? "success" : p.estatus === "VENCIDO" ? "danger" : "warning"}>
                      {p.estatus}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          {/* Datos de contacto */}
          <Card padding="md">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Contacto</h3>
            <div className="space-y-2 text-sm">
              {cliente.telefono && (
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 text-green-500" />
                  {cliente.telefono}
                </p>
              )}
              {cliente.correo && (
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400 break-all">
                  <Mail className="h-4 w-4 text-blue-500" />
                  {cliente.correo}
                </p>
              )}
              {cliente.zona && (
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  {cliente.zona}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Vendedor: {cliente.vendedor.nombre}
            </p>
          </Card>

          {/* Etiquetas */}
          {cliente.etiquetas.length > 0 && (
            <Card padding="md">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-1.5">
                <Tag className="h-4 w-4" /> Etiquetas
              </h3>
              <div className="flex gap-1.5 flex-wrap">
                {cliente.etiquetas.map((et: any) => (
                  <span
                    key={et.etiqueta.id}
                    className="rounded-full px-2.5 py-0.5 text-xs text-white font-medium"
                    style={{ backgroundColor: et.etiqueta.color }}
                  >
                    {et.etiqueta.nombre}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Notas */}
          {cliente.notas && (
            <Card padding="md">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                <FileText className="h-4 w-4 inline mr-1" /> Notas
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {cliente.notas}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Línea de tiempo */}
      <Card padding="lg">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          Historial de interacciones
        </h2>
        {cliente.eventos.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Sin eventos registrados</p>
        ) : (
          <div className="space-y-3">
            {cliente.eventos.map((ev: any, i: number) => (
              <div key={ev.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-7 w-7 rounded-full bg-[#a78bdb]/10 flex items-center justify-center shrink-0">
                    <EventoIcon tipo={ev.tipo} />
                  </div>
                  {i < cliente.eventos.length - 1 && (
                    <div className="w-px flex-1 bg-gray-100 dark:bg-gray-800 mt-1" />
                  )}
                </div>
                <div className="pb-3 flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{ev.descripcion}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {ev.autorNombre} · {formatFecha(ev.fecha)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modales */}
      <ConfirmModal
        open={showGanado}
        onClose={() => setShowGanado(false)}
        onConfirm={handleGanado}
        title="Marcar como Ganado 🎉"
        message={`Esto va a marcar a ${cliente.nombre} como Ganado y lo moverá a Clientes completados. ¿Seguro?`}
        confirmText="¡Sí, ganado!"
        variant="default"
        loading={loadingAccion}
      />

      <Modal open={showPerdido} onClose={() => setShowPerdido(false)} title="Marcar como Perdido" size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowPerdido(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handlePerdido} loading={loadingAccion}>Marcar perdido</Button>
          </div>
        }
      >
        <p className="text-sm text-gray-500 mb-3">¿Por qué no cerró? (obligatorio)</p>
        <div className="space-y-2">
          {["Precio", "Se fue con la competencia", "No contestó", "No era buen momento", "No calificaba", "Otro"].map((m) => (
            <label key={m} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <input
                type="radio"
                name="motivo"
                value={m}
                checked={motivoPerdida === m}
                onChange={() => setMotivoPerdida(m)}
                className="accent-[#a78bdb]"
              />
              <span className="text-sm">{m}</span>
            </label>
          ))}
        </div>
      </Modal>

      <ConfirmModal
        open={showArchivar}
        onClose={() => setShowArchivar(false)}
        onConfirm={handleArchivar}
        title={`Archivar a ${cliente.nombre}`}
        message="Podrás restaurarlo cuando quieras desde la sección Archivados. No se borra nada."
        confirmText="Archivar"
        loading={loadingAccion}
      />
    </div>
  )
}

function InfoField({ label, value, highlight, tooltip }: { label: string; value: string; highlight?: boolean; tooltip?: { texto: string; consejo: string } }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        {tooltip && <InfoTooltip texto={tooltip.texto} consejo={tooltip.consejo} />}
      </div>
      <p className={cn("font-medium", highlight ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white")}>
        {value}
      </p>
    </div>
  )
}

function EventoIcon({ tipo }: { tipo: string }) {
  const icons: Record<string, React.ReactNode> = {
    CREACION: <CheckCircle className="h-3.5 w-3.5 text-[#a78bdb]" />,
    NOTA: <FileText className="h-3.5 w-3.5 text-blue-500" />,
    CITA: <Calendar className="h-3.5 w-3.5 text-green-500" />,
    PAGO: <CreditCard className="h-3.5 w-3.5 text-emerald-500" />,
    CAMBIO_ETAPA: <Tag className="h-3.5 w-3.5 text-indigo-500" />,
    CAMBIO_ESTADO: <Trophy className="h-3.5 w-3.5 text-amber-500" />,
    OBJECION: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
  }
  return <>{icons[tipo] ?? <MessageSquare className="h-3.5 w-3.5 text-gray-400" />}</>
}
