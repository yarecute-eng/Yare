"use client"

import { useState } from "react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Share2,
  Copy,
  Check,
  Link as LinkIcon,
  QrCode,
  Users,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react"

interface CompartirClientProps {
  baseUrl: string
  slugAgenda: string | null
  vendedores: { nombre: string; slugAgenda: string }[]
  negocioNombre: string
  esAdmin: boolean
}

type CopiedKey =
  | "landing"
  | "utm"
  | "booking"
  | `vendedor-${string}`
  | null

const MEDIOS = ["Instagram", "Facebook", "WhatsApp", "Email", "TikTok", "Google"]

export default function CompartirClient({
  baseUrl,
  slugAgenda,
  vendedores,
  negocioNombre,
  esAdmin,
}: CompartirClientProps) {
  const [copied, setCopied] = useState<CopiedKey>(null)

  // UTM builder state
  const [fuente, setFuente] = useState("")
  const [medio, setMedio] = useState("Instagram")
  const [campana, setCampana] = useState("")

  const landingUrl = `${baseUrl}/landing`
  const bookingUrl = slugAgenda ? `${baseUrl}/agenda/${slugAgenda}` : null

  const utmParams = new URLSearchParams()
  if (fuente.trim()) utmParams.set("utm_source", fuente.trim())
  if (medio) utmParams.set("utm_medium", medio)
  if (campana.trim()) utmParams.set("utm_campaign", campana.trim())
  const utmUrl =
    utmParams.toString().length > 0
      ? `${landingUrl}?${utmParams.toString()}`
      : landingUrl

  async function copyToClipboard(text: string, key: CopiedKey) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Fallback for older browsers / insecure contexts
      const el = document.createElement("textarea")
      el.value = text
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const CopyButton = ({
    text,
    copyKey,
    label = "Copiar",
  }: {
    text: string
    copyKey: CopiedKey
    label?: string
  }) => {
    const isCopied = copied === copyKey
    return (
      <Button
        variant={isCopied ? "secondary" : "outline"}
        size="sm"
        icon={
          isCopied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )
        }
        onClick={() => copyToClipboard(text, copyKey)}
        className={isCopied ? "text-green-700 dark:text-green-400" : ""}
      >
        {isCopied ? "¡Copiado!" : label}
      </Button>
    )
  }

  const UrlBox = ({ url }: { url: string }) => (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50">
      <LinkIcon className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
      <span className="min-w-0 flex-1 truncate text-xs font-mono text-gray-600 dark:text-gray-400">
        {url}
      </span>
    </div>
  )

  return (
    <div className="space-y-8 pb-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a78bdb]/15">
          <Share2 className="h-5 w-5 text-[#a78bdb]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Compartir y crece
          </h1>
          <p className="text-sm text-gray-500">
            Comparte {negocioNombre} y rastrea tus campañas
          </p>
        </div>
      </div>

      {/* ── SECTION 1: Landing Page URL ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#a78bdb]" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Página de inicio
          </h2>
        </div>

        <Card padding="md">
          <p className="mb-3 text-sm text-gray-500">
            Comparte esta URL con clientes potenciales para presentarles{" "}
            {negocioNombre}.
          </p>
          <UrlBox url={landingUrl} />
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton text={landingUrl} copyKey="landing" label="Copiar URL" />
            <a href={landingUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="sm"
                icon={<ExternalLink className="h-3.5 w-3.5" />}
              >
                Abrir
              </Button>
            </a>
          </div>
        </Card>
      </section>

      {/* ── SECTION 2: UTM Link Builder ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-[#a78bdb]" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Constructor de links UTM
          </h2>
          <Badge variant="default">Rastreo de campañas</Badge>
        </div>

        <Card padding="md">
          <p className="mb-4 text-sm text-gray-500">
            Genera URLs con parámetros UTM para rastrear el origen de tus prospectos
            en Google Analytics u otras herramientas.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Fuente */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Fuente <span className="text-gray-400">(utm_source)</span>
              </label>
              <input
                type="text"
                value={fuente}
                onChange={(e) => setFuente(e.target.value)}
                placeholder="ej. instagram, google"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#a78bdb] focus:outline-none focus:ring-2 focus:ring-[#a78bdb]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Medio */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Medio <span className="text-gray-400">(utm_medium)</span>
              </label>
              <select
                value={medio}
                onChange={(e) => setMedio(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#a78bdb] focus:outline-none focus:ring-2 focus:ring-[#a78bdb]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {MEDIOS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Campaña */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Campaña <span className="text-gray-400">(utm_campaign)</span>
              </label>
              <input
                type="text"
                value={campana}
                onChange={(e) => setCampana(e.target.value)}
                placeholder="ej. promo-boda-2026"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#a78bdb] focus:outline-none focus:ring-2 focus:ring-[#a78bdb]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Generated URL preview */}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-gray-500">URL generada:</p>
            <UrlBox url={utmUrl} />
            <div className="flex flex-wrap gap-2">
              <CopyButton text={utmUrl} copyKey="utm" label="Copiar link UTM" />
              <a href={utmUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ExternalLink className="h-3.5 w-3.5" />}
                >
                  Probar
                </Button>
              </a>
            </div>
          </div>
        </Card>
      </section>

      {/* ── SECTION 3: Mi página de citas ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-[#a78bdb]" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Mi página de citas
          </h2>
        </div>

        {bookingUrl ? (
          <Card padding="md">
            <p className="mb-4 text-sm text-gray-500">
              Tus clientes pueden agendar citas directamente desde esta página
              personalizada.
            </p>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* QR code */}
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-xl border border-[#a78bdb]/20 bg-white p-3">
                  <QRCodeSVG
                    value={bookingUrl}
                    size={150}
                    fgColor="#7050ad"
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <span className="text-xs text-gray-400">Escanea para abrir</span>
              </div>

              {/* URL + actions */}
              <div className="flex-1 space-y-3">
                <UrlBox url={bookingUrl} />
                <div className="flex flex-wrap gap-2">
                  <CopyButton
                    text={bookingUrl}
                    copyKey="booking"
                    label="Copiar link"
                  />
                  <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ExternalLink className="h-3.5 w-3.5" />}
                    >
                      Ver página
                    </Button>
                  </a>
                </div>
                <p className="text-xs text-gray-400">
                  Comparte este link en redes sociales, WhatsApp o imprime el código
                  QR para eventos.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card padding="md" className="border-dashed border-[#a78bdb]/40">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#a78bdb]/10">
                <QrCode className="h-5 w-5 text-[#a78bdb]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Activa tu página de citas
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Configura un enlace personalizado para que tus clientes puedan
                  agendar citas contigo directamente, sin llamadas ni mensajes de
                  ida y vuelta.
                </p>
                <div className="mt-3">
                  <Link href="/perfil">
                    <Button
                      variant="primary"
                      size="sm"
                      iconRight={<ChevronRight className="h-3.5 w-3.5" />}
                    >
                      Configurar en mi perfil
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}
      </section>

      {/* ── SECTION 4: Admin — all booking pages ── */}
      {esAdmin && vendedores.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#a78bdb]" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Páginas del equipo
            </h2>
            <Badge variant="neutral">{vendedores.length}</Badge>
          </div>

          <Card padding="none">
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {vendedores.map((v) => {
                const url = `${baseUrl}/agenda/${v.slugAgenda}`
                const copyKey: CopiedKey = `vendedor-${v.slugAgenda}`
                return (
                  <li
                    key={v.slugAgenda}
                    className="flex flex-wrap items-center gap-3 px-5 py-4 sm:flex-nowrap"
                  >
                    {/* Avatar placeholder */}
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#a78bdb]/15 text-sm font-semibold text-[#7050ad]">
                      {v.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {v.nombre}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {url}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={copied === copyKey ? "secondary" : "ghost"}
                        size="sm"
                        icon={
                          copied === copyKey ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )
                        }
                        onClick={() => copyToClipboard(url, copyKey)}
                        className={
                          copied === copyKey
                            ? "text-green-700 dark:text-green-400"
                            : ""
                        }
                      >
                        {copied === copyKey ? "¡Copiado!" : "Copiar"}
                      </Button>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ExternalLink className="h-3.5 w-3.5" />}
                        >
                          <span className="sr-only">Abrir</span>
                        </Button>
                      </a>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        </section>
      )}
    </div>
  )
}
