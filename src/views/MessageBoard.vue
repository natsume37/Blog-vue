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
          <div class="danmaku-content" :style="{ backgroundColor: danmaku.color }">
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
    <div class="max-w-4xl mx-auto px-4 py-8">
      <CommentSection :content-id="0" content-type="message_board" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getComments, createComment } from '../api'
import { useSiteStore } from '../stores/site'
import { useUserStore } from '../stores/user'
import UserAvatar from '../components/UserAvatar.vue'
import CommentSection from '../components/CommentSection.vue'

const router = useRouter()
const siteStore = useSiteStore()
const userStore = useUserStore()

// 状态
const shootingDanmaku = ref(false)
const messages = ref<any[]>([])
const danmakuText = ref('')

// 弹幕相关
interface Danmaku {
  id: number
  content: string
  nickname: string
  avatar: string
  color: string
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

// 弹幕颜色 (RGB部分)
const danmakuBaseColors = [
  '255, 255, 255',
  '255, 230, 200',
  '200, 255, 230',
  '230, 200, 255',
  '255, 200, 230',
]

// 截断文本
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 获取留言用于弹幕
const fetchMessages = async () => {
  try {
    // 获取最新的50条评论作为弹幕源
    const res: any = await getComments('message_board', 0, { current: 1, size: 50 })
    if (res.code === 200) {
      messages.value = res.data.records
    }
  } catch (error) {
    console.error('获取弹幕数据失败:', error)
  }
}

// 初始化弹幕
const initDanmakus = () => {
  // 初始加载一些弹幕
  setTimeout(() => {
    if (messages.value.length === 0) return
    
    // 初始生成一批弹幕，确保屏幕不空
    // 如果留言少于20条，就循环使用，确保至少有15条初始弹幕
    const initialCount = 15
    
    for (let i = 0; i < initialCount; i++) {
      const msg = messages.value[i % messages.value.length]
      setTimeout(() => {
        createDanmaku(msg.content, msg.user?.nickname || '游客', msg.user?.avatar || '')
      }, i * 800) // 每800ms发射一条
    }
  }, 500)
}

// 创建弹幕
const createDanmaku = (content: string, nickname: string, avatar: string) => {
  const id = danmakuId++
  const top = Math.random() * 70 + 10 // 10% - 80% 的高度范围
  
  // 使用配置的速度 (默认10秒)
  const baseSpeed = siteStore.siteConfig.danmakuSpeed || 10
  const duration = Math.random() * 5 + baseSpeed 
  
  // 使用配置的透明度 (默认0.7)
  const opacity = siteStore.siteConfig.danmakuOpacity || 0.7
  const colorIndex = Math.floor(Math.random() * danmakuBaseColors.length)
  const color = `rgba(${danmakuBaseColors[colorIndex]}, ${opacity})`
  
  // 使用配置的字体大小 (默认14px)
  const fontSize = `${siteStore.siteConfig.danmakuFontSize || 14}px`
  
  const danmaku: Danmaku = {
    id,
    content: truncateText(content, 30),
    nickname,
    avatar,
    color,
    style: {
      top: `${top}%`,
      animationDuration: `${duration}s`,
      fontSize
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
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  
  shootingDanmaku.value = true
  try {
    const res: any = await createComment({
      content_type: 'message_board',
      content_id: 0,
      content: danmakuText.value
    })
    
    if (res.code === 200) {
      ElMessage.success('发射成功！')
      // 立即显示自己的弹幕
      createDanmaku(
        danmakuText.value, 
        userStore.userInfo?.nickname || '我', 
        userStore.userInfo?.avatar || ''
      )
      danmakuText.value = ''
      // 刷新弹幕池
      fetchMessages()
    } else {
      ElMessage.error(res.msg || '发射失败')
    }
  } catch (error) {
    console.error('发射弹幕失败:', error)
    ElMessage.error('发射失败，请稍后重试')
  } finally {
    shootingDanmaku.value = false
  }
}

// 初始化
onMounted(async () => {
  await fetchMessages()
  initDanmakus()
  
  // 启动弹幕循环
  startDanmakuLoop()
})

const startDanmakuLoop = () => {
  const loop = () => {
    if (messages.value.length > 0) {
      // 随机选取一条留言
      const randomMsg = messages.value[Math.floor(Math.random() * messages.value.length)]
      createDanmaku(randomMsg.content, randomMsg.user?.nickname || '游客', randomMsg.user?.avatar || '')
    }
    // 获取最新配置的间隔
    const interval = siteStore.siteConfig.danmakuInterval || 1200
    danmakuTimer = window.setTimeout(loop, interval)
  }
  loop()
}

onUnmounted(() => {
  if (danmakuTimer) {
    clearTimeout(danmakuTimer)
  }
})
</script>

<style scoped>
/* Hero Banner - 全屏自适应 */
.hero-banner {
  height: 100vh;
  min-height: 500px;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

@media (max-width: 768px) {
  .hero-banner {
    height: 100vh;
    min-height: 400px;
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
  right: -400px;
  animation: danmakuMove linear forwards;
  will-change: transform;
  /* 确保不换行 */
  white-space: nowrap;
}

@keyframes danmakuMove {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100vw - 400px));
  }
}

.danmaku-content {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px 6px 8px;
  /* background: rgba(0, 0, 0, 0.4); 移除默认背景，由内联样式控制 */
  backdrop-filter: blur(4px);
  border-radius: 50px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: transform 0.3s;
}

.danmaku-content:hover {
  transform: scale(1.05);
  background: rgba(0, 0, 0, 0.6);
  z-index: 10;
}

.danmaku-text {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
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