import { ProductForm } from "@/components/product-form"

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">Add a new dry fruit or spice to your inventory</p>
      </div>
      <ProductForm mode="add" />
    </div>
  )
}
