<template>
  <div class="h-[calc(100vh-100px)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- Top Bar -->
    <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
      <input 
        v-model="form.title" 
        type="text" 
        placeholder="请输入文章标题..." 
        class="text-2xl font-bold text-gray-800 placeholder-gray-300 border-none outline-none flex-grow mr-4 bg-transparent"
      />
      <div class="flex gap-3">
        <el-button @click="showSettings = true">
          <el-icon class="mr-1"><Setting /></el-icon> 设置
        </el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          <el-icon class="mr-1"><Check /></el-icon> 发布
        </el-button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center px-4 py-2 border-b border-gray-100 bg-gray-50/50 gap-1 overflow-x-auto">
      <el-tooltip content="加粗" placement="top">
        <button class="p-1.5 rounded hover:bg-gray-200 text-gray-600" @click="insertMarkdown('**', '**')"><el-icon><check-bold /></el-icon></button>
      </el-tooltip>
      <el-tooltip content="斜体" placement="top">
        <button class="p-1.5 rounded hover:bg-gray-200 text-gray-600" @click="insertMarkdown('*', '*')"><el-icon><edit /></el-icon></button>
      </el-tooltip>
      <div class="w-px h-4 bg-gray-300 mx-1"></div>
      <el-tooltip content="一级标题" placement="top">
        <button class="p-1.5 rounded hover:bg-gray-200 text-gray-600 font-bold" @click="insertMarkdown('# ', '')">H1</button>
      </el-tooltip>
      <el-tooltip content="二级标题" placement="top">
        <button class="p-1.5 rounded hover:bg-gray-200 text-gray-600 font-bold" @click="insertMarkdown('## ', '')">H2</button>
      </el-tooltip>
      <el-tooltip content="三级标题" placement="top">
        <button class="p-1.5 rounded hover:bg-gray-200 text-gray-600 font-bold" @click="insertMarkdown('### ', '')">H3</button>
      </el-tooltip>
      <div class="w-px h-4 bg-gray-300 mx-1"></div>
      <el-tooltip content="引用" placement="top">
        <button class="p-1.5 rounded hover:bg-gray-200 text-gray-600" @click="insertMarkdown('> ', '')"><el-icon><chat-line-square /></el-icon></button>
      </el-tooltip>
      <el-tooltip content="代码块" placement="top">
        <button class="p-1.5 rounded hover:bg-gray-200 text-gray-600" @click="insertMarkdown('```\n', '\n```')"><el-icon><monitor /></el-icon></button>
      </el-tooltip>
      <el-tooltip content="链接" placement="top">
        <button class="p-1.5 rounded hover:bg-gray-200 text-gray-600" @click="insertMarkdown('[', '](url)')"><el-icon><link /></el-icon></button>
      </el-tooltip>
      <el-tooltip content="图片" placement="top">
        <button class="p-1.5 rounded hover:bg-gray-200 text-gray-600" @click="insertMarkdown('![alt](', ')', 'image')"><el-icon><picture /></el-icon></button>
      </el-tooltip>
      <div class="flex-grow"></div>
      <el-radio-group v-model="viewMode" size="small">
        <el-radio-button label="edit">编辑</el-radio-button>
        <el-radio-button label="split">分屏</el-radio-button>
        <el-radio-button label="preview">预览</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Main Editor Area -->
    <div class="flex-grow flex overflow-hidden relative">
      <!-- Editor -->
      <div 
        v-show="viewMode !== 'preview'" 
        class="h-full overflow-y-auto p-4"
        :class="viewMode === 'split' ? 'w-1/2 border-r border-gray-100' : 'w-full'"
      >
        <textarea
          ref="editorRef"
          v-model="form.content"
          class="w-full h-full resize-none outline-none border-none text-gray-700 font-mono leading-relaxed"
          placeholder="开始写作..."
          @scroll="handleScroll"
        ></textarea>
      </div>

      <!-- Preview -->
      <div 
        v-show="viewMode !== 'edit'" 
        class="h-full overflow-y-auto p-8 bg-gray-50"
        :class="viewMode === 'split' ? 'w-1/2' : 'w-full'"
      >
        <div class="prose prose-slate max-w-none" v-html="renderedContent"></div>
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
            <span class="text-gray-700">置顶文章</span>
            <el-switch v-model="form.is_top" />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-700">推荐文章</span>
            <el-switch v-model="form.is_recommend" />
          </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, Check, Delete, Check as CheckBold, Edit, ChatLineSquare, Monitor } from '@element-plus/icons-vue'
import { marked } from 'marked'
// @ts-ignore
import { VueCropper } from 'vue-cropper'
import * as api from '../../api'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => route.params.id !== 'new')
const submitting = ref(false)
const showSettings = ref(false)
const viewMode = ref('split') // edit, split, preview
const editorRef = ref<HTMLTextAreaElement | null>(null)

// Form Data
const form = ref({
  title: '',
  summary: '',
  content: '',
  cover: '',
  category_id: null,
  tag_ids: [],
  is_published: true,
  is_top: false,
  is_recommend: false
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
    // Here we get base64 data. 
    // In a real app, you might want to upload this to a server.
    // For now, we'll use the base64 string directly (might be large) or assume the user has an upload endpoint.
    // Since we don't have a dedicated upload endpoint in the provided context, we'll use base64.
    // WARNING: Base64 strings can be very long and might exceed DB limits if not handled.
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
          is_top: article.is_top,
          is_recommend: article.is_recommend
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
})

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
  } finally {
    submitting.value = false
  }
}

const handleScroll = () => {
  // Sync scroll logic could be added here
}
</script>

<style scoped>
/* Add typography styles for markdown preview if not using Tailwind Typography plugin */
:deep(.prose) h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; }
:deep(.prose) h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; margin-top: 1em; }
:deep(.prose) h3 { font-size: 1.25em; font-weight: bold; margin-bottom: 0.5em; margin-top: 1em; }
:deep(.prose) p { margin-bottom: 1em; line-height: 1.6; }
:deep(.prose) ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
:deep(.prose) ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
:deep(.prose) blockquote { border-left: 4px solid #e5e7eb; padding-left: 1em; color: #6b7280; font-style: italic; }
:deep(.prose) pre { background-color: #f3f4f6; padding: 1em; border-radius: 0.5em; overflow-x: auto; }
:deep(.prose) code { background-color: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25em; font-family: monospace; }
:deep(.prose) img { max-width: 100%; border-radius: 0.5em; }
:deep(.prose) a { color: #3b82f6; text-decoration: underline; }
</style>
