"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Plus, Search, Edit, Trash2, Copy, Check, ToggleLeft, ToggleRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
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
import { couponsApi } from "@/lib/api"
import type { Coupon } from "@/lib/types"

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredCoupons = coupons.filter((coupon) => coupon.code.toLowerCase().includes(searchQuery.toLowerCase()))
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage)
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const fetchCoupons = async () => {
    setIsLoading(true)
    try {
      const res = await couponsApi.getAll()
      setCoupons(res.data)
    } catch (error) {
      console.error("Failed to fetch coupons", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleToggleActive = async (id: string) => {
    const coupon = coupons.find((c) => c.id === id)
    if (!coupon) return

    try {
      const updatedStatus = !coupon.isActive
      const res = await couponsApi.update(id, { is_active: updatedStatus })

      // Update local state
      setCoupons(coupons.map((c) => (c.id === id ? { ...c, isActive: updatedStatus } : c)))
    } catch (error) {
      console.error("Failed to toggle coupon status", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await couponsApi.delete(id)
      setCoupons(coupons.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Failed to delete coupon", error)
    }
  }

  const handleSaveCoupon = async (couponData: Partial<Coupon>) => {
    try {
      if (editingCoupon) {
        const updateData = {
          code: couponData.code,
          discount_type: couponData.discountType,
          discount_value: couponData.discountValue,
          min_order_amount: couponData.minOrderValue,
          max_discount_amount: couponData.maxDiscount,
          usage_limit: couponData.usageLimit,
          expires_at: couponData.expiresAt ? new Date(couponData.expiresAt).toISOString() : null,
          is_active: true,
        }
        const res = await couponsApi.update(editingCoupon.id, updateData)
        setCoupons(coupons.map((c) => (c.id === editingCoupon.id ? res.data : c)))
        setEditingCoupon(null)
      } else {
        const newCouponData = {
          code: couponData.code || "",
          discount_type: couponData.discountType || "percentage",
          discount_value: couponData.discountValue || 0,
          min_order_amount: couponData.minOrderValue || 0,
          max_discount_amount: couponData.maxDiscount,
          usage_limit: couponData.usageLimit || 100,
          expires_at: couponData.expiresAt ? new Date(couponData.expiresAt).toISOString() : null,
          is_active: true,
        }
        const res = await couponsApi.create(newCouponData)
        setCoupons([res.data, ...coupons])
      }
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Failed to save coupon", error)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date))
  }

  const isExpired = (date: Date) => new Date(date) < new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">Create and manage discount coupons</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCoupon(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <CouponDialog coupon={editingCoupon} onSave={handleSaveCoupon} onClose={() => setIsAddDialogOpen(false)} />
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Coupons</p>
            <p className="text-2xl font-bold">{coupons.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {coupons.filter((c) => c.isActive && !isExpired(c.expiresAt)).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Usage</p>
            <p className="text-2xl font-bold">{coupons.reduce((sum, c) => sum + c.usedCount, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Expired</p>
            <p className="text-2xl font-bold text-red-600">{coupons.filter((c) => isExpired(c.expiresAt)).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search coupon codes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
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
              ) : paginatedCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No coupons found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCoupons.map((coupon) => {
                  const expired = isExpired(coupon.expiresAt)
                  return (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-muted px-2 py-1 font-mono text-sm font-semibold">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleCopyCode(coupon.code)}
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `₹${coupon.discountValue}`}
                        </span>
                        {coupon.maxDiscount && (
                          <span className="text-xs text-muted-foreground"> (max ₹{coupon.maxDiscount})</span>
                        )}
                      </TableCell>
                      <TableCell>₹{coupon.minOrderValue}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>
                            {coupon.usedCount} / {coupon.usageLimit}
                          </span>
                          <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={expired ? "text-red-600" : ""}>{formatDate(coupon.expiresAt)}</span>
                      </TableCell>
                      <TableCell>
                        {expired ? (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            Expired
                          </Badge>
                        ) : coupon.isActive ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(coupon.id)}
                            disabled={expired}
                          >
                            {coupon.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          <Dialog
                            open={editingCoupon?.id === coupon.id}
                            onOpenChange={(open) => !open && setEditingCoupon(null)}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingCoupon(coupon)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <CouponDialog
                              coupon={coupon}
                              onSave={handleSaveCoupon}
                              onClose={() => setEditingCoupon(null)}
                            />
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete coupon &quot;
                                  {coupon.code}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(coupon.id)}
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
                  )
                })
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

function CouponDialog({
  coupon,
  onSave,
  onClose,
}: {
  coupon: Coupon | null
  onSave: (data: Partial<Coupon>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    code: coupon?.code || "",
    discountType: coupon?.discountType || "percentage",
    discountValue: coupon?.discountValue || 10,
    minOrderValue: coupon?.minOrderValue || 500,
    maxDiscount: coupon?.maxDiscount || undefined,
    usageLimit: coupon?.usageLimit || 100,
    expiresAt: coupon?.expiresAt
      ? new Date(coupon.expiresAt).toISOString().split("T")[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      code: formData.code.toUpperCase(),
      expiresAt: new Date(formData.expiresAt),
    } as Partial<Coupon>)
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{coupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Coupon Code *</Label>
          <Input
            id="code"
            placeholder="e.g., WELCOME10"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className="font-mono uppercase"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Discount Type *</Label>
            <Select
              value={formData.discountType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  discountType: value as "percentage" | "fixed",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountValue">
              Discount Value * {formData.discountType === "percentage" ? "(%)" : "(₹)"}
            </Label>
            <Input
              id="discountValue"
              type="number"
              min="0"
              value={formData.discountValue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountValue: Number(e.target.value),
                })
              }
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="minOrderValue">Minimum Order (₹) *</Label>
            <Input
              id="minOrderValue"
              type="number"
              min="0"
              value={formData.minOrderValue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minOrderValue: Number(e.target.value),
                })
              }
              required
            />
          </div>
          {formData.discountType === "percentage" && (
            <div className="space-y-2">
              <Label htmlFor="maxDiscount">Max Discount (₹)</Label>
              <Input
                id="maxDiscount"
                type="number"
                min="0"
                placeholder="Optional"
                value={formData.maxDiscount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxDiscount: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="usageLimit">Usage Limit *</Label>
            <Input
              id="usageLimit"
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiry Date *</Label>
            <Input
              id="expiresAt"
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">{coupon ? "Update" : "Create"} Coupon</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
