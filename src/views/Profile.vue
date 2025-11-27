<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-24 pb-12">
    <div class="max-w-2xl mx-auto px-4">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 font-serif">个人中心</h1>
        <p class="text-gray-500 mt-2">管理您的个人信息</p>
      </div>

      <!-- 个人信息卡片 -->
      <div class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/50">
        <!-- 头像区域 -->
        <div class="flex flex-col items-center mb-8">
          <div class="relative group">
            <UserAvatar 
              :src="avatarPreview || userStore.userInfo?.avatar" 
              :name="form.nickname || userStore.userInfo?.username"
              class="w-32 h-32 border-4 border-white shadow-lg"
            />
            <label 
              class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              <el-icon class="text-white text-2xl"><Camera /></el-icon>
              <input 
                type="file" 
                accept="image/*" 
                class="hidden" 
                @change="handleAvatarChange"
              />
            </label>
          </div>
          <p class="text-gray-500 text-sm mt-3">点击头像更换</p>
          
          <!-- 头像 URL 输入 -->
          <div class="w-full mt-4">
            <el-input
              v-model="form.avatar"
              placeholder="或输入头像图片链接"
              class="rounded-lg"
              @input="avatarPreview = form.avatar"
            >
              <template #prefix>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </div>
        </div>

        <!-- 表单 -->
        <el-form :model="form" label-position="top" class="space-y-4">
          <!-- 用户名（只读） -->
          <el-form-item label="用户名">
            <el-input 
              :value="userStore.userInfo?.username" 
              disabled 
              class="rounded-lg"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
            <p class="text-xs text-gray-400 mt-1">用户名不可修改</p>
          </el-form-item>

          <!-- 昵称 -->
          <el-form-item label="昵称">
            <el-input 
              v-model="form.nickname" 
              placeholder="请输入昵称"
              class="rounded-lg"
              maxlength="20"
              show-word-limit
            >
              <template #prefix>
                <el-icon><EditPen /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 邮箱 -->
          <el-form-item label="邮箱">
            <el-input 
              v-model="form.email" 
              placeholder="请输入邮箱"
              class="rounded-lg"
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 个性签名 -->
          <el-form-item label="个性签名">
            <el-input 
              v-model="form.intro" 
              type="textarea" 
              placeholder="介绍一下自己吧..."
              :rows="3"
              maxlength="200"
              show-word-limit
              class="rounded-lg"
            />
          </el-form-item>

          <!-- 账号信息 -->
          <div class="bg-gray-50 rounded-xl p-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">账号类型</span>
              <el-tag :type="userStore.isAdmin ? 'danger' : 'info'" size="small">
                {{ userStore.isAdmin ? '管理员' : '普通用户' }}
              </el-tag>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">注册时间</span>
              <span class="text-gray-700">{{ formatDate(userStore.userInfo?.created_at) }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-4 pt-4">
            <el-button 
              type="primary" 
              class="flex-1 !rounded-full !h-12"
              :loading="loading"
              @click="handleSubmit"
            >
              保存修改
            </el-button>
            <el-button 
              class="!rounded-full !h-12 !px-8"
              @click="resetForm"
            >
              重置
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 返回按钮 -->
      <div class="text-center mt-6">
        <router-link to="/" class="text-miyazaki-blue hover:underline">
          ← 返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Camera, Link, User, EditPen, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import UserAvatar from '../components/UserAvatar.vue'

const userStore = useUserStore()
const loading = ref(false)
const avatarPreview = ref('')

// 表单数据
const form = reactive({
  nickname: '',
  email: '',
  avatar: '',
  intro: ''
})

// 初始化表单数据
onMounted(() => {
  if (userStore.userInfo) {
    form.nickname = userStore.userInfo.nickname || ''
    form.email = userStore.userInfo.email || ''
    form.avatar = userStore.userInfo.avatar || ''
    form.intro = userStore.userInfo.intro || ''
  }
})

// 处理头像文件上传（转为 base64 预览，实际应该上传到服务器）
const handleAvatarChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // 简单预览，实际项目应该上传到文件服务器
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
      // 这里只是预览，实际需要上传文件获取 URL
      ElMessage.info('目前仅支持输入图片链接，文件上传功能开发中')
    }
    reader.readAsDataURL(file)
  }
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 重置表单
const resetForm = () => {
  if (userStore.userInfo) {
    form.nickname = userStore.userInfo.nickname || ''
    form.email = userStore.userInfo.email || ''
    form.avatar = userStore.userInfo.avatar || ''
    form.intro = userStore.userInfo.intro || ''
    avatarPreview.value = ''
  }
}

// 提交表单
const handleSubmit = async () => {
  loading.value = true
  
  // 构建更新数据，只包含有变化的字段
  const updateData: any = {}
  
  if (form.nickname !== userStore.userInfo?.nickname) {
    updateData.nickname = form.nickname
  }
  if (form.email !== userStore.userInfo?.email) {
    updateData.email = form.email
  }
  if (form.avatar !== userStore.userInfo?.avatar) {
    updateData.avatar = form.avatar
  }
  if (form.intro !== userStore.userInfo?.intro) {
    updateData.intro = form.intro
  }
  
  // 检查是否有更新
  if (Object.keys(updateData).length === 0) {
    ElMessage.info('没有修改任何信息')
    loading.value = false
    return
  }
  
  const result = await userStore.updateProfile(updateData)
  
  if (result.success) {
    ElMessage.success(result.msg)
    avatarPreview.value = ''
  } else {
    ElMessage.error(result.msg)
  }
  
  loading.value = false
}
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

:deep(.el-input__wrapper) {
  border-radius: 0.5rem;
}

:deep(.el-textarea__inner) {
  border-radius: 0.5rem;
}
</style>
