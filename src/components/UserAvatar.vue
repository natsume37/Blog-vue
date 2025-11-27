<template>
  <div 
    class="relative inline-block rounded-full overflow-hidden bg-gray-200 flex-shrink-0"
    :class="$attrs.class"
  >
    <img 
      v-if="shouldShowImage"
      :src="src" 
      :alt="alt" 
      class="w-full h-full object-cover"
      @error="handleImageError"
    />
    <div 
      v-else 
      class="w-full h-full flex items-center justify-center text-white font-bold select-none"
      :class="bgClass"
    >
      {{ firstChar }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: 'avatar'
  },
  name: {
    type: String,
    default: '?'
  }
})

const imageLoadError = ref(false)

const shouldShowImage = computed(() => {
  return props.src && !imageLoadError.value && props.src !== 'undefined' && props.src !== 'null'
})

const firstChar = computed(() => {
  // 如果没有名字或名字为空，显示 N（表示未登录/匿名）
  if (!props.name || props.name.trim() === '') {
    return 'N'
  }
  return props.name.charAt(0).toUpperCase()
})

// Generate a consistent color based on the name
const bgClass = computed(() => {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
    'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 
    'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 
    'bg-pink-500', 'bg-rose-500'
  ]
  let hash = 0
  const str = props.name || '?'
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
})

const handleImageError = () => {
  imageLoadError.value = true
}

watch(() => props.src, () => {
  imageLoadError.value = false
})
</script>
