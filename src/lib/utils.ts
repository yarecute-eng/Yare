import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatea moneda en MXN
export function formatMonto(monto: number, moneda = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto)
}

// Formatea fecha en español
export function formatFecha(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha
  const ahora = new Date()
  const diff = ahora.getTime() - d.getTime()
  const minutos = Math.floor(diff / 60000)
  const horas = Math.floor(diff / 3600000)
  const dias = Math.floor(diff / 86400000)

  if (minutos < 1) return "ahora"
  if (minutos < 60) return `hace ${minutos} min`
  if (horas < 24) return `hace ${horas} h`
  if (dias === 1) return "ayer"
  if (dias < 7) {
    const diasSemana = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"]
    return diasSemana[d.getDay()]
  }
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  })
}

export function formatFechaCompleta(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Temperatura label
export const tempLabel: Record<string, string> = {
  CALIENTE: "🔥 Caliente",
  TIBIO: "🟡 Tibio",
  FRIO: "🔵 Frío",
}

// Etapa label
export const etapaLabel: Record<string, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  PROPUESTA_ENVIADA: "Propuesta enviada",
  CLIENTE_NUEVO: "Cliente Nuevo",
  PERDIDO: "Perdido",
  CLIENTE_RECURRENTE: "Cliente Recurrente",
  CLIENTE_DE_TEMPORADAS: "Cliente de Temporadas",
  VIP_MAYORISTA: "VIP Mayorista",
}

export const etapas = [
  "NUEVO",
  "CONTACTADO",
  "PROPUESTA_ENVIADA",
  "CLIENTE_NUEVO",
  "PERDIDO",
  "CLIENTE_RECURRENTE",
  "CLIENTE_DE_TEMPORADAS",
  "VIP_MAYORISTA",
]

// Número de teléfono para WhatsApp (internacional sin signos)
export function formatTelWA(tel: string): string {
  const limpio = tel.replace(/\D/g, "")
  if (limpio.startsWith("52")) return limpio
  if (limpio.length === 10) return `52${limpio}`
  return limpio
}

// Días sin contacto
export function diasSinContacto(fecha: Date | string | null): number {
  if (!fecha) return 999
  const d = typeof fecha === "string" ? new Date(fecha) : fecha
  return Math.floor((Date.now() - d.getTime()) / 86400000)
}
