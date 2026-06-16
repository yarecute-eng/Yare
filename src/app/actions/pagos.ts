"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const PagoSchema = z.object({
  clienteId: z.string(),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  montoTotal: z.coerce.number().optional(),
  metodo: z.enum(["TRANSFERENCIA", "TARJETA", "LIGA_DE_PAGO", "DEPOSITO_ANTICIPO", "EFECTIVO"]),
  estatus: z.enum(["PENDIENTE", "PAGADO", "VENCIDO"]).default("PENDIENTE"),
  concepto: z.string().optional(),
  fechaPago: z.string().optional(),
  fechaVencimiento: z.string().optional(),
  notas: z.string().optional(),
})

export async function registrarPago(data: z.infer<typeof PagoSchema>) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }
  const usuario = session.user as any

  const parsed = PagoSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { clienteId, ...rest } = parsed.data

  const pago = await prisma.pago.create({
    data: {
      clienteId,
      ...rest,
      fechaPago: rest.fechaPago ? new Date(rest.fechaPago) : undefined,
      fechaVencimiento: rest.fechaVencimiento ? new Date(rest.fechaVencimiento) : undefined,
    },
  })

  // Registrar en línea de tiempo
  await prisma.eventoCliente.create({
    data: {
      clienteId,
      tipo: "PAGO",
      descripcion: `Pago registrado: $${rest.monto} (${rest.metodo}) — ${rest.estatus}`,
      autorNombre: usuario.nombre ?? "Sistema",
      autorId: usuario.id,
    },
  })

  revalidatePath(`/clientes/${clienteId}`)
  revalidatePath("/pagos")
  return { success: true, pagoId: pago.id }
}

export async function actualizarPago(id: string, data: Partial<z.infer<typeof PagoSchema>>) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }

  await prisma.pago.update({
    where: { id },
    data: {
      ...data,
      fechaPago: data.fechaPago ? new Date(data.fechaPago) : undefined,
      fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : undefined,
    },
  })

  revalidatePath("/pagos")
  return { success: true }
}
