"use client"

import { useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ProductForm } from "@/components/product-form"
import { productsApi } from "@/lib/api"
import type { Product } from "@/lib/types"

export default function EditProductPage() {
  const params = useParams()
  const id = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productsApi.getById(id)
        setProduct(res.data)
      } catch (error) {
        console.error("Failed to fetch product", error)
        // If 404, we might want to redirect or show not found
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-semibold">Product not found</h2>
        <p className="text-muted-foreground">The product you are looking for does not exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update product details for {product.name}</p>
      </div>
      <ProductForm mode="edit" initialData={product} />
    </div>
  )
}
