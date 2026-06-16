import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const LeadSchema = z.object({
  nombre: z.string().min(1).max(100),
  telefono: z.string().min(5).max(20),
  correo: z.string().email().optional().or(z.literal("")),
  origen: z.string().optional(),
  canalUtm: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = LeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const { nombre, telefono, correo, origen, canalUtm } = parsed.data

    // Buscar el admin para asignar el lead
    const admin = await prisma.usuario.findFirst({
      where: { rol: "ADMIN", activo: true },
    })
    if (!admin) {
      return NextResponse.json({ error: "No hay vendedor disponible" }, { status: 500 })
    }

    const tel = telefono.replace(/\D/g, "")
    const telInt = tel.startsWith("52") ? tel : `52${tel}`

    // Verificar duplicado
    const existente = await prisma.cliente.findFirst({
      where: { telefono: tel, eliminadoEn: null },
    })

    let clienteId: string

    if (existente) {
      clienteId = existente.id
      await prisma.eventoCliente.create({
        data: {
          clienteId,
          tipo: "NOTA",
          descripcion: `Volvió a la landing page. Canal: ${canalUtm ?? "landing"}`,
          autorNombre: "Sistema",
          fecha: new Date(),
        },
      })
    } else {
      const cliente = await prisma.cliente.create({
        data: {
          nombre,
          telefono: tel,
          telefonoInternacional: telInt,
          correo: correo || undefined,
          origen: origen ?? "Landing",
          canalUtm: canalUtm,
          etapa: "NUEVO",
          estado: "ACTIVO",
          temperatura: "TIBIO",
          proximaAccion: "Contactar en menos de 24 h",
          proximaAccionFecha: new Date(Date.now() + 24 * 3600000),
          vendedorId: admin.id,
        },
      })
      clienteId = cliente.id

      await prisma.eventoCliente.create({
        data: {
          clienteId,
          tipo: "CREACION",
          descripcion: `Lead de Landing page. Canal: ${canalUtm ?? "landing"}`,
          autorNombre: "Sistema",
          fecha: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true, clienteId })
  } catch (error) {
    console.error("Error guardando lead:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
