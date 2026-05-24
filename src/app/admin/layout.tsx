"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, FileText, Users, Store, Settings, Menu } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navItems = [
  {
    title: "لوحة التحكم",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "الطلبات",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "الفواتير",
    href: "/admin/invoices",
    icon: FileText,
  },
  {
    title: "المستخدمين",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "الإعدادات",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "المتجر",
    href: "/",
    icon: Store,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full" dir="rtl">
        <Sidebar side="right" collapsible="offcanvas">
          <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              <span className="text-lg font-bold">سانداك</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href)
                        }
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-4">
            <p className="text-center text-xs text-muted-foreground">
              © 2026 سانداك
            </p>
          </SidebarFooter>
        </Sidebar>
        <main className="flex flex-1 flex-col">
          <header className="flex h-14 items-center gap-2 border-b px-4 md:px-6">
            <SidebarTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
          </header>
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
