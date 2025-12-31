<template>
  <footer class="relative mt-20 bg-white pt-20 pb-10 overflow-hidden border-t border-gray-100">
    <div class="max-w-7xl mx-auto px-4 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        <div class="text-center md:text-left">
          <h3 class="text-2xl font-bold text-gray-800 mb-4 font-serif">{{ siteStore.siteConfig.siteName }}</h3>
          <p class="text-gray-500 leading-relaxed">
            {{ siteStore.siteConfig.siteDescription }}
          </p>
        </div>
        <div class="text-center">
          <h4 class="font-bold text-gray-800 mb-6">快速链接</h4>
          <ul class="space-y-3 text-gray-500">
            <li><router-link to="/" class="hover:text-miyazaki-blue transition-colors">首页</router-link></li>
            <li><router-link to="/category" class="hover:text-miyazaki-blue transition-colors">文章分类</router-link></li>
            <li><router-link to="/message" class="hover:text-miyazaki-blue transition-colors">留言板</router-link></li>
            <li><router-link to="/changelog" class="hover:text-miyazaki-blue transition-colors">建站日志</router-link></li>
            <li><router-link to="/about" class="hover:text-miyazaki-blue transition-colors">关于我</router-link></li>
          </ul>
        </div>
        <div class="text-center md:text-right">
          <h4 class="font-bold text-gray-800 mb-6">联系方式</h4>
          <div class="flex justify-center md:justify-end space-x-4">
            <a :href="config.social.github" target="_blank" class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-miyazaki-blue hover:text-white transition-colors cursor-pointer">
              <el-icon><Platform /></el-icon>
            </a>
            <a :href="config.social.email" class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-miyazaki-blue hover:text-white transition-colors cursor-pointer">
              <el-icon><Message /></el-icon>
            </a>
          </div>
        </div>
      </div>
      
      <div class="border-t border-gray-100 pt-8 text-center">
        <p class="text-gray-400 text-sm">© 2025 {{ siteStore.siteConfig.siteName }}. All rights reserved. {{ config.site.footerText }}</p>
        <p class="text-gray-300 text-xs mt-2">
          <a href="https://beian.miit.gov.cn/" target="_blank" class="hover:text-miyazaki-blue transition-colors">
            {{ config.site.beian }}
          </a>
        </p>
      </div>
    </div>
    
    <!-- Decorative Background -->
    <div class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-miyazaki-blue/10 to-transparent pointer-events-none"></div>
  </footer>
</template>

<script setup lang="ts">
import { Platform, Message } from '@element-plus/icons-vue'
import config from '../config'
import { useSiteStore } from '../stores/site'

const siteStore = useSiteStore()
</script>
