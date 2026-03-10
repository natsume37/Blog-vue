<template>
  <div class="ai-image-plugin space-y-6">
    <section
      v-if="!plugin?.installed || !plugin?.enabled"
      class="rounded-[24px] border border-amber-200 bg-amber-50/90 px-6 py-5 text-sm text-amber-800"
    >
      当前插件尚未安装或启用。请先回到插件中心启用它，再使用生图和入库能力。
      <div class="mt-4">
        <el-button class="!rounded-full !border-amber-300 !bg-white" @click="router.push('/admin/plugins')">
          返回插件中心
        </el-button>
      </div>
    </section>

    <section class="rounded-[28px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">AI Image Studio</div>
          <h3 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">AI 生图工作室</h3>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            用 OpenAI 兼容接口在后台生成图片，控制尺寸、质量和格式，并按需把结果直接写入图库。
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <el-button
            :loading="testing"
            class="!rounded-full !border-slate-200 !px-5 hover:!border-sky-200 hover:!text-sky-700"
            @click="testConnection"
          >
            测试连接
          </el-button>
          <el-button
            :loading="saving"
            class="!rounded-full !border-slate-200 !px-5 hover:!border-sky-200 hover:!text-sky-700"
            @click="saveConfig"
          >
            保存插件配置
          </el-button>
          <el-button
            type="primary"
            :loading="generating"
            class="!rounded-full !border-none !bg-slate-900 !px-6 hover:!bg-slate-800"
            @click="generateImages"
          >
            生成图片
          </el-button>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <article class="rounded-[24px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
        <div class="mb-5">
          <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Runtime</div>
          <h4 class="mt-2 text-xl font-semibold text-slate-900">插件配置</h4>
        </div>

        <el-form label-position="top" class="space-y-2">
          <el-form-item label="提供方">
            <el-input v-model="form.provider" placeholder="例如 openai-compatible" />
          </el-form-item>
          <el-form-item label="Base URL">
            <el-input v-model="form.base_url" placeholder="例如 https://api.openai.com/v1" />
          </el-form-item>
          <el-form-item label="API Key">
            <el-input
              v-model="form.api_key"
              type="password"
              show-password
              placeholder="输入图片模型 API Key"
              autocomplete="new-password"
            />
          </el-form-item>
          <el-form-item label="图片模型">
            <el-input v-model="form.image_model" placeholder="例如 gpt-image-1" />
          </el-form-item>

          <div class="grid gap-4 md:grid-cols-2">
            <el-form-item label="默认尺寸">
              <el-select v-model="form.default_size" class="w-full">
                <el-option label="方图 1024x1024" value="1024x1024" />
                <el-option label="横图 1536x1024" value="1536x1024" />
                <el-option label="竖图 1024x1536" value="1024x1536" />
              </el-select>
            </el-form-item>
            <el-form-item label="默认质量">
              <el-select v-model="form.default_quality" class="w-full">
                <el-option label="自动" value="auto" />
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
              </el-select>
            </el-form-item>
            <el-form-item label="默认格式">
              <el-select v-model="form.default_output_format" class="w-full">
                <el-option label="PNG" value="png" />
                <el-option label="JPEG" value="jpeg" />
                <el-option label="WEBP" value="webp" />
              </el-select>
            </el-form-item>
            <el-form-item label="默认背景">
              <el-select v-model="form.default_background" class="w-full">
                <el-option label="自动" value="auto" />
                <el-option label="纯色背景" value="opaque" />
                <el-option label="透明背景" value="transparent" />
              </el-select>
            </el-form-item>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <el-form-item label="超时（秒）">
              <el-input-number v-model="form.timeout_seconds" :min="10" :max="180" class="w-full" />
            </el-form-item>
            <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div class="text-sm font-medium text-slate-800">默认入库图库</div>
              <div class="mt-1 text-xs leading-6 text-slate-500">开启后，点击生成会优先把图片写入图库并返回资源地址。</div>
              <el-switch v-model="form.save_to_library_default" class="mt-3" />
            </div>
          </div>
        </el-form>
      </article>

      <article class="rounded-[24px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
        <div class="mb-5 flex items-center justify-between gap-3">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Prompt</div>
            <h4 class="mt-2 text-xl font-semibold text-slate-900">生成面板</h4>
          </div>
          <el-button class="!rounded-full" @click="router.push('/admin/resources')">打开图库</el-button>
        </div>

        <el-form label-position="top">
          <el-form-item label="提示词">
            <el-input
              v-model="generateForm.prompt"
              type="textarea"
              :rows="5"
              placeholder="例如：清晨海边的极简书桌，柔和自然光，胶片质感，适合博客头图。"
            />
          </el-form-item>
          <el-form-item label="负面提示词">
            <el-input
              v-model="generateForm.negative_prompt"
              type="textarea"
              :rows="3"
              placeholder="例如：不要文字水印、不要畸形手部、不要低清晰度。"
            />
          </el-form-item>

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <el-form-item label="尺寸">
              <el-select v-model="generateForm.size" class="w-full">
                <el-option label="1024x1024" value="1024x1024" />
                <el-option label="1536x1024" value="1536x1024" />
                <el-option label="1024x1536" value="1024x1536" />
              </el-select>
            </el-form-item>
            <el-form-item label="质量">
              <el-select v-model="generateForm.quality" class="w-full">
                <el-option label="自动" value="auto" />
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
              </el-select>
            </el-form-item>
            <el-form-item label="格式">
              <el-select v-model="generateForm.output_format" class="w-full">
                <el-option label="PNG" value="png" />
                <el-option label="JPEG" value="jpeg" />
                <el-option label="WEBP" value="webp" />
              </el-select>
            </el-form-item>
            <el-form-item label="背景">
              <el-select v-model="generateForm.background" class="w-full">
                <el-option label="自动" value="auto" />
                <el-option label="纯色" value="opaque" />
                <el-option label="透明" value="transparent" />
              </el-select>
            </el-form-item>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div class="text-sm font-medium text-slate-800">生成张数</div>
              <div class="mt-1 text-xs leading-6 text-slate-500">单次最多 4 张。数量越多，响应越慢，成本越高。</div>
              <el-input-number v-model="generateForm.n" :min="1" :max="4" class="mt-3" />
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div class="text-sm font-medium text-slate-800">本次自动入库</div>
              <div class="mt-1 text-xs leading-6 text-slate-500">关闭后只返回预览结果；开启后会优先尝试写入图库并生成资源地址。</div>
              <el-switch v-model="generateForm.save_to_library" class="mt-3" />
            </div>
          </div>
        </el-form>
      </article>
    </section>

    <section class="rounded-[24px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Output</div>
          <h4 class="mt-2 text-xl font-semibold text-slate-900">生成结果</h4>
          <p class="mt-2 text-sm leading-7 text-slate-500">
            结果会尽量返回可直接使用的图片地址；如果图库已配置七牛云，还会带上资源记录。
          </p>
        </div>
        <div v-if="lastResult" class="flex flex-wrap gap-2 text-xs text-slate-500">
          <span class="rounded-full bg-slate-100 px-3 py-1">{{ lastResult.model }}</span>
          <span class="rounded-full bg-slate-100 px-3 py-1">{{ lastResult.size }}</span>
          <span class="rounded-full bg-slate-100 px-3 py-1">{{ lastResult.quality }}</span>
          <span class="rounded-full bg-slate-100 px-3 py-1">{{ lastResult.output_format }}</span>
        </div>
      </div>

      <div
        v-if="!lastResult?.items?.length"
        class="mt-5 rounded-[20px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-10 text-sm text-slate-500"
      >
        还没有生成图片。保存配置后输入提示词，点击“生成图片”即可开始。
      </div>

      <div v-else class="mt-5 space-y-5">
        <div class="rounded-[20px] border border-slate-200 bg-slate-50/80 px-5 py-4">
          <div class="text-sm font-medium text-slate-900">{{ lastResult.message }}</div>
          <div class="mt-2 text-xs leading-6 text-slate-500">
            原始提示词：{{ lastResult.prompt }}
          </div>
          <div v-if="lastResult.revised_prompt" class="mt-1 text-xs leading-6 text-slate-500">
            模型修订后提示词：{{ lastResult.revised_prompt }}
          </div>
          <div
            v-if="lastResult.save_to_library && !lastResult.library_available"
            class="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-800"
          >
            当前站点图库未配置七牛云，结果仅返回预览链接，没有写入图库。
          </div>
        </div>

        <div class="grid gap-5 xl:grid-cols-2">
          <article
            v-for="item in lastResult.items"
            :key="item.index"
            class="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
          >
            <div class="aspect-[4/3] overflow-hidden bg-slate-100">
              <img :src="item.url" :alt="item.prompt || 'AI image result'" class="h-full w-full object-cover" />
            </div>
            <div class="space-y-4 p-5">
              <div class="flex flex-wrap items-center gap-2">
                <el-tag size="small" effect="plain">第 {{ item.index }} 张</el-tag>
                <el-tag size="small" effect="plain">{{ item.mime_type }}</el-tag>
                <el-tag v-if="item.saved" size="small" type="success" effect="plain">已入库</el-tag>
                <el-tag v-else size="small" effect="plain">预览结果</el-tag>
              </div>

              <p class="text-sm leading-7 text-slate-500">
                {{ item.prompt || lastResult.prompt }}
              </p>

              <div class="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs leading-6 text-slate-500">
                <div v-if="item.resource_url">资源地址：{{ item.resource_url }}</div>
                <div v-else-if="item.source_url">源地址：{{ item.source_url }}</div>
                <div v-else>当前结果以 data URL 预览，仅适合临时使用。</div>
              </div>

              <div class="flex flex-wrap gap-2">
                <el-button class="!rounded-full" @click="copyImageUrl(item)">
                  复制地址
                </el-button>
                <el-button class="!rounded-full" @click="copyMarkdown(item)">
                  复制 Markdown
                </el-button>
                <el-button class="!rounded-full" @click="openImage(item)">
                  新窗口预览
                </el-button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePluginStore } from '../../../stores/plugins'

type AIImagePluginConfig = {
  provider: string
  base_url: string
  api_key: string
  image_model: string
  default_size: '1024x1024' | '1536x1024' | '1024x1536'
  default_quality: 'auto' | 'low' | 'medium' | 'high'
  default_output_format: 'png' | 'jpeg' | 'webp'
  default_background: 'auto' | 'opaque' | 'transparent'
  timeout_seconds: number
  save_to_library_default: boolean
}

type AIImageGenerateForm = {
  prompt: string
  negative_prompt: string
  size: '1024x1024' | '1536x1024' | '1024x1536'
  quality: 'auto' | 'low' | 'medium' | 'high'
  output_format: 'png' | 'jpeg' | 'webp'
  background: 'auto' | 'opaque' | 'transparent'
  n: number
  save_to_library: boolean
}

type AIImageResultItem = {
  index: number
  prompt: string
  url: string
  source_url?: string
  data_url?: string
  mime_type: string
  saved: boolean
  resource_id?: number | null
  resource_key?: string
  resource_url?: string
}

type AIImageResult = {
  ok: boolean
  message: string
  provider: string
  model: string
  prompt: string
  negative_prompt?: string
  revised_prompt?: string
  size: string
  quality: string
  output_format: string
  background: string
  save_to_library: boolean
  library_available: boolean
  items: AIImageResultItem[]
}

const router = useRouter()
const pluginStore = usePluginStore()
const pluginId = 'ai-image-studio'

const plugin = computed(() => pluginStore.getPlugin(pluginId))
const saving = ref(false)
const testing = ref(false)
const generating = ref(false)
const lastSavedSnapshot = ref('')
const lastResult = ref<AIImageResult | null>(null)

const form = ref<AIImagePluginConfig>({
  provider: 'openai-compatible',
  base_url: '',
  api_key: '',
  image_model: 'gpt-image-1',
  default_size: '1024x1024',
  default_quality: 'high',
  default_output_format: 'png',
  default_background: 'auto',
  timeout_seconds: 90,
  save_to_library_default: true,
})

const generateForm = ref<AIImageGenerateForm>({
  prompt: '',
  negative_prompt: '',
  size: '1024x1024',
  quality: 'high',
  output_format: 'png',
  background: 'auto',
  n: 1,
  save_to_library: true,
})

const buildConfigPayload = (): AIImagePluginConfig => ({
  provider: form.value.provider.trim() || 'openai-compatible',
  base_url: form.value.base_url.trim(),
  api_key: form.value.api_key.trim(),
  image_model: form.value.image_model.trim() || 'gpt-image-1',
  default_size: form.value.default_size,
  default_quality: form.value.default_quality,
  default_output_format: form.value.default_output_format,
  default_background: form.value.default_background,
  timeout_seconds: Math.max(10, Number(form.value.timeout_seconds || 90)),
  save_to_library_default: !!form.value.save_to_library_default,
})

const snapshotConfig = () => JSON.stringify(buildConfigPayload())

const applyConfig = (payload: any) => {
  form.value = {
    provider: payload?.provider || 'openai-compatible',
    base_url: payload?.base_url || '',
    api_key: payload?.api_key || '',
    image_model: payload?.image_model || 'gpt-image-1',
    default_size: payload?.default_size || '1024x1024',
    default_quality: payload?.default_quality || 'high',
    default_output_format: payload?.default_output_format || 'png',
    default_background: payload?.default_background || 'auto',
    timeout_seconds: Number(payload?.timeout_seconds || 90),
    save_to_library_default: payload?.save_to_library_default !== false,
  }
  generateForm.value = {
    ...generateForm.value,
    size: form.value.default_size,
    quality: form.value.default_quality,
    output_format: form.value.default_output_format,
    background: form.value.default_background,
    save_to_library: form.value.save_to_library_default,
  }
  lastSavedSnapshot.value = snapshotConfig()
}

const fetchConfig = async () => {
  try {
    const res: any = await pluginStore.fetchPluginConfig(pluginId)
    if (res.code === 200) {
      applyConfig(res.data?.values || res.data || {})
    }
  } catch (_error) {
    // Keep defaults when the plugin is not configured yet.
  }
}

const persistConfig = async (quiet = false) => {
  const snapshot = snapshotConfig()
  if (snapshot === lastSavedSnapshot.value) return true
  const res: any = await pluginStore.updatePluginConfig(pluginId, buildConfigPayload())
  if (res.code !== 200) {
    throw new Error(res.msg || '保存插件配置失败')
  }
  applyConfig(res.data?.values || res.data || buildConfigPayload())
  if (!quiet) {
    ElMessage.success(res.msg || '插件配置已保存')
  }
  return true
}

const saveConfig = async () => {
  saving.value = true
  try {
    await persistConfig()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const testConnection = async () => {
  testing.value = true
  try {
    await persistConfig(true)
    const res: any = await pluginStore.callPluginAction(pluginId, 'test_connection', {})
    if (res.code === 200 && res.data?.result?.ok) {
      const result = res.data.result
      ElMessage.success(`${result.provider}/${result.model} 连通成功，耗时 ${result.latency_ms}ms`)
      return
    }
    ElMessage.error(res.msg || res.data?.result?.message || '测试失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '测试失败')
  } finally {
    testing.value = false
  }
}

const generateImages = async () => {
  if (generateForm.value.prompt.trim().length < 4) {
    ElMessage.warning('提示词至少需要 4 个字符')
    return
  }

  generating.value = true
  try {
    await persistConfig(true)
    const res: any = await pluginStore.callPluginAction(pluginId, 'generate', {
      prompt: generateForm.value.prompt.trim(),
      negative_prompt: generateForm.value.negative_prompt.trim(),
      size: generateForm.value.size,
      quality: generateForm.value.quality,
      output_format: generateForm.value.output_format,
      background: generateForm.value.background,
      n: Math.max(1, Math.min(4, Number(generateForm.value.n || 1))),
      save_to_library: generateForm.value.save_to_library,
    })
    if (res.code === 200 && res.data?.result) {
      lastResult.value = res.data.result as AIImageResult
      ElMessage.success(res.data.result.message || '生成成功')
      return
    }
    ElMessage.error(res.msg || '生成失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '生成失败')
  } finally {
    generating.value = false
  }
}

const resolveCopyTarget = (item: AIImageResultItem) => item.resource_url || item.source_url || item.url

const copyText = async (text: string, successMessage: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(successMessage)
  } catch (_error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const copyImageUrl = async (item: AIImageResultItem) => {
  await copyText(resolveCopyTarget(item), '图片地址已复制')
}

const copyMarkdown = async (item: AIImageResultItem) => {
  const target = resolveCopyTarget(item)
  await copyText(`![${item.prompt || 'AI Image'}](${target})`, 'Markdown 已复制')
}

const openImage = (item: AIImageResultItem) => {
  window.open(item.url || resolveCopyTarget(item), '_blank', 'noopener,noreferrer')
}

onMounted(async () => {
  await pluginStore.ensureCatalog()
  await fetchConfig()
})
</script>
