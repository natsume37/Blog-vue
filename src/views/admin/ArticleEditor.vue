<template>
  <div class="article-editor-page space-y-6">
    <section class="editor-hero overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div class="editor-hero__glow editor-hero__glow-a"></div>
      <div class="editor-hero__glow editor-hero__glow-b"></div>
      <div class="relative z-10 space-y-6 p-6 md:p-8">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div class="max-w-3xl">
            <div class="editor-kicker">Article Studio</div>
            <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {{ isEdit ? '重构这篇文章的表达方式。' : '从一个干净的工作台开始写作。' }}
            </h2>
            <p class="mt-3 text-sm leading-7 text-slate-500 md:text-base">
              保持结构清晰、内容克制。标题、正文、SEO 与发布状态都集中在同一套工作流里。
            </p>
          </div>

          <div class="flex flex-wrap gap-3 xl:justify-end">
            <el-button class="!rounded-full !border-slate-200 !px-5 !py-2.5 !text-slate-600 hover:!border-slate-300 hover:!bg-slate-50" @click="router.push('/admin/articles')">
              返回列表
            </el-button>
            <el-button
              v-if="aiPluginEnabled"
              class="!rounded-full !border-sky-200 !bg-sky-50 !px-5 !py-2.5 !text-sky-700 hover:!border-sky-300 hover:!bg-sky-100"
              @click="showAIDrawer = true"
            >
              <el-icon class="mr-2"><MagicStick /></el-icon>
              AI 草稿
            </el-button>
            <el-button
              v-if="isEdit && wechatPluginInstalled"
              class="!rounded-full !border-emerald-200 !bg-emerald-50 !px-5 !py-2.5 !text-emerald-700 hover:!border-emerald-300 hover:!bg-emerald-100"
              @click="openWeChatPublisher"
            >
              <el-icon class="mr-2"><Link /></el-icon>
              发公众号
            </el-button>
            <el-button
              v-if="isEdit"
              class="!rounded-full !border-amber-200 !bg-amber-50 !px-5 !py-2.5 !text-amber-700 hover:!border-amber-300 hover:!bg-amber-100"
              @click="openVersionDrawer"
            >
              <el-icon class="mr-2"><Files /></el-icon>
              历史版本
            </el-button>
            <el-dropdown trigger="click" @command="handleExport">
              <el-button class="!rounded-full !border-emerald-200 !bg-emerald-50 !px-4 !py-2.5 !text-emerald-700 hover:!border-emerald-300 hover:!bg-emerald-100">
                <el-icon><Download /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="md">导出为 Markdown</el-dropdown-item>
                  <el-dropdown-item command="md-permanent">导出为 Markdown（永久链接）</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button class="!rounded-full !border-slate-200 !bg-white !px-4 !py-2.5 !text-slate-700 hover:!border-sky-200 hover:!text-sky-700" @click="showSettings = true">
              <el-icon><Setting /></el-icon>
            </el-button>
            <el-button
              type="primary"
              :loading="submitting"
              class="!rounded-full !border-none !bg-slate-900 !px-7 !py-2.5 hover:!bg-slate-800 hover:shadow-[0_14px_30px_rgba(15,23,42,0.18)]"
              @click="handleSubmit"
            >
              <el-icon class="mr-2"><Check /></el-icon>
              {{ submitButtonLabel }}
            </el-button>
          </div>
        </div>

        <div class="editor-title-panel">
          <input
            v-model="form.title"
            type="text"
            placeholder="请输入文章标题..."
            class="editor-title-input"
          />
          <div class="flex flex-wrap gap-2">
            <span class="editor-chip editor-chip-dark">{{ isEdit ? '编辑模式' : '新建草稿' }}</span>
            <span class="editor-chip">{{ selectedCategoryName }}</span>
            <span class="editor-chip">{{ visibilityStateLabel }}</span>
            <span class="editor-chip">{{ form.is_published ? '已发布' : '草稿' }}</span>
            <span class="editor-chip" :class="form.is_recommend ? 'editor-chip-accent' : ''">{{ form.is_recommend ? '推荐文章' : '常规文章' }}</span>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div class="metric-card">
            <div class="metric-card__label">正文长度</div>
            <div class="metric-card__value">{{ wordCount }}</div>
            <div class="metric-card__hint">按当前内容实时统计</div>
          </div>
          <div class="metric-card">
            <div class="metric-card__label">预计阅读</div>
            <div class="metric-card__value">{{ estimatedReadMinutes }} 分钟</div>
            <div class="metric-card__hint">按 450 字/分钟估算</div>
          </div>
          <div class="metric-card">
            <div class="metric-card__label">标签数量</div>
            <div class="metric-card__value">{{ form.tag_ids.length }}</div>
            <div class="metric-card__hint">{{ form.tag_ids.length ? '已完成内容归类' : '建议至少添加一个标签' }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-card__label">封面状态</div>
            <div class="metric-card__value">{{ form.cover ? '已配置' : '待补充' }}</div>
            <div class="metric-card__hint">{{ form.cover ? '封面可直接用于列表展示' : '可从正文提取或裁剪生成' }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="editor-toolbar-shell rounded-[26px] border border-slate-200/70 bg-white/94 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <div class="toolbar-group">
            <el-tooltip content="加粗 (Bold)" placement="top" :show-after="400">
              <button class="toolbar-btn" @click="insertMarkdown('**', '**')"><el-icon><CheckBold /></el-icon></button>
            </el-tooltip>
            <el-tooltip content="斜体 (Italic)" placement="top" :show-after="400">
              <button class="toolbar-btn" @click="insertMarkdown('*', '*')"><el-icon><Edit /></el-icon></button>
            </el-tooltip>
          </div>

          <div class="toolbar-group">
            <button class="toolbar-btn toolbar-btn-text" @click="insertMarkdown('# ', '')">H1</button>
            <button class="toolbar-btn toolbar-btn-text" @click="insertMarkdown('## ', '')">H2</button>
            <button class="toolbar-btn toolbar-btn-text" @click="insertMarkdown('### ', '')">H3</button>
          </div>

          <div class="toolbar-group">
            <el-tooltip content="引用 (Quote)" placement="top" :show-after="400">
              <button class="toolbar-btn" @click="insertMarkdown('> ', '')"><el-icon><ChatLineSquare /></el-icon></button>
            </el-tooltip>
            <el-tooltip content="代码块 (Code)" placement="top" :show-after="400">
              <button class="toolbar-btn" @click="insertMarkdown('```\n', '\n```')"><el-icon><Monitor /></el-icon></button>
            </el-tooltip>
            <el-tooltip content="链接 (Link)" placement="top" :show-after="400">
              <button class="toolbar-btn" @click="insertMarkdown('[', '](url)')"><el-icon><Link /></el-icon></button>
            </el-tooltip>
          </div>

          <div class="toolbar-group">
            <el-tooltip content="插入图片" placement="top" :show-after="400">
              <button class="toolbar-btn" @click="openMediaManager('image')"><el-icon><Picture /></el-icon></button>
            </el-tooltip>
            <el-tooltip content="插入视频" placement="top" :show-after="400">
              <button class="toolbar-btn" @click="openMediaManager('video')"><el-icon><VideoCamera /></el-icon></button>
            </el-tooltip>
          </div>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="text-xs leading-6 text-slate-400">
            当前支持 Markdown、HTML 媒体标签和站内资源选择。
          </div>
          <div class="mode-switch">
            <button
              v-for="mode in viewModes"
              :key="mode.value"
              class="mode-switch__item"
              :class="viewMode === mode.value ? 'mode-switch__item-active' : ''"
              @click="viewMode = mode.value"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="workspace-shell rounded-[30px] border border-slate-200/70 bg-white/92 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
      <div class="workspace-shell__frame" :class="{ 'workspace-shell__frame-split': viewMode === 'split' }">
        <div
          v-show="viewMode !== 'preview'"
          class="workspace-panel"
          :class="viewMode === 'split' ? 'workspace-panel-split workspace-panel-divider' : 'workspace-panel-full'"
        >
          <div class="workspace-panel__header">
            <div>
              <div class="workspace-panel__eyebrow">Editor</div>
              <div class="workspace-panel__title">Markdown 正文</div>
            </div>
            <div class="workspace-panel__badge">{{ wordCount }} 字</div>
          </div>
          <div class="workspace-panel__body workspace-panel__body-editor custom-scrollbar">
            <textarea
              ref="editorRef"
              v-model="form.content"
              class="workspace-textarea custom-input"
              placeholder="开始你的创作..."
              @scroll="handleScroll"
            ></textarea>
          </div>
        </div>

        <div
          v-show="viewMode !== 'edit'"
          class="workspace-panel"
          :class="viewMode === 'split' ? 'workspace-panel-split' : 'workspace-panel-full'"
        >
          <div class="workspace-panel__header">
            <div>
              <div class="workspace-panel__eyebrow">Preview</div>
              <div class="workspace-panel__title">实时预览</div>
            </div>
            <div class="workspace-panel__badge">{{ form.summary ? '含摘要' : '无摘要' }}</div>
          </div>
          <div class="workspace-panel__body workspace-panel__body-preview custom-scrollbar">
            <div class="preview-shell">
              <div v-if="form.summary" class="preview-summary">
                {{ form.summary }}
              </div>
              <div class="prose prose-slate prose-lg max-w-none" v-html="renderedContent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="editor-footnote rounded-[22px] border border-slate-200/70 bg-slate-50/80 px-5 py-4 text-sm text-slate-500">
      发布前建议检查摘要、封面、分类和 SEO 字段。若要快速调整文章状态或权限，请打开右上角“设置”面板。
    </section>

    <el-drawer v-model="showSettings" title="文章设置" size="420px" class="editor-drawer">
      <div class="drawer-stack">
        <section class="drawer-section">
          <div class="drawer-section__head">
            <div class="drawer-section__eyebrow">Meta</div>
            <h3 class="drawer-section__title">摘要与 SEO</h3>
          </div>
          <el-form label-position="top">
            <el-form-item label="文章摘要">
              <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="请输入文章摘要（可选）" />
              <div class="mt-2">
                <el-button v-if="aiPluginEnabled" size="small" :loading="aiSummaryLoading" @click="handleGenerateSummary">
                  AI 一键摘要
                </el-button>
              </div>
            </el-form-item>

            <el-form-item label="URL Slug">
              <el-input v-model="form.slug" placeholder="例如: vue3-component-architecture" />
            </el-form-item>
            <el-form-item label="SEO 标题">
              <el-input v-model="form.seo_title" placeholder="可选，默认使用文章标题" />
            </el-form-item>
            <el-form-item label="SEO 描述">
              <el-input v-model="form.seo_description" type="textarea" :rows="2" placeholder="可选，默认使用文章摘要" />
            </el-form-item>
            <el-form-item label="SEO 关键词">
              <el-input v-model="form.seo_keywords" placeholder="多个关键词用英文逗号分隔" />
            </el-form-item>
          </el-form>
        </section>

        <section class="drawer-section">
          <div class="drawer-section__head">
            <div class="drawer-section__eyebrow">Presentation</div>
            <h3 class="drawer-section__title">分类、标签与封面</h3>
          </div>
          <el-form label-position="top">
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

                <div v-if="form.cover" class="cover-preview group">
                  <img :src="form.cover" class="h-full w-full object-cover" />
                  <div class="cover-preview__mask">
                    <el-button type="danger" circle size="small" @click="form.cover = ''"><el-icon><Delete /></el-icon></el-button>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </section>

        <section class="drawer-section">
          <div class="drawer-section__head">
            <div class="drawer-section__eyebrow">Publish</div>
            <h3 class="drawer-section__title">发布与权限</h3>
          </div>
          <div class="drawer-switch-list">
            <div class="drawer-switch-item">
              <div>
                <div class="drawer-switch-item__title">是否发布</div>
                <div class="drawer-switch-item__desc">切换文章的前台展示状态</div>
              </div>
              <el-switch v-model="form.is_published" />
            </div>
            <div class="drawer-switch-item">
              <div>
                <div class="drawer-switch-item__title">隐藏文章</div>
                <div class="drawer-switch-item__desc">不显示在列表，但保留访问链接</div>
              </div>
              <el-switch v-model="form.is_hidden" />
            </div>
            <div class="drawer-switch-item">
              <div>
                <div class="drawer-switch-item__title">置顶文章</div>
                <div class="drawer-switch-item__desc">在列表中优先显示</div>
              </div>
              <el-switch v-model="form.is_top" />
            </div>
            <div class="drawer-switch-item">
              <div>
                <div class="drawer-switch-item__title">推荐文章</div>
                <div class="drawer-switch-item__desc">可在首页推荐位展示</div>
              </div>
              <el-switch v-model="form.is_recommend" />
            </div>
            <div class="drawer-switch-item">
              <div>
                <div class="drawer-switch-item__title">密码保护</div>
                <div class="drawer-switch-item__desc">访问前需要回答验证问题</div>
              </div>
              <el-switch v-model="form.is_protected" />
            </div>
          </div>

          <el-form label-position="top" class="mt-4">
            <el-form-item label="可见性">
              <el-select v-model="form.visibility" class="w-full">
                <el-option label="公开可见" value="public" />
                <el-option label="登录后可见" value="login" />
                <el-option label="仅管理员可见" value="private" />
              </el-select>
            </el-form-item>
            <template v-if="form.is_protected">
              <el-form-item label="验证问题">
                <el-input v-model="form.protection_question" placeholder="例如：我的微信号是多少？" />
              </el-form-item>
              <el-form-item label="验证答案">
                <el-input v-model="form.protection_answer" placeholder="访问者需输入此答案" />
              </el-form-item>
            </template>
          </el-form>
        </section>
      </div>
    </el-drawer>

    <el-drawer v-if="aiPluginEnabled" v-model="showAIDrawer" title="AI 草稿生成" size="460px" class="editor-drawer">
      <div class="drawer-stack">
        <section class="drawer-section">
          <div class="drawer-section__head">
            <div class="drawer-section__eyebrow">AI Draft</div>
            <h3 class="drawer-section__title">生成初稿并填充编辑器</h3>
          </div>
          <el-form label-position="top">
            <el-form-item label="主题">
              <el-input v-model="aiForm.topic" placeholder="例如：Vue3 项目组件化重构实践" />
            </el-form-item>
            <el-form-item label="关键词">
              <el-input v-model="aiKeywordsInput" placeholder="用逗号分隔，例如：Vue3, 组件化, 可拓展性" />
            </el-form-item>
            <el-form-item label="大纲（每行一条）">
              <el-input v-model="aiOutlineInput" type="textarea" :rows="5" placeholder="背景&#10;设计目标&#10;实现路径&#10;总结" />
            </el-form-item>
            <div class="grid grid-cols-2 gap-3">
              <el-form-item label="风格">
                <el-input v-model="aiForm.style" />
              </el-form-item>
              <el-form-item label="语气">
                <el-input v-model="aiForm.tone" />
              </el-form-item>
            </div>
            <el-form-item label="目标字数">
              <el-input-number v-model="aiForm.target_words" :min="200" :max="5000" :step="100" class="w-full" />
            </el-form-item>
            <el-form-item label="已有上下文（可选）">
              <el-input v-model="aiForm.existing_context" type="textarea" :rows="4" />
            </el-form-item>
            <div class="mt-4">
              <el-button type="primary" :loading="aiGenerating" @click="handleGenerateDraft">生成草稿并填充编辑器</el-button>
            </div>
          </el-form>
        </section>
      </div>
    </el-drawer>

    <el-dialog v-model="showImageSelector" title="选择图片" width="520px">
      <div v-if="contentImages.length > 0" class="grid grid-cols-3 gap-4">
        <div
          v-for="(img, idx) in contentImages"
          :key="idx"
          class="image-pick-card"
          :class="selectedImage === img ? 'image-pick-card-active' : ''"
          @click="selectedImage = img"
        >
          <img :src="img" class="h-full w-full object-cover" />
        </div>
      </div>
      <div v-else class="py-10 text-center text-gray-400">
        正文中没有找到图片
      </div>
      <template #footer>
        <el-button @click="showImageSelector = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedImage" @click="confirmImageSelection">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCropper" title="裁剪封面" width="820px" :close-on-click-modal="false">
      <div class="cropper-shell">
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
      <div class="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
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

    <el-drawer v-model="showVersionDrawer" title="历史版本" size="420px" class="editor-drawer">
      <div class="drawer-stack">
        <section class="drawer-section">
          <div class="drawer-section__head">
            <div class="drawer-section__eyebrow">Version History</div>
            <h3 class="drawer-section__title">历史版本列表</h3>
          </div>
          <div v-loading="versionLoading">
            <el-empty v-if="!versionLoading && versions.length === 0" description="暂无历史版本" />
            <div v-else class="space-y-3">
              <div
                v-for="item in versions"
                :key="item.id"
                class="version-card"
              >
                <div class="text-sm font-medium text-slate-800 line-clamp-1">{{ item.title }}</div>
                <div class="mt-1 text-xs text-slate-400">版本 ID: {{ item.id }}</div>
                <div class="mt-1 text-xs text-slate-400">保存时间: {{ formatVersionTime(item.created_at) }}</div>
                <div class="mt-3">
                  <el-button size="small" type="warning" :loading="versionRestoringId === item.id" @click="handleRestoreVersion(item.id)">
                    回滚到此版本
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import ResourceManager from '../../components/ResourceManager.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, Check, Delete, Check as CheckBold, Edit, ChatLineSquare, Monitor, VideoCamera, Download, MagicStick, Files, Link, Picture } from '@element-plus/icons-vue'
import { marked } from 'marked'
// @ts-ignore
import { VueCropper } from 'vue-cropper'
import * as api from '../../api'
import { usePluginStore } from '../../stores/plugins'

// 配置 marked 允许 HTML 标签（video, audio 等）
marked.setOptions({
  breaks: true,
  gfm: true
})

const route = useRoute()
const router = useRouter()
const pluginStore = usePluginStore()
const isEdit = computed(() => route.params.id !== 'new')
const submitting = ref(false)
const showSettings = ref(false)
const viewMode = ref<'edit' | 'split' | 'preview'>('split')
const editorRef = ref<HTMLTextAreaElement | null>(null)
const showAIDrawer = ref(false)
const aiGenerating = ref(false)
const aiSummaryLoading = ref(false)
const showVersionDrawer = ref(false)
const versionLoading = ref(false)
const versionRestoringId = ref<number | null>(null)
const versions = ref<any[]>([])
const aiKeywordsInput = ref('')
const aiOutlineInput = ref('')
const aiForm = ref({
  topic: '',
  style: '技术博客',
  tone: '专业且易懂',
  language: 'zh-CN',
  target_words: 1200,
  include_summary: true,
  existing_context: ''
})

// Form Data
const form = ref<{
  title: string
  slug: string
  summary: string
  content: string
  cover: string
  seo_title: string
  seo_description: string
  seo_keywords: string
  category_id: number | null
  tag_ids: number[]
  is_published: boolean
  is_hidden: boolean
  visibility: 'public' | 'login' | 'private'
  is_top: boolean
  is_recommend: boolean
  is_protected: boolean
  protection_question: string
  protection_answer: string
}>({
  title: '',
  slug: '',
  summary: '',
  content: '',
  cover: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  category_id: null,
  tag_ids: [],
  is_published: true,
  is_hidden: false,
  visibility: 'public',
  is_top: false,
  is_recommend: false,
  is_protected: false,
  protection_question: '',
  protection_answer: ''
})

const categories = ref<any[]>([])
const tags = ref<any[]>([])
const viewModes = [
  { value: 'edit' as const, label: '编辑' },
  { value: 'split' as const, label: '分屏' },
  { value: 'preview' as const, label: '预览' }
]

const wordCount = computed(() => (form.value.content || '').replace(/\s+/g, '').length)
const estimatedReadMinutes = computed(() => Math.max(1, Math.ceil(wordCount.value / 450)))
const selectedCategoryName = computed(() => {
  const target = categories.value.find((item: any) => item.id === form.value.category_id)
  return target?.name || '未分类'
})
const visibilityStateLabel = computed(() => {
  if (form.value.visibility === 'login') return '登录后可见'
  if (form.value.visibility === 'private') return '仅管理员可见'
  return '公开访问'
})
const aiPluginEnabled = computed(() => pluginStore.isPluginEnabled('ai-assistant'))
const wechatPluginInstalled = computed(() => pluginStore.isPluginInstalled('wechat-official-account'))
const submitButtonLabel = computed(() => {
  if (form.value.is_published) {
    return isEdit.value ? '更新并发布' : '发布文章'
  }
  return isEdit.value ? '保存草稿' : '创建草稿'
})

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

const openWeChatPublisher = () => {
  if (!isEdit.value) return
  router.push({
    path: '/admin/plugins/wechat-official-account/publisher',
    query: { articleId: String(route.params.id) }
  })
}

const normalizeListInput = (value: string) =>
  value
    .split(/[\n,，]/g)
    .map(item => item.trim())
    .filter(Boolean)

const getApiErrorMessage = (error: any, fallback: string) => {
  const msg = error?.response?.data?.msg || error?.response?.data?.detail || error?.message
  return msg || fallback
}

const applySuggestedTags = (tagNames: string[]) => {
  if (!Array.isArray(tagNames) || tagNames.length === 0) return
  const map = new Map(tags.value.map((t: any) => [String(t.name).toLowerCase(), t.id]))
  const next = new Set<number>(form.value.tag_ids)
  tagNames.forEach(name => {
    const id = map.get(String(name).toLowerCase())
    if (id) next.add(id)
  })
  form.value.tag_ids = Array.from(next)
}

const handleGenerateDraft = async () => {
  if (!aiPluginEnabled.value) {
    ElMessage.warning('AI 插件未启用')
    return
  }
  if (!aiForm.value.topic.trim()) {
    ElMessage.warning('请先输入主题')
    return
  }

  aiGenerating.value = true
  try {
    const payload = {
      ...aiForm.value,
      keywords: normalizeListInput(aiKeywordsInput.value),
      outline: normalizeListInput(aiOutlineInput.value)
    }
    const res: any = await api.generateArticleDraft(payload)
    if (res.code !== 200 || !res.data) {
      ElMessage.error(res.msg || '生成失败')
      return
    }
    form.value.title = res.data.title || form.value.title
    form.value.summary = res.data.summary || form.value.summary
    form.value.content = res.data.content_markdown || form.value.content
    applySuggestedTags(res.data.tags_suggestion || [])
    showAIDrawer.value = false
    ElMessage.success(`草稿已生成（${res.data.provider}/${res.data.model}）`)
  } catch (error) {
    console.error(error)
    ElMessage.error(getApiErrorMessage(error, 'AI 生成异常'))
  } finally {
    aiGenerating.value = false
  }
}

const handleGenerateSummary = async () => {
  if (!aiPluginEnabled.value) {
    ElMessage.warning('AI 插件未启用')
    return
  }
  const content = (form.value.content || '').trim()
  if (!content) {
    ElMessage.warning('请先填写正文内容')
    return
  }

  aiSummaryLoading.value = true
  try {
    const res: any = await api.generateArticleSummary({
      title: form.value.title,
      content_markdown: content,
      max_length: 140,
      style: '简洁专业'
    })
    if (res.code !== 200 || !res.data?.summary) {
      ElMessage.error(res.msg || '摘要生成失败')
      return
    }
    form.value.summary = res.data.summary
    ElMessage.success(`摘要已生成（${res.data.provider}/${res.data.model}）`)
  } catch (error) {
    console.error(error)
    ElMessage.error(getApiErrorMessage(error, 'AI 摘要生成异常'))
  } finally {
    aiSummaryLoading.value = false
  }
}

const formatVersionTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const openVersionDrawer = async () => {
  if (!isEdit.value) return
  showVersionDrawer.value = true
  versionLoading.value = true
  try {
    const res: any = await api.getArticleVersions(Number(route.params.id))
    versions.value = res.code === 200 ? (res.data || []) : []
  } catch (error) {
    console.error(error)
    ElMessage.error('获取历史版本失败')
  } finally {
    versionLoading.value = false
  }
}

const handleRestoreVersion = async (versionId: number) => {
  if (!isEdit.value) return
  versionRestoringId.value = versionId
  try {
    const res: any = await api.restoreArticleVersion(Number(route.params.id), versionId)
    if (res.code === 200) {
      ElMessage.success('版本回滚成功，已刷新编辑器内容')
      const articleRes: any = await api.getArticle(Number(route.params.id))
      if (articleRes.code === 200) {
        const article = articleRes.data
        form.value = {
          title: article.title,
          slug: article.slug || '',
          summary: article.summary || '',
          content: article.content,
          cover: article.cover || '',
          seo_title: article.seo_title || '',
          seo_description: article.seo_description || '',
          seo_keywords: article.seo_keywords || '',
          category_id: article.category_id,
          tag_ids: article.tags ? article.tags.map((t: any) => t.id) : [],
          is_published: article.is_published,
          is_hidden: article.is_hidden || false,
          visibility: article.visibility || 'public',
          is_top: article.is_top,
          is_recommend: article.is_recommend,
          is_protected: article.is_protected || false,
          protection_question: article.protection_question || '',
          protection_answer: article.protection_answer || ''
        }
      }
      await openVersionDrawer()
    } else {
      ElMessage.error(res.msg || '版本回滚失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('版本回滚失败')
  } finally {
    versionRestoringId.value = null
  }
}

// Initialization
onMounted(async () => {
  try {
    await pluginStore.ensureCatalog()
    const [catsRes, tgsRes]: any = await Promise.all([api.getCategories(), api.getTags()])
    if (catsRes.code === 200) categories.value = catsRes.data || []
    if (tgsRes.code === 200) tags.value = tgsRes.data || []

    if (isEdit.value) {
      const articleRes: any = await api.getArticle(Number(route.params.id))
      if (articleRes.code === 200) {
        const article = articleRes.data
        form.value = {
          title: article.title,
          slug: article.slug || '',
          summary: article.summary || '',
          content: article.content,
          cover: article.cover || '',
          seo_title: article.seo_title || '',
          seo_description: article.seo_description || '',
          seo_keywords: article.seo_keywords || '',
          category_id: article.category_id,
          tag_ids: article.tags ? article.tags.map((t: any) => t.id) : [],
          is_published: article.is_published,
          is_hidden: article.is_hidden || false,
          visibility: article.visibility || 'public',
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
.article-editor-page {
  --editor-surface: rgba(255, 255, 255, 0.96);
  --editor-soft: #f8fafc;
  --editor-border: rgba(226, 232, 240, 0.85);
  --editor-text: #0f172a;
  --editor-muted: #64748b;
}

.editor-hero {
  position: relative;
}

.editor-hero__glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(34px);
  opacity: 0.55;
  pointer-events: none;
}

.editor-hero__glow-a {
  top: -36px;
  right: -24px;
  width: 220px;
  height: 220px;
  background: rgba(56, 189, 248, 0.16);
}

.editor-hero__glow-b {
  bottom: -96px;
  left: 12%;
  width: 260px;
  height: 220px;
  background: rgba(251, 191, 36, 0.12);
}

.editor-kicker,
.workspace-panel__eyebrow,
.drawer-section__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.editor-kicker {
  color: #0ea5e9;
}

.editor-title-panel {
  display: grid;
  gap: 1rem;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.75);
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.82));
  padding: 1.4rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.editor-title-input {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--editor-text);
  font-size: clamp(2rem, 3vw, 3.4rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.04em;
  outline: none;
}

.editor-title-input::placeholder {
  color: #cbd5e1;
}

.editor-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.86);
  padding: 0.45rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
}

.editor-chip-dark {
  background: #0f172a;
  border-color: #0f172a;
  color: white;
}

.editor-chip-accent {
  border-color: rgba(14, 165, 233, 0.28);
  background: rgba(240, 249, 255, 0.92);
  color: #0369a1;
}

.metric-card {
  border-radius: 24px;
  border: 1px solid var(--editor-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.9));
  padding: 1.2rem 1.25rem;
}

.metric-card__label {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #94a3b8;
}

.metric-card__value {
  margin-top: 0.8rem;
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--editor-text);
  line-height: 1.05;
}

.metric-card__hint {
  margin-top: 0.55rem;
  font-size: 0.86rem;
  color: var(--editor-muted);
  line-height: 1.6;
}

.toolbar-group,
.mode-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 16px;
  border: 1px solid var(--editor-border);
  background: #f8fafc;
  padding: 0.3rem;
}

.toolbar-btn {
  display: inline-flex;
  height: 38px;
  min-width: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #475569;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.toolbar-btn:hover {
  background: white;
  color: #0f172a;
  transform: translateY(-1px);
}

.toolbar-btn-text {
  min-width: 48px;
  padding: 0 0.65rem;
  font-size: 0.84rem;
  font-weight: 700;
}

.mode-switch__item {
  border-radius: 12px;
  padding: 0.55rem 0.95rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s ease;
}

.mode-switch__item-active {
  background: white;
  color: #0f172a;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
}

.workspace-shell {
  overflow: hidden;
}

.workspace-shell__frame {
  display: flex;
  min-height: 68vh;
  flex-direction: column;
}

.workspace-panel {
  display: flex;
  min-height: 0;
  flex: 1 1 0;
  flex-direction: column;
}

.workspace-panel-full {
  width: 100%;
}

.workspace-panel-split {
  width: 100%;
}

.workspace-panel-divider {
  border-bottom: 1px solid var(--editor-border);
}

.workspace-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--editor-border);
  padding: 1rem 1.25rem;
}

.workspace-panel__eyebrow {
  color: #94a3b8;
}

.workspace-panel__title {
  margin-top: 0.35rem;
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--editor-text);
}

.workspace-panel__badge {
  border-radius: 9999px;
  background: #f1f5f9;
  padding: 0.45rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
}

.workspace-panel__body {
  min-height: 0;
  flex: 1 1 0;
}

.workspace-panel__body-editor {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.88));
}

.workspace-panel__body-preview {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.88), rgba(255, 255, 255, 0.98));
}

.workspace-textarea {
  min-height: 100%;
  width: 100%;
  resize: none;
  border: none;
  background: transparent;
  padding: 1.5rem;
  color: #334155;
  font-family: var(--font-mono);
  font-size: 1rem;
  line-height: 1.95;
  outline: none;
}

.preview-shell {
  padding: 1.5rem 1.75rem;
}

.preview-summary {
  margin-bottom: 1.25rem;
  border-left: 4px solid #38bdf8;
  border-radius: 0 16px 16px 0;
  background: linear-gradient(90deg, rgba(240, 249, 255, 0.95), rgba(248, 250, 252, 0.9));
  padding: 1rem 1.15rem;
  color: #475569;
  line-height: 1.8;
}

.editor-footnote {
  line-height: 1.8;
}

.drawer-stack {
  display: grid;
  gap: 1rem;
  padding-bottom: 1.5rem;
}

.drawer-section {
  border-radius: 24px;
  border: 1px solid var(--editor-border);
  background: white;
  padding: 1rem;
}

.drawer-section__head {
  margin-bottom: 1rem;
}

.drawer-section__title {
  margin-top: 0.45rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--editor-text);
}

.drawer-switch-list {
  display: grid;
  gap: 0.75rem;
}

.drawer-switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 18px;
  background: #f8fafc;
  padding: 0.9rem 1rem;
}

.drawer-switch-item__title {
  font-size: 0.94rem;
  font-weight: 600;
  color: var(--editor-text);
}

.drawer-switch-item__desc {
  margin-top: 0.25rem;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--editor-muted);
}

.cover-preview {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid var(--editor-border);
  background: #f8fafc;
  height: 11rem;
}

.cover-preview__mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.45);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.cover-preview:hover .cover-preview__mask {
  opacity: 1;
}

.image-pick-card {
  aspect-ratio: 1 / 1;
  cursor: pointer;
  overflow: hidden;
  border-radius: 16px;
  border: 2px solid transparent;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.image-pick-card:hover {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.45);
}

.image-pick-card-active {
  border-color: #38bdf8;
}

.cropper-shell {
  height: 400px;
  width: 100%;
  overflow: hidden;
  border-radius: 20px;
  background: #0f172a;
}

.version-card {
  border-radius: 18px;
  border: 1px solid var(--editor-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.92));
  padding: 0.95rem 1rem;
}

:deep(.editor-drawer .el-drawer__header) {
  margin-bottom: 0;
  border-bottom: 1px solid var(--editor-border);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 1.1rem 1.25rem;
}

:deep(.editor-drawer .el-drawer__body) {
  background: #f8fafc;
  padding: 1rem 1rem 0;
}

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

/* Markdown preview typography */
:deep(.prose) {
  color: #334155;
  font-size: 1.01rem;
  line-height: 1.88;
}

:deep(.prose) h1,
:deep(.prose) h2,
:deep(.prose) h3 {
  color: #0f172a;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

:deep(.prose) h1 {
  font-size: 2.05rem;
  font-weight: 800;
  margin: 0.2em 0 0.8em;
}

:deep(.prose) h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1.5em 0 0.65em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.prose) h3 {
  font-size: 1.22rem;
  font-weight: 650;
  margin: 1.2em 0 0.55em;
}

:deep(.prose) p,
:deep(.prose) ul,
:deep(.prose) ol {
  margin-bottom: 1.05em;
}

:deep(.prose) ul,
:deep(.prose) ol {
  padding-left: 1.5em;
}

:deep(.prose) li + li {
  margin-top: 0.3em;
}

:deep(.prose) blockquote {
  margin: 1.2em 0;
  border-left: 4px solid #93c5fd;
  border-radius: 0 12px 12px 0;
  padding: 0.75em 1em;
  background: linear-gradient(180deg, #f8fbff 0%, #f1f5f9 100%);
  color: #475569;
}

:deep(.prose) pre {
  margin: 1.25em 0;
  padding: 1em 1.1em;
  border-radius: 14px;
  background: #0f172a;
  color: #e2e8f0;
  border: 1px solid #1e293b;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  overflow-x: auto;
}

:deep(.prose) pre code {
  display: block;
  background: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: 0.9rem;
  line-height: 1.7;
  text-shadow: none;
}

:deep(.prose) :not(pre) > code {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.15rem 0.42rem;
  color: #be123c;
  font-size: 0.88em;
}

:deep(.prose) a {
  color: #2563eb;
  text-decoration: none;
  border-bottom: 1px solid #93c5fd;
  transition: all 0.2s;
}

:deep(.prose) a:hover {
  color: #1d4ed8;
  border-bottom-color: #1d4ed8;
}

:deep(.prose) img,
:deep(.prose) video {
  max-width: 100%;
  border-radius: 12px;
  margin: 1.2em 0;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

@media (min-width: 1024px) {
  .workspace-shell__frame-split {
    flex-direction: row;
  }

  .workspace-panel-split {
    width: 50%;
  }

  .workspace-panel-divider {
    border-right: 1px solid var(--editor-border);
    border-bottom: none;
  }
}

@media (max-width: 768px) {
  .editor-title-input {
    font-size: 1.9rem;
  }

  .workspace-shell__frame {
    min-height: 58vh;
  }

  .workspace-textarea,
  .preview-shell {
    padding: 1.1rem;
  }
}
</style>
