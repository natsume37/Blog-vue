<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <el-input
        v-model="keyword"
        placeholder="搜索操作人/描述/目标ID"
        clearable
        style="width: 280px"
        @keyup.enter="fetchLogs"
        @clear="fetchLogs"
      />
      <el-input
        v-model="action"
        placeholder="动作 (如 article.update)"
        clearable
        style="width: 220px"
        @keyup.enter="fetchLogs"
        @clear="fetchLogs"
      />
      <el-input
        v-model="targetType"
        placeholder="对象类型 (如 article)"
        clearable
        style="width: 220px"
        @keyup.enter="fetchLogs"
        @clear="fetchLogs"
      />
      <el-button type="primary" @click="fetchLogs">查询</el-button>
    </div>

    <el-table :data="logs" stripe v-loading="loading" style="width: 100%">
      <el-table-column prop="created_at" label="时间" width="180" />
      <el-table-column prop="username" label="操作人" width="130" />
      <el-table-column prop="action" label="动作" width="180" />
      <el-table-column prop="target_type" label="对象类型" width="130" />
      <el-table-column prop="target_id" label="对象ID" width="120" />
      <el-table-column prop="description" label="描述" min-width="280" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP" width="140" />
      <el-table-column prop="request_method" label="方法" width="100" />
      <el-table-column prop="request_path" label="路径" min-width="220" show-overflow-tooltip />
    </el-table>

    <div class="mt-4 flex justify-end">
      <el-pagination
        background
        layout="total, prev, pager, next, jumper"
        :total="total"
        :page-size="size"
        :current-page="current"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAuditLogs } from '../../api'

const loading = ref(false)
const logs = ref<any[]>([])
const total = ref(0)
const current = ref(1)
const size = ref(20)
const keyword = ref('')
const action = ref('')
const targetType = ref('')

const fetchLogs = async () => {
  loading.value = true
  try {
    const { data } = await getAuditLogs({
      current: current.value,
      size: size.value,
      keyword: keyword.value || undefined,
      action: action.value || undefined,
      target_type: targetType.value || undefined
    })
    logs.value = data.records || []
    total.value = data.total || 0
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '加载操作日志失败')
  } finally {
    loading.value = false
  }
}

const onPageChange = (page: number) => {
  current.value = page
  fetchLogs()
}

onMounted(fetchLogs)
</script>
