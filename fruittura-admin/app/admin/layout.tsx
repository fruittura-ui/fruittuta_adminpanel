import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { AdminGuard } from "@/components/admin-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="ml-64">
        <AdminHeader />
        <main className="p-6">
          <AdminGuard>{children}</AdminGuard>
        </main>
      </div>
    </div>
  )
}
