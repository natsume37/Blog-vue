<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">{{ isEdit ? '编辑文章' : '写文章' }}</h2>
      <div class="flex gap-3">
        <el-button @click="$router.back()">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Editor -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <el-form label-position="top">
            <el-form-item label="文章标题">
              <el-input v-model="form.title" placeholder="请输入文章标题" size="large" />
            </el-form-item>
            
            <el-form-item label="文章摘要">
              <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="请输入文章摘要（可选）" />
            </el-form-item>
            
            <el-form-item label="文章内容">
              <el-input v-model="form.content" type="textarea" :rows="20" placeholder="支持 Markdown 格式" />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- Sidebar Settings -->
      <div class="space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="font-bold text-gray-700 mb-4">发布设置</h3>
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
            
            <el-form-item label="封面图 URL">
              <el-input v-model="form.cover" placeholder="https://..." />
              <div v-if="form.cover" class="mt-2 rounded-lg overflow-hidden h-32 w-full">
                <img :src="form.cover" class="w-full h-full object-cover" />
              </div>
            </el-form-item>
            
            <div class="pt-4 border-t border-gray-100 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">是否发布</span>
                <el-switch v-model="form.is_published" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">置顶文章</span>
                <el-switch v-model="form.is_top" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">推荐文章</span>
                <el-switch v-model="form.is_recommend" />
              </div>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as api from '../../api'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => route.params.id !== 'new')
const submitting = ref(false)

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
</script>
