import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import EmbudoClient from "./embudo-client"

export const metadata: Metadata = { title: "Embudo" }

export default async function EmbudoPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"

  const filtroVendedor = esAdmin ? {} : { vendedorId: usuario.id }

  const clientes = await prisma.cliente.findMany({
    where: {
      ...filtroVendedor,
      eliminadoEn: null,
      estado: "ACTIVO",
      etapa: {
        notIn: ["PERDIDO"],
      },
    },
    include: {
      etiquetas: { include: { etiqueta: true } },
      pagos: { where: { eliminadoEn: null }, select: { monto: true, estatus: true } },
      vendedor: { select: { nombre: true } },
    },
    orderBy: [{ temperatura: "asc" }, { proximaAccionFecha: "asc" }],
  })

  const config = await prisma.configuracionNegocio.findUnique({ where: { id: "singleton" } })
  const umbral = config?.umbralEstancamiento ?? 7

  return <EmbudoClient clientes={clientes} usuario={usuario} umbralDias={umbral} />
}
