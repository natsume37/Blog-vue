<template>
  <div class="wechat-plugin space-y-6">
    <section
      v-if="!plugin?.installed || !plugin?.enabled"
      class="rounded-[24px] border border-amber-200 bg-amber-50/90 px-6 py-5 text-sm text-amber-800"
    >
      当前插件尚未安装或启用。配置和发布入口保留在这里，但启停请回到插件中心处理。
      <div class="mt-4">
        <el-button class="!rounded-full !border-amber-300 !bg-white" @click="router.push('/admin/plugins')">
          返回插件中心
        </el-button>
      </div>
    </section>

    <section class="rounded-[28px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">WeChat Official Account</div>
          <h3 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">公众号发布插件</h3>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            配置公众号凭证、默认发布模式和评论策略，然后选择一篇文章发送到公众号草稿箱或直接提交发布。
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <el-button
            :loading="saving"
            class="!rounded-full !border-slate-200 !px-5 hover:!border-emerald-200 hover:!text-emerald-700"
            @click="saveConfig"
          >
            保存插件配置
          </el-button>
          <el-button
            type="primary"
            :loading="publishing"
            class="!rounded-full !border-none !bg-slate-900 !px-6 hover:!bg-slate-800"
            :disabled="!articleId"
            @click="publishArticle"
          >
            上传到公众号
          </el-button>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <article class="rounded-[24px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
        <div class="mb-5">
          <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Credentials</div>
          <h4 class="mt-2 text-xl font-semibold text-slate-900">插件配置</h4>
        </div>

        <el-form label-position="top" class="space-y-2">
          <el-form-item label="AppID">
            <el-input v-model="form.app_id" placeholder="填写微信公众号 AppID" />
          </el-form-item>
          <el-form-item label="AppSecret">
            <el-input
              v-model="form.app_secret"
              type="password"
              show-password
              placeholder="填写微信公众号 AppSecret"
              autocomplete="new-password"
            />
          </el-form-item>
          <el-form-item label="默认作者">
            <el-input v-model="form.author" placeholder="例如 Martin" />
          </el-form-item>
          <el-form-item label="发布模式">
            <el-select v-model="form.publish_mode" class="w-full">
              <el-option label="仅上传到草稿箱" value="draft" />
              <el-option label="上传后立即发布" value="publish" />
            </el-select>
          </el-form-item>
          <el-form-item label="文章原文链接前缀">
            <el-input v-model="form.content_source_url_base" placeholder="例如 https://martin88.xyz/article" />
          </el-form-item>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div class="text-sm font-medium text-slate-800">开放评论</div>
              <div class="mt-1 text-xs leading-6 text-slate-500">同步到公众号图文时，默认是否打开评论开关。</div>
              <el-switch v-model="form.need_open_comment" class="mt-3" />
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div class="text-sm font-medium text-slate-800">仅粉丝可评论</div>
              <div class="mt-1 text-xs leading-6 text-slate-500">启用后，只允许关注公众号的用户参与评论。</div>
              <el-switch v-model="form.only_fans_can_comment" class="mt-3" />
            </div>
          </div>
        </el-form>
      </article>

      <article class="rounded-[24px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
        <div class="mb-5 flex items-center justify-between gap-3">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Article</div>
            <h4 class="mt-2 text-xl font-semibold text-slate-900">发布目标</h4>
          </div>
          <el-button class="!rounded-full" @click="router.push('/admin/articles')">浏览文章</el-button>
        </div>

        <div class="flex gap-3">
          <el-input v-model="articleIdInput" placeholder="输入文章 ID" />
          <el-button :loading="articleLoading" @click="loadArticle">加载文章</el-button>
        </div>

        <div v-if="article" class="mt-5 space-y-4">
          <div class="overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50/80">
            <img v-if="article.cover" :src="article.cover" class="h-48 w-full object-cover" alt="cover" />
            <div class="p-5">
              <div class="text-xl font-semibold text-slate-900">{{ article.title }}</div>
              <p class="mt-3 text-sm leading-7 text-slate-500">
                {{ article.summary || '该文章暂无摘要，发布时将使用正文内容生成公众号图文摘要。' }}
              </p>
              <div class="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                <span class="rounded-full bg-white px-3 py-1">ID {{ article.id }}</span>
                <span class="rounded-full bg-white px-3 py-1">{{ article.categoryName || '未分类' }}</span>
                <span class="rounded-full bg-white px-3 py-1">{{ article.is_published ? '站内已发布' : '站内草稿' }}</span>
              </div>
            </div>
          </div>

          <el-form label-position="top">
            <el-form-item label="本次发布作者">
              <el-input v-model="publishAuthor" placeholder="为空则使用插件默认作者" />
            </el-form-item>
            <el-form-item label="本次发布模式">
              <el-select v-model="publishMode" class="w-full">
                <el-option label="仅上传到草稿箱" value="draft" />
                <el-option label="上传后立即发布" value="publish" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <div
          v-else
          class="mt-5 rounded-[20px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-sm text-slate-500"
        >
          选择一篇文章后，插件会展示封面、摘要和基础状态，并把当前文章 ID 带入发布请求。
        </div>

        <div v-if="publishResult" class="mt-5 rounded-[20px] border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800">
          <div class="font-medium text-emerald-900">最近一次发布结果</div>
          <div class="mt-2 leading-7">{{ publishResult }}</div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as api from '../../../api'
import { usePluginStore } from '../../../stores/plugins'

type WeChatPluginConfig = {
  app_id: string
  app_secret: string
  author: string
  publish_mode: 'draft' | 'publish'
  content_source_url_base: string
  need_open_comment: boolean
  only_fans_can_comment: boolean
}

const route = useRoute()
const router = useRouter()
const pluginStore = usePluginStore()
const pluginId = 'wechat-official-account'

const plugin = computed(() => pluginStore.getPlugin(pluginId))
const saving = ref(false)
const publishing = ref(false)
const articleLoading = ref(false)
const publishResult = ref('')
const article = ref<any | null>(null)
const articleIdInput = ref('')
const publishAuthor = ref('')
const publishMode = ref<'draft' | 'publish'>('draft')

const form = ref<WeChatPluginConfig>({
  app_id: '',
  app_secret: '',
  author: '',
  publish_mode: 'draft',
  content_source_url_base: '',
  need_open_comment: true,
  only_fans_can_comment: false,
})

const articleId = computed(() => {
  const value = article.value?.id || articleIdInput.value
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
})

const applyConfig = (payload: any) => {
  form.value = {
    app_id: payload?.app_id || '',
    app_secret: payload?.app_secret || '',
    author: payload?.author || '',
    publish_mode: payload?.publish_mode === 'publish' ? 'publish' : 'draft',
    content_source_url_base: payload?.content_source_url_base || '',
    need_open_comment: payload?.need_open_comment !== false,
    only_fans_can_comment: !!payload?.only_fans_can_comment,
  }
  publishAuthor.value = form.value.author
  publishMode.value = form.value.publish_mode
}

const fetchConfig = async () => {
  try {
    const res: any = await pluginStore.fetchPluginConfig(pluginId)
    if (res.code === 200) {
      applyConfig(res.data?.values || res.data || {})
    }
  } catch (_error) {
    // Backend may not have plugin config initialized yet.
  }
}

const loadArticle = async () => {
  if (!articleId.value) {
    ElMessage.warning('请输入有效的文章 ID')
    return
  }

  articleLoading.value = true
  try {
    const res: any = await api.getArticle(articleId.value)
    if (res.code === 200 && res.data) {
      article.value = res.data
      articleIdInput.value = String(res.data.id)
      return
    }
    ElMessage.error(res.msg || '获取文章失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '获取文章失败')
  } finally {
    articleLoading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    const res: any = await pluginStore.updatePluginConfig(pluginId, {
      ...form.value,
      app_id: form.value.app_id.trim(),
      app_secret: form.value.app_secret.trim(),
      author: form.value.author.trim(),
      content_source_url_base: form.value.content_source_url_base.trim(),
    })
    if (res.code === 200) {
      applyConfig(res.data?.values || res.data || form.value)
      ElMessage.success(res.msg || '插件配置已保存')
      return
    }
    ElMessage.error(res.msg || '保存失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const publishArticle = async () => {
  if (!articleId.value) {
    ElMessage.warning('请先选择文章')
    return
  }

  publishing.value = true
  publishResult.value = ''
  try {
    const res: any = await pluginStore.callPluginAction(pluginId, 'publish', {
      article_id: articleId.value,
      publish_mode: publishMode.value,
      author: publishAuthor.value.trim() || form.value.author.trim(),
      need_open_comment: form.value.need_open_comment,
      only_fans_can_comment: form.value.only_fans_can_comment,
    })
    if (res.code === 200) {
      const message = res.data?.result?.message || res.data?.message || res.msg || '发布请求已提交'
      publishResult.value = message
      ElMessage.success(message)
      return
    }
    ElMessage.error(res.msg || '发布失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '发布失败')
  } finally {
    publishing.value = false
  }
}

watch(
  () => route.query.articleId,
  (nextArticleId) => {
    if (typeof nextArticleId === 'string' && nextArticleId.trim()) {
      articleIdInput.value = nextArticleId
      loadArticle()
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await pluginStore.ensureCatalog()
  await fetchConfig()
})
</script>
