<script setup lang="ts">
import { formatClock } from '~/features/records/domain'

const workspace = useWorkspace()
const recordsApi = useRecordsApi()
const toast = useToast()
let timer: ReturnType<typeof setInterval> | undefined

const targetLabel = computed(() => {
  const focus = workspace.state.value.activeFocus
  if (!focus) return ''
  if (!focus.targetSeconds) return '正向计时'
  const remaining = Math.max(0, focus.targetSeconds - focus.elapsedSeconds)
  return remaining ? `还剩 ${Math.ceil(remaining / 60)} 分钟` : '已达到计划时长'
})

const focusPercent = computed(() => {
  const focus = workspace.state.value.activeFocus
  if (!focus?.targetSeconds) return 0
  return Math.min(100, (focus.elapsedSeconds / focus.targetSeconds) * 100)
})

const todayFocusLabel = computed(() => {
  const minutes = Math.round(workspace.todayFocusSeconds.value / 60)
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`
})

onMounted(() => {
  timer = setInterval(workspace.tickFocus, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

async function stopFocus(): Promise<void> {
  const record = workspace.stopFocus()
  if (!record) return
  try {
    const syncedRecord = await recordsApi.createFocus(record)
    workspace.replaceRecord(record.id, syncedRecord)
    toast.add({
      title: '专注已完成并同步',
      description: record.summary,
      icon: 'i-lucide-circle-check',
      color: 'success',
    })
  }
  catch {
    recordsApi.queueLocalRecord(record)
    toast.add({
      title: '专注已完成，暂存本机',
      description: '服务端暂时不可用，稍后可从时间流重试同步。',
      icon: 'i-lucide-circle-check',
      color: 'warning',
    })
  }
}
</script>

<template>
  <aside
    class="context-rail"
    aria-label="今日上下文"
  >
    <section
      v-if="workspace.state.value.activeFocus"
      class="context-card active-focus-card"
    >
      <header>
        <span><UIcon name="i-lucide-timer" /> 当前专注</span>
        <i
          class="live-dot"
          aria-label="计时进行中"
        />
      </header>
      <h3>{{ workspace.state.value.activeFocus.task }}</h3>
      <p>{{ workspace.state.value.activeFocus.project || '未归类项目' }}</p>
      <strong class="focus-clock">{{ formatClock(workspace.state.value.activeFocus.elapsedSeconds) }}</strong>
      <div
        class="focus-progress"
        aria-hidden="true"
      >
        <i :style="{ width: `${focusPercent}%` }" />
      </div>
      <small>{{ targetLabel }}</small>
      <div class="focus-actions">
        <button
          type="button"
          @click="workspace.toggleFocus"
        >
          <UIcon :name="workspace.state.value.activeFocus.isRunning ? 'i-lucide-pause' : 'i-lucide-play'" />
          {{ workspace.state.value.activeFocus.isRunning ? '暂停' : '继续' }}
        </button>
        <button
          type="button"
          @click="stopFocus"
        >
          <UIcon name="i-lucide-square" /> 完成
        </button>
      </div>
    </section>

    <section
      v-else
      class="context-card quiet-focus-card"
    >
      <span class="quiet-icon"><UIcon name="i-lucide-timer-reset" /></span>
      <h3>留一段完整时间</h3>
      <p>从快速记录里写下唯一任务，然后开始计时。</p>
      <button
        type="button"
        @click="workspace.setActiveCapture('focus')"
      >
        开始一次专注
      </button>
    </section>

    <section class="context-card reading-card">
      <header>
        <span><UIcon name="i-lucide-book-open" /> 正在阅读</span><button
          type="button"
          aria-label="查看书架"
        >
          <UIcon name="i-lucide-arrow-up-right" />
        </button>
      </header>
      <template v-if="workspace.currentReading.value">
        <span class="book-mark">{{ workspace.currentReading.value.detail.progress }}%</span>
        <div>
          <h3>{{ workspace.currentReading.value.detail.bookTitle }}</h3>
          <p>{{ workspace.currentReading.value.detail.author || '作者未填写' }}</p>
        </div>
        <div class="reading-progress">
          <i :style="{ width: `${workspace.currentReading.value.detail.progress}%` }" />
        </div>
      </template>
      <p
        v-else
        class="empty-context"
      >
        还没有正在阅读的书。
      </p>
    </section>

    <section class="context-card daily-stats-card">
      <header><span><UIcon name="i-lucide-chart-no-axes-column-increasing" /> 今日概览</span></header>
      <div class="stat-grid">
        <div><strong>{{ workspace.todayCount.value }}</strong><small>条记录</small></div>
        <div><strong>{{ todayFocusLabel }}</strong><small>专注</small></div>
        <div><strong>{{ workspace.state.value.records.filter(record => record.kind === 'reading').length }}</strong><small>阅读</small></div>
      </div>
      <button type="button">
        <UIcon name="i-lucide-moon-star" /> 晚些时候生成今日回顾
      </button>
    </section>

    <p class="context-privacy">
      <UIcon name="i-lucide-shield-check" /> 私人记录默认只有你可以读取
    </p>
  </aside>
</template>
