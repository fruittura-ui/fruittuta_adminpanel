"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus, Search, Edit, Trash2, Star, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { productsApi } from "@/lib/api"
import type { Product } from "@/lib/types"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(10) // Number of products per page

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const params: any = { limit: 100 }
      if (searchQuery) params.search = searchQuery
      if (categoryFilter !== "all") params.category = categoryFilter

      // Fetch both main list and info list to ensure we get everything
      // The backend seems to filter out 'info' products from the main endpoint
      const [mainRes, infoRes] = await Promise.all([
        productsApi.getAll(params),
        productsApi.getAll({ ...params, visibility: "info" })
      ])

      const mainProducts = mainRes.data || []
      const infoProducts = infoRes.data || []

      // Merge and deduplicate by ID
      const productMap = new Map()

      mainProducts.forEach(p => productMap.set(p.id, p))
      infoProducts.forEach(p => productMap.set(p.id, p))

      const allProducts = Array.from(productMap.values())

      setProducts(allProducts)
      setCurrentPage(1) // Reset to first page on new search/filter
    } catch (error) {
      console.error("Failed to fetch products", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchProducts()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, categoryFilter])

  const handleDelete = async (id: string) => {
    try {
      await productsApi.delete(id)
      setProducts(products.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Failed to delete product", error)
    }
  }

  const getTotalStock = (product: Product) => product.variants.reduce((sum, v) => sum + v.stock, 0)

  // Pagination calculations
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const paginatedProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(products.length / productsPerPage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your dry fruits and spices inventory</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="dryfruits">Dry Fruits</SelectItem>
                  <SelectItem value="spices">Spices</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.nameHindi && <p className="text-sm text-muted-foreground">{product.nameHindi}</p>}
                          {product.isOrganic && (
                            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                              Organic
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          product.category === "dryfruits"
                            ? "border-primary text-primary"
                            : "border-green-600 text-green-600"
                        }
                      >
                        {product.category === "dryfruits" ? "Dry Fruits" : "Spices"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          product.visibility === "info"
                            ? "bg-blue-100 text-blue-800"
                            : product.visibility === "ecommerce"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {product.visibility === "info"
                          ? "Info Only"
                          : product.visibility === "ecommerce"
                            ? "E-commerce"
                            : "Both"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {product.variants.map((variant, idx) => (
                          <div key={idx} className="text-sm">
                            {variant.size} - ₹{variant.price}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          getTotalStock(product) < 50 ? "text-red-600 font-medium" : "text-green-600 font-medium"
                        }
                      >
                        {getTotalStock(product)} units
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span>{product.rating}</span>
                        <span className="text-muted-foreground">({product.reviewCount})</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) setCurrentPage(currentPage - 1)
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage(page)
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
