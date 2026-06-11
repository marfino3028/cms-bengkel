<script setup lang="ts">
import type { Category } from '~/types/models'

const { data, refresh } = await useAsyncData('admin-categories', async () => {
  const res = await useApi()<{ data: Category[] }>('/admin/categories')
  return res.data
})

const showModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const formError = ref('')

const blank = () => ({ name: '', icon: '', description: '', is_active: true, sort_order: 0 })
const form = reactive(blank())

function openCreate() {
  Object.assign(form, blank())
  editingId.value = null
  formError.value = ''
  showModal.value = true
}
function openEdit(c: Category) {
  Object.assign(form, {
    name: c.name,
    icon: c.icon ?? '',
    description: c.description ?? '',
    is_active: (c as any).is_active ?? true,
    sort_order: (c as any).sort_order ?? 0,
  })
  editingId.value = c.id
  formError.value = ''
  showModal.value = true
}
async function save() {
  saving.value = true
  formError.value = ''
  try {
    if (editingId.value) await useApi()(`/admin/categories/${editingId.value}`, { method: 'PUT', body: { ...form } })
    else await useApi()('/admin/categories', { method: 'POST', body: { ...form } })
    showModal.value = false
    await refresh()
  } catch (e: any) {
    formError.value = e?.data?.message || 'Gagal menyimpan.'
  } finally {
    saving.value = false
  }
}
async function remove(c: Category) {
  if (!confirm(`Hapus kategori "${c.name}"? Produk di dalamnya juga ikut terhapus.`)) return
  await useApi()(`/admin/categories/${c.id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-slate-900">Kategori</h1>
        <p class="text-sm text-slate-500">Kelompok sparepart</p>
      </div>
      <button class="btn btn-primary" @click="openCreate"><Icon name="lucide:plus" /> Tambah</button>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="c in data" :key="c.id" class="card flex items-center justify-between gap-3 p-4">
        <div class="min-w-0">
          <p class="font-semibold text-slate-800">{{ c.name }}</p>
          <p class="text-xs text-slate-400">{{ c.products_count ?? 0 }} produk · /{{ c.slug }}</p>
        </div>
        <div class="flex gap-1">
          <button class="rounded-lg p-2 text-slate-500 hover:bg-primary-50 hover:text-primary-600" @click="openEdit(c)"><Icon name="lucide:pencil" /></button>
          <button class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-500" @click="remove(c)"><Icon name="lucide:trash-2" /></button>
        </div>
      </div>
    </div>

    <AppModal v-model="showModal" :title="editingId ? 'Edit Kategori' : 'Tambah Kategori'">
      <form class="space-y-4" @submit.prevent="save">
        <div><label class="label">Nama</label><input v-model="form.name" required class="input"></div>
        <div><label class="label">Deskripsi</label><textarea v-model="form.description" rows="2" class="input" /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="label">Urutan</label><input v-model.number="form.sort_order" type="number" class="input"></div>
          <label class="flex items-end gap-2 pb-2 text-sm"><input v-model="form.is_active" type="checkbox" class="h-4 w-4 accent-primary-600"> Aktif</label>
        </div>
        <p v-if="formError" class="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{{ formError }}</p>
        <div class="flex gap-2 pt-2">
          <button type="button" class="btn btn-ghost flex-1" @click="showModal = false">Batal</button>
          <button type="submit" class="btn btn-primary flex-1" :disabled="saving"><Icon v-if="saving" name="lucide:loader-2" class="animate-spin" /> Simpan</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>
