/**
 * Instance $fetch terkonfigurasi: base URL dari runtimeConfig + Bearer token dari cookie.
 */
export function useApi() {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('admin_token')

  return $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Accept', 'application/json')
      if (token.value) headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    },
    onResponseError({ response }) {
      if (response.status === 401 && import.meta.client) {
        token.value = null
      }
    },
  })
}
