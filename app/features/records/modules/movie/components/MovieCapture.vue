<script setup lang="ts">
import type {
  MovieCaptureInput,
  MovieStatus,
  RecordVisibility,
} from '~/features/records/types'

const emit = defineEmits<{
  save: [input: MovieCaptureInput]
}>()

const movieTitle = ref('')
const director = ref('')
const status = ref<MovieStatus>('看过')
const rating = ref(0)
const note = ref('')
const visibility = ref<RecordVisibility>('private')

function save(): void {
  if (!movieTitle.value.trim()) return
  emit('save', {
    movieTitle: movieTitle.value,
    director: director.value,
    status: status.value,
    rating: rating.value,
    note: note.value,
    visibility: visibility.value,
  })
  movieTitle.value = ''
  director.value = ''
  rating.value = 0
  note.value = ''
}
</script>

<template>
  <div class="capture-form movie-capture">
    <div class="field-grid movie-fields">
      <label class="wide-field">
        <span>电影名称</span>
        <input
          v-model="movieTitle"
          type="text"
          placeholder="刚刚看了什么？"
        >
      </label>
      <label>
        <span>导演</span>
        <input
          v-model="director"
          type="text"
          placeholder="可选"
        >
      </label>
      <label>
        <span>状态</span>
        <select v-model="status">
          <option>想看</option>
          <option>在看</option>
          <option>看过</option>
        </select>
      </label>
    </div>

    <div class="rating-row">
      <span>我的评分</span>
      <div
        role="radiogroup"
        aria-label="电影评分"
      >
        <button
          v-for="value in 5"
          :key="value"
          type="button"
          :class="{ 'is-selected': value <= rating }"
          :aria-label="`${value} 星`"
          :aria-checked="rating === value"
          role="radio"
          @click="rating = value"
        >
          ★
        </button>
      </div>
      <small>{{ rating ? `${rating} 星` : '未评分' }}</small>
    </div>

    <label class="inline-field">
      <span>观后短记</span>
      <input
        v-model="note"
        type="text"
        placeholder="留下一个画面或感受……"
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
        :disabled="!movieTitle.trim()"
        @click="save"
      >
        保存电影记录
      </button>
    </div>
  </div>
</template>
