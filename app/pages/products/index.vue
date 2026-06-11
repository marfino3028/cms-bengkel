<script setup lang="ts">
import type { Category, Paginated, Product } from '~/types/models'

const { rupiah } = useFormat()

const search = ref('')
const page = ref(1)

const { data, refresh, pending } = await useAsyncData(
  'admin-products',
  () =>
    useApi()<Paginated<Product>>('/admin/products', {
      query: { search: search.value || undefined, page: page.value },
    }),
  { watch: [search, page] }
)

const { data: categories } = await useAsyncData('admin-cats', async () => {
  const res = await useApi()<{ data: Category[] }>('/admin/categories')
  return res.data
})

const showModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const uploading = ref(false)
const formError = ref('')

const blank = () => ({
  category_id: categories.value?.[0]?.id ?? null,
  name: '',
  brand: '',
  sku: '',
  description: '',
  price: 0,
  stock: 0,
  image: '',
  is_active: true,
  is_featured: false,
})
const form = reactive(blank())

function openCreate() {
  Object.assign(form, blank())
  editingId.value = null
  formError.value = ''
  showModal.value = true
}

function openEdit(p: Product) {
  Object.assign(form, {
    category_id: p.category_id,
    name: p.name,
    brand: p.brand ?? '',
    sku: p.sku ?? '',
    description: p.description ?? '',
    price: p.price,
    stock: p.stock,
    image: p.image ?? '',
    is_active: (p as any).is_active ?? true,
    is_featured: p.is_featured,
  })
  editingId.value = p.id
  formError.value = ''
  showModal.value = true
}

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('image', file)
    fd.append('folder', 'products')
    const res = await useApi()<{ url: string }>('/admin/upload', { method: 'POST', body: fd })
    form.image = res.url
  } catch {
    formError.value = 'Gagal mengunggah gambar.'
  } finally {
    uploading.value = false
  }
}

async function save() {
  saving.value = true
  formError.value = ''
  try {
    if (editingId.value) {
      await useApi()(`/admin/products/${editingId.value}`, { method: 'PUT', body: { ...form } })
    } else {
      await useApi()('/admin/products', { method: 'POST', body: { ...form } })
    }
    showModal.value = false
    await refresh()
  } catch (e: any) {
    const errs = e?.data?.errors
    formError.value = errs ? (Object.values(errs).flat()[0] as string) : (e?.data?.message || 'Gagal menyimpan.')
  } finally {
    saving.value = false
  }
}

async function remove(p: Product) {
  if (!confirm(`Hapus produk "${p.name}"?`)) return
  await useApi()(`/admin/products/${p.id}`, { method: 'DELETE' })
  await refresh()
}

let t: ReturnType<typeof setTimeout>
const searchInput = ref('')
watch(searchInput, (v) => {
  clearTimeout(t)
  t = setTimeout(() => { search.value = v; page.value = 1 }, 400)
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-slate-900">Produk</h1>
        <p class="text-sm text-slate-500">Kelola sparepart & stok</p>
      </div>
      <button class="btn btn-primary" @click="openCreate"><Icon name="lucide:plus" /> Tambah Produk</button>
    </div>

    <div class="card mt-5 p-3">
      <div class="relative">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="searchInput" type="search" placeholder="Cari produk..." class="input pl-10">
      </div>
    </div>

    <!-- Table (desktop) -->
    <div class="card mt-4 hidden overflow-hidden md:block">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th class="px-4 py-3">Produk</th>
            <th class="px-4 py-3">Kategori</th>
            <th class="px-4 py-3">Harga</th>
            <th class="px-4 py-3">Stok</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="p in data?.data" :key="p.id" class="hover:bg-slate-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img :src="p.image || ''" :alt="p.name" class="h-10 w-10 rounded-lg object-cover">
                <div>
                  <p class="font-medium text-slate-800">{{ p.name }}</p>
                  <p class="text-xs text-slate-400">{{ p.brand }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ p.category?.name }}</td>
            <td class="px-4 py-3 font-medium text-slate-700">{{ rupiah(p.price) }}</td>
            <td class="px-4 py-3">
              <span :class="p.stock <= 5 ? 'text-red-600 font-semibold' : 'text-slate-600'">{{ p.stock }}</span>
            </td>
            <td class="px-4 py-3">
              <span class="badge" :class="p.is_featured ? 'bg-accent-100 text-accent-600' : 'bg-slate-100 text-slate-500'">
                {{ p.is_featured ? 'Unggulan' : 'Reguler' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-1">
                <button class="rounded-lg p-2 text-slate-500 hover:bg-primary-50 hover:text-primary-600" @click="openEdit(p)"><Icon name="lucide:pencil" /></button>
                <button class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-500" @click="remove(p)"><Icon name="lucide:trash-2" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!pending && !data?.data?.length" class="py-10 text-center text-slate-400">Belum ada produk.</p>
    </div>

    <!-- Cards (mobile) -->
    <div class="mt-4 space-y-3 md:hidden">
      <div v-for="p in data?.data" :key="p.id" class="card flex gap-3 p-3">
        <img :src="p.image || ''" :alt="p.name" class="h-16 w-16 shrink-0 rounded-lg object-cover">
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-slate-800">{{ p.name }}</p>
          <p class="text-xs text-slate-400">{{ p.category?.name }}</p>
          <p class="text-sm font-bold text-primary-700">{{ rupiah(p.price) }} · stok {{ p.stock }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <button class="rounded-lg p-2 text-slate-500 hover:bg-primary-50 hover:text-primary-600" @click="openEdit(p)"><Icon name="lucide:pencil" /></button>
          <button class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-500" @click="remove(p)"><Icon name="lucide:trash-2" /></button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="data && data.meta.last_page > 1" class="mt-5 flex items-center justify-center gap-2">
      <button class="btn btn-outline px-3" :disabled="page <= 1" @click="page--"><Icon name="lucide:chevron-left" /></button>
      <span class="text-sm text-slate-600">Hal {{ data.meta.current_page }} / {{ data.meta.last_page }}</span>
      <button class="btn btn-outline px-3" :disabled="page >= data.meta.last_page" @click="page++"><Icon name="lucide:chevron-right" /></button>
    </div>

    <!-- Modal Form -->
    <AppModal v-model="showModal" :title="editingId ? 'Edit Produk' : 'Tambah Produk'">
      <form class="space-y-4" @submit.prevent="save">
        <div>
          <label class="label">Nama Produk</label>
          <input v-model="form.name" required class="input">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Kategori</label>
            <select v-model="form.category_id" required class="input">
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="label">Merek</label>
            <input v-model="form.brand" class="input">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Harga (Rp)</label>
            <input v-model.number="form.price" type="number" min="0" required class="input">
          </div>
          <div>
            <label class="label">Stok</label>
            <input v-model.number="form.stock" type="number" min="0" required class="input">
          </div>
        </div>
        <div>
          <label class="label">Deskripsi</label>
          <textarea v-model="form.description" rows="2" class="input" />
        </div>
        <div>
          <label class="label">Gambar</label>
          <div class="flex items-center gap-3">
            <img v-if="form.image" :src="form.image" class="h-14 w-14 rounded-lg object-cover">
            <div class="flex-1">
              <input v-model="form.image" class="input" placeholder="URL gambar atau unggah">
              <label class="mt-2 inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-primary-600">
                <Icon :name="uploading ? 'lucide:loader-2' : 'lucide:upload'" :class="uploading ? 'animate-spin' : ''" />
                {{ uploading ? 'Mengunggah...' : 'Unggah gambar' }}
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
          <button type="submit" class="btn btn-primary flex-1" :disabled="saving">
            <Icon v-if="saving" name="lucide:loader-2" class="animate-spin" /> Simpan
          </button>
        </div>
      </form>
    </AppModal>
  </div>
</template>
