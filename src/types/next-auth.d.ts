import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      rol: string
      nombre: string
    }
  }

  interface User {
    rol?: string
    nombre?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    rol?: string
    nombre?: string
  }
}
