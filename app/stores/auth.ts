import { defineStore } from 'pinia'

export interface AuthUser {
  id: number
  name: string
  email: string
  phone?: string | null
  role: string
  avatar?: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const token = useCookie<string | null>('admin_token', {
    maxAge: 60 * 60 * 24 * 14,
    sameSite: 'lax',
  })
  const user = ref<AuthUser | null>(null)
  const ready = ref(false)

  const isLoggedIn = computed(() => !!token.value && user.value?.role === 'admin')

  async function login(email: string, password: string) {
    const res = await useApi()<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    if (res.user.role !== 'admin') {
      throw new Error('Akun ini bukan admin. Gunakan akun administrator.')
    }
    token.value = res.token
    user.value = res.user
    return res
  }

  async function fetchUser() {
    if (!token.value) {
      user.value = null
      ready.value = true
      return
    }
    try {
      const res = await useApi()<{ user: AuthUser }>('/auth/me')
      user.value = res.user
      if (res.user.role !== 'admin') {
        token.value = null
        user.value = null
      }
    } catch {
      token.value = null
      user.value = null
    }
    ready.value = true
  }

  async function logout() {
    try {
      await useApi()('/auth/logout', { method: 'POST' })
    } catch {
      /* ignore */
    }
    token.value = null
    user.value = null
  }

  return { token, user, ready, isLoggedIn, login, fetchUser, logout }
})
