<template>
  <transition name="fade">
    <div v-show="visible" @click="scrollToTop" class="fixed bottom-8 right-8 cursor-pointer z-50 group">
      <div class="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 text-gray-800 border border-white/50 flex items-center justify-center">
        <el-icon :size="20" class="group-hover:-translate-y-0.5 transition-transform duration-300"><CaretTop /></el-icon>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { CaretTop } from '@element-plus/icons-vue'

const visible = ref(false)

const checkScroll = () => {
  visible.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
