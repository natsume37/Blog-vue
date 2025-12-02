<template>
  <nav 
    class="fixed top-0 left-0 w-full z-50 transition-all duration-300"
    :class="[
      isHidden ? '-translate-y-full' : 'translate-y-0',
      (isTransparentPage && isTop) ? 'bg-gradient-to-b from-black/30 to-transparent border-transparent shadow-none py-4' : 'bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm py-0'
    ]"
  >
    <div class="w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-24 2xl:px-32">
      <div class="flex justify-between h-16 items-center">
        <div class="flex-shrink-0 flex items-center cursor-pointer gap-3" @click="$router.push('/')">
          <div class="w-9 h-9 bg-gradient-to-br from-miyazaki-blue to-miyazaki-green rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md transform rotate-3 hover:rotate-0 transition-transform font-display">
            {{ siteStore.siteConfig.siteName.charAt(0) }}
          </div>
          <span 
            class="font-bold text-xl tracking-wide transition-colors duration-300 font-display"
            :class="(isTransparentPage && isTop) ? 'text-white drop-shadow-md' : 'text-gray-800'"
          >
            {{ siteStore.siteConfig.siteName }}
          </span>
        </div>
        <div class="hidden md:flex space-x-8 items-center">
          <router-link 
            v-for="link in navLinks" 
            :key="link.path"
            :to="link.path" 
            class="relative group py-2 font-medium text-[17px] flex items-center gap-1.5 transition-colors duration-300"
            :class="(isTransparentPage && isTop) ? 'text-white/90 hover:text-white drop-shadow-sm' : 'text-gray-600 hover:text-miyazaki-blue'"
          >
            <el-icon :size="16"><component :is="link.icon" /></el-icon>
            {{ link.name }}
            <span 
              class="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
              :class="(isTransparentPage && isTop) ? 'bg-white' : 'bg-miyazaki-blue'"
            ></span>
          </router-link>
          
          <div class="relative group ml-4">
            <input 
              type="text" 
              placeholder="Search..." 
              class="pl-4 pr-8 py-1.5 border rounded-full focus:outline-none focus:ring-2 transition-all text-sm w-40 focus:w-56"
              :class="(isTransparentPage && isTop) ? 'bg-white/20 border-white/30 text-white placeholder-white/70 focus:bg-white/30 focus:border-white focus:ring-white/20' : 'bg-gray-50/50 border-gray-200 text-gray-800 focus:border-miyazaki-blue focus:ring-miyazaki-blue/20 group-hover:bg-white'"
            />
            <div 
              class="absolute right-0 top-0 h-full w-8 flex items-center justify-center pointer-events-none transition-colors duration-300"
              :class="(isTransparentPage && isTop) ? 'text-white/70' : 'text-gray-400'"
            >
              <el-icon :size="16"><Search /></el-icon>
            </div>
          </div>
          
          <!-- 未登录：显示登录按钮 -->
          <router-link 
            v-if="!userStore.isLoggedIn" 
            to="/login" 
            class="px-5 py-1.5 rounded-full transition-all font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            :class="(isTransparentPage && isTop) ? 'bg-white text-miyazaki-blue hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-miyazaki-blue'"
          >
            登录
          </router-link>
          
          <!-- 已登录：显示用户头像和下拉菜单 -->
          <el-dropdown v-else trigger="click" @command="handleCommand">
            <div class="flex items-center cursor-pointer group">
              <UserAvatar 
                :src="userStore.userInfo?.avatar" 
                :name="userStore.userInfo?.nickname || userStore.userInfo?.username"
                class="w-9 h-9 border-2 transition-all shadow-sm"
                :class="(isTransparentPage && isTop) ? 'border-white/50 group-hover:border-white' : 'border-transparent group-hover:border-miyazaki-blue'"
              />
              <el-icon 
                class="ml-2 transition-colors duration-300"
                :class="(isTransparentPage && isTop) ? 'text-white/80 group-hover:text-white' : 'text-gray-500 group-hover:text-miyazaki-blue'"
              ><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled class="!text-gray-800 font-medium">
                  <div class="flex items-center gap-2">
                    <span>{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</span>
                    <el-tag v-if="userStore.isAdmin" type="danger" size="small">管理员</el-tag>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item divided command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item v-if="userStore.isAdmin" command="admin">
                  <el-icon><Setting /></el-icon>
                  后台管理
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, ArrowDown, User, Setting, SwitchButton, HomeFilled, Menu, ChatLineSquare, Calendar } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import { useSiteStore } from '../stores/site'
import UserAvatar from './UserAvatar.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const siteStore = useSiteStore()

const navLinks = [
  { name: '首页', path: '/', icon: HomeFilled },
  { name: '分类', path: '/category', icon: Menu },
  { name: '留言板', path: '/message', icon: ChatLineSquare },
  { name: '建站日志', path: '/changelog', icon: Calendar },
]

// 导航栏滚动隐藏逻辑
const isHidden = ref(false)
const lastScrollTop = ref(0)
const isTop = ref(true)

const isTransparentPage = computed(() => route.path === '/' || route.path.startsWith('/article/'))

const handleScroll = () => {
  const currentScrollTop = window.scrollY || document.documentElement.scrollTop
  
  // 更新是否在顶部状态
  isTop.value = currentScrollTop < 20
  
  // 只有当滚动超过一定距离（例如 60px）才开始处理隐藏逻辑
  if (currentScrollTop > 60) {
    if (currentScrollTop > lastScrollTop.value) {
      // 向下滚动 -> 隐藏
      isHidden.value = true
    } else {
      // 向上滚动 -> 显示
      isHidden.value = false
    }
  } else {
    // 在顶部 -> 总是显示
    isHidden.value = false
  }
  
  lastScrollTop.value = currentScrollTop <= 0 ? 0 : currentScrollTop
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 初始化检查
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// ...existing code...
// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
      break
  }
}
</script>
