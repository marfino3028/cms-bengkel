<script setup lang="ts">
const props = defineProps<{ status: string }>()

const map: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Menunggu', cls: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Dikonfirmasi', cls: 'bg-primary-100 text-primary-700' },
  processing: { label: 'Diproses', cls: 'bg-primary-100 text-primary-700' },
  in_progress: { label: 'Dikerjakan', cls: 'bg-accent-100 text-accent-600' },
  completed: { label: 'Selesai', cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Dibatalkan', cls: 'bg-red-100 text-red-700' },
  paid: { label: 'Lunas', cls: 'bg-green-100 text-green-700' },
  unpaid: { label: 'Belum Bayar', cls: 'bg-slate-100 text-slate-600' },
}

const info = computed(() => map[props.status] ?? { label: props.status, cls: 'bg-slate-100 text-slate-600' })
</script>

<template>
  <span class="badge" :class="info.cls">{{ info.label }}</span>
</template>
