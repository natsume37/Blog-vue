<template>
  <span ref="typewriterElement" class="font-serif text-xl md:text-2xl text-white drop-shadow-md"></span>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TypeIt from 'typeit'

const props = defineProps<{
  strings: string[]
}>()

const typewriterElement = ref<HTMLElement | null>(null)

onMounted(() => {
  if (typewriterElement.value) {
    new TypeIt(typewriterElement.value, {
      strings: props.strings,
      speed: 100,
      loop: true,
      breakLines: false,
      nextStringDelay: 3000,
      lifeLike: true
    }).go()
  }
})
</script>
