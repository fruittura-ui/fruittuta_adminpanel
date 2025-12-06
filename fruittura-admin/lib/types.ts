export interface ProductVariant {
  size: string
  price: number
  stock: number
}

export interface Product {
  id: string
  name: string
  nameHindi?: string
  category: "dryfruits" | "spices"
  visibility?: "ecommerce" | "info" | "both"
  description: string
  variants: ProductVariant[]
  image: string
  isOrganic: boolean
  rating: number
  reviewCount: number
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  variant: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  couponCode?: string
  createdAt: Date
  updatedAt: Date
}

export interface Coupon {
  id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minOrderValue: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  isActive: boolean
  expiresAt: Date
  createdAt: Date
}

export type OrderStatus = Order["status"]

export interface DashboardStats {
  total_revenue: number
  total_orders: number
  total_products: number
  conversion_rate: number
  revenue_change: string
  orders_change: string
  products_change: string
  conversion_change: string
}

export interface RevenueData {
  month: string
  revenue: number
  orders: number
}

export interface CategoryData {
  name: string
  value: number
  color: string
  [key: string]: any
}
