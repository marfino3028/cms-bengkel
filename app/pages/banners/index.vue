<script setup lang="ts">
import type { Banner } from '~/types/models'

const { data, refresh } = await useAsyncData('admin-banners', async () => {
  const res = await useApi()<{ data: Banner[] }>('/admin/banners')
  return res.data
})

const showModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const uploading = ref(false)
const formError = ref('')

const blank = () => ({ title: '', subtitle: '', image: '', link: '', is_active: true, sort_order: 0 })
const form = reactive(blank())

function openCreate() { Object.assign(form, blank()); editingId.value = null; formError.value = ''; showModal.value = true }
function openEdit(b: Banner) {
  Object.assign(form, {
    title: b.title, subtitle: b.subtitle ?? '', image: b.image, link: b.link ?? '',
    is_active: (b as any).is_active ?? true, sort_order: (b as any).sort_order ?? 0,
  })
  editingId.value = b.id; formError.value = ''; showModal.value = true
}
async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData(); fd.append('image', file); fd.append('folder', 'banners')
    const res = await useApi()<{ url: string }>('/admin/upload', { method: 'POST', body: fd })
    form.image = res.url
  } finally { uploading.value = false }
}
async function save() {
  saving.value = true; formError.value = ''
  try {
    if (editingId.value) await useApi()(`/admin/banners/${editingId.value}`, { method: 'PUT', body: { ...form } })
    else await useApi()('/admin/banners', { method: 'POST', body: { ...form } })
    showModal.value = false; await refresh()
  } catch (e: any) { formError.value = e?.data?.message || 'Gagal menyimpan. Gambar wajib diisi.' }
  finally { saving.value = false }
}
async function remove(b: Banner) {
  if (!confirm(`Hapus banner "${b.title}"?`)) return
  await useApi()(`/admin/banners/${b.id}`, { method: 'DELETE' }); await refresh()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-slate-900">Banner</h1>
        <p class="text-sm text-slate-500">Banner promosi halaman depan</p>
      </div>
      <button class="btn btn-primary" @click="openCreate"><Icon name="lucide:plus" /> Tambah</button>
    </div>

    <div class="mt-5 grid gap-4 sm:grid-cols-2">
      <div v-for="b in data" :key="b.id" class="card overflow-hidden">
        <img :src="b.image" :alt="b.title" class="aspect-[21/9] w-full object-cover">
        <div class="flex items-center justify-between gap-2 p-4">
          <div class="min-w-0">
            <p class="truncate font-semibold text-slate-800">{{ b.title }}</p>
            <p class="truncate text-xs text-slate-400">{{ b.subtitle }}</p>
          </div>
          <div class="flex gap-1">
            <button class="rounded-lg p-2 text-slate-500 hover:bg-primary-50 hover:text-primary-600" @click="openEdit(b)"><Icon name="lucide:pencil" /></button>
            <button class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-500" @click="remove(b)"><Icon name="lucide:trash-2" /></button>
          </div>
        </div>
      </div>
    </div>

    <AppModal v-model="showModal" :title="editingId ? 'Edit Banner' : 'Tambah Banner'">
      <form class="space-y-4" @submit.prevent="save">
        <div><label class="label">Judul</label><input v-model="form.title" required class="input"></div>
        <div><label class="label">Subjudul</label><input v-model="form.subtitle" class="input"></div>
        <div>
          <label class="label">Gambar</label>
          <div class="flex items-center gap-3">
            <img v-if="form.image" :src="form.image" class="h-14 w-24 rounded-lg object-cover">
            <div class="flex-1">
              <input v-model="form.image" required class="input" placeholder="URL gambar atau unggah">
              <label class="mt-2 inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-primary-600">
                <Icon :name="uploading ? 'lucide:loader-2' : 'lucide:upload'" :class="uploading ? 'animate-spin' : ''" />
                {{ uploading ? 'Mengunggah...' : 'Unggah' }}
                <input type="file" accept="image/*" class="hidden" @change="onFile">
              </label>
            </div>
          </div>
        </div>
        <div><label class="label">Link (opsional)</label><input v-model="form.link" class="input" placeholder="/katalog"></div>
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
