<script setup lang="ts">
import FocusCapture from '~/features/records/modules/focus/components/FocusCapture.vue'
import MovieCapture from '~/features/records/modules/movie/components/MovieCapture.vue'
import NoteCapture from '~/features/records/modules/note/components/NoteCapture.vue'
import ReadingCapture from '~/features/records/modules/reading/components/ReadingCapture.vue'
import { recordModules } from '~/features/records/registry'
import type {
  FocusCaptureInput,
  MovieCaptureInput,
  NoteCaptureInput,
  ReadingCaptureInput,
} from '~/features/records/types'

const workspace = useWorkspace()
const recordsApi = useRecordsApi()
const toast = useToast()

function saved(label: string, synced: boolean): void {
  toast.add({
    title: synced ? `${label}已保存` : `${label}已保存到本机`,
    description: synced ? '已同步到私人时间流。' : '服务端暂时不可用，已保存在当前设备，稍后可重试同步。',
    icon: 'i-lucide-circle-check',
    color: synced ? 'success' : 'warning',
  })
}

async function addNote(input: NoteCaptureInput): Promise<void> {
  try {
    workspace.mergeRecords([await recordsApi.createNote(input)])
    saved('笔记', true)
  }
  catch {
    recordsApi.queueLocalRecord(workspace.addNote(input))
    saved('笔记', false)
  }
}

function startFocus(input: FocusCaptureInput): void {
  if (workspace.state.value.activeFocus) {
    toast.add({
      title: '已有专注正在进行',
      description: '请先结束右侧的当前专注。',
      icon: 'i-lucide-timer',
      color: 'warning',
    })
    return
  }
  workspace.startFocus(input)
  toast.add({ title: '专注已开始', icon: 'i-lucide-play', color: 'success' })
}

async function addReading(input: ReadingCaptureInput): Promise<void> {
  try {
    workspace.mergeRecords([await recordsApi.createReading(input)])
    saved('阅读记录', true)
  }
  catch {
    recordsApi.queueLocalRecord(workspace.addReading(input))
    saved('阅读记录', false)
  }
}

async function addMovie(input: MovieCaptureInput): Promise<void> {
  try {
    workspace.mergeRecords([await recordsApi.createMovie(input)])
    saved('电影记录', true)
  }
  catch {
    recordsApi.queueLocalRecord(workspace.addMovie(input))
    saved('电影记录', false)
  }
}
</script>

<template>
  <section
    class="quick-capture"
    aria-labelledby="quick-capture-title"
  >
    <header class="capture-heading">
      <div>
        <span class="heading-icon"><UIcon name="i-lucide-sparkles" /></span>
        <div>
          <h2 id="quick-capture-title">
            快速记录
          </h2>
          <p>把正在发生的事放进时间流</p>
        </div>
      </div>
      <span class="capture-shortcut">随时按 <kbd>N</kbd> 回到这里</span>
    </header>

    <div
      class="capture-tabs"
      role="tablist"
      aria-label="记录类型"
    >
      <button
        v-for="module in recordModules"
        :id="`capture-tab-${module.kind}`"
        :key="module.kind"
        type="button"
        role="tab"
        :aria-selected="workspace.state.value.activeCapture === module.kind"
        :aria-controls="`capture-panel-${module.kind}`"
        :class="{ 'is-active': workspace.state.value.activeCapture === module.kind }"
        @click="workspace.setActiveCapture(module.kind)"
      >
        <UIcon :name="module.icon" />
        {{ module.shortLabel }}
      </button>
    </div>

    <div class="capture-panel-wrap">
      <section
        v-show="workspace.state.value.activeCapture === 'note'"
        id="capture-panel-note"
        role="tabpanel"
        aria-labelledby="capture-tab-note"
      >
        <NoteCapture @save="addNote" />
      </section>
      <section
        v-show="workspace.state.value.activeCapture === 'focus'"
        id="capture-panel-focus"
        role="tabpanel"
        aria-labelledby="capture-tab-focus"
      >
        <FocusCapture @start="startFocus" />
      </section>
      <section
        v-show="workspace.state.value.activeCapture === 'reading'"
        id="capture-panel-reading"
        role="tabpanel"
        aria-labelledby="capture-tab-reading"
      >
        <ReadingCapture @save="addReading" />
      </section>
      <section
        v-show="workspace.state.value.activeCapture === 'movie'"
        id="capture-panel-movie"
        role="tabpanel"
        aria-labelledby="capture-tab-movie"
      >
        <MovieCapture @save="addMovie" />
      </section>
    </div>
  </section>
</template>
