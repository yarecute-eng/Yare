"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const CitaSchema = z.object({
  clienteId: z.string(),
  titulo: z.string().optional(),
  fecha: z.string(),
  hora: z.string(),
  duracion: z.coerce.number().default(30),
  notas: z.string().optional(),
  googleMeetLink: z.string().url().optional().or(z.literal("")),
})

export async function agendarCita(data: z.infer<typeof CitaSchema>) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }
  const usuario = session.user as any

  const parsed = CitaSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { clienteId, fecha, hora, ...rest } = parsed.data
  const fechaHora = new Date(`${fecha}T${hora}:00`)

  const cita = await prisma.cita.create({
    data: {
      clienteId,
      vendedorId: usuario.id,
      fecha: fechaHora,
      titulo: rest.titulo || null,
      duracion: rest.duracion,
      notas: rest.notas || null,
      googleMeetLink: rest.googleMeetLink || null,
    },
  })

  await prisma.eventoCliente.create({
    data: {
      clienteId,
      tipo: "CITA",
      descripcion: `Cita agendada: ${rest.titulo ?? "Sin título"} — ${fechaHora.toLocaleDateString("es-MX")}`,
      autorNombre: usuario.nombre ?? "Sistema",
      autorId: usuario.id,
      fecha: fechaHora,
    },
  })

  revalidatePath(`/clientes/${clienteId}`)
  revalidatePath("/agenda")
  return { success: true, citaId: cita.id }
}

export async function agendarCitaPublica(data: {
  slugAgenda: string
  nombre: string
  telefono: string
  correo?: string
  fecha: string
  hora: string
  notas?: string
}) {
  const vendedor = await prisma.usuario.findUnique({
    where: { slugAgenda: data.slugAgenda, activo: true },
    select: { id: true, nombre: true },
  })
  if (!vendedor) return { error: "Liga no válida" }

  // Buscar o crear cliente
  let cliente = data.telefono
    ? await prisma.cliente.findFirst({ where: { telefono: data.telefono, vendedorId: vendedor.id } })
    : null

  if (!cliente) {
    cliente = await prisma.cliente.create({
      data: {
        nombre: data.nombre,
        telefono: data.telefono || null,
        correo: data.correo || null,
        vendedorId: vendedor.id,
        etapa: "CONTACTADO",
        origen: "Landing",
      },
    })
  }

  const fechaHora = new Date(`${data.fecha}T${data.hora}:00`)

  await prisma.cita.create({
    data: {
      clienteId: cliente.id,
      vendedorId: vendedor.id,
      fecha: fechaHora,
      titulo: "Cita desde liga pública",
      duracion: 30,
      notas: data.notas || null,
    },
  })

  revalidatePath("/agenda")
  return { success: true }
}
