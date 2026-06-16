import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.rol = (user as any).rol
        token.nombre = (user as any).nombre
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).rol = token.rol
        ;(session.user as any).nombre = token.nombre
      }
      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        correo: { label: "Correo", type: "email" },
        contrasena: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            correo: z.string().email(),
            contrasena: z.string().min(1),
          })
          .safeParse(credentials)

        if (!parsed.success) return null

        const usuario = await prisma.usuario.findUnique({
          where: { correo: parsed.data.correo },
        })

        if (!usuario || !usuario.activo) return null

        const valida = await bcrypt.compare(
          parsed.data.contrasena,
          usuario.contrasenaHash
        )
        if (!valida) return null

        return {
          id: usuario.id,
          email: usuario.correo,
          name: usuario.nombre,
          rol: usuario.rol,
          nombre: usuario.nombre,
        }
      },
    }),
  ],
})
