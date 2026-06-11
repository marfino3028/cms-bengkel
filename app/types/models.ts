export interface Category {
  id: number
  name: string
  slug: string
  icon?: string | null
  description?: string | null
  products_count?: number
}

export interface Product {
  id: number
  category_id: number
  category?: Category
  name: string
  slug: string
  brand?: string | null
  sku?: string | null
  description?: string | null
  price: number
  stock: number
  in_stock: boolean
  image: string | null
  is_featured: boolean
}

export interface Service {
  id: number
  name: string
  slug: string
  description?: string | null
  price: number
  duration_minutes?: number | null
  image: string | null
  is_featured: boolean
}

export interface Banner {
  id: number
  title: string
  subtitle?: string | null
  image: string
  link?: string | null
}

export interface BookingItem {
  id: number
  item_type: 'service' | 'part'
  name: string
  price: number
  qty: number
  subtotal: number
}

export interface Booking {
  id: number
  booking_code: string
  customer_name: string
  customer_phone: string
  vehicle_brand: string
  vehicle_model: string
  vehicle_plate: string
  vehicle_year?: string | null
  scheduled_at: string
  complaint: string
  admin_notes?: string | null
  status: string
  service_total: number
  parts_total: number
  grand_total: number
  payment_status: string
  payment_method?: string | null
  paid_at?: string | null
  items?: BookingItem[]
  created_at: string
}

export interface OrderItem {
  id: number
  product_id: number | null
  product_name: string
  price: number
  qty: number
  subtotal: number
  image?: string | null
}

export interface Order {
  id: number
  order_code: string
  customer_name: string
  customer_phone: string
  fulfillment: string
  shipping_address?: string | null
  subtotal: number
  shipping_cost: number
  total: number
  status: string
  payment_status: string
  payment_method?: string | null
  paid_at?: string | null
  notes?: string | null
  items?: OrderItem[]
  created_at: string
}

export interface Paginated<T> {
  data: T[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}
