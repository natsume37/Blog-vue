<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 p-6 text-center group relative">
    <div class="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-miyazaki-blue to-miyazaki-green opacity-60"></div>
    <div class="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500 z-10 mt-4">
      <img :src="siteStore.siteConfig.siteAvatar" alt="Avatar" class="w-full h-full object-cover" />
    </div>
    <h3 class="text-[30px] font-bold text-gray-800 mb-1 font-serif">{{ siteStore.siteConfig.siteAuthor }}</h3>
    <p class="text-[15px] text-gray-500 mb-4 font-medium">{{ siteStore.siteConfig.siteDescription }}</p>
    
    <div class="flex justify-center space-x-4 mb-6">
      <!-- Social Icons -->
      <a :href="config.social.github" target="_blank" class="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-miyazaki-blue hover:text-white hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1 active:scale-90">
        <el-icon :size="20">
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path fill="currentColor" d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0 1 38.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path></svg>
        </el-icon>
      </a>
      <a :href="config.social.email" class="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-miyazaki-blue hover:text-white hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1 active:scale-90">
        <el-icon :size="20"><Message /></el-icon>
      </a>
    </div>
    
    <div class="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-5">
      <div class="group/item cursor-pointer">
        <div class="font-bold text-lg text-gray-800 group-hover/item:text-miyazaki-blue transition-colors">{{ props.stats.articleCount }}</div>
        <div class="text-[15px] text-gray-400 uppercase tracking-wider mt-0.5">文章</div>
      </div>
      <div class="group/item cursor-pointer">
        <div class="font-bold text-lg text-gray-800 group-hover/item:text-miyazaki-blue transition-colors">{{ props.stats.tagCount }}</div>
        <div class="text-[15px] text-gray-400 uppercase tracking-wider mt-0.5">标签</div>
      </div>
      <div class="group/item cursor-pointer">
        <div class="font-bold text-lg text-gray-800 group-hover/item:text-miyazaki-blue transition-colors">{{ formatNumber(props.stats.viewCount) }}</div>
        <div class="text-[15px] text-gray-400 uppercase tracking-wider mt-0.5">访问</div>
      </div>
    </div>
    
    <div class="mt-4 text-[15px] text-gray-400">
      🚀 已运行 {{ props.stats.runDays }} 天
    </div>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@element-plus/icons-vue'
import config from '../config'
import { useSiteStore } from '../stores/site'

const siteStore = useSiteStore()

// Props
const props = withDefaults(defineProps<{
  stats?: {
    articleCount: number
    tagCount: number
    viewCount: number
    runDays: number
  }
}>(), {
  stats: () => ({ articleCount: 0, tagCount: 0, viewCount: 0, runDays: 0 })
})

// 暴露 `stats` 给模板使用，避免未使用变量错误并保持模板简洁
// const stats = props.stats

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>
