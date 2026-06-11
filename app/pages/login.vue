<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const auth = useAuthStore()
const email = ref('admin@bengkelku.com')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    await navigateTo('/')
  } catch (e: any) {
    errorMsg.value = e?.data?.message || e?.message || 'Login gagal.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
    <div class="text-center">
      <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white">
        <Icon name="lucide:bike" class="text-3xl" />
      </span>
      <h1 class="mt-4 font-display text-2xl font-bold text-slate-900">Panel Admin</h1>
      <p class="text-sm text-slate-500">Masuk untuk mengelola bengkel</p>
    </div>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label class="label">Email</label>
        <input v-model="email" type="email" required class="input" placeholder="admin@bengkelku.com">
      </div>
      <div>
        <label class="label">Password</label>
        <input v-model="password" type="password" required class="input" placeholder="••••••••">
      </div>
      <div v-if="errorMsg" class="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{{ errorMsg }}</div>
      <button type="submit" class="btn btn-primary w-full" :disabled="loading">
        <Icon v-if="loading" name="lucide:loader-2" class="animate-spin" />
        {{ loading ? 'Memproses...' : 'Masuk' }}
      </button>
    </form>
  </div>
</template>
