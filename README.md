# Fruittura Admin Panel

A comprehensive Admin Dashboard for managing the Fruittura e-commerce platform. Built with Next.js, Shadcn UI, and Tailwind CSS.

## Overview
This project serves as the administrative interface for Fruittura, allowing administrators to manage products, orders, coupons, and view business analytics. It connects to a separate backend service for data persistence and business logic.

## Features

- **Product Management**
  - View, search, and filter products.
  - Create, edit, and delete products.
  - Manage product variants, stock levels, and pricing.
  - Control product visibility (Ecommerce, Info Only, or Both).
  - Bulk image handling.

- **Order Management**
  - View detailed order lists with pagination.
  - Filter orders by status and search by customer details.
  - Update order statuses (Pending, Processing, Shipped, Delivered, Cancelled).
  - View individual order details including shipping and item breakdowns.

- **Coupon Management**
  - Create and manage discount coupons.
  - Toggle coupon active status instantly.
  - Track coupon usage and expiry.

- **Dashboard Analytics**
  - **Revenue Chart**: Visual representation of revenue over time.
  - **Top Products**: Analysis of best-selling items.
  - **Category Distribution**: Breakdown of sales by category.

- **Authentication**
  - Secure admin access.
  - Protected routes using `AdminGuard`.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (based on Radix UI)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Fetching**: Axios
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd fruittura-adminpanel
   ```

2. **Navigate to the frontend directory:**
   ```bash
   cd fruittura-admin
   ```

3. **Install dependencies:**
   ```bash
   npm install
   # or if using pnpm
   pnpm install
   ```

### Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration

The application is currently configured to connect to the backend deployed at `https://fruittura.onrender.com`.

- **API Configuration**: The base URL is defined in `lib/api.ts`.
- **Environment Variables**: Check `.env` file for any local overrides if necessary.

## Folder Structure

```
fruittura-admin/
├── app/                  # Next.js App Router pages
│   ├── admin/            # Protected admin routes (Dashboard, Products, Orders, etc.)
│   ├── login/            # Login page
│   └── page.tsx          # Root page (redirects to admin)
├── components/           # React components
│   ├── ui/               # Shadcn UI reusable primitives
│   └── ...               # Feature-specific components (e.g., ProductForm, DashboardCharts)
├── lib/                  # Utilities
│   ├── api.ts            # Axios instance and API calls
│   ├── types.ts          # TypeScript interfaces/types
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
