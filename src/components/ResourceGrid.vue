<template>
  <div v-if="items.length > 0" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 p-4">
    <div 
      v-for="item in items" 
      :key="item.id" 
      class="group relative bg-white rounded-lg overflow-hidden cursor-pointer border border-gray-100 hover:border-sky-300 hover:shadow-md transition-all duration-200"
      :class="selectedId === item.id ? 'ring-2 ring-sky-400 border-sky-400' : ''"
      @click="$emit('select', item)"
    >
      <!-- 图片容器 - 使用 1:1 正方形 -->
      <div class="relative w-full" style="padding-bottom: 100%;">
        <!-- 图片 -->
        <template v-if="item.media_type === 'img'">
          <img 
            v-if="item.displayUrl"
            :src="item.displayUrl" 
            :alt="item.filename"
            class="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            @error="$emit('image-error', $event, item)"
          />
          <div v-else class="absolute inset-0 flex items-center justify-center bg-gray-50">
            <el-icon class="animate-spin text-gray-300" :size="20"><Loading /></el-icon>
          </div>
        </template>
        
        <!-- 视频 -->
        <template v-else-if="item.media_type === 'video'">
          <div class="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <el-icon class="text-white/80" :size="32"><VideoPlay /></el-icon>
          </div>
        </template>
        
        <!-- 音频 -->
        <template v-else-if="item.media_type === 'audio'">
          <div class="absolute inset-0 bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center">
            <el-icon class="text-sky-400" :size="32"><Headset /></el-icon>
          </div>
        </template>
        
        <!-- 其他 -->
        <template v-else>
          <div class="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <el-icon class="text-gray-300" :size="32"><Document /></el-icon>
          </div>
        </template>
        
        <!-- 选中标记 -->
        <div v-if="selectedId === item.id" class="absolute top-1.5 left-1.5 bg-sky-500 text-white rounded-full p-1 shadow z-10">
          <el-icon :size="10"><Check /></el-icon>
        </div>
        
        <!-- 悬浮操作按钮 -->
        <div class="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-10">
          <button 
            class="w-6 h-6 rounded bg-white/90 shadow-sm flex items-center justify-center text-gray-500 hover:text-sky-500"
            @click.stop="copyLink(item)"
            title="复制链接"
          >
            <el-icon :size="12"><Link /></el-icon>
          </button>
          <button 
            class="w-6 h-6 rounded bg-white/90 shadow-sm flex items-center justify-center text-gray-500 hover:text-red-500"
            @click.stop="$emit('delete', item)"
            title="删除"
          >
            <el-icon :size="12"><Delete /></el-icon>
          </button>
        </div>
        
        <!-- 底部信息遮罩 -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div class="text-[10px] text-white truncate">{{ item.filename }}</div>
          <div class="text-[9px] text-white/70">{{ formatSize(item.size) }}</div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 空状态 -->
  <div v-else class="flex flex-col items-center justify-center py-16 text-gray-400">
    <el-icon :size="48" class="mb-4 text-gray-200"><Picture /></el-icon>
    <span class="text-sm">暂无资源</span>
  </div>
</template>

<script setup lang="ts">
import { Loading, VideoPlay, Headset, Document, Check, Link, Picture, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ResourceItem } from '../stores/resource'

defineProps<{
  items: ResourceItem[]
  selectedId: number | null
}>()

defineEmits<{
  select: [item: ResourceItem]
  delete: [item: ResourceItem]
  'image-error': [event: Event, item: ResourceItem]
}>()

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

const copyLink = async (item: ResourceItem) => {
  try {
    await navigator.clipboard.writeText(item.displayUrl || item.url)
    ElMessage.success('链接已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>
