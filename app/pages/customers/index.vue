<script setup lang="ts">
import type { Paginated } from '~/types/models'

interface Customer {
  id: number
  name: string
  email: string
  phone?: string | null
  bookings_count?: number
  orders_count?: number
}

const search = ref('')
const page = ref(1)

const { data } = await useAsyncData(
  'admin-customers',
  () =>
    useApi()<Paginated<Customer>>('/admin/customers', {
      query: { search: search.value || undefined, page: page.value },
    }),
  { watch: [search, page] }
)

let t: ReturnType<typeof setTimeout>
const searchInput = ref('')
watch(searchInput, (v) => { clearTimeout(t); t = setTimeout(() => { search.value = v; page.value = 1 }, 400) })
</script>

<template>
  <div>
    <h1 class="font-display text-2xl font-bold text-slate-900">Pelanggan</h1>
    <p class="text-sm text-slate-500">Data pelanggan terdaftar</p>

    <div class="card mt-5 p-3">
      <div class="relative">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="searchInput" type="search" placeholder="Cari nama / email / telepon..." class="input pl-10">
      </div>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="c in data?.data"
        :key="c.id"
        :to="`/customers/${c.id}`"
        class="card flex items-center gap-3 p-4 transition hover:shadow-md"
      >
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700">
          {{ c.name.charAt(0).toUpperCase() }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate font-semibold text-slate-800">{{ c.name }}</p>
          <p class="truncate text-xs text-slate-400">{{ c.email }}</p>
          <p class="text-xs text-slate-500">{{ c.bookings_count ?? 0 }} booking · {{ c.orders_count ?? 0 }} pesanan</p>
        </div>
        <Icon name="lucide:chevron-right" class="text-slate-300" />
      </NuxtLink>
      <p v-if="!data?.data?.length" class="col-span-full card py-12 text-center text-slate-400">Belum ada pelanggan.</p>
    </div>

    <div v-if="data && data.meta.last_page > 1" class="mt-5 flex items-center justify-center gap-2">
      <button class="btn btn-outline px-3" :disabled="page <= 1" @click="page--"><Icon name="lucide:chevron-left" /></button>
      <span class="text-sm text-slate-600">Hal {{ data.meta.current_page }} / {{ data.meta.last_page }}</span>
      <button class="btn btn-outline px-3" :disabled="page >= data.meta.last_page" @click="page++"><Icon name="lucide:chevron-right" /></button>
    </div>
  </div>
</template>
