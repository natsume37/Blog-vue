import axios from 'axios'
import { ElMessage } from 'element-plus'
import { apiConfig } from '../config'

const service = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: true
})

// Response interceptor
service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 会话失效，清理本地用户信息（cookie 由后端控制）
          localStorage.removeItem('userInfo')
          // 不自动跳转，让路由守卫处理
          ElMessage.error('登录已过期，请重新登录')
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data?.detail || error.response.data?.msg || '发生错误')
      }
    } else {
      ElMessage.error('网络错误')
    }
    return Promise.reject(error)
  }
)

export default service
