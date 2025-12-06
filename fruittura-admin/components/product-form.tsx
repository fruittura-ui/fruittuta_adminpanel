"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { productsApi } from "@/lib/api"
import type { Product, ProductVariant } from "@/lib/types"

interface ProductFormProps {
  initialData?: Product
  mode: "add" | "edit"
}

export function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null)

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    nameHindi: initialData?.nameHindi || "",
    category: initialData?.category || "dryfruits",
    visibility: initialData?.visibility || "ecommerce",
    description: initialData?.description || "",
    isOrganic: initialData?.isOrganic || false,
  })

  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants || [{ size: "", price: 0, stock: 0 }],
  )

  const handleAddVariant = () => {
    setVariants([...variants, { size: "", price: 0, stock: 0 }])
  }

  const handleRemoveVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updatedVariants = [...variants]
    if (field === "size") {
      updatedVariants[index][field] = value as string
    } else {
      updatedVariants[index][field] = Number(value)
    }
    setVariants(updatedVariants)
  }

  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const productData = {
        ...formData,
        variants,
        // If editing and no new image file, keep existing image (if any)
        // If adding, image will be uploaded after creation
        images: mode === "edit" && initialData?.image ? [initialData.image] : [],
      }

      let productId = initialData?.id

      if (mode === "add") {
        const res = await productsApi.create(productData)
        productId = res.data.id
      } else if (mode === "edit" && productId) {
        await productsApi.update(productId, productData)
      }

      if (productId && imageFile) {
        await productsApi.uploadImage(productId, imageFile)
      }

      router.push("/admin/products")
    } catch (error) {
      console.error("Failed to save product", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Black Pepper"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameHindi">Name in Hindi</Label>
                  <Input
                    id="nameHindi"
                    placeholder="e.g., काली मिर्च"
                    value={formData.nameHindi}
                    onChange={(e) => setFormData({ ...formData, nameHindi: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        category: value as "dryfruits" | "spices",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dryfruits">Dry Fruits</SelectItem>
                      <SelectItem value="spices">Spices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility *</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        visibility: value as "ecommerce" | "info" | "both",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">E-commerce Only</SelectItem>
                      <SelectItem value="info">Info Site Only</SelectItem>
                      <SelectItem value="both">Both Sites</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="organic"
                  checked={formData.isOrganic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isOrganic: checked })}
                />
                <Label htmlFor="organic" className="cursor-pointer">
                  This is an organic product
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Size Variants & Pricing</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid gap-4 sm:grid-cols-4 items-end border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-2">
                    <Label>Size *</Label>
                    <Input
                      placeholder="e.g., 100g, 250g"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (₹) *</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="249"
                      value={variant.price || ""}
                      onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock *</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="100"
                      value={variant.stock || ""}
                      onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveVariant(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Product preview"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => setImagePreview(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:bg-muted">
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Upload Image</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Saving..." : mode === "add" ? "Add Product" : "Update Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/admin/products")}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form >
  )
}
