"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, KanbanSquare, CalendarDays, Wallet,
  ListChecks, Trophy, XCircle, Archive, CalendarPlus, UserCog,
  Share2, Search, Sparkles, ShieldCheck, ChevronLeft, ChevronRight,
  Crown, Menu, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { useState } from "react"

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  color: string
  admin?: boolean
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tablero", color: "text-[#a78bdb]" },
  { href: "/clientes", icon: Users, label: "Clientes", color: "text-blue-500" },
  { href: "/embudo", icon: KanbanSquare, label: "Embudo", color: "text-indigo-500" },
  { href: "/seguimiento", icon: ListChecks, label: "Seguimiento", color: "text-amber-500" },
  { href: "/agenda", icon: CalendarDays, label: "Agenda", color: "text-green-500" },
  { href: "/pagos", icon: Wallet, label: "Pagos", color: "text-emerald-500" },
  { href: "/completados", icon: Trophy, label: "Completados", color: "text-green-600" },
  { href: "/perdidos", icon: XCircle, label: "Perdidos", color: "text-gray-500" },
  { href: "/archivados", icon: Archive, label: "Archivados", color: "text-gray-400" },
  { href: "/compartir", icon: CalendarPlus, label: "Mis ligas de citas", color: "text-teal-500" },
  { href: "/compartir", icon: Share2, label: "Comparte y crece", color: "text-[#a78bdb]" },
  { href: "/equipo", icon: UserCog, label: "Equipo", color: "text-cyan-500", admin: true },
  { href: "/admin", icon: ShieldCheck, label: "Panel admin", color: "text-[#a78bdb]", admin: true },
]

interface SidebarProps {
  usuario: { nombre: string; rol: string; id: string }
}

export function Sidebar({ usuario }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const filteredItems = navItems.filter((item) => {
    if (item.admin && usuario.rol !== "ADMIN") return false
    return true
  })

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-40 flex flex-col",
        "bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800",
        "transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800")}>
        <div className="h-9 w-9 rounded-xl bg-[#a78bdb] flex items-center justify-center shrink-0">
          <Crown className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight truncate">
              Princessitas
            </p>
            <p className="text-xs text-gray-500 truncate">Ceremonias</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn("ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200", collapsed && "mx-auto")}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {filteredItems.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all",
                "group min-h-[44px]",
                active
                  ? "bg-[#a78bdb]/10 text-[#a78bdb] font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active ? "text-[#a78bdb]" : item.color)} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className={cn(
        "border-t border-gray-100 dark:border-gray-800 p-3",
        collapsed ? "flex justify-center" : "flex items-center gap-3"
      )}>
        <Avatar nombre={usuario.nombre} size="sm" />
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {usuario.nombre}
            </p>
            <p className="text-xs text-gray-500 truncate">{usuario.rol}</p>
          </div>
        )}
      </div>
    </aside>
  )
}

// Barra inferior para móvil
export function BottomNav({ usuario }: SidebarProps) {
  const pathname = usePathname()
  const mainItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Tablero" },
    { href: "/clientes", icon: Users, label: "Clientes" },
    { href: "/embudo", icon: KanbanSquare, label: "Embudo" },
    { href: "/seguimiento", icon: ListChecks, label: "Hoy" },
    { href: "/agenda", icon: CalendarDays, label: "Agenda" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="flex">
        {mainItems.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs",
                "min-h-[56px] transition-colors",
                active
                  ? "text-[#a78bdb]"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
