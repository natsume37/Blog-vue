<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">工具墙管理</h2>
        <p class="mt-1 text-sm text-gray-500">维护工具墙展示内容，支持分类、标签、订阅链接和打开方式配置。</p>
      </div>
      <el-button type="primary" @click="handleCreate">新增工具</el-button>
    </div>

    <el-card>
      <div class="mb-4 grid gap-3 md:grid-cols-[1.2fr_180px_180px_120px]">
        <el-input v-model="keyword" placeholder="搜索名称 / 链接 / 标签 / 徽标" clearable @keyup.enter="fetchToolItems" />
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable>
          <el-option v-for="option in statusOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-input v-model="categoryFilter" placeholder="分类筛选" clearable @keyup.enter="fetchToolItems" />
        <el-button @click="fetchToolItems">筛选</el-button>
      </div>

      <el-table :data="toolItems" v-loading="loading">
        <el-table-column label="工具" min-width="280">
          <template #default="{ row }">
            <div class="flex items-start gap-3">
              <img :src="row.logo || fallbackLogo" alt="logo" class="h-11 w-11 rounded-xl border border-gray-200 object-cover" />
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <div class="truncate font-medium text-gray-800">{{ row.name }}</div>
                  <el-tag v-if="row.badge" size="small">{{ row.badge }}</el-tag>
                  <el-tag v-if="row.is_featured" size="small" type="warning">精选</el-tag>
                </div>
                <div class="truncate text-xs text-gray-400">{{ row.url }}</div>
                <div class="mt-1 text-xs text-gray-500 line-clamp-2">{{ row.description || '暂无简介' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'">{{ statusMap[row.status]?.label || row.status }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" width="130" />
        <el-table-column prop="tool_type" label="类型" width="110" />
        <el-table-column prop="sort_order" label="排序" width="90" />
        <el-table-column prop="subscription_url" label="订阅地址" min-width="180" show-overflow-tooltip />
        <el-table-column prop="tags" label="标签" min-width="160" show-overflow-tooltip />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== 'published'" link type="success" @click="quickChangeStatus(row, 'published')">发布</el-button>
            <el-button v-if="row.status !== 'offline'" link type="warning" @click="quickChangeStatus(row, 'offline')">下线</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑工具' : '新增工具'" width="760px">
      <el-form label-position="top">
        <div class="grid gap-4 md:grid-cols-2">
          <el-form-item label="工具名称">
            <el-input v-model="form.name" placeholder="请输入工具名称" />
          </el-form-item>
          <el-form-item label="工具链接">
            <el-input v-model="form.url" placeholder="https://example.com" />
          </el-form-item>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <el-form-item label="Logo 地址">
            <el-input v-model="form.logo" placeholder="https://example.com/logo.png" />
          </el-form-item>
          <el-form-item label="分类">
            <el-input v-model="form.category" placeholder="推荐工具 / 资讯雷达 / 设计灵感" />
          </el-form-item>
        </div>

        <el-form-item label="工具简介">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="255" show-word-limit />
        </el-form-item>

        <div class="grid gap-4 md:grid-cols-2">
          <el-form-item label="类型">
            <el-input v-model="form.tool_type" placeholder="website / news / docs / ai" />
          </el-form-item>
          <el-form-item label="徽标">
            <el-input v-model="form.badge" placeholder="实时 / 推荐 / Beta" />
          </el-form-item>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <el-form-item label="标签">
            <el-input v-model="form.tags" placeholder="用英文逗号分隔，例如：新闻,实时,聚合" />
          </el-form-item>
          <el-form-item label="订阅地址">
            <el-input v-model="form.subscription_url" placeholder="可选：RSS / 订阅页地址" />
          </el-form-item>
        </div>

        <div class="grid gap-4 md:grid-cols-[1fr_1fr_180px]">
          <el-form-item label="状态">
            <el-select v-model="form.status">
              <el-option v-for="option in statusOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="打开方式">
            <el-select v-model="form.open_mode">
              <el-option v-for="option in openModeOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="form.sort_order" :min="0" :max="9999" class="!w-full" />
          </el-form-item>
        </div>

        <div class="grid gap-4 md:grid-cols-[1fr_120px] md:items-start">
          <el-form-item label="主题色">
            <el-input v-model="form.site_color" placeholder="#0ea5e9" />
          </el-form-item>
          <el-form-item label="精选展示">
            <el-switch v-model="form.is_featured" />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createToolItem,
  deleteToolItem,
  getAdminToolItems,
  updateToolItem,
} from '../../api'
import { useSiteStore } from '../../stores/site'

const siteStore = useSiteStore()
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)
const keyword = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const toolItems = ref<any[]>([])

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已下线', value: 'offline' },
]

const openModeOptions = [
  { label: '新标签页', value: 'new_tab' },
  { label: '当前页', value: 'same_tab' },
]

const statusMap: Record<string, { label: string; type: '' | 'success' | 'warning' | 'danger' | 'info' }> = {
  draft: { label: '草稿', type: 'info' },
  published: { label: '已发布', type: 'success' },
  offline: { label: '已下线', type: 'warning' },
}

const fallbackLogo = siteStore.siteConfig.siteAvatar

const form = reactive({
  name: '',
  url: '',
  logo: '',
  description: '',
  category: '推荐工具',
  tool_type: 'website',
  badge: '',
  tags: '',
  site_color: '',
  subscription_url: '',
  open_mode: 'new_tab',
  sort_order: 0,
  is_featured: false,
  status: 'published',
})

const resetForm = () => {
  form.name = ''
  form.url = ''
  form.logo = ''
  form.description = ''
  form.category = '推荐工具'
  form.tool_type = 'website'
  form.badge = ''
  form.tags = ''
  form.site_color = ''
  form.subscription_url = ''
  form.open_mode = 'new_tab'
  form.sort_order = 0
  form.is_featured = false
  form.status = 'published'
}

const fetchToolItems = async () => {
  loading.value = true
  try {
    const res: any = await getAdminToolItems({
      status: statusFilter.value || undefined,
      category: categoryFilter.value || undefined,
      keyword: keyword.value || undefined,
    })
    if (res.code === 200) {
      toolItems.value = res.data || []
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  isEdit.value = false
  currentId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  currentId.value = row.id
  form.name = row.name || ''
  form.url = row.url || ''
  form.logo = row.logo || ''
  form.description = row.description || ''
  form.category = row.category || '推荐工具'
  form.tool_type = row.tool_type || 'website'
  form.badge = row.badge || ''
  form.tags = row.tags || ''
  form.site_color = row.site_color || ''
  form.subscription_url = row.subscription_url || ''
  form.open_mode = row.open_mode || 'new_tab'
  form.sort_order = row.sort_order || 0
  form.is_featured = !!row.is_featured
  form.status = row.status || 'draft'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name.trim() || !form.url.trim()) {
    ElMessage.warning('请填写工具名称和工具链接')
    return
  }

  submitting.value = true
  try {
    const payload = { ...form }
    const res: any = isEdit.value && currentId.value
      ? await updateToolItem(currentId.value, payload)
      : await createToolItem(payload)

    if (res.code !== 200) {
      ElMessage.warning(res.msg || '保存失败')
      return
    }

    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    fetchToolItems()
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const quickChangeStatus = async (row: any, status: string) => {
  try {
    const res: any = await updateToolItem(row.id, {
      ...row,
      status,
    })
    if (res.code !== 200) {
      ElMessage.warning(res.msg || '状态更新失败')
      return
    }
    ElMessage.success('状态已更新')
    fetchToolItems()
  } catch (error) {
    console.error(error)
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除工具「${row.name}」吗？`, '提示', {
    type: 'warning',
  }).then(async () => {
    try {
      const res: any = await deleteToolItem(row.id)
      if (res.code !== 200) {
        ElMessage.warning(res.msg || '删除失败')
        return
      }
      ElMessage.success('删除成功')
      fetchToolItems()
    } catch (error) {
      console.error(error)
    }
  })
}

const formatDateTime = (value: string) => {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

onMounted(() => {
  fetchToolItems()
})
</script>
