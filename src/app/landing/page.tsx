import { Metadata } from "next"
import LandingClient from "./landing-client"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Princessitas Ceremonias — Vestidos de primera comunión y bautizo en Guadalajara",
  description: "Vestidos de primera comunión, fiesta para niña y ropones de bautizo. Agenda tu cita hoy en Guadalajara, México.",
  openGraph: {
    title: "Princessitas Ceremonias",
    description: "Vestidos de primera comunión, fiesta para niña y ropones de bautizo. ¡Agenda tu cita!",
    type: "website",
  },
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ utm_source?: string; utm_medium?: string; utm_campaign?: string }>
}) {
  const params = await searchParams
  const config = await prisma.configuracionNegocio.findUnique({ where: { id: "singleton" } })
  return <LandingClient config={config} utm={params} />
}
