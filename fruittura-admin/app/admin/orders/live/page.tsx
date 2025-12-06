"use client"

import { useState, useEffect, useCallback } from "react"
import { Clock, MapPin, Package, RefreshCw, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ordersApi } from "@/lib/api"
import type { Order, OrderStatus } from "@/lib/types"

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  processing: "bg-blue-100 text-blue-800 border-blue-300",
  shipped: "bg-purple-100 text-purple-800 border-purple-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
}

const statusBorderColors: Record<OrderStatus, string> = {
  pending: "border-l-yellow-500",
  processing: "border-l-blue-500",
  shipped: "border-l-purple-500",
  delivered: "border-l-green-500",
  cancelled: "border-l-red-500",
}

const statusOptions: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"]

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  const fetchLiveOrders = useCallback(async () => {
    try {
      // Fetch all orders and filter client-side for now
      // Ideally backend should support filtering by multiple statuses
      const res = await ordersApi.getAll({ limit: 100 })
      const allOrders = res.data
      const liveOrders = allOrders.filter(
        (o) => o.status === "pending" || o.status === "processing"
      )
      setOrders(liveOrders)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch live orders", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch and polling
  useEffect(() => {
    fetchLiveOrders()
    const interval = setInterval(() => {
      fetchLiveOrders()
    }, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [fetchLiveOrders])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus)
      // Optimistic update
      setOrders(
        orders.map((order) => (order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order)),
      )
      // If status is no longer pending/processing, it will be removed on next fetch
      // For better UX, we could remove it immediately or keep it until refresh
      if (newStatus !== "pending" && newStatus !== "processing") {
        // Optional: Remove from list immediately
        // setOrders(orders.filter(o => o.id !== orderId))
      }
    } catch (error) {
      console.error("Failed to update order status", error)
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    fetchLiveOrders()
  }

  const getTimeSince = (date: Date | string) => {
    const dateObj = new Date(date)
    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const pendingOrders = orders.filter((o) => o.status === "pending")
  const processingOrders = orders.filter((o) => o.status === "processing")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Live Orders</h1>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
            </span>
          </div>
          <p className="text-muted-foreground">
            Real-time order tracking • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{processingOrders.length}</p>
                <p className="text-sm text-muted-foreground">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-sm text-muted-foreground">Active Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <span className="text-lg font-bold text-green-600">₹</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Active Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              Pending Orders
            </CardTitle>
            <Badge variant="secondary">{pendingOrders.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingOrders.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No pending orders</p>
            ) : (
              pendingOrders.map((order) => (
                <LiveOrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  getTimeSince={getTimeSince}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              Processing Orders
            </CardTitle>
            <Badge variant="secondary">{processingOrders.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {processingOrders.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No orders being processed</p>
            ) : (
              processingOrders.map((order) => (
                <LiveOrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  getTimeSince={getTimeSince}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LiveOrderCard({
  order,
  onStatusChange,
  getTimeSince,
}: {
  order: Order
  onStatusChange: (orderId: string, status: OrderStatus) => void
  getTimeSince: (date: Date | string) => string
}) {
  return (
    <div className={`rounded-lg border border-l-4 bg-card p-4 ${statusBorderColors[order.status]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{order.id}</span>
            <Badge className={statusColors[order.status]} variant="secondary">
              {order.status}
            </Badge>
          </div>
          <p className="font-medium">{order.customerName}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{order.address ? order.address.split(",")[0] : "No Address"}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">₹{order.total.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{order.items.length} items</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {getTimeSince(order.createdAt)}
        </div>
        <Select value={order.status} onValueChange={(value) => onStatusChange(order.id, value as OrderStatus)}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
