<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="text-9xl font-bold text-gray-200">403</div>
      <h1 class="text-2xl font-bold text-gray-800 mt-4">访问被拒绝</h1>
      <p class="text-gray-500 mt-2">抱歉，您没有权限访问此页面</p>
      <div class="mt-8 flex justify-center gap-4">
        <el-button @click="$router.push('/')">返回首页</el-button>
        <el-button type="primary" @click="handleLogout">重新登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>
