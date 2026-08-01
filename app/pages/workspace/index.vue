<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  middleware: 'owner',
})

useSeoMeta({
  title: '今天 · 私人工作台',
  description: '快速记录笔记、专注、阅读和电影的私人工作台。',
  robots: 'noindex, nofollow',
})

const workspace = useWorkspace()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 11) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const fullDate = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}).format(new Date())

function handleShortcut(event: KeyboardEvent): void {
  if (event.key.toLowerCase() !== 'n' || event.metaKey || event.ctrlKey || event.altKey) return
  const target = event.target
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return
  workspace.setActiveCapture('note')
  document.querySelector<HTMLTextAreaElement>('#quick-note')?.focus()
}

onMounted(() => window.addEventListener('keydown', handleShortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', handleShortcut))
</script>

<template>
  <div class="workspace-page">
    <header class="workspace-topbar">
      <div class="mobile-brand">
        <span>日</span><strong>日常</strong>
      </div>
      <button
        type="button"
        aria-label="搜索所有记录"
      >
        <UIcon name="i-lucide-search" />
      </button>
    </header>

    <section class="workspace-welcome">
      <div>
        <p>{{ fullDate }}</p>
        <h1>{{ greeting }}，今天想留下些什么？</h1>
      </div>
      <button type="button">
        <UIcon name="i-lucide-calendar-check" /> 今日回顾
      </button>
    </section>

    <WorkspaceQuickCapture />
    <WorkspaceTimelineStream />
  </div>
</template>
