<script setup lang="ts">
const { data, refresh } = await useAsyncData('admin-settings', async () => {
  const res = await useApi()<{ data: Record<string, string> }>('/admin/settings')
  return res.data
})

const fields = [
  { key: 'site_name', label: 'Nama Bengkel', type: 'text' },
  { key: 'tagline', label: 'Tagline', type: 'text' },
  { key: 'about', label: 'Tentang', type: 'textarea' },
  { key: 'address', label: 'Alamat', type: 'textarea' },
  { key: 'phone', label: 'Telepon', type: 'text' },
  { key: 'whatsapp', label: 'WhatsApp (62...)', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'hours', label: 'Jam Operasional', type: 'text' },
  { key: 'instagram', label: 'Instagram (username)', type: 'text' },
  { key: 'facebook', label: 'Facebook (username)', type: 'text' },
  { key: 'maps_url', label: 'Google Maps URL', type: 'text' },
  { key: 'logo', label: 'Logo URL', type: 'text' },
]

const form = reactive<Record<string, string>>({})
watchEffect(() => {
  if (data.value) {
    for (const f of fields) form[f.key] = data.value[f.key] ?? ''
  }
})

const saving = ref(false)
const savedMsg = ref('')
async function save() {
  saving.value = true
  savedMsg.value = ''
  try {
    await useApi()('/admin/settings', { method: 'PUT', body: { settings: { ...form } } })
    savedMsg.value = 'Pengaturan tersimpan.'
    await refresh()
  } catch {
    savedMsg.value = 'Gagal menyimpan.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="font-display text-2xl font-bold text-slate-900">Pengaturan</h1>
    <p class="text-sm text-slate-500">Profil bengkel yang tampil di website & aplikasi</p>

    <form class="card mt-5 space-y-4 p-5" @submit.prevent="save">
      <div v-for="f in fields" :key="f.key">
        <label class="label">{{ f.label }}</label>
        <textarea v-if="f.type === 'textarea'" v-model="form[f.key]" rows="2" class="input" />
        <input v-else v-model="form[f.key]" class="input">
      </div>

      <p v-if="savedMsg" class="text-sm font-medium text-green-600">{{ savedMsg }}</p>
      <button type="submit" class="btn btn-primary" :disabled="saving">
        <Icon v-if="saving" name="lucide:loader-2" class="animate-spin" /> Simpan Pengaturan
      </button>
    </form>
  </div>
</template>
