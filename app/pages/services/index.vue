<script setup lang="ts">
import type { Service } from '~/types/models'

const { rupiah } = useFormat()

const { data, refresh } = await useAsyncData('admin-services', async () => {
  const res = await useApi()<{ data: Service[] }>('/admin/services')
  return res.data
})

const showModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const uploading = ref(false)
const formError = ref('')

const blank = () => ({ name: '', description: '', price: 0, duration_minutes: 60, image: '', is_active: true, is_featured: false })
const form = reactive(blank())

function openCreate() { Object.assign(form, blank()); editingId.value = null; formError.value = ''; showModal.value = true }
function openEdit(s: Service) {
  Object.assign(form, {
    name: s.name, description: s.description ?? '', price: s.price,
    duration_minutes: s.duration_minutes ?? 60, image: s.image ?? '',
    is_active: (s as any).is_active ?? true, is_featured: s.is_featured,
  })
  editingId.value = s.id; formError.value = ''; showModal.value = true
}
async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData(); fd.append('image', file); fd.append('folder', 'services')
    const res = await useApi()<{ url: string }>('/admin/upload', { method: 'POST', body: fd })
    form.image = res.url
  } finally { uploading.value = false }
}
async function save() {
  saving.value = true; formError.value = ''
  try {
    if (editingId.value) await useApi()(`/admin/services/${editingId.value}`, { method: 'PUT', body: { ...form } })
    else await useApi()('/admin/services', { method: 'POST', body: { ...form } })
    showModal.value = false; await refresh()
  } catch (e: any) { formError.value = e?.data?.message || 'Gagal menyimpan.' }
  finally { saving.value = false }
}
async function remove(s: Service) {
  if (!confirm(`Hapus layanan "${s.name}"?`)) return
  await useApi()(`/admin/services/${s.id}`, { method: 'DELETE' }); await refresh()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-slate-900">Layanan</h1>
        <p class="text-sm text-slate-500">Jenis jasa servis</p>
      </div>
      <button class="btn btn-primary" @click="openCreate"><Icon name="lucide:plus" /> Tambah</button>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="s in data" :key="s.id" class="card overflow-hidden">
        <img :src="s.image || ''" :alt="s.name" class="aspect-[16/9] w-full object-cover">
        <div class="p-4">
          <div class="flex items-start justify-between gap-2">
            <p class="font-semibold text-slate-800">{{ s.name }}</p>
            <span v-if="s.is_featured" class="badge bg-accent-100 text-accent-600">Unggulan</span>
          </div>
          <p class="mt-1 line-clamp-2 text-xs text-slate-400">{{ s.description }}</p>
          <div class="mt-3 flex items-center justify-between">
            <p class="font-bold text-primary-700">{{ rupiah(s.price) }}</p>
            <div class="flex gap-1">
              <button class="rounded-lg p-2 text-slate-500 hover:bg-primary-50 hover:text-primary-600" @click="openEdit(s)"><Icon name="lucide:pencil" /></button>
              <button class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-500" @click="remove(s)"><Icon name="lucide:trash-2" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppModal v-model="showModal" :title="editingId ? 'Edit Layanan' : 'Tambah Layanan'">
      <form class="space-y-4" @submit.prevent="save">
        <div><label class="label">Nama Layanan</label><input v-model="form.name" required class="input"></div>
        <div><label class="label">Deskripsi</label><textarea v-model="form.description" rows="2" class="input" /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="label">Harga (Rp)</label><input v-model.number="form.price" type="number" min="0" required class="input"></div>
          <div><label class="label">Durasi (menit)</label><input v-model.number="form.duration_minutes" type="number" min="0" class="input"></div>
        </div>
        <div>
          <label class="label">Gambar</label>
          <div class="flex items-center gap-3">
            <img v-if="form.image" :src="form.image" class="h-14 w-14 rounded-lg object-cover">
            <div class="flex-1">
              <input v-model="form.image" class="input" placeholder="URL gambar atau unggah">
              <label class="mt-2 inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-primary-600">
                <Icon :name="uploading ? 'lucide:loader-2' : 'lucide:upload'" :class="uploading ? 'animate-spin' : ''" />
                {{ uploading ? 'Mengunggah...' : 'Unggah' }}
                <input type="file" accept="image/*" class="hidden" @change="onFile">
              </label>
            </div>
          </div>
        </div>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 text-sm"><input v-model="form.is_active" type="checkbox" class="h-4 w-4 accent-primary-600"> Aktif</label>
          <label class="flex items-center gap-2 text-sm"><input v-model="form.is_featured" type="checkbox" class="h-4 w-4 accent-primary-600"> Unggulan</label>
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
