<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">AI 配置</h2>
      <div class="flex items-center gap-2">
        <el-button :loading="testing" @click="handleTestAI">AI 一键测试</el-button>
        <el-button type="primary" :loading="saving" @click="saveConfig">保存配置</el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <el-form :model="form" label-width="140px">
        <el-form-item label="启用 AI">
          <el-switch v-model="form.ai_enabled" />
        </el-form-item>

        <el-form-item label="Provider">
          <el-input v-model="form.ai_provider" placeholder="例如 deepseek / openai-compatible" />
        </el-form-item>

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

        <el-form-item label="模型">
          <el-input v-model="form.ai_model" placeholder="例如 deepseek-chat / gpt-4o-mini" />
        </el-form-item>

        <el-form-item label="超时（秒）">
          <el-input-number v-model="form.ai_timeout_seconds" :min="1" :max="120" />
        </el-form-item>
      </el-form>

      <div class="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        保存后将立即影响后台 AI 生成功能（文章草稿 / 摘要）。
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
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

const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const form = ref<AIConfigForm>({
  ai_enabled: true,
  ai_provider: 'openai-compatible',
  ai_base_url: '',
  ai_api_key: '',
  ai_model: 'gpt-4o-mini',
  ai_timeout_seconds: 30
})

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
        ai_timeout_seconds: Number(res.data.ai_timeout_seconds || 30)
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取 AI 配置失败')
  } finally {
    loading.value = false
  }
}

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
    const payload: AIConfigForm = {
      ...form.value,
      ai_provider: form.value.ai_provider.trim(),
      ai_base_url: form.value.ai_base_url.trim(),
      ai_api_key: form.value.ai_api_key.trim(),
      ai_model: form.value.ai_model.trim(),
      ai_timeout_seconds: Math.max(1, Number(form.value.ai_timeout_seconds || 30))
    }
    const res: any = await updateAIConfig(payload)
    if (res.code === 200 && res.data) {
      form.value = {
        ai_enabled: !!res.data.ai_enabled,
        ai_provider: res.data.ai_provider || '',
        ai_base_url: res.data.ai_base_url || '',
        ai_api_key: res.data.ai_api_key || '',
        ai_model: res.data.ai_model || '',
        ai_timeout_seconds: Number(res.data.ai_timeout_seconds || 30)
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
    const payload: AIConfigForm = {
      ...form.value,
      ai_provider: form.value.ai_provider.trim(),
      ai_base_url: form.value.ai_base_url.trim(),
      ai_api_key: form.value.ai_api_key.trim(),
      ai_model: form.value.ai_model.trim(),
      ai_timeout_seconds: Math.max(1, Number(form.value.ai_timeout_seconds || 30))
    }
    const res: any = await testAIConfig(payload)
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
