"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { puede } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"

const ClienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100),
  telefono: z.string().optional(),
  correo: z.string().email("Correo inválido").optional().or(z.literal("")),
  origen: z.string().optional(),
  etapa: z.string().optional(),
  temperatura: z.string().optional(),
  valorEstimado: z.coerce.number().optional(),
  objecionPrincipal: z.string().optional(),
  notas: z.string().optional(),
  proximaAccion: z.string().optional(),
  proximaAccionFecha: z.string().optional(),
  vendedorId: z.string().optional(),
  productoInteres: z.string().optional(),
  tallas: z.string().optional(),
  empresa: z.string().optional(),
  canalUtm: z.string().optional(),
})

export async function crearCliente(data: z.infer<typeof ClienteSchema>) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }
  const usuario = session.user as any

  const parsed = ClienteSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  }

  const { nombre, telefono, correo, vendedorId, ...rest } = parsed.data

  // Si no es admin, asignar al vendedor actual
  const asignadoA = usuario.rol === "ADMIN" && vendedorId ? vendedorId : usuario.id

  // Verificar duplicados por teléfono
  if (telefono) {
    const existente = await prisma.cliente.findFirst({
      where: { telefono, eliminadoEn: null },
      select: { id: true, nombre: true },
    })
    if (existente) {
      return {
        error: `Ya tienes a ${existente.nombre} con este WhatsApp`,
        clienteExistenteId: existente.id,
      }
    }
  }

  const tel = telefono?.replace(/\D/g, "")
  const telInt = tel
    ? tel.startsWith("52") ? tel : `52${tel}`
    : undefined

  const cliente = await prisma.cliente.create({
    data: {
      nombre,
      telefono: tel,
      telefonoInternacional: telInt,
      correo: correo || undefined,
      vendedorId: asignadoA,
      etapa: rest.etapa ?? "NUEVO",
      temperatura: rest.temperatura ?? "TIBIO",
      estado: "ACTIVO",
      ...rest,
      proximaAccionFecha: rest.proximaAccionFecha
        ? new Date(rest.proximaAccionFecha)
        : undefined,
    },
  })

  // Registrar en línea de tiempo
  await prisma.eventoCliente.create({
    data: {
      clienteId: cliente.id,
      tipo: "CREACION",
      descripcion: `Cliente creado desde ${rest.origen ?? "CRM"}`,
      autorNombre: usuario.nombre ?? "Sistema",
      autorId: usuario.id,
    },
  })

  // Auditoría
  await prisma.registroAuditoria.create({
    data: {
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombre,
      accion: "creó",
      entidad: "Cliente",
      entidadId: cliente.id,
      detalle: `Creó al cliente ${nombre}`,
    },
  })

  revalidatePath("/clientes")
  revalidatePath("/embudo")
  return { success: true, clienteId: cliente.id }
}

export async function actualizarCliente(id: string, data: Partial<z.infer<typeof ClienteSchema>>) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }
  const usuario = session.user as any

  const cliente = await prisma.cliente.findUnique({ where: { id } })
  if (!cliente) return { error: "Cliente no encontrado" }
  if (!puede(usuario, "editar", { vendedorId: cliente.vendedorId })) {
    return { error: "Sin permiso" }
  }

  const tel = data.telefono?.replace(/\D/g, "")
  const telInt = tel ? (tel.startsWith("52") ? tel : `52${tel}`) : undefined

  await prisma.cliente.update({
    where: { id },
    data: {
      ...data,
      telefono: tel,
      telefonoInternacional: telInt,
      proximaAccionFecha: data.proximaAccionFecha
        ? new Date(data.proximaAccionFecha)
        : undefined,
      actualizadoEn: new Date(),
    },
  })

  await prisma.registroAuditoria.create({
    data: {
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombre,
      accion: "editó",
      entidad: "Cliente",
      entidadId: id,
      detalle: `Editó al cliente ${cliente.nombre}`,
    },
  })

  revalidatePath(`/clientes/${id}`)
  revalidatePath("/clientes")
  return { success: true }
}

export async function moverEtapa(clienteId: string, nuevaEtapa: string) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }
  const usuario = session.user as any

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
  if (!cliente) return { error: "Cliente no encontrado" }
  if (!puede(usuario, "editar", { vendedorId: cliente.vendedorId })) {
    return { error: "Sin permiso" }
  }

  const etapaAnterior = cliente.etapa
  await prisma.cliente.update({
    where: { id: clienteId },
    data: { etapa: nuevaEtapa, actualizadoEn: new Date() },
  })

  await prisma.eventoCliente.create({
    data: {
      clienteId,
      tipo: "CAMBIO_ETAPA",
      descripcion: `Movido de ${etapaAnterior} → ${nuevaEtapa}`,
      autorNombre: usuario.nombre ?? "Sistema",
      autorId: usuario.id,
    },
  })

  revalidatePath("/embudo")
  revalidatePath(`/clientes/${clienteId}`)
  return { success: true }
}

export async function marcarGanado(clienteId: string) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }
  const usuario = session.user as any

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
  if (!cliente) return { error: "No encontrado" }
  if (!puede(usuario, "editar", { vendedorId: cliente.vendedorId })) {
    return { error: "Sin permiso" }
  }

  await prisma.cliente.update({
    where: { id: clienteId },
    data: { estado: "GANADO", ganadoEn: new Date() },
  })

  await prisma.eventoCliente.create({
    data: {
      clienteId,
      tipo: "CAMBIO_ESTADO",
      descripcion: `¡Marcada como GANADA! 🎉 +$${cliente.valorEstimado ?? 0}`,
      autorNombre: usuario.nombre ?? "Sistema",
      autorId: usuario.id,
    },
  })

  await prisma.registroAuditoria.create({
    data: {
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombre,
      accion: "marcó como ganado",
      entidad: "Cliente",
      entidadId: clienteId,
    },
  })

  revalidatePath("/embudo")
  revalidatePath(`/clientes/${clienteId}`)
  revalidatePath("/completados")
  revalidatePath("/dashboard")
  return { success: true, valor: cliente.valorEstimado ?? 0, nombre: cliente.nombre }
}

export async function marcarPerdido(clienteId: string, motivo: string) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }
  const usuario = session.user as any

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
  if (!cliente) return { error: "No encontrado" }
  if (!puede(usuario, "editar", { vendedorId: cliente.vendedorId })) {
    return { error: "Sin permiso" }
  }

  await prisma.cliente.update({
    where: { id: clienteId },
    data: { estado: "PERDIDO", perdidoEn: new Date(), motivoPerdida: motivo },
  })

  await prisma.eventoCliente.create({
    data: {
      clienteId,
      tipo: "CAMBIO_ESTADO",
      descripcion: `Marcado como PERDIDO — Motivo: ${motivo}`,
      autorNombre: usuario.nombre ?? "Sistema",
      autorId: usuario.id,
    },
  })

  revalidatePath("/embudo")
  revalidatePath(`/clientes/${clienteId}`)
  revalidatePath("/perdidos")
  return { success: true }
}

export async function archivarCliente(clienteId: string) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }
  const usuario = session.user as any

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
  if (!cliente) return { error: "No encontrado" }

  await prisma.cliente.update({
    where: { id: clienteId },
    data: { estado: "ARCHIVADO", archivadoEn: new Date() },
  })

  await prisma.eventoCliente.create({
    data: {
      clienteId,
      tipo: "CAMBIO_ESTADO",
      descripcion: "Archivado (se puede restaurar cuando quieras)",
      autorNombre: usuario.nombre ?? "Sistema",
      autorId: usuario.id,
    },
  })

  revalidatePath("/embudo")
  revalidatePath("/clientes")
  return { success: true }
}

export async function restaurarCliente(clienteId: string) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
  if (!cliente) return { error: "No encontrado" }

  await prisma.cliente.update({
    where: { id: clienteId },
    data: {
      estado: "ACTIVO",
      archivadoEn: null,
      ganadoEn: null,
      perdidoEn: null,
    },
  })

  revalidatePath("/archivados")
  revalidatePath("/clientes")
  return { success: true }
}

export async function eliminarCliente(clienteId: string) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }
  const usuario = session.user as any

  if (!puede(usuario, "borrar")) return { error: "Sin permiso" }

  await prisma.cliente.update({
    where: { id: clienteId },
    data: { eliminadoEn: new Date() },
  })

  revalidatePath("/clientes")
  return { success: true }
}
