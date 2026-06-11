<script setup lang="ts">
const auth = useAuthStore()
const route = useRoute()
const config = useRuntimeConfig()

const open = ref(false)
watch(() => route.fullPath, () => (open.value = false))

const nav = [
  { to: '/', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
  { to: '/bookings', label: 'Booking Servis', icon: 'lucide:calendar-check' },
  { to: '/orders', label: 'Pesanan', icon: 'lucide:shopping-bag' },
  { to: '/products', label: 'Produk', icon: 'lucide:package' },
  { to: '/categories', label: 'Kategori', icon: 'lucide:tags' },
  { to: '/services', label: 'Layanan', icon: 'lucide:wrench' },
  { to: '/banners', label: 'Banner', icon: 'lucide:image' },
  { to: '/customers', label: 'Pelanggan', icon: 'lucide:users' },
  { to: '/settings', label: 'Pengaturan', icon: 'lucide:settings' },
]

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

async function doLogout() {
  await auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform lg:translate-x-0"
      :class="open ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
          <Icon name="lucide:bike" class="text-xl" />
        </span>
        <span class="font-display text-lg font-extrabold text-slate-900">BengkelKu</span>
      </div>
      <nav class="flex flex-col gap-1 overflow-y-auto p-3" style="height: calc(100vh - 4rem)">
        <NuxtLink
          v-for="n in nav"
          :key="n.to"
          :to="n.to"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
          :class="isActive(n.to) ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        >
          <Icon :name="n.icon" class="text-lg" />
          {{ n.label }}
        </NuxtLink>
      </nav>
    </aside>

    <!-- Overlay (mobile) -->
    <div v-if="open" class="fixed inset-0 z-30 bg-black/40 lg:hidden" @click="open = false" />

    <!-- Main -->
    <div class="lg:pl-64">
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
        <button class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" @click="open = true">
          <Icon name="lucide:menu" class="text-2xl" />
        </button>
        <div class="flex flex-1 items-center justify-end gap-3">
          <div class="text-right">
            <p class="text-sm font-semibold text-slate-800">{{ auth.user?.name }}</p>
            <p class="text-xs text-slate-400">Administrator</p>
          </div>
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700">
            {{ auth.user?.name?.charAt(0)?.toUpperCase() }}
          </span>
          <button class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-500" title="Keluar" @click="doLogout">
            <Icon name="lucide:log-out" class="text-xl" />
          </button>
        </div>
      </header>

      <main class="p-4 sm:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
