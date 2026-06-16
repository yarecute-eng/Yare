import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { z } from "zod"

// Modelo de Anthropic — cambiar aquí si se actualiza
const MODELO = "claude-haiku-4-5-20251001"

const IaSchema = z.object({
  funcion: z.enum(["mensaje", "temperatura", "proximaAccion", "resumen", "objecion"]),
  cliente: z.object({
    nombre: z.string(),
    etapa: z.string(),
    temperatura: z.string(),
    objecionPrincipal: z.string().optional(),
    notas: z.string().optional(),
    ultimoContacto: z.string().optional(),
    valorEstimado: z.number().optional(),
    productoInteres: z.string().optional(),
    tallas: z.string().optional(),
  }),
  texto: z.string().optional(),
})

// Plantillas locales cuando no hay llave de IA
function plantillaLocal(funcion: string, cliente: any): string {
  const nombre = cliente.nombre
  const etapa = cliente.etapa
  const objecion = cliente.objecionPrincipal ?? ""
  const producto = cliente.productoInteres ?? "el producto"

  switch (funcion) {
    case "mensaje":
      if (objecion.includes("pensar")) {
        return `Hola ${nombre}, entiendo perfectamente que quieras pensarlo bien 😊 Solo quería comentarte que los vestidos de esa temporada tienen disponibilidad limitada. ¿Te gustaría que separáramos el tuyo con un anticipo pequeño para asegurar la talla?`
      }
      if (objecion.includes("consultar") || objecion.includes("pareja")) {
        return `Hola ${nombre}, con mucho gusto 😊 ¿Quieres que te mande un resumen con fotos para que lo puedan ver juntos? Así tienen todo a la mano cuando lo platiquen.`
      }
      return `Hola ${nombre}, ¿cómo estás? Te escribo para dar seguimiento. ¿Hay algo en lo que te pueda ayudar para avanzar con ${producto}?`

    case "temperatura":
      if (cliente.temperatura === "CALIENTE") return "🔥 Caliente — Ha mostrado interés activo. Contactar esta semana."
      if (cliente.temperatura === "TIBIO") return "🟡 Tibio — Interesado pero sin urgencia. Dar seguimiento en 3-5 días."
      return "🔵 Frío — Poco interés. Contactar en 2-3 semanas con algo nuevo."

    case "proximaAccion":
      if (etapa === "NUEVO") return "Primer contacto: llamar o escribir por WhatsApp para presentarse"
      if (etapa === "CONTACTADO") return "Enviar propuesta o catálogo con los modelos de interés"
      if (etapa === "PROPUESTA_ENVIADA") return "Hacer seguimiento de la propuesta y resolver objeciones"
      return "Agendar cita para cerrar la venta"

    case "resumen":
      return `${nombre} es un cliente en etapa ${etapa}${objecion ? ` con objeción: "${objecion}"` : ""}. ${cliente.notas ?? "Sin notas adicionales."}`

    case "objecion":
      if (objecion.includes("pensar")) return "Sugerencia: crea urgencia con disponibilidad limitada y ofrece apartar con anticipo"
      if (objecion.includes("precio") || objecion.includes("caro")) return "Sugerencia: muestra el valor, ofrece pago en partes y compara con el recuerdo que van a tener"
      return "Sugerencia: valida su objeción, ofrece información adicional y propón un siguiente paso pequeño"

    default:
      return "No hay sugerencia disponible para esta función."
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const body = await req.json()
  const parsed = IaSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const { funcion, cliente, texto } = parsed.data
  const llave = process.env.ANTHROPIC_API_KEY

  // Sin llave: usar plantillas locales
  if (!llave) {
    return NextResponse.json({
      resultado: plantillaLocal(funcion, cliente),
      usePlantilla: true,
    })
  }

  try {
    const promptsMap: Record<string, string> = {
      mensaje: `Eres un experto vendedor de vestidos de fiesta y ceremonias para niñas en México. 
Redacta un mensaje de WhatsApp corto y cálido para este cliente que lo mueva a la siguiente etapa de la venta.
Cliente: ${cliente.nombre}
Etapa: ${cliente.etapa}
Temperatura: ${cliente.temperatura}
Objeción principal: ${cliente.objecionPrincipal ?? "ninguna"}
Producto de interés: ${cliente.productoInteres ?? "vestidos"}
Notas: ${cliente.notas ?? ""}
Mensaje tipo del negocio: "Hola {nombre}, gracias por tu interés. ¿Te parece si agendamos una llamada?"
Responde SOLO con el mensaje, sin explicaciones.`,
      
      temperatura: `Analiza este cliente y determina su temperatura de compra (🔥 Caliente, 🟡 Tibio, o 🔵 Frío).
Nombre: ${cliente.nombre}, Etapa: ${cliente.etapa}, Notas: ${cliente.notas ?? ""}, Último contacto: ${cliente.ultimoContacto ?? "sin datos"}
Responde con: "[emoji] [Temperatura] — [1 frase explicando por qué]"`,
      
      proximaAccion: `Para este cliente, sugiere la próxima acción más efectiva para avanzar la venta.
Nombre: ${cliente.nombre}, Etapa: ${cliente.etapa}, Temperatura: ${cliente.temperatura}
Objeción: ${cliente.objecionPrincipal ?? "ninguna"}, Notas: ${cliente.notas ?? ""}
Responde con UNA acción concreta y el plazo sugerido. Máximo 2 líneas.`,
      
      resumen: `Resume en 3-5 líneas la situación comercial de este cliente.
${JSON.stringify(cliente)}
Incluye: en qué etapa está, qué frenó la compra y dónde quedó la última conversación.`,
      
      objecion: `El cliente dijo: "${texto ?? cliente.objecionPrincipal}"
Contexto: ${cliente.nombre}, interesado en ${cliente.productoInteres ?? "vestidos"}.
Sugiere UNA respuesta concreta para manejar esta objeción y UN próximo paso. Máximo 3 líneas.`,
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": llave,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 400,
        messages: [{ role: "user", content: promptsMap[funcion] }],
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const resultado = data.content?.[0]?.text ?? plantillaLocal(funcion, cliente)

    return NextResponse.json({ resultado })
  } catch (error) {
    console.error("Error en IA:", error)
    // Degradar a plantilla local
    return NextResponse.json({
      resultado: plantillaLocal(funcion, cliente),
      usePlantilla: true,
    })
  }
}
