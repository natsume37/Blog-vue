<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
    <!-- Hero Banner Section with Danmaku -->
    <div class="hero-banner relative overflow-hidden" :style="{ backgroundImage: `url(${currentBanner})` }">
      <div class="absolute inset-0 bg-black/30"></div>
      
      <!-- 弹幕容器 -->
      <div class="danmaku-container absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          v-for="danmaku in activeDanmakus" 
          :key="danmaku.id"
          class="danmaku-item"
          :style="danmaku.style"
        >
          <div class="danmaku-content">
            <UserAvatar 
              :src="danmaku.avatar" 
              :name="danmaku.nickname"
              class="w-6 h-6 border border-white/50 shadow-sm"
            />
            <span class="danmaku-text">{{ danmaku.content }}</span>
          </div>
        </div>
      </div>
      
      <!-- 中间发射区域 -->
      <div class="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 text-shadow">弹幕</h1>
        
        <div class="danmaku-input-wrapper w-full max-w-xl">
          <div class="relative flex items-center bg-white/20 backdrop-blur-md rounded-full border border-white/30 p-1">
            <input 
              v-model="danmakuText"
              type="text"
              placeholder="说点什么吧~"
              class="flex-1 bg-transparent text-white placeholder-white/70 px-4 py-3 outline-none"
              maxlength="50"
              @keyup.enter="shootDanmaku"
            />
            <button 
              @click="shootDanmaku"
              :disabled="!danmakuText.trim() || shootingDanmaku"
              class="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              发射
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 留言列表区域 -->
    <div class="max-w-4xl mx-auto px-4 py-12">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 font-serif">留言板 💬</h2>
        <p class="text-gray-500">{{ total }} 条留言</p>
      </div>
      
      <!-- Message Form (Detailed) -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/50">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <el-input 
            v-model="form.nickname" 
            placeholder="昵称（选填）"
            class="rounded-lg"
            maxlength="20"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
          <el-input 
            v-model="form.email" 
            placeholder="邮箱（选填，不公开）"
            class="rounded-lg"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </div>
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="写下你的留言..."
          maxlength="500"
          show-word-limit
          class="mb-4"
        />
        <div class="flex justify-end">
          <el-button 
            type="primary" 
            :loading="submitting"
            :disabled="!form.content.trim()"
            class="!rounded-full !px-8"
            @click="handleSubmit"
          >
            <el-icon class="mr-1"><Promotion /></el-icon>
            发送留言
          </el-button>
        </div>
      </div>

      <!-- Messages List -->
      <div class="space-y-4">
        <!-- Loading -->
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div class="flex gap-4">
              <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div class="flex-grow">
                <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Messages -->
        <div 
          v-for="message in messages" 
          :key="message.id" 
          class="bg-white/80 backdrop-blur-lg rounded-xl shadow-sm p-6 flex gap-4 border border-white/50 hover:shadow-md transition-shadow"
        >
          <div class="flex-shrink-0">
            <UserAvatar 
              :src="message.avatar" 
              :name="message.nickname || '游客'"
              class="w-12 h-12 border-2 border-white shadow"
            />
          </div>
          <div class="flex-grow">
            <div class="flex items-center gap-2 mb-2">
              <span class="font-bold text-gray-800">{{ message.nickname || '游客' }}</span>
              <span class="text-xs text-gray-400">{{ formatTime(message.created_at) }}</span>
            </div>
            <p class="text-gray-600 whitespace-pre-wrap">{{ message.content }}</p>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="!loading && messages.length === 0" class="text-center py-20 text-gray-400">
          <el-icon class="text-6xl mb-4"><ChatLineSquare /></el-icon>
          <p>暂无留言，快来抢沙发吧！</p>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="total > pageSize" class="flex justify-center mt-8">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="fetchMessages"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, Message, Promotion, ChatLineSquare } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMessages, createMessage } from '../api'
import { useSiteStore } from '../stores/site'
import { useUserStore } from '../stores/user'
import UserAvatar from '../components/UserAvatar.vue'

const router = useRouter()
const siteStore = useSiteStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const submitting = ref(false)
const shootingDanmaku = ref(false)
const messages = ref<any[]>([])
const danmakuText = ref('')

// 弹幕相关
interface Danmaku {
  id: number
  content: string
  nickname: string
  avatar: string
  style: Record<string, string>
}
const activeDanmakus = ref<Danmaku[]>([])
let danmakuId = 0
let danmakuTimer: number | null = null

// 背景图
const currentBanner = computed(() => {
  const banners = siteStore.siteConfig.messageBoardBanners
  if (banners && banners.length > 0) {
    const randomIndex = Math.floor(Math.random() * banners.length)
    return banners[randomIndex]
  }
  return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop'
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表单
const form = reactive({
  nickname: '',
  email: '',
  content: ''
})

// 弹幕颜色
const danmakuColors = [
  'rgba(255, 255, 255, 0.95)',
  'rgba(255, 230, 200, 0.95)',
  'rgba(200, 255, 230, 0.95)',
  'rgba(230, 200, 255, 0.95)',
  'rgba(255, 200, 230, 0.95)',
]

// 截断文本
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 格式化时间 - 精确到秒
const formatTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  
  // 超过7天显示完整日期时间（精确到秒）
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 创建弹幕
const createDanmaku = (content: string, nickname: string, avatar: string) => {
  const id = danmakuId++
  const top = Math.random() * 70 + 10 // 10% - 80% 的高度范围
  const duration = Math.random() * 5 + 10 // 10-15秒
  const colorIndex = Math.floor(Math.random() * danmakuColors.length)
  
  const danmaku: Danmaku = {
    id,
    content: truncateText(content, 30),
    nickname,
    avatar,
    style: {
      top: `${top}%`,
      animationDuration: `${duration}s`,
      backgroundColor: danmakuColors[colorIndex] || 'rgba(255, 255, 255, 0.95)',
    }
  }
  
  activeDanmakus.value.push(danmaku)
  
  // 动画结束后移除
  setTimeout(() => {
    activeDanmakus.value = activeDanmakus.value.filter(d => d.id !== id)
  }, duration * 1000)
}

// 发射弹幕
const shootDanmaku = async () => {
  if (!danmakuText.value.trim()) return
  
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再发射弹幕')
    router.push('/login')
    return
  }
  
  shootingDanmaku.value = true
  try {
    const res: any = await createMessage({
      content: danmakuText.value.trim(),
      nickname: userStore.userInfo?.nickname || userStore.userInfo?.username,
      email: userStore.userInfo?.email
    })
    
    if (res.code === 200) {
      // 立即显示弹幕
      createDanmaku(
        danmakuText.value.trim(),
        userStore.userInfo?.nickname || userStore.userInfo?.username || '游客',
        userStore.userInfo?.avatar || ''
      )
      danmakuText.value = ''
      ElMessage.success('发射成功！')
      // 刷新列表
      fetchMessages()
    } else {
      ElMessage.error(res.msg || '发射失败')
    }
  } catch (error) {
    console.error('Failed to shoot danmaku:', error)
    ElMessage.error('发射失败，请稍后重试')
  } finally {
    shootingDanmaku.value = false
  }
}

// 初始化弹幕（从历史留言中加载）
const initDanmakus = async () => {
  try {
    const res: any = await getMessages({ current: 1, size: 20 })
    if (res.code === 200) {
      const records = res.data.records
      // 延迟依次创建弹幕
      records.forEach((msg: any, index: number) => {
        setTimeout(() => {
          createDanmaku(msg.content, msg.nickname || '游客', msg.avatar || '')
        }, index * 800)
      })
    }
  } catch (error) {
    console.error('Failed to init danmakus:', error)
  }
}

// 获取留言
const fetchMessages = async () => {
  loading.value = true
  try {
    const res: any = await getMessages({
      current: currentPage.value,
      size: pageSize.value
    })
    if (res.code === 200) {
      messages.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  } finally {
    loading.value = false
  }
}

// 提交留言
const handleSubmit = async () => {
  if (!form.content.trim()) {
    ElMessage.warning('请输入留言内容')
    return
  }
  
  submitting.value = true
  try {
    const res: any = await createMessage({
      content: form.content.trim(),
      nickname: form.nickname.trim() || undefined,
      email: form.email.trim() || undefined
    })
    
    if (res.code === 200) {
      ElMessage.success('留言成功！')
      form.content = ''
      // 刷新列表
      currentPage.value = 1
      fetchMessages()
    } else {
      ElMessage.error(res.msg || '留言失败')
    }
  } catch (error) {
    console.error('Failed to submit message:', error)
    ElMessage.error('留言失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  fetchMessages()
  initDanmakus()
  
  // 定时循环弹幕
  danmakuTimer = window.setInterval(() => {
    if (messages.value.length > 0) {
      const randomMsg = messages.value[Math.floor(Math.random() * messages.value.length)]
      createDanmaku(randomMsg.content, randomMsg.nickname || '游客', randomMsg.avatar || '')
    }
  }, 3000)
})

onUnmounted(() => {
  if (danmakuTimer) {
    clearInterval(danmakuTimer)
  }
})
</script>

<style scoped>
/* Hero Banner */
.hero-banner {
  height: 60vh;
  min-height: 400px;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

@media (max-width: 768px) {
  .hero-banner {
    height: 50vh;
    min-height: 350px;
    background-attachment: scroll;
  }
}

.text-shadow {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* 弹幕样式 */
.danmaku-container {
  z-index: 5;
}

.danmaku-item {
  position: absolute;
  right: -300px;
  animation: danmakuMove linear forwards;
  will-change: transform;
}

@keyframes danmakuMove {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100vw - 300px));
  }
}

.danmaku-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px 6px 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.danmaku-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 输入框样式 */
.danmaku-input-wrapper input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

/* 响应式 */
@media (max-width: 640px) {
  .danmaku-content {
    padding: 4px 12px 4px 6px;
    gap: 6px;
  }
  
  .danmaku-text {
    font-size: 12px;
  }
}
</style>