<script setup lang="ts">
import type { FocusCaptureInput } from '~/features/records/types'

const emit = defineEmits<{
  start: [input: FocusCaptureInput]
}>()

const task = ref('')
const project = ref('个人数字空间')
const durationMinutes = ref(45)
const durations = [25, 45, 60, 90]

function start(): void {
  if (!task.value.trim()) return
  emit('start', {
    task: task.value,
    project: project.value,
    durationMinutes: durationMinutes.value,
  })
  task.value = ''
}
</script>

<template>
  <div class="capture-form focus-capture">
    <div class="field-grid field-grid-focus">
      <label class="wide-field">
        <span>这段时间只做什么？</span>
        <input
          v-model="task"
          type="text"
          placeholder="例如：完成工作台的时间流组件"
          @keydown.enter.prevent="start"
        >
      </label>
      <label>
        <span>归属项目</span>
        <input
          v-model="project"
          type="text"
          placeholder="可选"
        >
      </label>
    </div>

    <div
      class="duration-picker"
      aria-label="选择计划时长"
    >
      <span>计划时长</span>
      <button
        v-for="duration in durations"
        :key="duration"
        type="button"
        :class="{ 'is-selected': durationMinutes === duration }"
        @click="durationMinutes = duration"
      >
        {{ duration }} 分钟
      </button>
    </div>

    <div class="capture-footer capture-footer-end">
      <p><UIcon name="i-lucide-shield-check" /> 专注明细固定为私有</p>
      <button
        class="primary-button"
        type="button"
        :disabled="!task.trim()"
        @click="start"
      >
        <UIcon name="i-lucide-play" />
        开始专注
      </button>
    </div>
  </div>
</template>
