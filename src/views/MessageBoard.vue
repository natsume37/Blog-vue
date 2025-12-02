<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-24 pb-12">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-800 mb-4 font-serif">留言树洞 💬</h1>
        <p class="text-gray-500">在这里留下你的足迹，分享你的想法</p>
      </div>

      <!-- 流动留言墙 -->
      <div v-if="wallMessages.length > 0" class="message-wall-container mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-4">
        <div class="message-wall">
          <!-- 第一行 - 向左流动 -->
          <div class="message-row scroll-left">
            <div class="message-track">
              <div 
                v-for="(msg, index) in wallMessagesRow1" 
                :key="'row1-' + index"
                class="message-bubble"
                :style="{ 
                  '--delay': index * 0.1 + 's',
                  '--bg': bubbleColors[index % bubbleColors.length]
                }"
              >
                <UserAvatar 
                  :src="msg.avatar" 
                  :name="msg.nickname || '游客'"
                  class="w-8 h-8 border border-white/30 shadow-sm flex-shrink-0"
                />
                <span class="message-name">{{ msg.nickname || '游客' }}</span>
                <span class="message-text">{{ truncateText(msg.content, 30) }}</span>
              </div>
            </div>
            <div class="message-track">
              <div 
                v-for="(msg, index) in wallMessagesRow1" 
                :key="'row1-dup-' + index"
                class="message-bubble"
                :style="{ 
                  '--delay': index * 0.1 + 's',
                  '--bg': bubbleColors[index % bubbleColors.length]
                }"
              >
                <UserAvatar 
                  :src="msg.avatar" 
                  :name="msg.nickname || '游客'"
                  class="w-8 h-8 border border-white/30 shadow-sm flex-shrink-0"
                />
                <span class="message-name">{{ msg.nickname || '游客' }}</span>
                <span class="message-text">{{ truncateText(msg.content, 30) }}</span>
              </div>
            </div>
          </div>
          
          <!-- 第二行 - 向右流动 -->
          <div class="message-row scroll-right">
            <div class="message-track">
              <div 
                v-for="(msg, index) in wallMessagesRow2" 
                :key="'row2-' + index"
                class="message-bubble"
                :style="{ 
                  '--delay': index * 0.15 + 's',
                  '--bg': bubbleColors[(index + 3) % bubbleColors.length]
                }"
              >
                <UserAvatar 
                  :src="msg.avatar" 
                  :name="msg.nickname || '游客'"
                  class="w-8 h-8 border border-white/30 shadow-sm flex-shrink-0"
                />
                <span class="message-name">{{ msg.nickname || '游客' }}</span>
                <span class="message-text">{{ truncateText(msg.content, 30) }}</span>
              </div>
            </div>
            <div class="message-track">
              <div 
                v-for="(msg, index) in wallMessagesRow2" 
                :key="'row2-dup-' + index"
                class="message-bubble"
                :style="{ 
                  '--delay': index * 0.15 + 's',
                  '--bg': bubbleColors[(index + 3) % bubbleColors.length]
                }"
              >
                <UserAvatar 
                  :src="msg.avatar" 
                  :name="msg.nickname || '游客'"
                  class="w-8 h-8 border border-white/30 shadow-sm flex-shrink-0"
                />
                <span class="message-name">{{ msg.nickname || '游客' }}</span>
                <span class="message-text">{{ truncateText(msg.content, 30) }}</span>
              </div>
            </div>
          </div>

          <!-- 第三行 - 向左流动（较慢） -->
          <div class="message-row scroll-left-slow">
            <div class="message-track">
              <div 
                v-for="(msg, index) in wallMessagesRow3" 
                :key="'row3-' + index"
                class="message-bubble"
                :style="{ 
                  '--delay': index * 0.12 + 's',
                  '--bg': bubbleColors[(index + 5) % bubbleColors.length]
                }"
              >
                <UserAvatar 
                  :src="msg.avatar" 
                  :name="msg.nickname || '游客'"
                  class="w-8 h-8 border border-white/30 shadow-sm flex-shrink-0"
                />
                <span class="message-name">{{ msg.nickname || '游客' }}</span>
                <span class="message-text">{{ truncateText(msg.content, 30) }}</span>
              </div>
            </div>
            <div class="message-track">
              <div 
                v-for="(msg, index) in wallMessagesRow3" 
                :key="'row3-dup-' + index"
                class="message-bubble"
                :style="{ 
                  '--delay': index * 0.12 + 's',
                  '--bg': bubbleColors[(index + 5) % bubbleColors.length]
                }"
              >
                <UserAvatar 
                  :src="msg.avatar" 
                  :name="msg.nickname || '游客'"
                  class="w-8 h-8 border border-white/30 shadow-sm flex-shrink-0"
                />
                <span class="message-name">{{ msg.nickname || '游客' }}</span>
                <span class="message-text">{{ truncateText(msg.content, 30) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Message Form -->
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
import { ref, reactive, onMounted, computed } from 'vue'
import { User, Message, Promotion, ChatLineSquare } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMessages, createMessage } from '../api'
import UserAvatar from '../components/UserAvatar.vue'

// 状态
const loading = ref(false)
const submitting = ref(false)
const messages = ref<any[]>([])
const wallMessages = ref<any[]>([])

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

// 留言墙颜色
const bubbleColors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
]

// 将留言分成三行
const wallMessagesRow1 = computed(() => {
  const msgs = wallMessages.value
  return msgs.filter((_, i) => i % 3 === 0)
})

const wallMessagesRow2 = computed(() => {
  const msgs = wallMessages.value
  return msgs.filter((_, i) => i % 3 === 1)
})

const wallMessagesRow3 = computed(() => {
  const msgs = wallMessages.value
  return msgs.filter((_, i) => i % 3 === 2)
})

// 获取随机头像表情
// const getAvatarEmoji = (nickname: string) => {
//   const index = nickname ? nickname.charCodeAt(0) % avatarEmojis.length : Math.floor(Math.random() * avatarEmojis.length)
//   return avatarEmojis[index]
// }

// 截断文本
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 格式化时间
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
  
  return date.toLocaleDateString('zh-CN')
}

// 获取留言墙数据（获取更多用于展示）
const fetchWallMessages = async () => {
  try {
    const res: any = await getMessages({
      current: 1,
      size: 30 // 获取更多数据用于留言墙
    })
    if (res.code === 200) {
      wallMessages.value = res.data.records
    }
  } catch (error) {
    console.error('Failed to fetch wall messages:', error)
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
      fetchWallMessages() // 同时刷新留言墙
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
  fetchWallMessages()
})
</script>

<style scoped>
/* 留言墙容器 */
.message-wall-container {
  position: relative;
}

.message-wall-container::before,
.message-wall-container::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  z-index: 10;
  pointer-events: none;
}

.message-wall-container::before {
  left: 0;
  background: linear-gradient(to right, rgb(239 246 255 / 0.9), transparent);
}

.message-wall-container::after {
  right: 0;
  background: linear-gradient(to left, rgb(240 253 244 / 0.9), transparent);
}

.message-wall {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-row {
  display: flex;
  width: max-content;
}

.message-track {
  display: flex;
  gap: 16px;
  padding: 4px 8px;
}

/* 向左滚动 */
.scroll-left {
  animation: scrollLeft 40s linear infinite;
}

.scroll-left:hover {
  animation-play-state: paused;
}

/* 向右滚动 */
.scroll-right {
  animation: scrollRight 45s linear infinite;
}

.scroll-right:hover {
  animation-play-state: paused;
}

/* 向左滚动（较慢） */
.scroll-left-slow {
  animation: scrollLeft 55s linear infinite;
}

.scroll-left-slow:hover {
  animation-play-state: paused;
}

@keyframes scrollLeft {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes scrollRight {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0);
  }
}

/* 留言气泡 */
.message-bubble {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg);
  border-radius: 24px;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: default;
  animation: fadeIn 0.5s ease var(--delay) both;
}

.message-bubble:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.message-avatar {
  font-size: 18px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.message-name {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.message-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式 */
@media (max-width: 640px) {
  .message-bubble {
    padding: 6px 12px;
    gap: 6px;
  }
  
  .message-avatar {
    font-size: 14px;
  }
  
  .message-name {
    font-size: 11px;
  }
  
  .message-text {
    font-size: 12px;
    max-width: 120px;
  }
  
  .message-wall-container::before,
  .message-wall-container::after {
    width: 30px;
  }
}
</style>