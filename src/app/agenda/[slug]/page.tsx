import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import BookingClient from "./booking-client"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const vendedor = await prisma.usuario.findUnique({
    where: { slugAgenda: slug },
    select: { nombre: true },
  })
  if (!vendedor) return { title: "Liga no válida" }
  return { title: `Agendar cita con ${vendedor.nombre}` }
}

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let vendedor
  try {
    vendedor = await prisma.usuario.findUnique({
      where: { slugAgenda: slug, activo: true },
      select: { id: true, nombre: true, avatar: true, slugAgenda: true },
    })
  } catch (e) {
    console.error("Error buscando vendedor:", e)
    return <div className="p-8 text-red-500">Error de conexión. Intenta de nuevo.</div>
  }

  if (!vendedor) notFound()

  return <BookingClient vendedor={vendedor} />
}
