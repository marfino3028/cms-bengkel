<script setup lang="ts">
import type { Order } from '~/types/models'

const route = useRoute()
const { rupiah, dateTime } = useFormat()
const id = route.params.id

const { data: order, refresh } = await useAsyncData(`admin-order-${id}`, async () => {
  const res = await useApi()<{ data: Order }>(`/admin/orders/${id}`)
  return res.data
})

const statusVal = ref(order.value?.status || 'pending')
watchEffect(() => { if (order.value) statusVal.value = order.value.status })

const saving = ref(false)
async function saveStatus() {
  saving.value = true
  try {
    await useApi()(`/admin/orders/${id}/status`, { method: 'PUT', body: { status: statusVal.value } })
    await refresh()
  } finally { saving.value = false }
}

const savingPay = ref(false)
async function setPayment(payment_status: string) {
  savingPay.value = true
  try {
    await useApi()(`/admin/orders/${id}/payment`, {
      method: 'PUT',
      body: { payment_status, payment_method: order.value?.payment_method || 'transfer' },
    })
    await refresh()
  } finally { savingPay.value = false }
}
</script>

<template>
  <div v-if="order">
    <NuxtLink to="/orders" class="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600">
      <Icon name="lucide:arrow-left" /> Kembali
    </NuxtLink>

    <div class="grid gap-5 lg:grid-cols-3">
      <div class="space-y-5 lg:col-span-2">
        <div class="card p-5">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 class="font-display text-xl font-bold text-slate-900">{{ order.order_code }}</h1>
              <p class="text-sm text-slate-400">{{ dateTime(order.created_at) }}</p>
            </div>
            <div class="flex gap-1"><StatusBadge :status="order.status" /><StatusBadge :status="order.payment_status" /></div>
          </div>
          <div class="mt-4 grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <div><p class="text-xs text-slate-400">Pelanggan</p><p class="font-medium text-slate-700">{{ order.customer_name }}</p><p class="text-slate-500">{{ order.customer_phone }}</p></div>
            <div><p class="text-xs text-slate-400">Pengambilan</p><p class="font-medium text-slate-700">{{ order.fulfillment === 'pickup' ? 'Ambil di Bengkel' : 'Diantar' }}</p><p v-if="order.shipping_address" class="text-slate-500">{{ order.shipping_address }}</p></div>
            <div><p class="text-xs text-slate-400">Pembayaran</p><p class="font-medium text-slate-700">{{ order.payment_method === 'cash' ? 'Bayar di Tempat' : 'Transfer Bank' }}</p></div>
            <div v-if="order.notes"><p class="text-xs text-slate-400">Catatan</p><p class="text-slate-600">{{ order.notes }}</p></div>
          </div>
        </div>

        <div class="card p-5">
          <h2 class="font-display font-bold text-slate-900">Item Pesanan</h2>
          <ul class="mt-3 divide-y divide-slate-100">
            <li v-for="it in order.items" :key="it.id" class="flex items-center gap-3 py-3">
              <img v-if="it.image" :src="it.image" class="h-12 w-12 rounded-lg object-cover">
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-slate-700">{{ it.product_name }}</p>
                <p class="text-xs text-slate-400">{{ rupiah(it.price) }} × {{ it.qty }}</p>
              </div>
              <span class="text-sm font-semibold text-slate-700">{{ rupiah(it.subtotal) }}</span>
            </li>
          </ul>
          <div class="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
            <div class="flex justify-between text-slate-500"><span>Subtotal</span><span>{{ rupiah(order.subtotal) }}</span></div>
            <div class="flex justify-between text-slate-500"><span>Ongkir</span><span>{{ rupiah(order.shipping_cost) }}</span></div>
            <div class="flex justify-between pt-1 text-base font-bold"><span>Total</span><span class="text-primary-700">{{ rupiah(order.total) }}</span></div>
          </div>
        </div>
      </div>

      <div class="space-y-5">
        <div class="card p-5">
          <h2 class="font-display font-bold text-slate-900">Ubah Status</h2>
          <select v-model="statusVal" class="input mt-3">
            <option value="pending">Menunggu</option>
            <option value="processing">Diproses</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <button class="btn btn-primary mt-3 w-full" :disabled="saving" @click="saveStatus">
            <Icon v-if="saving" name="lucide:loader-2" class="animate-spin" /> Simpan Status
          </button>
        </div>

        <div class="card p-5">
          <h2 class="font-display font-bold text-slate-900">Pembayaran</h2>
          <p class="mt-2 text-sm text-slate-500">Status: <StatusBadge :status="order.payment_status" /></p>
          <div class="mt-3 flex gap-2">
            <button class="btn btn-primary flex-1" :disabled="savingPay || order.payment_status === 'paid'" @click="setPayment('paid')">
              <Icon name="lucide:check" /> Tandai Lunas
            </button>
            <button class="btn btn-outline flex-1" :disabled="savingPay || order.payment_status === 'unpaid'" @click="setPayment('unpaid')">
              Belum Bayar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
