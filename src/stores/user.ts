import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../api'

export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  intro: string
  is_admin: boolean
  created_at: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfo | null>(null)
  const isLoading = ref(false)

  // 尝试从 localStorage 恢复 userInfo
  const savedUserInfo = localStorage.getItem('userInfo')
  if (savedUserInfo) {
    try {
      userInfo.value = JSON.parse(savedUserInfo)
    } catch (e) {
      localStorage.removeItem('userInfo')
    }
  }

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.is_admin === true)

  // Actions
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const logout = () => {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  /**
   * 验证 token 是否有效，并获取最新用户信息
   * 用于页面刷新后恢复登录状态
   */
  const verifyToken = async (): Promise<boolean> => {
    if (!token.value) {
      return false
    }

    isLoading.value = true
    try {
      const res: any = await api.getCurrentUser()
      if (res.code === 200 && res.data) {
        setUserInfo(res.data)
        return true
      } else {
        // Token 无效或过期
        logout()
        return false
      }
    } catch (error) {
      // 请求失败（401 等）
      logout()
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 登录
   */
  const login = async (username: string, password: string): Promise<{ success: boolean; msg: string }> => {
    isLoading.value = true
    try {
      const res: any = await api.login({ username, password })
      if (res.code === 200 && res.data) {
        setToken(res.data.token)
        setUserInfo(res.data.userInfo)
        return { success: true, msg: '登录成功' }
      } else {
        return { success: false, msg: res.msg || '登录失败' }
      }
    } catch (error: any) {
      return { success: false, msg: error.response?.data?.msg || '登录失败' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 注册
   */
  const register = async (data: { username: string; email: string; password: string; code: string }): Promise<{ success: boolean; msg: string }> => {
    isLoading.value = true
    try {
      const res: any = await api.register(data)
      if (res.code === 200) {
        return { success: true, msg: '注册成功' }
      } else {
        return { success: false, msg: res.msg || '注册失败' }
      }
    } catch (error: any) {
      return { success: false, msg: error.response?.data?.msg || '注册失败' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新个人资料
   */
  const updateProfile = async (data: { nickname?: string; avatar?: string; intro?: string; email?: string }): Promise<{ success: boolean; msg: string }> => {
    isLoading.value = true
    try {
      const res: any = await api.updateProfile(data)
      if (res.code === 200 && res.data) {
        setUserInfo(res.data)
        return { success: true, msg: '更新成功' }
      } else {
        return { success: false, msg: res.msg || '更新失败' }
      }
    } catch (error: any) {
      return { success: false, msg: error.response?.data?.msg || '更新失败' }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    token,
    userInfo,
    isLoading,
    // Getters
    isLoggedIn,
    isAdmin,
    // Actions
    setToken,
    setUserInfo,
    logout,
    verifyToken,
    login,
    register,
    updateProfile
  }
})
