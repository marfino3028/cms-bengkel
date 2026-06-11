export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (to.path === '/login') {
    if (auth.isLoggedIn) return navigateTo('/')
    return
  }

  if (!auth.isLoggedIn) {
    return navigateTo('/login')
  }
})
