import type { NextAuthConfig } from "next-auth"

// Configuración ligera para el Edge Runtime (proxy/middleware)
// No importa Prisma ni bcrypt — solo lee el JWT
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
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
  providers: [], // los providers solo se necesitan en el servidor
}
