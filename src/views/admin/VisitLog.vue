<template>
  <div class="space-y-6">
    <!-- Map Section -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <el-icon class="text-miyazaki-blue"><MapLocation /></el-icon> 访客分布
      </h3>
      <div ref="mapChart" class="w-full h-[500px]"></div>
    </div>

    <!-- Logs Table -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <el-icon class="text-miyazaki-blue"><List /></el-icon> 访问记录
        </h3>
        <el-button @click="fetchLogs" :loading="loading" circle>
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>

      <el-table :data="logs" v-loading="loading" style="width: 100%">
        <el-table-column prop="ip" label="IP 地址" width="140" />
        <el-table-column prop="location" label="地理位置" width="180">
          <template #default="{ row }">
            <span v-if="row.province || row.city">{{ row.province }} {{ row.city }}</span>
            <span v-else class="text-gray-400">未知</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="访问路径" min-width="200" show-overflow-tooltip />
        <el-table-column prop="method" label="方法" width="80">
          <template #default="{ row }">
            <el-tag :type="getMethodType(row.method)" size="small">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status_code" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status_code === 200 ? 'success' : 'danger'" size="small">{{ row.status_code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="process_time" label="耗时" width="100">
          <template #default="{ row }">
            {{ (row.process_time * 1000).toFixed(2) }} ms
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="访问时间" width="180" />
      </el-table>

      <div class="flex justify-center mt-6">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="fetchLogs"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { MapLocation, List, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import chinaMap from '../../assets/china.json' // Need to download this
import { getVisitLogs, getMapStats } from '../../api'

// Register map
echarts.registerMap('china', chinaMap as any)

const mapChart = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const loading = ref(false)
const logs = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const getMethodType = (method: string) => {
  const map: Record<string, string> = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger'
  }
  return map[method] || 'info'
}

const initMap = async () => {
  if (!mapChart.value) return
  
  chartInstance = echarts.init(mapChart.value)
  
  try {
    const res: any = await getMapStats()
    const data = res.code === 200 ? res.data : []
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const value = params.value
          return `${params.name}: ${Number.isNaN(value) || !value ? 0 : value} 次访问`
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.map((i: any) => i.value), 10),
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color: ['#e0f2f1', '#00695c']
        }
      },
      series: [
        {
          name: '访问量',
          type: 'map',
          map: 'china',
          roam: true,
          emphasis: {
            label: {
              show: true
            },
            itemStyle: {
              areaColor: '#b2dfdb'
            }
          },
          data: data
        }
      ]
    }
    
    chartInstance.setOption(option)
  } catch (error) {
    console.error('Failed to init map:', error)
  }
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const res: any = await getVisitLogs({
      current: currentPage.value,
      size: pageSize.value
    })
    if (res.code === 200) {
      logs.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch logs:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
  initMap()
  
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
})

onUnmounted(() => {
  chartInstance?.dispose()
})
</script>
