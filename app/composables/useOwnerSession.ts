import type { ApiResponse, LoginResult, OwnerUser } from '~/types/api'

function errorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return '网络连接失败，请稍后重试'
  const candidate = error as {
    data?: { detail?: string, msg?: string }
    message?: string
  }
  return candidate.data?.detail || candidate.data?.msg || candidate.message || '网络连接失败，请稍后重试'
}

export function useOwnerSession() {
  const config = useRuntimeConfig()
  const user = useState<OwnerUser | null>('owner-user', () => null)
  const checked = useState('owner-session-checked', () => false)
  const loading = useState('owner-session-loading', () => false)

  const isOwner = computed(() => user.value?.is_admin === true)

  async function ensureOwner(force = false): Promise<boolean> {
    if (!force && checked.value) return isOwner.value
    if (loading.value) return false

    loading.value = true
    try {
      const response = await $fetch<ApiResponse<OwnerUser>>('/auth/me', {
        baseURL: config.public.apiV1Base,
        credentials: 'include',
      })
      user.value = response.code === 200 && response.data?.is_admin ? response.data : null
    }
    catch {
      user.value = null
    }
    finally {
      checked.value = true
      loading.value = false
    }

    return isOwner.value
  }

  async function login(username: string, password: string): Promise<{ ok: boolean, message: string }> {
    loading.value = true
    try {
      const response = await $fetch<ApiResponse<LoginResult>>('/auth/login', {
        method: 'POST',
        baseURL: config.public.apiV1Base,
        credentials: 'include',
        body: { username, password },
      })

      if (response.code !== 200 || !response.data?.userInfo.is_admin) {
        user.value = null
        checked.value = true
        return { ok: false, message: response.msg || '这里只允许站长登录' }
      }

      user.value = response.data.userInfo
      checked.value = true
      return { ok: true, message: '登录成功' }
    }
    catch (error) {
      user.value = null
      checked.value = true
      return { ok: false, message: errorMessage(error) }
    }
    finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await $fetch('/auth/logout', {
        method: 'POST',
        baseURL: config.public.apiV1Base,
        credentials: 'include',
      })
    }
    finally {
      user.value = null
      checked.value = true
      await navigateTo('/login')
    }
  }

  return {
    user,
    loading,
    isOwner,
    ensureOwner,
    login,
    logout,
  }
}
