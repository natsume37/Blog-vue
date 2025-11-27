<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-end border-b border-gray-100 pb-6">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 tracking-tight">文章管理</h2>
        <p class="text-gray-500 mt-2 text-sm">管理您的所有博客文章、草稿及发布状态</p>
      </div>
      <el-button 
        type="primary" 
        size="large" 
        class="!rounded-full !px-6 !shadow-lg hover:!shadow-xl transition-all !bg-black !border-black hover:!bg-gray-800"
        @click="$router.push('/admin/articles/new')"
      >
        <el-icon class="mr-2"><Plus /></el-icon> 写文章
      </el-button>
    </div>

    <!-- Content -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <el-table 
        :data="articles" 
        style="width: 100%" 
        v-loading="loading"
        :header-cell-style="{ background: '#f9fafb', color: '#374151', fontWeight: '600' }"
      >
        <el-table-column prop="title" label="标题" min-width="240">
          <template #default="{ row }">
            <div class="py-2">
              <div class="font-semibold text-gray-900 text-base mb-1">{{ row.title }}</div>
              <div class="text-xs text-gray-400 truncate max-w-md">{{ row.summary || '暂无摘要' }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="categoryName" label="分类" width="140">
          <template #default="{ row }">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {{ row.categoryName || '未分类' }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <span 
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="row.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="row.is_published ? 'bg-green-500' : 'bg-gray-400'"></span>
              {{ row.is_published ? '已发布' : '草稿' }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="发布时间" width="180">
          <template #default="{ row }">
            <span class="text-gray-500 text-sm font-mono">{{ row.createTime?.split(' ')[0] }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="viewCount" label="数据" width="140">
          <template #default="{ row }">
            <div class="flex items-center gap-3 text-xs text-gray-400">
              <span title="阅读"><el-icon><View /></el-icon> {{ row.viewCount }}</span>
              <span title="评论"><el-icon><ChatDotSquare /></el-icon> {{ row.commentCount }}</span>
              <span title="点赞"><el-icon><Star /></el-icon> {{ row.likeCount }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="160" align="right" fixed="right">
          <template #default="{ row }">
            <div class="flex justify-end gap-2">
              <el-button circle size="small" @click="$router.push(`/admin/articles/${row.id}`)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button circle size="small" type="danger" plain @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="p-4 flex justify-between items-center border-t border-gray-50 bg-gray-50/30">
        <span class="text-xs text-gray-400">共 {{ total }} 篇文章</span>
        <el-pagination 
          background 
          layout="prev, pager, next" 
          :total="total" 
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @current-change="fetchArticles"
          class="!m-0"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, View, ChatDotSquare, Star, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as api from '../../api'

const articles = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const fetchArticles = async () => {
  loading.value = true
  try {
    const res: any = await api.getAdminArticles({ current: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      articles.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    '确定要删除这篇文章吗？此操作不可恢复。',
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: '!bg-red-500 !border-red-500',
    }
  ).then(async () => {
    try {
      const res: any = await api.deleteArticle(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchArticles()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      console.error(error)
    }
  })
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
:deep(.el-table__inner-wrapper::before) {
  display: none;
}
</style>
