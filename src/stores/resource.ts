import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getResources, deleteResource } from '../api/resource'
import { getBatchPrivateUrls, getPrivateUrl } from '../api'
import { ElMessage } from 'element-plus'

export interface ResourceItem {
  id: number
  filename: string
  key: string
  url: string
  size: number
  media_type: string
  displayUrl?: string
}

interface CacheEntry {
  url: string
  expires: number
}

export const useResourceStore = defineStore('resource', () => {
  // 数据
  const items = ref<ResourceItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(24)
  const filterType = ref('')
  const loading = ref(false)
  
  // 私有链接缓存
  const privateUrlCache = new Map<string, CacheEntry>()
  
  // 版本号，每次数据变化时递增，用于触发组件刷新
  const version = ref(0)

  // 获取私有链接
  const getDisplayUrl = async (item: ResourceItem): Promise<string> => {
    if (!item.key) return item.url
    
    const cached = privateUrlCache.get(item.key)
    const now = Math.floor(Date.now() / 1000)
    
    if (cached && cached.expires > now + 300) {
      return cached.url
    }
    
    try {
      const res: any = await getPrivateUrl(item.key)
      if (res.code === 200 && res.data?.url) {
        privateUrlCache.set(item.key, {
          url: res.data.url,
          expires: res.data.expires || (now + 3600)
        })
        return res.data.url
      }
    } catch (e) {
      console.warn('Failed to get private url for', item.key)
    }
    return item.url
  }

  // 批量获取私有链接
  const getBatchDisplayUrls = async (records: ResourceItem[]): Promise<Map<string, string>> => {
    const keys = records.map(item => item.key).filter(Boolean)
    if (keys.length === 0) return new Map()
    
    const urlMap = new Map<string, string>()
    const now = Math.floor(Date.now() / 1000)
    
    const keysToFetch: string[] = []
    for (const key of keys) {
      const cached = privateUrlCache.get(key)
      if (cached && cached.expires > now + 300) {
        urlMap.set(key, cached.url)
      } else {
        keysToFetch.push(key)
      }
    }
    
    if (keysToFetch.length > 0) {
      try {
        const res: any = await getBatchPrivateUrls(keysToFetch)
        if (res.code === 200 && res.data) {
          for (const [key, data] of Object.entries(res.data as Record<string, any>)) {
            privateUrlCache.set(key, {
              url: data.url,
              expires: data.expires || (now + 3600)
            })
            urlMap.set(key, data.url)
          }
        }
      } catch (e) {
        console.warn('Failed to batch get private urls', e)
      }
    }
    
    return urlMap
  }

  // 加载数据
  const fetchData = async () => {
    loading.value = true
    try {
      const res: any = await getResources({
        current: page.value,
        size: pageSize.value,
        type: filterType.value === '' ? undefined : (filterType.value === 'image' ? 'img' : filterType.value)
      })
      if (res.code === 200) {
        const records = res.data.records || []
        const urlMap = await getBatchDisplayUrls(records)
        
        items.value = records.map((item: any) => ({
          ...item,
          displayUrl: urlMap.get(item.key) || item.url
        }))
        total.value = res.data.total
        version.value++
      }
    } catch (e) {
      console.error(e)
      ElMessage.error('加载资源列表失败')
    } finally {
      loading.value = false
    }
  }

  // 删除资源
  const removeResource = async (id: number) => {
    await deleteResource(id)
    await fetchData()
  }

  // 刷新单个资源的URL
  const refreshItemUrl = async (item: ResourceItem) => {
    if (item.key) {
      privateUrlCache.delete(item.key)
    }
    const newUrl = await getDisplayUrl(item)
    const idx = items.value.findIndex(i => i.id === item.id)
    if (idx !== -1 && items.value[idx]) {
      items.value[idx].displayUrl = newUrl
    }
    return newUrl
  }

  // 设置筛选并刷新
  const setFilter = (type: string) => {
    filterType.value = type
    page.value = 1
    fetchData()
  }

  // 设置页码
  const setPage = (p: number) => {
    page.value = p
    fetchData()
  }

  // 设置每页数量
  const setPageSize = (size: number) => {
    pageSize.value = size
    page.value = 1
    fetchData()
  }

  return {
    items,
    total,
    page,
    pageSize,
    filterType,
    loading,
    version,
    fetchData,
    removeResource,
    refreshItemUrl,
    setFilter,
    setPage,
    setPageSize,
    getDisplayUrl
  }
})
