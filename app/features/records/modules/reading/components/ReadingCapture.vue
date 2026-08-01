<script setup lang="ts">
import type {
  ReadingCaptureInput,
  ReadingStatus,
  RecordVisibility,
} from '~/features/records/types'

const emit = defineEmits<{
  save: [input: ReadingCaptureInput]
}>()

const bookTitle = ref('创造的秩序')
const author = ref('')
const status = ref<ReadingStatus>('在读')
const progress = ref(42)
const durationMinutes = ref(30)
const note = ref('')
const visibility = ref<RecordVisibility>('private')

function save(): void {
  if (!bookTitle.value.trim()) return
  emit('save', {
    bookTitle: bookTitle.value,
    author: author.value,
    status: status.value,
    progress: progress.value,
    durationMinutes: durationMinutes.value,
    note: note.value,
    visibility: visibility.value,
  })
  note.value = ''
}
</script>

<template>
  <div class="capture-form reading-capture">
    <div class="field-grid">
      <label class="wide-field">
        <span>书名</span>
        <input
          v-model="bookTitle"
          type="text"
          placeholder="搜索书架或输入书名"
        >
      </label>
      <label>
        <span>状态</span>
        <select v-model="status">
          <option>想读</option>
          <option>在读</option>
          <option>读完</option>
        </select>
      </label>
      <label>
        <span>作者</span>
        <input
          v-model="author"
          type="text"
          placeholder="可选"
        >
      </label>
      <label>
        <span>本次阅读</span>
        <div class="number-field"><input
          v-model.number="durationMinutes"
          type="number"
          min="1"
        ><small>分钟</small></div>
      </label>
    </div>

    <label class="range-field">
      <span>阅读进度 <strong>{{ progress }}%</strong></span>
      <input
        v-model.number="progress"
        type="range"
        min="0"
        max="100"
      >
    </label>

    <label class="inline-field">
      <span>当下感受</span>
      <input
        v-model="note"
        type="text"
        placeholder="留下一句话……"
      >
    </label>

    <div class="capture-footer">
      <button
        class="visibility-button"
        type="button"
        @click="visibility = visibility === 'private' ? 'public' : 'private'"
      >
        <UIcon :name="visibility === 'private' ? 'i-lucide-lock' : 'i-lucide-eye'" />
        {{ visibility === 'private' ? '仅自己' : '公开只读' }}
      </button>
      <button
        class="primary-button"
        type="button"
        :disabled="!bookTitle.trim()"
        @click="save"
      >
        保存阅读记录
      </button>
    </div>
  </div>
</template>
