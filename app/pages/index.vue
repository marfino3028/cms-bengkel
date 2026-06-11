<script setup lang="ts">
import type { Booking, Order, Product } from '~/types/models'

const { rupiah, dateTime } = useFormat()

interface Dashboard {
  counts: {
    products: number
    services: number
    customers: number
    bookings_pending: number
    orders_pending: number
    bookings_total: number
    orders_total: number
  }
  revenue: { total: number; this_month: number }
  recent_bookings: Booking[]
  recent_orders: Order[]
  low_stock: Product[]
}

const { data } = await useAsyncData('dashboard', async () => {
  const res = await useApi()<{ data: Dashboard }>('/admin/dashboard')
  return res.data
})

const stats = computed(() => {
  const d = data.value
  if (!d) return []
  return [
    { label: 'Pendapatan Bulan Ini', value: rupiah(d.revenue.this_month), icon: 'lucide:trending-up', color: 'bg-green-100 text-green-600' },
    { label: 'Total Pendapatan', value: rupiah(d.revenue.total), icon: 'lucide:wallet', color: 'bg-primary-100 text-primary-600' },
    { label: 'Booking Menunggu', value: d.counts.bookings_pending, icon: 'lucide:calendar-clock', color: 'bg-amber-100 text-amber-600' },
    { label: 'Pesanan Menunggu', value: d.counts.orders_pending, icon: 'lucide:package-search', color: 'bg-accent-100 text-accent-600' },
    { label: 'Total Produk', value: d.counts.products, icon: 'lucide:package', color: 'bg-slate-100 text-slate-600' },
    { label: 'Total Pelanggan', value: d.counts.customers, icon: 'lucide:users', color: 'bg-slate-100 text-slate-600' },
  ]
})
</script>

<template>
  <div>
    <h1 class="font-display text-2xl font-bold text-slate-900">Dashboard</h1>
    <p class="text-sm text-slate-500">Ringkasan aktivitas bengkel</p>

    <div class="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      <div v-for="s in stats" :key="s.label" class="card p-4">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl" :class="s.color">
          <Icon :name="s.icon" class="text-xl" />
        </span>
        <p class="mt-3 font-display text-xl font-bold text-slate-900 sm:text-2xl">{{ s.value }}</p>
        <p class="text-xs text-slate-500 sm:text-sm">{{ s.label }}</p>
      </div>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-2">
      <!-- Recent bookings -->
      <div class="card p-5">
        <div class="flex items-center justify-between">
          <h2 class="font-display font-bold text-slate-900">Booking Terbaru</h2>
          <NuxtLink to="/bookings" class="text-sm font-semibold text-primary-600 hover:underline">Semua</NuxtLink>
        </div>
        <div class="mt-3 divide-y divide-slate-100">
          <NuxtLink
            v-for="b in data?.recent_bookings"
            :key="b.id"
            :to="`/bookings/${b.id}`"
            class="flex items-center justify-between gap-2 py-2.5 hover:opacity-80"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-700">{{ b.booking_code }}</p>
              <p class="truncate text-xs text-slate-400">{{ b.customer_name }} · {{ dateTime(b.scheduled_at) }}</p>
            </div>
            <StatusBadge :status="b.status" />
          </NuxtLink>
          <p v-if="!data?.recent_bookings?.length" class="py-6 text-center text-sm text-slate-400">Belum ada booking.</p>
        </div>
      </div>

      <!-- Recent orders -->
      <div class="card p-5">
        <div class="flex items-center justify-between">
          <h2 class="font-display font-bold text-slate-900">Pesanan Terbaru</h2>
          <NuxtLink to="/orders" class="text-sm font-semibold text-primary-600 hover:underline">Semua</NuxtLink>
        </div>
        <div class="mt-3 divide-y divide-slate-100">
          <NuxtLink
            v-for="o in data?.recent_orders"
            :key="o.id"
            :to="`/orders/${o.id}`"
            class="flex items-center justify-between gap-2 py-2.5 hover:opacity-80"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-700">{{ o.order_code }}</p>
              <p class="truncate text-xs text-slate-400">{{ o.customer_name }} · {{ rupiah(o.total) }}</p>
            </div>
            <StatusBadge :status="o.status" />
          </NuxtLink>
          <p v-if="!data?.recent_orders?.length" class="py-6 text-center text-sm text-slate-400">Belum ada pesanan.</p>
        </div>
      </div>
    </div>

    <!-- Low stock -->
    <div v-if="data?.low_stock?.length" class="card mt-6 p-5">
      <h2 class="font-display font-bold text-slate-900"><Icon name="lucide:alert-triangle" class="text-amber-500" /> Stok Menipis</h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <span v-for="p in data.low_stock" :key="p.id" class="badge bg-amber-50 text-amber-700">
          {{ p.name }} — sisa {{ p.stock }}
        </span>
      </div>
    </div>
  </div>
</template>
