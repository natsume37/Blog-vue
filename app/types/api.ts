export interface ApiResponse<T = null> {
  code: number
  msg: string
  data: T | null
}

export interface OwnerUser {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  intro: string
  is_admin: boolean
  is_active: boolean
  created_at: string | null
}

export interface LoginResult {
  token: string
  userInfo: OwnerUser
}
