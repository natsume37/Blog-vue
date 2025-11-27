<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">建站日志管理</h2>
      <el-button type="primary" @click="handleCreate">新增日志</el-button>
    </div>

    <el-card>
      <el-table :data="logs" v-loading="loading">
        <el-table-column prop="created_at" label="日期" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="120" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑日志' : '新增日志'"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="版本号">
          <el-input v-model="form.version" placeholder="例如: v1.0.0" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input 
            v-model="form.content" 
            type="textarea" 
            :rows="5" 
            placeholder="支持 Markdown"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getChangelogs, createChangelog, updateChangelog, deleteChangelog } from '../../api'

const loading = ref(false)
const logs = ref<any[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

const form = reactive({
  version: '',
  content: ''
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const res: any = await getChangelogs()
    if (res.code === 200) {
      logs.value = res.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  isEdit.value = false
  form.version = ''
  form.content = ''
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  currentId.value = row.id
  form.version = row.version
  form.content = row.content
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除这条日志吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await deleteChangelog(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchLogs()
      }
    } catch (error) {
      console.error(error)
    }
  })
}

const handleSubmit = async () => {
  if (!form.content) {
    ElMessage.warning('请输入内容')
    return
  }
  
  submitting.value = true
  try {
    if (isEdit.value && currentId.value) {
      const res: any = await updateChangelog(currentId.value, form)
      if (res.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchLogs()
      }
    } else {
      const res: any = await createChangelog(form)
      if (res.code === 200) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        fetchLogs()
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchLogs()
})
</script>
