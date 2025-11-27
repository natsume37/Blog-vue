<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">评论管理</h2>
      <div class="flex gap-3">
        <el-select v-model="filterStatus" placeholder="筛选状态" clearable @change="fetchComments">
          <el-option label="全部" :value="null" />
          <el-option label="已审核" :value="true" />
          <el-option label="待审核" :value="false" />
        </el-select>
        <el-input 
          v-model="keyword" 
          placeholder="搜索评论内容" 
          clearable 
          style="width: 200px"
          @keyup.enter="fetchComments"
          @clear="fetchComments"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <el-table :data="comments" style="width: 100%" v-loading="loading">
        <el-table-column label="评论者" width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <UserAvatar 
                :src="row.user.avatar" 
                :name="row.user.nickname || row.user.username"
                class="w-8 h-8"
              />
              <span class="text-gray-700 text-sm">{{ row.user.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="content" label="评论内容" min-width="300">
          <template #default="{ row }">
            <p class="text-gray-600 text-sm line-clamp-2">{{ row.content }}</p>
          </template>
        </el-table-column>
        
        <el-table-column prop="article_title" label="文章" width="180">
          <template #default="{ row }">
            <router-link 
              :to="`/article/${row.article_id}`" 
              class="text-blue-500 hover:underline text-sm line-clamp-1"
              target="_blank"
            >
              {{ row.article_title }}
            </router-link>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_approved ? 'success' : 'warning'" size="small">
              {{ row.is_approved ? '已审核' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="发布时间" width="170">
          <template #default="{ row }">
            <span class="text-gray-500 text-sm">{{ formatTime(row.created_at) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" align="right">
          <template #default="{ row }">
            <el-button 
              v-if="!row.is_approved" 
              link 
              type="success" 
              @click="handleApprove(row)"
            >
              审核通过
            </el-button>
            <el-button 
              v-else 
              link 
              type="warning" 
              @click="handleReject(row)"
            >
              撤销审核
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="p-4 flex justify-between items-center border-t border-gray-50">
        <span class="text-sm text-gray-500">共 {{ total }} 条评论</span>
        <el-pagination 
          background 
          layout="prev, pager, next" 
          :total="total" 
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @current-change="fetchComments"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as api from '../../api'
import UserAvatar from '../../components/UserAvatar.vue'

const comments = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const filterStatus = ref<boolean | null>(null)
const keyword = ref('')

const fetchComments = async () => {
  loading.value = true
  try {
    const params: any = {
      current: currentPage.value,
      size: pageSize.value
    }
    
    if (filterStatus.value !== null) {
      params.is_approved = filterStatus.value
    }
    
    if (keyword.value) {
      params.keyword = keyword.value
    }
    
    const res: any = await api.getAdminComments(params)
    if (res.code === 200) {
      comments.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取评论列表失败')
  } finally {
    loading.value = false
  }
}

const handleApprove = async (row: any) => {
  try {
    const res: any = await api.updateAdminComment(row.id, { is_approved: true })
    if (res.code === 200) {
      ElMessage.success('审核通过')
      row.is_approved = true
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  }
}

const handleReject = async (row: any) => {
  try {
    const res: any = await api.updateAdminComment(row.id, { is_approved: false })
    if (res.code === 200) {
      ElMessage.success('已撤销审核')
      row.is_approved = false
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    '确定要删除这条评论吗？此操作不可恢复。',
    '警告',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res: any = await api.deleteAdminComment(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchComments()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const formatTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchComments()
})
</script>
