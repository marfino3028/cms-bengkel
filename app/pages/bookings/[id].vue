<script setup lang="ts">
import type { Booking, Paginated, Product, Service } from '~/types/models'

const route = useRoute()
const { rupiah, dateTime } = useFormat()
const id = route.params.id

const { data: booking, refresh } = await useAsyncData(`admin-booking-${id}`, async () => {
  const res = await useApi()<{ data: Booking }>(`/admin/bookings/${id}`)
  return res.data
})

const { data: products } = await useAsyncData('add-products', async () => {
  const res = await useApi()<Paginated<Product>>('/admin/products', { query: { page: 1 } })
  return res.data
})
const { data: services } = await useAsyncData('add-services', async () => {
  const res = await useApi()<{ data: Service[] }>('/admin/services')
  return res.data
})

const statusForm = reactive({ status: booking.value?.status || 'pending', admin_notes: booking.value?.admin_notes || '' })
watchEffect(() => {
  if (booking.value) {
    statusForm.status = booking.value.status
    statusForm.admin_notes = booking.value.admin_notes || ''
  }
})

const savingStatus = ref(false)
async function saveStatus() {
  savingStatus.value = true
  try {
    await useApi()(`/admin/bookings/${id}/status`, { method: 'PUT', body: { ...statusForm } })
    await refresh()
  } finally { savingStatus.value = false }
}

const savingPay = ref(false)
async function setPayment(payment_status: string) {
  savingPay.value = true
  try {
    await useApi()(`/admin/bookings/${id}/payment`, {
      method: 'PUT',
      body: { payment_status, payment_method: booking.value?.payment_method || 'cash' },
    })
    await refresh()
  } finally { savingPay.value = false }
}

// Add item
const showAdd = ref(false)
const addForm = reactive({ item_type: 'part' as 'part' | 'service', item_id: null as number | null, qty: 1 })
const addingItem = ref(false)
async function addItem() {
  if (!addForm.item_id) return
  addingItem.value = true
  try {
    await useApi()(`/admin/bookings/${id}/items`, { method: 'POST', body: { ...addForm } })
    showAdd.value = false
    addForm.item_id = null
    addForm.qty = 1
    await refresh()
  } catch (e: any) {
    alert(e?.data?.message || 'Gagal menambah item.')
  } finally { addingItem.value = false }
}
async function removeItem(itemId: number) {
  if (!confirm('Hapus item ini?')) return
  await useApi()(`/admin/bookings/${id}/items/${itemId}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div v-if="booking">
    <NuxtLink to="/bookings" class="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600">
      <Icon name="lucide:arrow-left" /> Kembali
    </NuxtLink>

    <div class="grid gap-5 lg:grid-cols-3">
      <!-- Info & items -->
      <div class="space-y-5 lg:col-span-2">
        <div class="card p-5">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 class="font-display text-xl font-bold text-slate-900">{{ booking.booking_code }}</h1>
              <p class="text-sm text-slate-400">Dibuat {{ dateTime(booking.created_at) }}</p>
            </div>
            <div class="flex gap-1"><StatusBadge :status="booking.status" /><StatusBadge :status="booking.payment_status" /></div>
          </div>
          <div class="mt-4 grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <div><p class="text-xs text-slate-400">Pelanggan</p><p class="font-medium text-slate-700">{{ booking.customer_name }}</p><p class="text-slate-500">{{ booking.customer_phone }}</p></div>
            <div><p class="text-xs text-slate-400">Jadwal</p><p class="font-medium text-slate-700">{{ dateTime(booking.scheduled_at) }}</p></div>
            <div><p class="text-xs text-slate-400">Motor</p><p class="font-medium text-slate-700">{{ booking.vehicle_brand }} {{ booking.vehicle_model }}</p><p class="text-slate-500">{{ booking.vehicle_plate }} <span v-if="booking.vehicle_year">· {{ booking.vehicle_year }}</span></p></div>
            <div class="sm:col-span-2"><p class="text-xs text-slate-400">Keluhan</p><p class="text-slate-600">{{ booking.complaint }}</p></div>
          </div>
        </div>

        <div class="card p-5">
          <div class="flex items-center justify-between">
            <h2 class="font-display font-bold text-slate-900">Rincian Item</h2>
            <button class="btn btn-outline text-sm" @click="showAdd = true"><Icon name="lucide:plus" /> Tambah Item</button>
          </div>
          <ul class="mt-3 divide-y divide-slate-100">
            <li v-for="it in booking.items" :key="it.id" class="flex items-center justify-between gap-2 py-2.5">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-slate-700">{{ it.name }}</p>
                <p class="text-xs text-slate-400">
                  <span class="badge bg-slate-100 text-slate-500">{{ it.item_type === 'service' ? 'Jasa' : 'Sparepart' }}</span>
                  {{ rupiah(it.price) }} × {{ it.qty }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-slate-700">{{ rupiah(it.subtotal) }}</span>
                <button class="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500" @click="removeItem(it.id)"><Icon name="lucide:trash-2" /></button>
              </div>
            </li>
          </ul>
          <div class="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
            <div class="flex justify-between text-slate-500"><span>Jasa</span><span>{{ rupiah(booking.service_total) }}</span></div>
            <div class="flex justify-between text-slate-500"><span>Sparepart</span><span>{{ rupiah(booking.parts_total) }}</span></div>
            <div class="flex justify-between pt-1 text-base font-bold"><span>Total</span><span class="text-primary-700">{{ rupiah(booking.grand_total) }}</span></div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-5">
        <div class="card p-5">
          <h2 class="font-display font-bold text-slate-900">Ubah Status</h2>
          <select v-model="statusForm.status" class="input mt-3">
            <option value="pending">Menunggu</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="in_progress">Dikerjakan</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <textarea v-model="statusForm.admin_notes" rows="3" class="input mt-3" placeholder="Catatan untuk pelanggan (opsional)" />
          <button class="btn btn-primary mt-3 w-full" :disabled="savingStatus" @click="saveStatus">
            <Icon v-if="savingStatus" name="lucide:loader-2" class="animate-spin" /> Simpan Status
          </button>
        </div>

        <div class="card p-5">
          <h2 class="font-display font-bold text-slate-900">Pembayaran</h2>
          <p class="mt-2 text-sm text-slate-500">Status saat ini: <StatusBadge :status="booking.payment_status" /></p>
          <div class="mt-3 flex gap-2">
            <button class="btn btn-primary flex-1" :disabled="savingPay || booking.payment_status === 'paid'" @click="setPayment('paid')">
              <Icon name="lucide:check" /> Tandai Lunas
            </button>
            <button class="btn btn-outline flex-1" :disabled="savingPay || booking.payment_status === 'unpaid'" @click="setPayment('unpaid')">
              Belum Bayar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add item modal -->
    <AppModal v-model="showAdd" title="Tambah Item">
      <form class="space-y-4" @submit.prevent="addItem">
        <div>
          <label class="label">Jenis</label>
          <select v-model="addForm.item_type" class="input" @change="addForm.item_id = null">
            <option value="part">Sparepart</option>
            <option value="service">Jasa Servis</option>
          </select>
        </div>
        <div>
          <label class="label">{{ addForm.item_type === 'part' ? 'Pilih Sparepart' : 'Pilih Layanan' }}</label>
          <select v-model.number="addForm.item_id" required class="input">
            <option :value="null" disabled>-- pilih --</option>
            <template v-if="addForm.item_type === 'part'">
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }} ({{ rupiah(p.price) }}, stok {{ p.stock }})</option>
            </template>
            <template v-else>
              <option v-for="s in services" :key="s.id" :value="s.id">{{ s.name }} ({{ rupiah(s.price) }})</option>
            </template>
          </select>
        </div>
        <div>
          <label class="label">Jumlah</label>
          <input v-model.number="addForm.qty" type="number" min="1" class="input">
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" class="btn btn-ghost flex-1" @click="showAdd = false">Batal</button>
          <button type="submit" class="btn btn-primary flex-1" :disabled="addingItem"><Icon v-if="addingItem" name="lucide:loader-2" class="animate-spin" /> Tambah</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>
