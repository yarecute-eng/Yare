import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import PerfilClient from "./perfil-client"

export const metadata: Metadata = { title: "Perfil" }

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const usuario = session.user as any

  const user = await prisma.usuario.findUnique({
    where: { id: usuario.id },
    select: {
      id: true,
      nombre: true,
      correo: true,
      rol: true,
      slugAgenda: true,
      metaMensual: true,
      creadoEn: true,
    },
  })

  if (!user) redirect("/login")

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? ""

  return <PerfilClient user={user} baseUrl={baseUrl} />
}
