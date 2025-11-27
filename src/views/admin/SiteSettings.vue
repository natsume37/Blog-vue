<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">站点设置</h2>
      <el-button type="primary" @click="saveConfig" :loading="saving">保存配置</el-button>
    </div>

    <el-card v-loading="loading">
      <el-form :model="form" label-width="120px">
        <el-tabs>
          <el-tab-pane label="基本信息">
            <el-form-item label="站点名称">
              <el-input v-model="form.siteName" />
            </el-form-item>
            <el-form-item label="站点描述">
              <el-input v-model="form.siteDescription" type="textarea" />
            </el-form-item>
            <el-form-item label="作者名称">
              <el-input v-model="form.siteAuthor" />
            </el-form-item>
            <el-form-item label="站点头像">
              <el-input v-model="form.siteAvatar" placeholder="图片URL" />
              <div class="mt-2" v-if="form.siteAvatar">
                <img :src="form.siteAvatar" class="w-16 h-16 rounded-full object-cover" />
              </div>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="首页设置">
            <el-form-item label="主标题">
              <el-input v-model="form.heroTitle" />
            </el-form-item>
            <el-form-item label="背景图片">
              <el-input v-model="form.heroBgImage" placeholder="图片URL" />
              <div class="mt-2" v-if="form.heroBgImage">
                <img :src="form.heroBgImage" class="h-32 object-cover rounded-lg" />
              </div>
            </el-form-item>
            
            <el-divider content-position="left">打字机内容</el-divider>
            <div v-for="(_sentence, index) in form.heroSentences" :key="index" class="flex gap-2 mb-2">
              <el-input v-model="form.heroSentences[index]" placeholder="输入一句短语" />
              <el-button type="danger" :icon="Delete" circle @click="removeSentence(index)" />
            </div>
            <el-button type="primary" plain size="small" @click="addSentence" class="mt-2">添加短语</el-button>

            <el-divider content-position="left">公告栏</el-divider>
            <el-form-item label="显示公告">
              <el-switch v-model="form.showNotice" />
            </el-form-item>
            <el-form-item label="公告内容" v-if="form.showNotice">
              <el-input v-model="form.noticeText" type="textarea" :rows="3" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="关于我">
            <el-form-item label="内容编辑">
              <el-input 
                v-model="form.aboutContent" 
                type="textarea" 
                :rows="15" 
                placeholder="支持 Markdown 格式"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { getSiteConfig, updateSiteConfig } from '../../api'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const saving = ref(false)

const form = ref({
  siteName: '',
  siteDescription: '',
  siteAvatar: '',
  siteAuthor: '',
  heroTitle: '',
  heroBgImage: '',
  heroSentences: [] as string[],
  showNotice: true,
  noticeText: '',
  aboutContent: ''
})

const fetchConfig = async () => {
  loading.value = true
  try {
    const res: any = await getSiteConfig()
    if (res.code === 200) {
      form.value = res.data
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取配置失败')
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    const res: any = await updateSiteConfig(form.value)
    if (res.code === 200) {
      ElMessage.success('配置已保存')
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

const addSentence = () => {
  form.value.heroSentences.push('')
}

const removeSentence = (index: number) => {
  form.value.heroSentences.splice(index, 1)
}

onMounted(() => {
  fetchConfig()
})
</script>
