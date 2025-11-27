<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import BackToTop from './components/BackToTop.vue'
import { useSiteStore } from './stores/site'
import { useUserStore } from './stores/user'
import { EditPen } from '@element-plus/icons-vue'

const route = useRoute()
const siteStore = useSiteStore()
const userStore = useUserStore()

// 判断是否在后台管理页面
const isAdminPage = computed(() => route.path.startsWith('/admin'))

onMounted(() => {
  siteStore.fetchConfig()
})
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans text-gray-800 bg-miyazaki-white">
    <!-- 后台管理页面不显示全局导航栏 -->
    <NavBar v-if="!isAdminPage" />
    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="apple-page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <!-- 后台管理页面不显示全局 Footer -->
    <Footer v-if="!isAdminPage" />
    <BackToTop v-if="!isAdminPage" />
    
    <!-- Global Write Button (Fixed Bottom Right) - 仅在非后台页面显示 -->
    <router-link
      v-if="userStore.isAdmin && !isAdminPage"
      to="/admin/articles/new"
      class="fixed bottom-24 right-8 z-40 w-12 h-12 bg-miyazaki-blue text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-500 hover:scale-110 transition-all duration-300 group"
      title="写文章"
    >
      <el-icon class="text-xl group-hover:rotate-12 transition-transform"><EditPen /></el-icon>
    </router-link>
  </div>
</template>

<style>
.apple-page-enter-active,
.apple-page-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.apple-page-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
  filter: blur(4px);
}

.apple-page-leave-to {
  opacity: 0;
  transform: scale(0.98);
  filter: blur(4px);
}
</style>
