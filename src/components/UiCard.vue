<template>
  <section
    class="ui-card rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300"
    :class="[
      hoverable ? 'hover:-translate-y-1 hover:shadow-lg hover:border-slate-200' : '',
      paddingClass
    ]"
  >
    <div v-if="title || subtitle" class="mb-3">
      <h3 v-if="title" class="text-sm font-bold text-gray-700">{{ title }}</h3>
      <p v-if="subtitle" class="mt-1 text-xs text-gray-500">{{ subtitle }}</p>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  subtitle?: string
  hoverable?: boolean
  paddingClass?: string
}>(), {
  title: '',
  subtitle: '',
  hoverable: true,
  paddingClass: 'p-4'
})
</script>

<style scoped>
.ui-card {
  backdrop-filter: blur(2px);
}
</style>
