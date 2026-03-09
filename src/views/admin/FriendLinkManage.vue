<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">友链管理</h2>
        <p class="mt-1 text-sm text-gray-500">管理前台友链展示、审核互链申请、控制排序与上下线状态。</p>
      </div>
      <el-button type="primary" @click="handleCreate">新增友链</el-button>
    </div>

    <el-card>
      <div class="mb-4 grid gap-3 md:grid-cols-[1.2fr_180px_120px]">
        <el-input v-model="keyword" placeholder="搜索站点名 / 链接 / 联系方式" clearable @keyup.enter="fetchLinks" />
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable>
          <el-option v-for="option in statusOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-button @click="fetchLinks">筛选</el-button>
      </div>

      <el-table :data="links" v-loading="loading">
        <el-table-column label="站点" min-width="260">
          <template #default="{ row }">
            <div class="flex items-start gap-3">
              <img :src="row.logo || fallbackLogo" alt="logo" class="h-11 w-11 rounded-xl border border-gray-200 object-cover" />
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <div class="truncate font-medium text-gray-800">{{ row.name }}</div>
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

        <el-table-column prop="group_name" label="分组" width="130" />
        <el-table-column prop="sort_order" label="排序" width="90" />
        <el-table-column prop="contact" label="联系方式" min-width="140" show-overflow-tooltip />
        <el-table-column prop="reciprocal_url" label="互链地址" min-width="180" show-overflow-tooltip />
        <el-table-column prop="review_note" label="审核备注" min-width="160" show-overflow-tooltip />
        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== 'approved'" link type="success" @click="quickChangeStatus(row, 'approved')">通过</el-button>
            <el-button v-if="row.status !== 'offline'" link type="warning" @click="quickChangeStatus(row, 'offline')">下线</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑友链' : '新增友链'" width="720px">
      <el-form label-position="top">
        <div class="grid gap-4 md:grid-cols-2">
          <el-form-item label="站点名称">
            <el-input v-model="form.name" placeholder="请输入站点名称" />
          </el-form-item>
          <el-form-item label="站点链接">
            <el-input v-model="form.url" placeholder="https://example.com" />
          </el-form-item>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <el-form-item label="Logo 地址">
            <el-input v-model="form.logo" placeholder="https://example.com/logo.png" />
          </el-form-item>
          <el-form-item label="分组">
            <el-input v-model="form.group_name" placeholder="推荐站点 / 技术博客 / 工具站" />
          </el-form-item>
        </div>

        <el-form-item label="站点简介">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="255" show-word-limit />
        </el-form-item>

        <div class="grid gap-4 md:grid-cols-2">
          <el-form-item label="联系方式">
            <el-input v-model="form.contact" placeholder="邮箱 / QQ / 微信" />
          </el-form-item>
          <el-form-item label="互链地址">
            <el-input v-model="form.reciprocal_url" placeholder="对方已挂本站友链的页面地址" />
          </el-form-item>
        </div>

        <div class="grid gap-4 md:grid-cols-[1fr_180px_180px]">
          <el-form-item label="状态">
            <el-select v-model="form.status">
              <el-option v-for="option in statusOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="form.sort_order" :min="0" :max="9999" class="!w-full" />
          </el-form-item>
          <el-form-item label="主题色">
            <el-input v-model="form.site_color" placeholder="#38bdf8" />
          </el-form-item>
        </div>

        <div class="grid gap-4 md:grid-cols-[1fr_120px] md:items-start">
          <el-form-item label="审核备注">
            <el-input v-model="form.review_note" type="textarea" :rows="2" maxlength="255" show-word-limit placeholder="例如：已互链 / 待补 logo / 内容不匹配" />
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
  createFriendLink,
  deleteFriendLink,
  getAdminFriendLinks,
  updateFriendLink,
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
const links = ref<any[]>([])

const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已下线', value: 'offline' },
]

const statusMap: Record<string, { label: string; type: '' | 'success' | 'warning' | 'danger' | 'info' }> = {
  pending: { label: '待审核', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已拒绝', type: 'danger' },
  offline: { label: '已下线', type: 'info' },
}

const fallbackLogo = siteStore.siteConfig.siteAvatar

const form = reactive({
  name: '',
  url: '',
  logo: '',
  description: '',
  group_name: '推荐站点',
  contact: '',
  reciprocal_url: '',
  site_color: '',
  sort_order: 0,
  is_featured: false,
  status: 'approved',
  review_note: '',
})

const resetForm = () => {
  form.name = ''
  form.url = ''
  form.logo = ''
  form.description = ''
  form.group_name = '推荐站点'
  form.contact = ''
  form.reciprocal_url = ''
  form.site_color = ''
  form.sort_order = 0
  form.is_featured = false
  form.status = 'approved'
  form.review_note = ''
}

const fetchLinks = async () => {
  loading.value = true
  try {
    const res: any = await getAdminFriendLinks({
      status: statusFilter.value || undefined,
      keyword: keyword.value || undefined,
    })
    if (res.code === 200) {
      links.value = res.data || []
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
  form.group_name = row.group_name || '推荐站点'
  form.contact = row.contact || ''
  form.reciprocal_url = row.reciprocal_url || ''
  form.site_color = row.site_color || ''
  form.sort_order = row.sort_order || 0
  form.is_featured = !!row.is_featured
  form.status = row.status || 'pending'
  form.review_note = row.review_note || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name.trim() || !form.url.trim()) {
    ElMessage.warning('请填写站点名称和站点链接')
    return
  }

  submitting.value = true
  try {
    const payload = { ...form }
    const res: any = isEdit.value && currentId.value
      ? await updateFriendLink(currentId.value, payload)
      : await createFriendLink(payload)

    if (res.code !== 200) {
      ElMessage.warning(res.msg || '保存失败')
      return
    }

    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    fetchLinks()
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const quickChangeStatus = async (row: any, status: string) => {
  try {
    const res: any = await updateFriendLink(row.id, {
      ...row,
      status,
    })
    if (res.code !== 200) {
      ElMessage.warning(res.msg || '状态更新失败')
      return
    }
    ElMessage.success('状态已更新')
    fetchLinks()
  } catch (error) {
    console.error(error)
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除友链「${row.name}」吗？`, '提示', {
    type: 'warning',
  }).then(async () => {
    try {
      const res: any = await deleteFriendLink(row.id)
      if (res.code !== 200) {
        ElMessage.warning(res.msg || '删除失败')
        return
      }
      ElMessage.success('删除成功')
      fetchLinks()
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
  fetchLinks()
})
</script>
