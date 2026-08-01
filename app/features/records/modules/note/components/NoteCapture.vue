<script setup lang="ts">
import type { NoteCaptureInput, RecordVisibility } from '~/features/records/types'

const emit = defineEmits<{
  save: [input: NoteCaptureInput]
}>()

const DRAFT_KEY = 'daily-workspace-note-draft-v1'
const content = ref('')
const visibility = ref<RecordVisibility>('private')

onMounted(() => {
  content.value = localStorage.getItem(DRAFT_KEY) || ''
})

watch(content, (value) => {
  try {
    localStorage.setItem(DRAFT_KEY, value)
  }
  catch {
    // 隐私模式下仍允许在当前会话继续编辑。
  }
})

function save(): void {
  if (!content.value.trim()) return
  emit('save', { content: content.value, visibility: visibility.value })
  content.value = ''
}
</script>

<template>
  <div class="capture-form note-capture">
    <label
      class="sr-only"
      for="quick-note"
    >笔记内容</label>
    <textarea
      id="quick-note"
      v-model="content"
      rows="5"
      placeholder="此刻在想什么？"
      @keydown.meta.enter.prevent="save"
      @keydown.ctrl.enter.prevent="save"
    />

    <div class="capture-footer">
      <div class="capture-tools">
        <button
          class="visibility-button"
          type="button"
          :aria-label="visibility === 'private' ? '当前仅自己可见，点击切换公开' : '当前公开可见，点击切换私有'"
          @click="visibility = visibility === 'private' ? 'public' : 'private'"
        >
          <UIcon :name="visibility === 'private' ? 'i-lucide-lock' : 'i-lucide-eye'" />
          {{ visibility === 'private' ? '仅自己' : '公开只读' }}
        </button>
        <span class="draft-state">{{ content.trim() ? '草稿已保留' : '支持 Markdown' }}</span>
      </div>
      <button
        class="primary-button"
        type="button"
        :disabled="!content.trim()"
        @click="save"
      >
        保存笔记
        <kbd>⌘ ↵</kbd>
      </button>
    </div>
  </div>
</template>
