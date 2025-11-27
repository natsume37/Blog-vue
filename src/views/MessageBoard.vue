<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-24 pb-12">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-800 mb-4 font-serif">留言树洞 💬</h1>
        <p class="text-gray-500">在这里留下你的足迹，分享你的想法</p>
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
import { ref, reactive, onMounted } from 'vue'
import { User, Message, Promotion, ChatLineSquare } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMessages, createMessage } from '../api'
import UserAvatar from '../components/UserAvatar.vue'

// 状态
const loading = ref(false)
const submitting = ref(false)
const messages = ref<any[]>([])

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
})
</script>

<style scoped>
</style>