<script setup lang="ts">
import type { Booking, Order } from '~/types/models'

const route = useRoute()
const { rupiah, dateTime } = useFormat()

interface CustomerDetail {
  customer: { id: number; name: string; email: string; phone?: string | null; created_at?: string }
  bookings: Booking[]
  orders: Order[]
}

const { data } = await useAsyncData(`admin-customer-${route.params.id}`, async () => {
  const res = await useApi()<{ data: CustomerDetail }>(`/admin/customers/${route.params.id}`)
  return res.data
})
</script>

<template>
  <div v-if="data">
    <NuxtLink to="/customers" class="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600">
      <Icon name="lucide:arrow-left" /> Kembali
    </NuxtLink>

    <div class="card flex items-center gap-4 p-5">
      <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 font-display text-xl font-bold text-primary-700">
        {{ data.customer.name.charAt(0).toUpperCase() }}
      </span>
      <div>
        <h1 class="font-display text-xl font-bold text-slate-900">{{ data.customer.name }}</h1>
        <p class="text-sm text-slate-500">{{ data.customer.email }} · {{ data.customer.phone }}</p>
      </div>
    </div>

    <div class="mt-5 grid gap-5 lg:grid-cols-2">
      <div class="card p-5">
        <h2 class="font-display font-bold text-slate-900">Booking ({{ data.bookings.length }})</h2>
        <div class="mt-3 divide-y divide-slate-100">
          <NuxtLink v-for="b in data.bookings" :key="b.id" :to="`/bookings/${b.id}`" class="flex items-center justify-between gap-2 py-2.5 hover:opacity-80">
            <div class="min-w-0"><p class="truncate text-sm font-medium text-slate-700">{{ b.booking_code }}</p><p class="text-xs text-slate-400">{{ dateTime(b.scheduled_at) }}</p></div>
            <div class="flex items-center gap-2"><StatusBadge :status="b.status" /><span class="text-sm font-semibold">{{ rupiah(b.grand_total) }}</span></div>
          </NuxtLink>
          <p v-if="!data.bookings.length" class="py-6 text-center text-sm text-slate-400">Belum ada booking.</p>
        </div>
      </div>

      <div class="card p-5">
        <h2 class="font-display font-bold text-slate-900">Pesanan ({{ data.orders.length }})</h2>
        <div class="mt-3 divide-y divide-slate-100">
          <NuxtLink v-for="o in data.orders" :key="o.id" :to="`/orders/${o.id}`" class="flex items-center justify-between gap-2 py-2.5 hover:opacity-80">
            <div class="min-w-0"><p class="truncate text-sm font-medium text-slate-700">{{ o.order_code }}</p><p class="text-xs text-slate-400">{{ dateTime(o.created_at) }}</p></div>
            <div class="flex items-center gap-2"><StatusBadge :status="o.status" /><span class="text-sm font-semibold">{{ rupiah(o.total) }}</span></div>
          </NuxtLink>
          <p v-if="!data.orders.length" class="py-6 text-center text-sm text-slate-400">Belum ada pesanan.</p>
        </div>
      </div>
    </div>
  </div>
</template>
