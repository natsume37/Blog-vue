<template>
  <div class="space-y-5">
    <section class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="stat-card">
        <div class="stat-label">当前页记录</div>
        <div class="stat-value">{{ logs.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">独立 IP（当前页）</div>
        <div class="stat-value">{{ uniqueIpCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">平均响应耗时</div>
        <div class="stat-value">{{ averageCostMs }} ms</div>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div class="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h3 class="flex items-center gap-2 text-base font-semibold text-slate-800 sm:text-lg">
          <el-icon class="text-slate-600"><MapLocation /></el-icon>
          访客分布
        </h3>
        <el-button @click="refreshMapStats" :loading="mapLoading" plain>
          <el-icon><Refresh /></el-icon>
          刷新地图
        </el-button>
      </div>
      <div ref="mapChart" class="h-[420px] w-full sm:h-[500px]"></div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div class="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <h3 class="flex items-center gap-2 text-base font-semibold text-slate-800 sm:text-lg">
          <el-icon class="text-slate-600"><List /></el-icon>
          访问记录
        </h3>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <el-input
            v-model="keyword"
            clearable
            placeholder="筛选 IP 或路径"
            class="w-full sm:w-[240px]"
          />
          <el-select v-model="methodFilter" class="w-full sm:w-[120px]">
            <el-option label="全部方法" value="ALL" />
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
          <el-button @click="fetchLogs" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <el-table :data="filteredLogs" v-loading="loading" row-key="id" style="width: 100%">
        <el-table-column prop="ip" label="IP 地址" min-width="150" />
        <el-table-column label="地理位置" min-width="160">
          <template #default="{ row }">
            <span v-if="row.province || row.city">{{ [row.province, row.city].filter(Boolean).join(' ') }}</span>
            <span v-else class="text-slate-400">未知</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="访问路径" min-width="240" show-overflow-tooltip />
        <el-table-column prop="method" label="方法" width="100">
          <template #default="{ row }">
            <el-tag :type="getMethodType(row.method)" size="small">{{ row.method || 'UNKNOWN' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status_code" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status_code)" size="small">{{ row.status_code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="120">
          <template #default="{ row }">{{ toMs(row.process_time) }} ms</template>
        </el-table-column>
        <el-table-column prop="created_at" label="访问时间" width="180" />
      </el-table>

      <div class="mt-5 flex justify-center">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          background
          @current-change="fetchLogs"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { MapLocation, List, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import chinaMap from '../../assets/china.json'
import { getVisitLogs, getMapStats } from '../../api'

echarts.registerMap('china', chinaMap as any)

type VisitLogRow = {
  id: number
  ip: string
  location?: string
  province?: string
  city?: string
  path?: string
  method?: string
  status_code?: number
  process_time?: number
  created_at?: string
}

const mapChart = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const loading = ref(false)
const mapLoading = ref(false)
const logs = ref<VisitLogRow[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const keyword = ref('')
const methodFilter = ref<'ALL' | 'GET' | 'POST' | 'PUT' | 'DELETE'>('ALL')

const filteredLogs = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return logs.value.filter((row) => {
    const methodMatched = methodFilter.value === 'ALL' || row.method === methodFilter.value
    if (!q) return methodMatched
    return (
      methodMatched &&
      ((row.ip || '').toLowerCase().includes(q) || (row.path || '').toLowerCase().includes(q))
    )
  })
})

const uniqueIpCount = computed(() => new Set(logs.value.map(i => i.ip).filter(Boolean)).size)

const averageCostMs = computed(() => {
  if (!logs.value.length) return '0.00'
  const totalCost = logs.value.reduce((sum, row) => sum + Number(row.process_time || 0), 0)
  return ((totalCost * 1000) / logs.value.length).toFixed(2)
})

const getMethodType = (method: string) => {
  const map: Record<string, string> = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger'
  }
  return map[method] || 'info'
}

const getStatusType = (statusCode?: number) => {
  if (!statusCode) return 'info'
  if (statusCode >= 200 && statusCode < 300) return 'success'
  if (statusCode >= 400 && statusCode < 500) return 'warning'
  return 'danger'
}

const toMs = (seconds?: number) => (Number(seconds || 0) * 1000).toFixed(2)

const normalizeMapName = (name: string) =>
  name
    .replace('省', '')
    .replace('市', '')
    .replace('自治区', '')
    .replace('维吾尔', '')
    .replace('回族', '')
    .replace('壮族', '')

const setMapOption = (data: Array<{ name: string; value: number }>) => {
  if (!chartInstance) return
  const maxValue = Math.max(10, ...data.map(item => Number(item.value || 0)))
  chartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}: ${Number(params.value || 0)} 次访问`
    },
    visualMap: {
      min: 0,
      max: maxValue,
      left: 'left',
      bottom: '4%',
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#e2e8f0', '#94a3b8', '#0f172a']
      }
    },
    series: [
      {
        name: '访问量',
        type: 'map',
        map: 'china',
        roam: true,
        emphasis: {
          label: { show: true },
          itemStyle: { areaColor: '#475569' }
        },
        data
      }
    ]
  })
}

const initMap = async () => {
  await nextTick()
  if (!mapChart.value) return
  chartInstance?.dispose()
  chartInstance = echarts.init(mapChart.value)
  await refreshMapStats()
}

const refreshMapStats = async () => {
  mapLoading.value = true
  try {
    const res: any = await getMapStats()
    const rawData = Array.isArray(res?.data) ? res.data : []
    const data = rawData
      .map((item: any) => ({
        name: normalizeMapName(String(item?.name || '')),
        value: Number(item?.value || 0)
      }))
      .filter((item: { name: string; value: number }) => item.name)
    setMapOption(data)
  } catch (error) {
    console.error('Failed to fetch map stats:', error)
    ElMessage.error('地图数据加载失败')
    setMapOption([])
  } finally {
    mapLoading.value = false
  }
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const res: any = await getVisitLogs({
      current: currentPage.value,
      size: pageSize.value
    })
    const pageData = res?.data || {}
    logs.value = Array.isArray(pageData.records)
      ? pageData.records
      : Array.isArray(pageData.items)
        ? pageData.items
        : []
    total.value = Number(pageData.total || logs.value.length || 0)
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    ElMessage.error('访问记录加载失败')
    logs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const onResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  fetchLogs()
  initMap()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
.stat-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 14px 16px;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 26px;
  line-height: 1;
  font-weight: 700;
  color: #0f172a;
}
</style>
