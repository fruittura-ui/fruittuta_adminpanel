"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dashboardApi } from "@/lib/api"
import type { RevenueData } from "@/lib/types"

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardApi.getRevenueChart()
        setData(res.data)
      } catch (error) {
        console.error("Failed to fetch revenue chart data", error)
      }
    }
    fetchData()
  }, [])

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c68a15" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c68a15" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-card p-3 shadow-md">
                        <p className="text-sm font-medium">₹{payload[0].value?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{payload[0].payload.orders} orders</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#c68a15"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
