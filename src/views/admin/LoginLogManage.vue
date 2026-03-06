<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <el-input
        v-model="keyword"
        placeholder="搜索用户名/IP/失败原因"
        clearable
        style="width: 260px"
        @keyup.enter="fetchData"
        @clear="fetchData"
      />
      <el-select v-model="successFilter" placeholder="登录状态" clearable style="width: 140px" @change="fetchData">
        <el-option label="成功" :value="true" />
        <el-option label="失败" :value="false" />
      </el-select>
      <el-button type="primary" @click="fetchData">查询</el-button>
    </div>

    <el-table :data="rows" stripe v-loading="loading">
      <el-table-column prop="created_at" label="时间" width="180" />
      <el-table-column prop="username" label="用户名" width="140" />
      <el-table-column prop="ip" label="IP" width="150" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.success ? 'success' : 'danger'">{{ row.success ? '成功' : '失败' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="原因" min-width="220" />
      <el-table-column prop="user_agent" label="UA" min-width="260" show-overflow-tooltip />
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
import { getLoginLogs } from '../../api'

const loading = ref(false)
const rows = ref<any[]>([])
const total = ref(0)
const current = ref(1)
const size = ref(20)
const keyword = ref('')
const successFilter = ref<boolean | undefined>(undefined)

const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getLoginLogs({
      current: current.value,
      size: size.value,
      keyword: keyword.value || undefined,
      success: successFilter.value
    })
    rows.value = data.records || []
    total.value = data.total || 0
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '加载登录日志失败')
  } finally {
    loading.value = false
  }
}

const onPageChange = (page: number) => {
  current.value = page
  fetchData()
}

onMounted(fetchData)
</script>
