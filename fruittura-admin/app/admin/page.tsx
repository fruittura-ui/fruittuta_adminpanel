"use client"

import { useEffect, useState } from "react"
import { IndianRupee, ShoppingCart, Package, TrendingUp, Loader2 } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { RevenueChart } from "@/components/revenue-chart"
import { CategoryChart } from "@/components/category-chart"
import { RecentOrders } from "@/components/recent-orders"
import { TopProducts } from "@/components/top-products"
import { dashboardApi } from "@/lib/api"
import type { DashboardStats } from "@/lib/types"

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getStats()
        setStats(res.data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your business overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`₹${stats?.total_revenue.toLocaleString()}`}
          change={stats?.revenue_change || "0%"}
          changeType="positive"
          icon={IndianRupee}
          iconColor="bg-primary"
        />
        <StatsCard
          title="Total Orders"
          value={stats?.total_orders.toString() || "0"}
          change={stats?.orders_change || "0%"}
          changeType="positive"
          icon={ShoppingCart}
          iconColor="bg-green-600"
        />
        <StatsCard
          title="Products"
          value={stats?.total_products.toString() || "0"}
          change={stats?.products_change || "0"}
          changeType="neutral"
          icon={Package}
          iconColor="bg-blue-600"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats?.conversion_rate}%`}
          change={stats?.conversion_change || "0%"}
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-amber-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <RevenueChart />
        <CategoryChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <RecentOrders />
        <TopProducts />
      </div>
    </div>
  )
}
