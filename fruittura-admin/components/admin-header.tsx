"use client"

import { User } from "lucide-react"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@fruittura.com</p>
          </div>
        </div>
      </div>
    </header>
  )
}
