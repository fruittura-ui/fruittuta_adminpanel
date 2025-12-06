"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dashboardApi } from "@/lib/api"
import type { Product } from "@/lib/types"
import { Star } from "lucide-react"

export function TopProducts() {
  const [topProducts, setTopProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await dashboardApi.getTopProducts()
        setTopProducts(res.data)
      } catch (error) {
        console.error("Failed to fetch top products", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-3">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-4 rounded-lg border border-border p-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  {product.rating} ({product.reviewCount})
                </div>
              </div>
              <p className="font-semibold">₹{product.variants[0]?.price}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
