import axios from "axios"
import type { Order, Product, Coupon, DashboardStats, RevenueData, CategoryData } from "./types"

const API_URL = "https://fruittura.onrender.com"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authApi = {
  login: (data: any) => {
    // Use the simple admin login endpoint to bypass bcrypt issues
    return api.post("/api/auth/admin/simple-login", {
      email: data.email || data.username, // Handle both just in case
      password: data.password
    })
  },
  register: (data: any) => api.post("/api/auth/register", data),
  getProfile: () => api.get("/api/auth/profile"),
}

export const productsApi = {
  getAll: (params?: any) => api.get<Product[]>("/api/products/", { params }),
  getById: (id: string) => api.get<Product>(`/api/products/${id}`),
  create: (data: any) => api.post<Product>("/api/products/", data),
  update: (id: string, data: any) => api.put<Product>(`/api/products/${id}`, data),
  delete: (id: string) => api.delete(`/api/products/${id}`),
  uploadImage: (id: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post<{ url: string }>(`/api/products/${id}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
}

export const ordersApi = {
  getAll: (params?: any) => api.get<Order[]>("/api/orders/", { params }),
  updateStatus: (id: string, status: string) => api.put(`/api/orders/${id}/status`, null, { params: { status } }),
}

export const couponsApi = {
  getAll: () => api.get<Coupon[]>("/api/coupons/"),
  create: (data: any) => api.post<Coupon>("/api/coupons/", data),
  update: (id: string, data: any) => api.put<Coupon>(`/api/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/api/coupons/${id}`),
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>("/api/dashboard/stats"),
  getRevenueChart: () => api.get<RevenueData[]>("/api/dashboard/revenue-chart"),
  getCategoryChart: () => api.get<CategoryData[]>("/api/dashboard/category-chart"),
  getTopProducts: () => api.get<Product[]>("/api/dashboard/top-products"),
}

export default api
