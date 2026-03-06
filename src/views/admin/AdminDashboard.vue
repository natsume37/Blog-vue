<template>
  <div class="space-y-5">
    <section class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="stat-card">
        <div class="stat-label">今日访问量</div>
        <div class="stat-value">{{ data.today_visits }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">待发布草稿</div>
        <div class="stat-value">{{ data.draft_count }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">待审核评论</div>
        <div class="stat-value">{{ data.pending_comments }}</div>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-base font-semibold text-slate-800 sm:text-lg">近 7 天访问趋势</h3>
        <el-button plain :loading="loading" @click="fetchData">刷新</el-button>
      </div>
      <div ref="chartEl" class="h-[320px] w-full"></div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 class="mb-3 text-base font-semibold text-slate-800 sm:text-lg">热门文章排行</h3>
      <el-table :data="data.hot_articles" v-loading="loading" row-key="id" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="260" show-overflow-tooltip />
        <el-table-column prop="view_count" label="阅读量" width="100" />
        <el-table-column prop="comment_count" label="评论数" width="100" />
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getDashboardStats } from '../../api'

type DashboardData = {
  today_visits: number
  draft_count: number
  pending_comments: number
  visit_trend_7d: Array<{ date: string; count: number }>
  hot_articles: Array<{ id: number; title: string; view_count: number; comment_count: number }>
}

const loading = ref(false)
const chartEl = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const data = ref<DashboardData>({
  today_visits: 0,
  draft_count: 0,
  pending_comments: 0,
  visit_trend_7d: [],
  hot_articles: []
})

const renderChart = () => {
  if (!chart) return
  const x = data.value.visit_trend_7d.map(i => i.date.slice(5))
  const y = data.value.visit_trend_7d.map(i => i.count)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 28, right: 18, top: 22, bottom: 26, containLabel: true },
    xAxis: { type: 'category', data: x, boundaryGap: false },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      name: '访问量',
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.12 },
      lineStyle: { width: 2 },
      data: y
    }]
  })
}

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await getDashboardStats()
    if (res.code === 200 && res.data) {
      data.value = res.data
      renderChart()
    } else {
      ElMessage.error(res.msg || '获取仪表盘数据失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

const onResize = () => chart?.resize()

onMounted(async () => {
  await nextTick()
  if (chartEl.value) chart = echarts.init(chartEl.value)
  await fetchData()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
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
  font-size: 28px;
  line-height: 1;
  font-weight: 700;
  color: #0f172a;
}
</style>
