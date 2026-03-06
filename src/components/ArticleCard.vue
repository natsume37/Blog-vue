<template>
  <router-link
    :to="`/article/${id}`"
    class="article-card bg-white rounded-2xl shadow-md hover:shadow-2xl transition-transform duration-300 overflow-hidden flex flex-col h-full group border border-gray-100 relative cursor-pointer hover:-translate-y-1 active:scale-[0.99]"
  >
    <!-- Cover Image -->
    <div class="aspect-[16/9] overflow-hidden relative">
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10"></div>
      <img :src="image" alt="Article Cover" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div class="cover-shine"></div>
      
      <!-- Category Overlay -->
      <div class="absolute top-3 left-3 z-20">
        <span class="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
          <el-icon><Folder /></el-icon> {{ category || '未分类' }}
        </span>
      </div>
    </div>
    
    <!-- Content -->
    <div class="p-6 flex-grow flex flex-col">
      <!-- Title -->
      <h3 class="text-lg md:text-xl font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-miyazaki-blue transition-colors leading-tight">
        {{ title }}
      </h3>

      <!-- Summary (Optional, if available) -->
      <p v-if="summary" class="text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">
        {{ summary }}
      </p>
      <div v-else class="flex-grow"></div>

      <!-- Bottom Meta -->
      <div class="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1">
            <el-icon><Calendar /></el-icon>
            <span class="ml-1">{{ formatDate(date) }}</span>
          </span>
        </div>
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1 hover:text-red-400 transition-colors">
            <el-icon><TrendCharts /></el-icon>
            <span class="ml-1">{{ formatNumber(views) }}</span>
          </span>
          <span class="flex items-center gap-1 hover:text-miyazaki-blue transition-colors">
            <el-icon><ChatDotSquare /></el-icon>
            <span class="ml-1">{{ formatNumber(commentCount) }}</span>
          </span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { Folder, Calendar, TrendCharts, ChatDotSquare } from '@element-plus/icons-vue'

defineProps<{
  id: number | string
  title: string
  summary?: string
  date: string
  image: string
  category: string
  views?: number
  likes?: number
  commentCount?: number
  tags?: any[]
}>()

// 格式化数字
const formatNumber = (num?: number) => {
  if (!num) return '0'
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 简单日期格式化
const formatDate = (str: string) => {
  if (!str) return ''
  return str.split(' ')[0]
}
</script>

<style scoped>
@keyframes card-shine {
  from { transform: translateX(-140%) rotate(12deg); }
  to { transform: translateX(240%) rotate(12deg); }
}

.article-card {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
}

.article-card:hover {
  border-color: rgba(56, 189, 248, 0.3);
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.12);
}

.cover-shine {
  position: absolute;
  inset: 0 auto 0 -60%;
  width: 38%;
  background: linear-gradient(110deg, transparent, rgba(255, 255, 255, 0.32), transparent);
  pointer-events: none;
}

.group:hover .cover-shine {
  animation: card-shine 0.95s ease;
}

@media (prefers-reduced-motion: reduce) {
  .group:hover .cover-shine {
    animation: none;
  }
}
</style>
