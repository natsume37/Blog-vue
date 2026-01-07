<template>
  <div class="h-[calc(100vh-100px)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- Top Bar -->
    <div class="flex justify-between items-center px-8 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm z-10">
      <input 
        v-model="form.title" 
        type="text" 
        placeholder="请输入文章标题..." 
        class="text-3xl font-bold text-gray-800 placeholder-gray-300 border-none outline-none flex-grow mr-8 bg-transparent transition-all duration-300 focus:placeholder-gray-400"
      />
      <div class="flex gap-4">
        <el-dropdown trigger="click" @command="handleExport">
          <el-button size="large" circle class="!border-gray-200 hover:!bg-gray-50 hover:!text-green-600 hover:!border-green-300 transition-all">
            <el-icon><Download /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="md">导出为 Markdown</el-dropdown-item>
              <el-dropdown-item command="md-permanent">导出为 Markdown（永久链接）</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button size="large" circle @click="showSettings = true" class="!border-gray-200 hover:!bg-gray-50 hover:!text-miyazaki-blue hover:!border-miyazaki-blue/30 transition-all">
          <el-icon><Setting /></el-icon>
        </el-button>
        <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit" class="!px-8 !rounded-full !bg-gradient-to-r from-miyazaki-blue to-blue-500 !border-none hover:shadow-lg hover:shadow-blue-200 transition-all transform hover:-translate-y-0.5">
          <el-icon class="mr-2"><Check /></el-icon> 发布
        </el-button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center px-6 py-3 border-b border-gray-100 bg-gray-50/80 backdrop-blur text-gray-600 gap-2 overflow-x-auto shadow-sm relative z-0">
      <el-tooltip content="加粗 (Bold)" placement="top" :show-after="500">
        <button class="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors" @click="insertMarkdown('**', '**')"><el-icon><check-bold /></el-icon></button>
      </el-tooltip>
      <el-tooltip content="斜体 (Italic)" placement="top" :show-after="500">
        <button class="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors" @click="insertMarkdown('*', '*')"><el-icon><edit /></el-icon></button>
      </el-tooltip>
      <div class="w-px h-5 bg-gray-200 mx-2"></div>
      
      <el-tooltip content="一级标题" placement="top" :show-after="500">
        <button class="px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 font-bold text-sm transition-colors" @click="insertMarkdown('# ', '')">H1</button>
      </el-tooltip>
      <el-tooltip content="二级标题" placement="top" :show-after="500">
        <button class="px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 font-bold text-sm transition-colors" @click="insertMarkdown('## ', '')">H2</button>
      </el-tooltip>
      <el-tooltip content="三级标题" placement="top" :show-after="500">
        <button class="px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 font-bold text-sm transition-colors" @click="insertMarkdown('### ', '')">H3</button>
      </el-tooltip>
      
      <div class="w-px h-5 bg-gray-200 mx-2"></div>
      
      <el-tooltip content="引用 (Quote)" placement="top" :show-after="500">
        <button class="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors" @click="insertMarkdown('> ', '')"><el-icon><chat-line-square /></el-icon></button>
      </el-tooltip>
      <el-tooltip content="代码块 (Code)" placement="top" :show-after="500">
        <button class="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors" @click="insertMarkdown('```\n', '\n```')"><el-icon><monitor /></el-icon></button>
      </el-tooltip>
      <el-tooltip content="链接 (Link)" placement="top" :show-after="500">
        <button class="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors" @click="insertMarkdown('[', '](url)')"><el-icon><link /></el-icon></button>
      </el-tooltip>
      
      <div class="w-px h-5 bg-gray-200 mx-2"></div>

      <el-tooltip content="插入图片" placement="top" :show-after="500">
        <button class="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors" @click="openMediaManager('image')"><el-icon><Picture /></el-icon></button>
      </el-tooltip>
      <el-tooltip content="插入视频" placement="top" :show-after="500">
        <button class="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors" @click="openMediaManager('video')">
          <el-icon><VideoCamera /></el-icon>
        </button>
      </el-tooltip>
      
      <div class="flex-grow"></div>
      
      <div class="bg-gray-100 p-1 rounded-lg flex">
        <button 
          v-for="mode in ['edit', 'split', 'preview']" 
          :key="mode"
          class="px-3 py-1 rounded-md text-xs font-medium transition-all duration-200"
          :class="viewMode === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          @click="viewMode = mode"
        >
          {{ mode === 'edit' ? '编辑' : mode === 'split' ? '分屏' : '预览' }}
        </button>
      </div>
    </div>

    <!-- Main Editor Area -->
    <div class="flex-grow flex overflow-hidden relative bg-white">
      <!-- Editor -->
      <div 
        v-show="viewMode !== 'preview'" 
        class="h-full overflow-y-auto px-8 py-6 custom-scrollbar"
        :class="viewMode === 'split' ? 'w-1/2 border-r border-gray-100' : 'w-full'"
      >
        <textarea
          ref="editorRef"
          v-model="form.content"
          class="w-full h-full resize-none outline-none border-none text-gray-700 font-mono text-lg leading-loose custom-input"
          placeholder="开始你的创作..."
          @scroll="handleScroll"
        ></textarea>
      </div>

      <!-- Preview -->
      <div 
        v-show="viewMode !== 'edit'" 
        class="h-full overflow-y-auto px-10 py-8 bg-gray-50/30 custom-scrollbar"
        :class="viewMode === 'split' ? 'w-1/2' : 'w-full'"
      >
        <div class="prose prose-slate prose-lg max-w-none" v-html="renderedContent"></div>
      </div>
    </div>

    <!-- Settings Drawer -->
    <el-drawer v-model="showSettings" title="文章设置" size="400px">
      <el-form label-position="top">
        <el-form-item label="文章摘要">
          <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="请输入文章摘要（可选）" />
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="form.category_id" placeholder="选择分类" class="w-full">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签">
          <el-select v-model="form.tag_ids" multiple placeholder="选择标签" class="w-full">
            <el-option v-for="item in tags" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="封面图">
          <div class="space-y-3 w-full">
            <el-input v-model="form.cover" placeholder="输入图片 URL" />
            
            <div class="flex gap-2">
              <el-button size="small" @click="extractImagesFromContent">从正文提取</el-button>
              <el-button size="small" type="primary" @click="openCropper">裁剪封面</el-button>
            </div>

            <div v-if="form.cover" class="relative group rounded-lg overflow-hidden h-40 border border-gray-200 bg-gray-50">
              <img :src="form.cover" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                <el-button type="danger" circle size="small" @click="form.cover = ''"><el-icon><Delete /></el-icon></el-button>
              </div>
            </div>
          </div>
        </el-form-item>
        
        <div class="pt-4 border-t border-gray-100 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-700">是否发布</span>
            <el-switch v-model="form.is_published" />
          </div>
          <div class="flex items-center justify-between">
             <div class="flex flex-col">
              <span class="text-gray-700">隐藏文章</span>
              <span class="text-xs text-gray-400">不显示在列表，但可通过链接访问</span>
            </div>
            <el-switch v-model="form.is_hidden" />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-700">置顶文章</span>
            <el-switch v-model="form.is_top" />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-700">推荐文章</span>
            <el-switch v-model="form.is_recommend" />
          </div>
          
          <el-divider border-style="dashed">权限设置</el-divider>
          <div class="flex items-center justify-between">
            <span class="text-gray-700">密码保护</span>
            <el-switch v-model="form.is_protected" />
          </div>
          <template v-if="form.is_protected">
            <el-form-item label="验证问题">
              <el-input v-model="form.protection_question" placeholder="例如：我的微信号是多少？" />
            </el-form-item>
            <el-form-item label="验证答案">
              <el-input v-model="form.protection_answer" placeholder="访问者需输入此答案" />
            </el-form-item>
          </template>
        </div>
      </el-form>
    </el-drawer>

    <!-- Image Selector Dialog -->
    <el-dialog v-model="showImageSelector" title="选择图片" width="500px">
      <div v-if="contentImages.length > 0" class="grid grid-cols-3 gap-4">
        <div 
          v-for="(img, idx) in contentImages" 
          :key="idx" 
          class="aspect-square rounded-lg overflow-hidden border-2 cursor-pointer hover:border-miyazaki-blue relative"
          :class="selectedImage === img ? 'border-miyazaki-blue' : 'border-transparent'"
          @click="selectedImage = img"
        >
          <img :src="img" class="w-full h-full object-cover" />
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-400">
        正文中没有找到图片
      </div>
      <template #footer>
        <el-button @click="showImageSelector = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedImage" @click="confirmImageSelection">确定</el-button>
      </template>
    </el-dialog>

    <!-- Cropper Dialog -->
    <el-dialog v-model="showCropper" title="裁剪封面" width="800px" :close-on-click-modal="false">
      <div class="h-[400px] w-full bg-gray-900">
        <vue-cropper
          ref="cropperRef"
          :img="cropperImg"
          :output-size="1"
          :output-type="'png'"
          :info="true"
          :full="true"
          :can-move="true"
          :can-move-box="true"
          :fixed="true"
          :fixed-number="[16, 9]"
          :center-box="true"
          :high="true"
          mode="contain"
        ></vue-cropper>
      </div>
      <div class="mt-4 flex gap-4 items-center">
         <el-input v-model="cropperImg" placeholder="输入图片 URL 进行裁剪" class="flex-grow" />
         <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept="image/*"
          >
            <el-button>上传本地图片</el-button>
          </el-upload>
      </div>
      <template #footer>
        <el-button @click="showCropper = false">取消</el-button>
        <el-button type="primary" :loading="cropping" @click="finishCrop">确认裁剪</el-button>
      </template>
    </el-dialog>

    <ResourceManager ref="resourceManagerRef" @select="handleResourceSelect" />
  </div>
</template>

<script setup lang="ts">
import ResourceManager from '../../components/ResourceManager.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, Check, Delete, Check as CheckBold, Edit, ChatLineSquare, Monitor, VideoCamera, Download } from '@element-plus/icons-vue'
import { marked } from 'marked'
// @ts-ignore
import { VueCropper } from 'vue-cropper'
import * as api from '../../api'

// 配置 marked 允许 HTML 标签（video, audio 等）
marked.setOptions({
  breaks: true,
  gfm: true
})

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => route.params.id !== 'new')
const submitting = ref(false)
const showSettings = ref(false)
const viewMode = ref('split') // edit, split, preview
const editorRef = ref<HTMLTextAreaElement | null>(null)

// Form Data
const form = ref<{
  title: string
  summary: string
  content: string
  cover: string
  category_id: number | null
  tag_ids: number[]
  is_published: boolean
  is_hidden: boolean
  is_top: boolean
  is_recommend: boolean
  is_protected: boolean
  protection_question: string
  protection_answer: string
}>({
  title: '',
  summary: '',
  content: '',
  cover: '',
  category_id: null,
  tag_ids: [],
  is_published: true,
  is_hidden: false,
  is_top: false,
  is_recommend: false,
  is_protected: false,
  protection_question: '',
  protection_answer: ''
})

const categories = ref<any[]>([])
const tags = ref<any[]>([])

// Markdown Rendering
const renderedContent = computed(() => {
  return marked(form.value.content || '')
})

// Image Extraction
const showImageSelector = ref(false)
const contentImages = ref<string[]>([])
const selectedImage = ref('')

const extractImagesFromContent = () => {
  const regex = /!\[.*?\]\((.*?)\)/g
  const matches = [...form.value.content.matchAll(regex)]
  contentImages.value = matches.map(m => m[1]).filter(Boolean) as string[]
  if (contentImages.value.length === 0) {
    ElMessage.info('正文中未找到图片')
    return
  }
  showImageSelector.value = true
}

const confirmImageSelection = () => {
  if (selectedImage.value) {
    form.value.cover = selectedImage.value
    showImageSelector.value = false
  }
}

// Cropper
const showCropper = ref(false)
const cropperRef = ref<any>(null)
const cropperImg = ref('')
const cropping = ref(false)

const openCropper = () => {
  if (form.value.cover) {
    cropperImg.value = form.value.cover
  }
  showCropper.value = true
}

const handleFileChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e: any) => {
    cropperImg.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const finishCrop = () => {
  cropping.value = true
  cropperRef.value.getCropData((data: string) => {
    form.value.cover = data
    showCropper.value = false
    cropping.value = false
    ElMessage.success('裁剪成功')
  })
}

// Editor Toolbar
const insertMarkdown = (prefix: string, suffix: string, type?: string) => {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = textarea.value
  const selection = text.substring(start, end)

  let replacement = prefix + selection + suffix
  
  // Special handling for image if no selection
  if (type === 'image' && !selection) {
    // replacement is already set correctly by default params
  }

  form.value.content = text.substring(0, start) + replacement + text.substring(end)
  
  // Restore cursor position
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + selection.length)
  }, 0)
}

const handleScroll = () => {
  // Sync scroll logic could be added here
}

// Resource Manager
const resourceManagerRef = ref<any>(null)
const currentMediaType = ref('')

const openMediaManager = (type: string) => {
  currentMediaType.value = type
  resourceManagerRef.value?.open(type)
}

const handleResourceSelect = (item: any) => {
  // 根据实际资源类型决定插入格式，而不是按钮类型
  const mediaType = item.media_type || currentMediaType.value
  
  if (mediaType === 'img' || mediaType === 'image') {
    insertMarkdown(`![${item.filename}](${item.url})`, '')
  } else if (mediaType === 'video') {
    insertMarkdown(`\n<video src="${item.url}" controls width="100%"></video>\n`, '')
  } else if (mediaType === 'audio') {
    insertMarkdown(`\n<audio src="${item.url}" controls></audio>\n`, '')
  } else {
    // 其他类型作为链接插入
    insertMarkdown(`[${item.filename}](${item.url})`, '')
  }
}

// 导出文章
const handleExport = (command: string) => {
  if (!form.value.title) {
    ElMessage.warning('请先输入文章标题')
    return
  }
  
  let content = form.value.content || ''
  const filename = `${form.value.title}.md`
  
  if (command === 'md-permanent') {
    // 转换为永久链接：移除URL中的token参数
    content = convertToPermanentLinks(content)
  }
  
  // 添加 YAML Front Matter
  const frontMatter = `---
title: ${form.value.title}
date: ${new Date().toISOString().split('T')[0]}
summary: ${form.value.summary || ''}
category: ${categories.value.find(c => c.id === form.value.category_id)?.name || ''}
tags: [${form.value.tag_ids.map(id => tags.value.find(t => t.id === id)?.name || '').filter(Boolean).join(', ')}]
---

`
  
  const fullContent = frontMatter + content
  
  // 创建下载
  const blob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success(`已导出: ${filename}`)
}

// 将临时链接转换为永久链接
const convertToPermanentLinks = (content: string): string => {
  // 匹配带有 token 参数的七牛云链接
  // 格式: http://domain/path?e=xxx&token=xxx
  const urlRegex = /(https?:\/\/[^\s\)\"\']+)\?[^\s\)\"\']*token=[^\s\)\"\']*/g
  
  return content.replace(urlRegex, (_, baseUrl) => {
    return baseUrl
  })
}

const handleSubmit = async () => {
  if (!form.value.title || !form.value.content) {
    ElMessage.warning('标题和内容不能为空')
    return
  }
  
  submitting.value = true
  try {
    let res: any
    if (isEdit.value) {
      res = await api.updateArticle(Number(route.params.id), form.value)
    } else {
      res = await api.createArticle(form.value)
    }
    
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '发布成功')
      router.push('/admin/articles')
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('操作异常')
  } finally {
    submitting.value = false
  }
}

// Initialization
onMounted(async () => {
  try {
    const [catsRes, tgsRes]: any = await Promise.all([api.getCategories(), api.getTags()])
    if (catsRes.code === 200) categories.value = catsRes.data || []
    if (tgsRes.code === 200) tags.value = tgsRes.data || []

    if (isEdit.value) {
      const articleRes: any = await api.getArticle(Number(route.params.id))
      if (articleRes.code === 200) {
        const article = articleRes.data
        form.value = {
          title: article.title,
          summary: article.summary || '',
          content: article.content,
          cover: article.cover || '',
          category_id: article.category_id,
          tag_ids: article.tags ? article.tags.map((t: any) => t.id) : [],
          is_published: article.is_published,
          is_hidden: article.is_hidden || false,
          is_top: article.is_top,
          is_recommend: article.is_recommend,
          is_protected: article.is_protected || false,
          protection_question: article.protection_question || '',
          protection_answer: article.protection_answer || ''
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
})
</script>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}

/* Custom Input Placeholder */
.custom-input::placeholder {
  color: #9ca3af;
  font-style: italic;
}

/* Add typography styles for markdown preview if not using Tailwind Typography plugin */
:deep(.prose) h1 { font-size: 2.25em; font-weight: 800; margin-bottom: 0.8em; color: #1e293b; letter-spacing: -0.025em; }
:deep(.prose) h2 { font-size: 1.5em; font-weight: 700; margin-bottom: 0.6em; margin-top: 1.5em; color: #334155; letter-spacing: -0.025em; }
:deep(.prose) h3 { font-size: 1.25em; font-weight: 600; margin-bottom: 0.5em; margin-top: 1.2em; color: #475569; }
:deep(.prose) p { margin-bottom: 1.5em; line-height: 1.8; color: #4b5563; }
:deep(.prose) ul { list-style-type: disc; padding-left: 1.6em; margin-bottom: 1.5em; color: #4b5563; }
:deep(.prose) ol { list-style-type: decimal; padding-left: 1.6em; margin-bottom: 1.5em; color: #4b5563; }
:deep(.prose) blockquote { border-left: 4px solid #dbeafe; padding-left: 1.2em; color: #64748b; font-style: italic; background: #f8fafc; padding-top: 0.5rem; padding-bottom: 0.5rem; border-radius: 0 0.5rem 0.5rem 0; }
:deep(.prose) pre { background-color: #1e293b; padding: 1.5em; border-radius: 0.75em; overflow-x: auto; margin-bottom: 1.5em; color: #e2e8f0; }
:deep(.prose) code { background-color: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 0.375rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; color: #ef4444; font-size: 0.9em; }
:deep(.prose) img { max-width: 100%; border-radius: 0.75em; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin: 1.5em 0; }
:deep(.prose) a { color: #3b82f6; text-decoration: none; border-bottom: 1px solid #93c5fd; transition: all 0.2s; }
:deep(.prose) a:hover { color: #2563eb; border-bottom-color: #2563eb; }
:deep(.prose) video { border-radius: 0.75em; margin: 1.5em 0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
</style>
