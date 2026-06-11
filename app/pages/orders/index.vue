<script setup lang="ts">
import type { Order, Paginated } from '~/types/models'

const { rupiah, dateTime } = useFormat()

const status = ref('')
const search = ref('')
const page = ref(1)

const { data } = await useAsyncData(
  'admin-orders',
  () =>
    useApi()<Paginated<Order>>('/admin/orders', {
      query: { status: status.value || undefined, search: search.value || undefined, page: page.value },
    }),
  { watch: [status, search, page] }
)

const statuses = [
  { k: '', l: 'Semua' },
  { k: 'pending', l: 'Menunggu' },
  { k: 'processing', l: 'Diproses' },
  { k: 'completed', l: 'Selesai' },
  { k: 'cancelled', l: 'Batal' },
]

let t: ReturnType<typeof setTimeout>
const searchInput = ref('')
watch(searchInput, (v) => { clearTimeout(t); t = setTimeout(() => { search.value = v; page.value = 1 }, 400) })
watch(status, () => (page.value = 1))
</script>

<template>
  <div>
    <h1 class="font-display text-2xl font-bold text-slate-900">Pesanan Sparepart</h1>
    <p class="text-sm text-slate-500">Kelola pesanan & pembayaran</p>

    <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm">
        <button
          v-for="s in statuses"
          :key="s.k"
          class="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition"
          :class="status === s.k ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'"
          @click="status = s.k"
        >{{ s.l }}</button>
      </div>
      <div class="relative flex-1">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="searchInput" type="search" placeholder="Cari kode / nama..." class="input pl-10">
      </div>
    </div>

    <div class="mt-4 space-y-3">
      <NuxtLink
        v-for="o in data?.data"
        :key="o.id"
        :to="`/orders/${o.id}`"
        class="card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:shadow-md"
      >
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-semibold text-slate-800">{{ o.order_code }}</span>
            <StatusBadge :status="o.status" />
            <StatusBadge :status="o.payment_status" />
          </div>
          <p class="mt-1 text-sm text-slate-500">{{ o.customer_name }} · {{ o.items?.length || 0 }} item · {{ dateTime(o.created_at) }}</p>
        </div>
        <div class="text-right">
          <p class="font-display font-bold text-primary-700">{{ rupiah(o.total) }}</p>
          <Icon name="lucide:chevron-right" class="text-slate-300" />
        </div>
      </NuxtLink>
      <p v-if="!data?.data?.length" class="card py-12 text-center text-slate-400">Tidak ada pesanan.</p>
    </div>

    <div v-if="data && data.meta.last_page > 1" class="mt-5 flex items-center justify-center gap-2">
      <button class="btn btn-outline px-3" :disabled="page <= 1" @click="page--"><Icon name="lucide:chevron-left" /></button>
      <span class="text-sm text-slate-600">Hal {{ data.meta.current_page }} / {{ data.meta.last_page }}</span>
      <button class="btn btn-outline px-3" :disabled="page >= data.meta.last_page" @click="page++"><Icon name="lucide:chevron-right" /></button>
    </div>
  </div>
</template>
