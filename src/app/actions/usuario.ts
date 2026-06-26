"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const PerfilSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  slugAgenda: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones")
    .min(3, "Mínimo 3 caracteres")
    .optional()
    .or(z.literal("")),
  metaMensual: z.coerce.number().min(0).optional(),
})

export async function actualizarPerfil(data: z.infer<typeof PerfilSchema>) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }
  const usuario = session.user as any

  const parsed = PerfilSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { slugAgenda, ...rest } = parsed.data

  // Verificar que el slug no esté tomado por otro usuario
  if (slugAgenda) {
    const existente = await prisma.usuario.findUnique({ where: { slugAgenda } })
    if (existente && existente.id !== usuario.id) {
      return { error: "Ese slug ya está en uso, elige otro" }
    }
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      nombre: rest.nombre,
      slugAgenda: slugAgenda || null,
      metaMensual: rest.metaMensual ?? null,
    },
  })

  revalidatePath("/perfil")
  return { success: true }
}

export async function crearUsuario(data: {
  nombre: string
  correo: string
  contrasena: string
  rol: "ADMIN" | "VENDEDOR"
}) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }
  const usuario = session.user as any
  if (usuario.rol !== "ADMIN") return { error: "Sin permisos" }

  if (!data.nombre || !data.correo || !data.contrasena) return { error: "Todos los campos son requeridos" }
  if (data.contrasena.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres" }

  const existe = await prisma.usuario.findUnique({ where: { correo: data.correo } })
  if (existe) return { error: "Ya existe un usuario con ese correo" }

  const bcrypt = await import("bcryptjs")
  const hash = await bcrypt.hash(data.contrasena, 12)

  await prisma.usuario.create({
    data: {
      nombre: data.nombre,
      correo: data.correo,
      contrasenaHash: hash,
      rol: data.rol,
    },
  })

  revalidatePath("/admin")
  return { success: true }
}

export async function toggleUsuarioActivo(id: string) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }
  const usuario = session.user as any
  if (usuario.rol !== "ADMIN") return { error: "Sin permisos" }

  const user = await prisma.usuario.findUnique({ where: { id } })
  if (!user) return { error: "Usuario no encontrado" }

  await prisma.usuario.update({ where: { id }, data: { activo: !user.activo } })
  revalidatePath("/admin")
  return { success: true }
}

export async function cambiarContrasena(data: {
  actual: string
  nueva: string
}) {
  const session = await auth()
  if (!session?.user) return { error: "No autenticado" }
  const usuario = session.user as any

  const bcrypt = await import("bcryptjs")
  const user = await prisma.usuario.findUnique({ where: { id: usuario.id } })
  if (!user) return { error: "Usuario no encontrado" }

  const valida = await bcrypt.compare(data.actual, user.contrasenaHash)
  if (!valida) return { error: "Contraseña actual incorrecta" }

  if (data.nueva.length < 8) return { error: "La nueva contraseña debe tener al menos 8 caracteres" }

  const hash = await bcrypt.hash(data.nueva, 12)
  await prisma.usuario.update({ where: { id: usuario.id }, data: { contrasenaHash: hash } })

  return { success: true }
}
