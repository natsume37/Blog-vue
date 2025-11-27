<template>
  <div class="min-h-screen bg-gray-50/50 pt-24 pb-12">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <div class="text-center mb-12">
          <div class="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img :src="siteStore.siteConfig.siteAvatar" alt="Avatar" class="w-full h-full object-cover" />
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2 font-serif">{{ siteStore.siteConfig.siteAuthor }}</h1>
          <p class="text-gray-500">{{ siteStore.siteConfig.siteDescription }}</p>
        </div>

        <div class="prose prose-lg max-w-none prose-headings:font-serif prose-a:text-miyazaki-blue prose-img:rounded-xl" v-html="renderedContent">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSiteStore } from '../stores/site'
import { marked } from 'marked'

const siteStore = useSiteStore()

const renderedContent = computed(() => {
  return marked(siteStore.siteConfig.aboutContent || '')
})
</script>

<style scoped>
:deep(.prose) {
  line-height: 1.8;
}
</style>
