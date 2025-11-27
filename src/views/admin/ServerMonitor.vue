<template>
  <div class="server-monitor p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">服务器监控</h2>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-500">
          上次更新: {{ lastUpdate }}
        </span>
        <el-switch 
          v-model="autoRefresh" 
          active-text="自动刷新"
          @change="toggleAutoRefresh"
        />
        <el-button type="primary" :loading="loading" @click="fetchAllData">
          <el-icon class="mr-1"><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 系统信息卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- 操作系统 -->
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-3">
          <el-icon class="text-3xl opacity-80"><Monitor /></el-icon>
          <span class="text-xs bg-white/20 px-2 py-1 rounded">系统</span>
        </div>
        <h3 class="text-2xl font-bold mb-1">{{ systemInfo.os?.system || '-' }}</h3>
        <p class="text-sm opacity-80">{{ systemInfo.os?.hostname || '-' }}</p>
      </div>

      <!-- CPU -->
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-3">
          <el-icon class="text-3xl opacity-80"><Cpu /></el-icon>
          <span class="text-xs bg-white/20 px-2 py-1 rounded">CPU</span>
        </div>
        <h3 class="text-2xl font-bold mb-1">{{ realtimeData.cpu_percent || 0 }}%</h3>
        <p class="text-sm opacity-80">{{ systemInfo.cpu?.count_logical || 0 }} 核心</p>
      </div>

      <!-- 内存 -->
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-3">
          <el-icon class="text-3xl opacity-80"><Coin /></el-icon>
          <span class="text-xs bg-white/20 px-2 py-1 rounded">内存</span>
        </div>
        <h3 class="text-2xl font-bold mb-1">{{ realtimeData.memory_percent || 0 }}%</h3>
        <p class="text-sm opacity-80">{{ formatBytes(realtimeData.memory_used) }} / {{ formatBytes(systemInfo.memory?.total) }}</p>
      </div>

      <!-- 磁盘 -->
      <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-3">
          <el-icon class="text-3xl opacity-80"><FolderOpened /></el-icon>
          <span class="text-xs bg-white/20 px-2 py-1 rounded">磁盘</span>
        </div>
        <h3 class="text-2xl font-bold mb-1">{{ realtimeData.disk_percent || 0 }}%</h3>
        <p class="text-sm opacity-80">{{ formatBytes(systemInfo.disk?.used) }} / {{ formatBytes(systemInfo.disk?.total) }}</p>
      </div>
    </div>

    <!-- 运行时间 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <el-icon class="text-blue-500 text-xl"><Timer /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">系统运行时间</p>
            <p class="text-lg font-bold text-gray-800">{{ formatUptime(systemInfo.time?.uptime) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <el-icon class="text-green-500 text-xl"><Connection /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">服务运行时间</p>
            <p class="text-lg font-bold text-gray-800">{{ formatUptime(systemInfo.time?.server_uptime) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <el-icon class="text-purple-500 text-xl"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-sm text-gray-500">服务器时间</p>
            <p class="text-lg font-bold text-gray-800">{{ systemInfo.time?.current_time || '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细信息 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- CPU & 内存使用率 -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <el-icon class="text-blue-500"><TrendCharts /></el-icon>
          资源使用率
        </h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm text-gray-600">CPU 使用率</span>
              <span class="text-sm font-bold" :class="getStatusColor(realtimeData.cpu_percent)">{{ realtimeData.cpu_percent || 0 }}%</span>
            </div>
            <el-progress 
              :percentage="realtimeData.cpu_percent || 0" 
              :color="getProgressColor(realtimeData.cpu_percent)"
              :stroke-width="12"
              :show-text="false"
            />
          </div>
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm text-gray-600">内存使用率</span>
              <span class="text-sm font-bold" :class="getStatusColor(realtimeData.memory_percent)">{{ realtimeData.memory_percent || 0 }}%</span>
            </div>
            <el-progress 
              :percentage="realtimeData.memory_percent || 0" 
              :color="getProgressColor(realtimeData.memory_percent)"
              :stroke-width="12"
              :show-text="false"
            />
          </div>
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm text-gray-600">磁盘使用率</span>
              <span class="text-sm font-bold" :class="getStatusColor(realtimeData.disk_percent)">{{ realtimeData.disk_percent || 0 }}%</span>
            </div>
            <el-progress 
              :percentage="realtimeData.disk_percent || 0" 
              :color="getProgressColor(realtimeData.disk_percent)"
              :stroke-width="12"
              :show-text="false"
            />
          </div>
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-sm text-gray-600">Swap 使用率</span>
              <span class="text-sm font-bold" :class="getStatusColor(systemInfo.memory?.swap_percent)">{{ systemInfo.memory?.swap_percent || 0 }}%</span>
            </div>
            <el-progress 
              :percentage="systemInfo.memory?.swap_percent || 0" 
              :color="getProgressColor(systemInfo.memory?.swap_percent)"
              :stroke-width="12"
              :show-text="false"
            />
          </div>
        </div>
      </div>

      <!-- 网络流量 -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <el-icon class="text-green-500"><Connection /></el-icon>
          网络流量
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <el-icon class="text-blue-500"><Top /></el-icon>
              <span class="text-sm text-gray-600">发送流量</span>
            </div>
            <p class="text-2xl font-bold text-blue-600">{{ formatBytes(realtimeData.network_sent) }}</p>
          </div>
          <div class="bg-green-50 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <el-icon class="text-green-500"><Bottom /></el-icon>
              <span class="text-sm text-gray-600">接收流量</span>
            </div>
            <p class="text-2xl font-bold text-green-600">{{ formatBytes(realtimeData.network_recv) }}</p>
          </div>
          <div class="bg-purple-50 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <el-icon class="text-purple-500"><Promotion /></el-icon>
              <span class="text-sm text-gray-600">发送包数</span>
            </div>
            <p class="text-2xl font-bold text-purple-600">{{ formatNumber(systemInfo.network?.packets_sent) }}</p>
          </div>
          <div class="bg-orange-50 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <el-icon class="text-orange-500"><Download /></el-icon>
              <span class="text-sm text-gray-600">接收包数</span>
            </div>
            <p class="text-2xl font-bold text-orange-600">{{ formatNumber(systemInfo.network?.packets_recv) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统详情 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 系统信息表 -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <el-icon class="text-blue-500"><InfoFilled /></el-icon>
          系统详情
        </h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="操作系统">{{ systemInfo.os?.system }} {{ systemInfo.os?.release }}</el-descriptions-item>
          <el-descriptions-item label="主机名">{{ systemInfo.os?.hostname }}</el-descriptions-item>
          <el-descriptions-item label="处理器">{{ systemInfo.os?.processor || systemInfo.os?.machine }}</el-descriptions-item>
          <el-descriptions-item label="Python 版本">{{ systemInfo.os?.python_version }}</el-descriptions-item>
          <el-descriptions-item label="CPU 频率">{{ systemInfo.cpu?.freq_current }} MHz</el-descriptions-item>
          <el-descriptions-item label="启动时间">{{ systemInfo.time?.boot_time }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 进程列表 -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <el-icon class="text-purple-500"><List /></el-icon>
          Top 进程
          <el-radio-group v-model="processSortBy" size="small" class="ml-auto" @change="fetchProcesses">
            <el-radio-button value="memory">内存</el-radio-button>
            <el-radio-button value="cpu">CPU</el-radio-button>
          </el-radio-group>
        </h3>
        <el-table :data="processes" size="small" max-height="300">
          <el-table-column prop="name" label="进程名" min-width="120" show-overflow-tooltip />
          <el-table-column prop="pid" label="PID" width="70" />
          <el-table-column prop="cpu_percent" label="CPU %" width="80">
            <template #default="{ row }">
              <span :class="getStatusColor(row.cpu_percent)">{{ row.cpu_percent }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="memory_percent" label="内存 %" width="80">
            <template #default="{ row }">
              <span :class="getStatusColor(row.memory_percent)">{{ row.memory_percent }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'running' ? 'success' : 'info'" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  Refresh, Monitor, Cpu, Coin, FolderOpened, Timer, Connection, Clock,
  TrendCharts, Top, Bottom, Promotion, Download, InfoFilled, List
} from '@element-plus/icons-vue'
import { getSystemInfo, getRealtimeStats, getProcesses } from '../../api'

// 状态
const loading = ref(false)
const autoRefresh = ref(true)
const lastUpdate = ref('')
const systemInfo = ref<any>({})
const realtimeData = ref<any>({})
const processes = ref<any[]>([])
const processSortBy = ref('memory')

let refreshTimer: number | null = null

// 格式化字节
const formatBytes = (bytes?: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化数字
const formatNumber = (num?: number) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
  return num.toString()
}

// 格式化运行时间
const formatUptime = (seconds?: number) => {
  if (!seconds) return '-'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) return `${days}天 ${hours}小时 ${minutes}分钟`
  if (hours > 0) return `${hours}小时 ${minutes}分钟`
  return `${minutes}分钟`
}

// 获取状态颜色
const getStatusColor = (percent?: number) => {
  if (!percent) return 'text-gray-600'
  if (percent >= 90) return 'text-red-500'
  if (percent >= 70) return 'text-orange-500'
  if (percent >= 50) return 'text-yellow-500'
  return 'text-green-500'
}

// 获取进度条颜色
const getProgressColor = (percent?: number) => {
  if (!percent) return '#67c23a'
  if (percent >= 90) return '#f56c6c'
  if (percent >= 70) return '#e6a23c'
  if (percent >= 50) return '#f0a020'
  return '#67c23a'
}

// 获取系统信息
const fetchSystemInfo = async () => {
  try {
    const res: any = await getSystemInfo()
    if (res.code === 200 && res.data) {
      systemInfo.value = res.data
      // 同时用系统信息初始化实时数据
      if (!realtimeData.value.cpu_percent) {
        realtimeData.value = {
          cpu_percent: res.data.cpu?.percent || 0,
          memory_percent: res.data.memory?.percent || 0,
          memory_used: res.data.memory?.used || 0,
          memory_available: res.data.memory?.available || 0,
          disk_percent: res.data.disk?.percent || 0,
          network_sent: res.data.network?.bytes_sent || 0,
          network_recv: res.data.network?.bytes_recv || 0,
          timestamp: new Date().toLocaleTimeString()
        }
        lastUpdate.value = new Date().toLocaleTimeString()
      }
    }
  } catch (error) {
    console.error('Failed to fetch system info:', error)
  }
}

// 获取实时数据
const fetchRealtimeData = async () => {
  try {
    const res: any = await getRealtimeStats()
    if (res.code === 200 && res.data) {
      // 合并数据，保留之前的非零值
      const newData = res.data
      realtimeData.value = {
        cpu_percent: newData.cpu_percent ?? realtimeData.value.cpu_percent ?? 0,
        memory_percent: newData.memory_percent ?? realtimeData.value.memory_percent ?? 0,
        memory_used: newData.memory_used ?? realtimeData.value.memory_used ?? 0,
        memory_available: newData.memory_available ?? realtimeData.value.memory_available ?? 0,
        disk_percent: newData.disk_percent ?? realtimeData.value.disk_percent ?? 0,
        network_sent: newData.network_sent ?? realtimeData.value.network_sent ?? 0,
        network_recv: newData.network_recv ?? realtimeData.value.network_recv ?? 0,
        timestamp: newData.timestamp
      }
      lastUpdate.value = newData.timestamp || new Date().toLocaleTimeString()
    }
  } catch (error) {
    console.error('Failed to fetch realtime stats:', error)
  }
}

// 获取进程列表
const fetchProcesses = async () => {
  try {
    const res: any = await getProcesses({ limit: 10, sort_by: processSortBy.value })
    if (res.code === 200 && res.data) {
      processes.value = res.data.processes || []
    }
  } catch (error) {
    console.error('Failed to fetch processes:', error)
  }
}

// 获取所有数据
const fetchAllData = async () => {
  loading.value = true
  await Promise.all([
    fetchSystemInfo(),
    fetchRealtimeData(),
    fetchProcesses()
  ])
  loading.value = false
}

// 切换自动刷新
const toggleAutoRefresh = (enabled: boolean) => {
  if (enabled) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

// 开始自动刷新
const startAutoRefresh = () => {
  refreshTimer = window.setInterval(() => {
    fetchRealtimeData()
  }, 3000)
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 初始化
onMounted(() => {
  fetchAllData()
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

// 清理
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
</style>
