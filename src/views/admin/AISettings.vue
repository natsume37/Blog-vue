<template>
  <div class="ai-settings-page space-y-6">
    <section class="ai-settings-hero overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div class="ai-settings-hero__glow ai-settings-hero__glow-a"></div>
      <div class="ai-settings-hero__glow ai-settings-hero__glow-b"></div>

      <div class="relative z-10 space-y-6 p-6 md:p-8">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div class="max-w-3xl">
            <div class="ai-settings-kicker">AI Assistant</div>
            <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              把草稿、摘要和生图能力收进同一套运行时配置。
            </h2>
            <p class="mt-3 text-sm leading-7 text-slate-500 md:text-base">
              Provider、模型、超时和密钥只维护一次。文章编辑器里的 AI 草稿、AI 摘要，以及生图子页都会共享这套配置。
            </p>
          </div>

          <div class="flex flex-wrap gap-3 xl:justify-end">
            <el-button class="!rounded-full !border-slate-200 !px-5 !text-slate-600 hover:!border-slate-300 hover:!bg-slate-50" @click="router.push('/admin/articles/new')">
              去写文章
            </el-button>
            <el-button class="!rounded-full !border-sky-200 !bg-sky-50 !px-5 !text-sky-700 hover:!border-sky-300 hover:!bg-sky-100" @click="router.push('/admin/plugins/ai-assistant/images')">
              打开生图页
            </el-button>
            <el-button
              :loading="testing"
              class="!rounded-full !border-slate-200 !px-5 !text-slate-700 hover:!border-sky-200 hover:!text-sky-700"
              @click="handleTestAI"
            >
              AI 一键测试
            </el-button>
            <el-button
              type="primary"
              :loading="saving"
              class="!rounded-full !border-none !bg-slate-900 !px-6 hover:!bg-slate-800"
              @click="saveConfig"
            >
              保存配置
            </el-button>
          </div>
        </div>

        <div class="ai-settings-chip-row">
          <span class="ai-settings-chip ai-settings-chip-dark">{{ form.ai_enabled ? 'AI 已启用' : 'AI 已停用' }}</span>
          <span class="ai-settings-chip">{{ normalizedProviderLabel }}</span>
          <span class="ai-settings-chip">{{ normalizedModelLabel }}</span>
          <span class="ai-settings-chip">{{ baseHostLabel }}</span>
        </div>

        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div class="ai-settings-metric">
            <div class="ai-settings-metric__label">运行状态</div>
            <div class="ai-settings-metric__value">{{ form.ai_enabled ? '开启' : '关闭' }}</div>
            <div class="ai-settings-metric__hint">关闭后，后台所有 AI 能力都会暂停。</div>
          </div>
          <div class="ai-settings-metric">
            <div class="ai-settings-metric__label">Provider</div>
            <div class="ai-settings-metric__value ai-settings-metric__value-compact">{{ normalizedProviderLabel }}</div>
            <div class="ai-settings-metric__hint">保持和实际兼容协议一致，便于草稿和测试复用。</div>
          </div>
          <div class="ai-settings-metric">
            <div class="ai-settings-metric__label">文本模型</div>
            <div class="ai-settings-metric__value ai-settings-metric__value-compact">{{ normalizedModelLabel }}</div>
            <div class="ai-settings-metric__hint">文章草稿和摘要默认走这套模型。</div>
          </div>
          <div class="ai-settings-metric">
            <div class="ai-settings-metric__label">超时预算</div>
            <div class="ai-settings-metric__value">{{ timeoutLabel }}</div>
            <div class="ai-settings-metric__hint">草稿生成通常更长，建议至少保留 20 秒以上。</div>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
      <article class="ai-settings-panel" v-loading="loading">
        <div class="ai-settings-panel__head">
          <div>
            <div class="ai-settings-panel__eyebrow">Runtime</div>
            <h3 class="ai-settings-panel__title">连接与模型</h3>
            <p class="ai-settings-panel__desc">
              把基础连接参数一次填完整，后续编辑器、插件页和 AI 工作流都会共用这套配置。
            </p>
          </div>
          <div class="ai-settings-panel__status">
            <span class="ai-settings-chip">{{ baseHostLabel }}</span>
          </div>
        </div>

        <el-form :model="form" label-position="top" class="space-y-2">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="ai-settings-option-card">
              <div class="ai-settings-option-card__title">AI 总开关</div>
              <div class="ai-settings-option-card__desc">适合在联调期临时停用，不需要删除原有配置。</div>
              <div class="ai-settings-option-card__control">
                <span>{{ form.ai_enabled ? '当前开启' : '当前关闭' }}</span>
                <el-switch v-model="form.ai_enabled" />
              </div>
            </div>

            <div class="ai-settings-option-card">
              <div class="ai-settings-option-card__title">请求预算</div>
              <div class="ai-settings-option-card__desc">数值越大，长文草稿越稳，但失败反馈会更晚返回。</div>
              <el-input-number v-model="form.ai_timeout_seconds" :min="1" :max="120" class="mt-3 w-full" />
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <el-form-item label="Provider">
              <el-input v-model="form.ai_provider" placeholder="例如 openai-compatible / deepseek" />
            </el-form-item>
            <el-form-item label="模型">
              <el-input v-model="form.ai_model" placeholder="例如 gpt-4o-mini / deepseek-chat" />
            </el-form-item>
          </div>

          <el-form-item label="Base URL">
            <el-input v-model="form.ai_base_url" placeholder="例如 https://api.deepseek.com/v1" />
          </el-form-item>

          <el-form-item label="API Key">
            <el-input
              v-model="form.ai_api_key"
              type="password"
              show-password
              placeholder="输入 AI API Key"
              autocomplete="new-password"
            />
          </el-form-item>
        </el-form>

        <div class="ai-settings-footnote">
          保存后会立即影响文章编辑器中的 AI 草稿和 AI 摘要，也会作为 AI 生图页的默认连接来源。
        </div>
      </article>

      <div class="space-y-6">
        <section class="ai-settings-panel ai-settings-panel-soft">
          <div class="ai-settings-panel__head">
            <div>
              <div class="ai-settings-panel__eyebrow">Coverage</div>
              <h3 class="ai-settings-panel__title">这套配置会影响哪里</h3>
            </div>
          </div>

          <div class="ai-settings-capability-grid">
            <article v-for="item in capabilityCards" :key="item.title" class="ai-settings-capability-card">
              <div class="ai-settings-capability-card__title">{{ item.title }}</div>
              <div class="ai-settings-capability-card__desc">{{ item.desc }}</div>
            </article>
          </div>
        </section>

        <section class="ai-settings-panel">
          <div class="ai-settings-panel__head">
            <div>
              <div class="ai-settings-panel__eyebrow">Checklist</div>
              <h3 class="ai-settings-panel__title">联调建议</h3>
            </div>
          </div>

          <div class="ai-settings-checklist">
            <div v-for="item in checklistItems" :key="item.title" class="ai-settings-checklist__item">
              <div class="ai-settings-checklist__title">{{ item.title }}</div>
              <div class="ai-settings-checklist__desc">{{ item.desc }}</div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAIConfig, testAIConfig, updateAIConfig } from '../../api'

type AIConfigForm = {
  ai_enabled: boolean
  ai_provider: string
  ai_base_url: string
  ai_api_key: string
  ai_model: string
  ai_timeout_seconds: number
}

const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const form = ref<AIConfigForm>({
  ai_enabled: true,
  ai_provider: 'openai-compatible',
  ai_base_url: '',
  ai_api_key: '',
  ai_model: 'gpt-4o-mini',
  ai_timeout_seconds: 30,
})

const normalizedProviderLabel = computed(() => form.value.ai_provider.trim() || '未设置 Provider')
const normalizedModelLabel = computed(() => form.value.ai_model.trim() || '未设置模型')
const baseHostLabel = computed(() => {
  const raw = form.value.ai_base_url.trim()
  if (!raw) return '未设置 Base URL'
  try {
    return new URL(raw).host || raw
  } catch (_error) {
    return raw
  }
})
const timeoutLabel = computed(() => `${Math.max(1, Number(form.value.ai_timeout_seconds || 30))} 秒`)

const capabilityCards = [
  { title: 'AI 草稿', desc: '文章编辑器会用这里的 Provider、模型和超时生成首稿，并自动回填正文。' },
  { title: 'AI 摘要', desc: '摘要生成会共用同一套文本模型，方便保持表达风格一致。' },
  { title: 'AI 生图', desc: '生图子页会复用连接信息，减少在多个页面重复配置密钥。' },
  { title: '插件测试', desc: '保存前可以先做一次联调测试，尽快确认接口、Key 和路由都正常。' },
]

const checklistItems = [
  { title: 'Base URL 尽量填完整', desc: 'OpenAI 兼容接口通常建议直接带上 `/v1`，减少请求路径拼接差异。' },
  { title: '草稿场景优先稳定模型', desc: '如果模型擅长长文和结构化输出，AI 草稿体验会比纯聊天模型更稳。' },
  { title: '密钥建议单独配置', desc: '如果文本和图片走不同服务，最好用独立 Key，方便排查额度和权限问题。' },
  { title: '超时不要压太低', desc: '草稿生成本来就比摘要更慢，超时过低时容易出现已执行但前端误判失败。' },
]

const fetchConfig = async () => {
  loading.value = true
  try {
    const res: any = await getAIConfig()
    if (res.code === 200 && res.data) {
      form.value = {
        ai_enabled: !!res.data.ai_enabled,
        ai_provider: res.data.ai_provider || '',
        ai_base_url: res.data.ai_base_url || '',
        ai_api_key: res.data.ai_api_key || '',
        ai_model: res.data.ai_model || '',
        ai_timeout_seconds: Number(res.data.ai_timeout_seconds || 30),
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取 AI 配置失败')
  } finally {
    loading.value = false
  }
}

const buildPayload = (): AIConfigForm => ({
  ...form.value,
  ai_provider: form.value.ai_provider.trim(),
  ai_base_url: form.value.ai_base_url.trim(),
  ai_api_key: form.value.ai_api_key.trim(),
  ai_model: form.value.ai_model.trim(),
  ai_timeout_seconds: Math.max(1, Number(form.value.ai_timeout_seconds || 30)),
})

const saveConfig = async () => {
  if (!form.value.ai_provider.trim()) {
    ElMessage.warning('Provider 不能为空')
    return
  }
  if (!form.value.ai_model.trim()) {
    ElMessage.warning('模型不能为空')
    return
  }

  saving.value = true
  try {
    const res: any = await updateAIConfig(buildPayload())
    if (res.code === 200 && res.data) {
      form.value = {
        ai_enabled: !!res.data.ai_enabled,
        ai_provider: res.data.ai_provider || '',
        ai_base_url: res.data.ai_base_url || '',
        ai_api_key: res.data.ai_api_key || '',
        ai_model: res.data.ai_model || '',
        ai_timeout_seconds: Number(res.data.ai_timeout_seconds || 30),
      }
      ElMessage.success('AI 配置已保存')
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleTestAI = async () => {
  testing.value = true
  try {
    const res: any = await testAIConfig(buildPayload())
    if (res.code === 200 && res.data?.ok) {
      ElMessage.success(`测试通过：${res.data.provider}/${res.data.model}，耗时 ${res.data.latency_ms}ms`)
      return
    }
    ElMessage.error(res.msg || res.data?.message || '测试失败')
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error?.message || '测试失败'
    ElMessage.error(msg)
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<style scoped>
.ai-settings-page {
  --ai-border: rgba(226, 232, 240, 0.85);
  --ai-text: #0f172a;
  --ai-muted: #64748b;
}

.ai-settings-hero {
  position: relative;
}

.ai-settings-hero__glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(38px);
  opacity: 0.52;
  pointer-events: none;
}

.ai-settings-hero__glow-a {
  top: -36px;
  right: -32px;
  width: 220px;
  height: 220px;
  background: rgba(56, 189, 248, 0.15);
}

.ai-settings-hero__glow-b {
  bottom: -94px;
  left: 10%;
  width: 250px;
  height: 220px;
  background: rgba(251, 191, 36, 0.12);
}

.ai-settings-kicker,
.ai-settings-panel__eyebrow,
.ai-settings-metric__label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}

.ai-settings-kicker {
  color: #0ea5e9;
}

.ai-settings-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.ai-settings-chip {
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

.ai-settings-chip-dark {
  background: #0f172a;
  border-color: #0f172a;
  color: #fff;
}

.ai-settings-metric {
  border-radius: 24px;
  border: 1px solid var(--ai-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.9));
  padding: 1.15rem 1.2rem;
}

.ai-settings-metric__label {
  color: #94a3b8;
}

.ai-settings-metric__value {
  margin-top: 0.8rem;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.08;
  color: var(--ai-text);
}

.ai-settings-metric__value-compact {
  font-size: 1.18rem;
  line-height: 1.35;
  word-break: break-word;
}

.ai-settings-metric__hint {
  margin-top: 0.55rem;
  font-size: 0.84rem;
  line-height: 1.65;
  color: var(--ai-muted);
}

.ai-settings-panel {
  border-radius: 28px;
  border: 1px solid var(--ai-border);
  background: rgba(255, 255, 255, 0.95);
  padding: 1.35rem;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
}

.ai-settings-panel-soft {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
}

.ai-settings-panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.ai-settings-panel__eyebrow {
  color: #94a3b8;
}

.ai-settings-panel__title {
  margin-top: 0.45rem;
  font-size: 1.18rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--ai-text);
}

.ai-settings-panel__desc {
  margin-top: 0.5rem;
  max-width: 36rem;
  font-size: 0.88rem;
  line-height: 1.75;
  color: var(--ai-muted);
}

.ai-settings-panel__status {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.ai-settings-option-card {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 22px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(248, 250, 252, 0.84);
  padding: 1rem;
}

.ai-settings-option-card__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--ai-text);
}

.ai-settings-option-card__desc {
  margin-top: 0.45rem;
  font-size: 0.82rem;
  line-height: 1.7;
  color: var(--ai-muted);
}

.ai-settings-option-card__control {
  margin-top: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.84rem;
  font-weight: 600;
  color: #475569;
}

.ai-settings-footnote {
  margin-top: 1.15rem;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.88);
  padding: 0.95rem 1rem;
  font-size: 0.84rem;
  line-height: 1.75;
  color: var(--ai-muted);
}

.ai-settings-capability-grid {
  display: grid;
  gap: 0.85rem;
}

.ai-settings-capability-card {
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
}

.ai-settings-capability-card__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--ai-text);
}

.ai-settings-capability-card__desc {
  margin-top: 0.45rem;
  font-size: 0.83rem;
  line-height: 1.72;
  color: var(--ai-muted);
}

.ai-settings-checklist {
  display: grid;
  gap: 0.85rem;
}

.ai-settings-checklist__item {
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(248, 250, 252, 0.84);
  padding: 0.95rem 1rem;
}

.ai-settings-checklist__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ai-text);
}

.ai-settings-checklist__desc {
  margin-top: 0.42rem;
  font-size: 0.82rem;
  line-height: 1.72;
  color: var(--ai-muted);
}

@media (max-width: 768px) {
  .ai-settings-panel,
  .ai-settings-metric {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
