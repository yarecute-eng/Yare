import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { ToastProvider } from "@/components/ui/toast"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: {
    template: "%s · Princessitas Ceremonias",
    default: "Princessitas Ceremonias CRM",
  },
  description: "Sistema de gestión de clientes para Princessitas Ceremonias — vestidos de fiesta, primera comunión y bautizo en Guadalajara.",
  openGraph: {
    title: "Princessitas Ceremonias",
    description: "Vestidos de primera comunión, fiesta y ropones de bautizo en Guadalajara, México.",
    type: "website",
    locale: "es_MX",
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Anti-parpadeo: aplica el tema ANTES de pintar */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('tema');
                  if (t === 'oscuro' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
