<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">邮件配置</h2>
      <div class="flex gap-2">
        <el-button :loading="testing" @click="handleTest">测试发送</el-button>
        <el-button type="primary" :loading="saving" @click="saveConfig">保存配置</el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <el-form :model="form" label-width="130px">
        <el-form-item label="SMTP Host">
          <el-input v-model="form.smtpHost" placeholder="例如 smtp.qq.com" />
        </el-form-item>
        <el-form-item label="SMTP Port">
          <el-input-number v-model="form.smtpPort" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="SMTP User">
          <el-input v-model="form.smtpUser" />
        </el-form-item>
        <el-form-item label="SMTP Password">
          <el-input v-model="form.smtpPassword" type="password" show-password autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="发件邮箱">
          <el-input v-model="form.emailsFromEmail" />
        </el-form-item>
        <el-form-item label="发件人名称">
          <el-input v-model="form.emailsFromName" />
        </el-form-item>
        <el-divider content-position="left">测试发送</el-divider>
        <el-form-item label="测试收件人">
          <el-input v-model="testEmailTo" placeholder="输入接收测试邮件的邮箱" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getMailConfig, testMailConfig, updateMailConfig } from '../../api'

type MailForm = {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  emailsFromEmail: string
  emailsFromName: string
}

const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const testEmailTo = ref('')
const form = ref<MailForm>({
  smtpHost: '',
  smtpPort: 465,
  smtpUser: '',
  smtpPassword: '',
  emailsFromEmail: '',
  emailsFromName: ''
})

const fetchConfig = async () => {
  loading.value = true
  try {
    const res: any = await getMailConfig()
    if (res.code === 200 && res.data) {
      form.value = {
        smtpHost: res.data.smtpHost || '',
        smtpPort: Number(res.data.smtpPort || 465),
        smtpUser: res.data.smtpUser || '',
        smtpPassword: res.data.smtpPassword || '',
        emailsFromEmail: res.data.emailsFromEmail || '',
        emailsFromName: res.data.emailsFromName || ''
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取邮件配置失败')
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    const res: any = await updateMailConfig(form.value)
    if (res.code === 200) {
      ElMessage.success('邮件配置已保存')
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error?.response?.data?.msg || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleTest = async () => {
  if (!testEmailTo.value.trim()) {
    ElMessage.warning('请先输入测试收件人邮箱')
    return
  }
  testing.value = true
  try {
    const res: any = await testMailConfig(form.value, testEmailTo.value.trim())
    if (res.code === 200) {
      ElMessage.success(res.msg || '测试邮件发送成功')
    } else {
      ElMessage.error(res.msg || '测试失败')
    }
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error?.response?.data?.msg || '测试失败')
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>
