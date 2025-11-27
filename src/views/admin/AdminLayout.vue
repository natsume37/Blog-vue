<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-md flex flex-col">
      <div class="p-6 border-b border-gray-100">
        <h1 class="text-xl font-bold text-gray-800 flex items-center gap-2">
          <el-icon class="text-miyazaki-blue"><Management /></el-icon>
          博客管理
        </h1>
      </div>
      
      <nav class="flex-grow p-4 space-y-1">
        <router-link to="/admin/articles" 
          class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-miyazaki-blue transition-colors"
          active-class="bg-blue-50 text-miyazaki-blue font-medium">
          <el-icon><Document /></el-icon> 文章管理
        </router-link>
        
        <router-link to="/admin/categories" 
          class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-miyazaki-blue transition-colors"
          active-class="bg-blue-50 text-miyazaki-blue font-medium">
          <el-icon><Collection /></el-icon> 分类/标签
        </router-link>
        
        <router-link to="/admin/comments" 
          class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-miyazaki-blue transition-colors"
          active-class="bg-blue-50 text-miyazaki-blue font-medium">
          <el-icon><ChatDotSquare /></el-icon> 评论管理
        </router-link>
        
        <router-link to="/admin/users" 
          class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-miyazaki-blue transition-colors"
          active-class="bg-blue-50 text-miyazaki-blue font-medium">
          <el-icon><User /></el-icon> 用户管理
        </router-link>
        
        <router-link to="/admin/monitor" 
          class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-miyazaki-blue transition-colors"
          active-class="bg-blue-50 text-miyazaki-blue font-medium">
          <el-icon><Monitor /></el-icon> 服务器监控
        </router-link>

        <router-link to="/admin/settings" 
          class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-miyazaki-blue transition-colors"
          active-class="bg-blue-50 text-miyazaki-blue font-medium">
          <el-icon><Setting /></el-icon> 站点设置
        </router-link>

        <router-link to="/admin/changelogs" 
          class="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-miyazaki-blue transition-colors"
          active-class="bg-blue-50 text-miyazaki-blue font-medium">
          <el-icon><Timer /></el-icon> 建站日志
        </router-link>

        <div class="pt-4 mt-4 border-t border-gray-100">
          <router-link to="/" class="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-800 transition-colors">
            <el-icon><HomeFilled /></el-icon> 返回首页
          </router-link>
        </div>
      </nav>
      
      <div class="p-4 border-t border-gray-100">
        <div class="flex items-center justify-between px-4 py-2">
          <div class="flex items-center gap-3">
            <UserAvatar 
              :src="userStore.userInfo?.avatar" 
              :name="userStore.userInfo?.nickname || 'Admin'"
              class="w-8 h-8"
            />
            <div class="text-sm">
              <div class="font-medium text-gray-700">{{ userStore.userInfo?.nickname || 'Admin' }}</div>
              <div class="text-xs text-gray-400">管理员</div>
            </div>
          </div>
          <el-button link type="danger" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-grow p-8 overflow-y-auto">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Management, Document, Collection, HomeFilled, SwitchButton, User, Monitor, ChatDotSquare, Setting, Timer } from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user'
import { ElMessage } from 'element-plus'
import UserAvatar from '../../components/UserAvatar.vue'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
