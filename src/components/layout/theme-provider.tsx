"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type Tema = "claro" | "oscuro" | "auto"

interface ThemeContextValue {
  tema: Tema
  setTema: (t: Tema) => void
  temaEfectivo: "claro" | "oscuro"
}

const ThemeContext = createContext<ThemeContextValue>({
  tema: "auto",
  setTema: () => {},
  temaEfectivo: "claro",
})

export function ThemeProvider({ children, initialTema }: { children: ReactNode; initialTema?: Tema }) {
  const [tema, setTemaState] = useState<Tema>(initialTema ?? "auto")

  const temaEfectivo = (() => {
    if (tema === "claro") return "claro"
    if (tema === "oscuro") return "oscuro"
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro"
    }
    return "claro"
  })()

  useEffect(() => {
    const root = document.documentElement
    if (temaEfectivo === "oscuro") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [temaEfectivo])

  // Escucha cambios del sistema en modo "auto"
  useEffect(() => {
    if (tema !== "auto") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      document.documentElement.classList.toggle("dark", mq.matches)
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [tema])

  const setTema = (t: Tema) => {
    setTemaState(t)
    localStorage.setItem("tema", t)
  }

  return (
    <ThemeContext.Provider value={{ tema, setTema, temaEfectivo }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
