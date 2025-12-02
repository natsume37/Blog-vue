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
        <el-icon :size="20"><Platform /></el-icon>
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
import { Platform, Message } from '@element-plus/icons-vue'
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
