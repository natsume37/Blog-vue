<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Categories -->
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-800">分类管理</h3>
        <el-button size="small" type="primary" @click="openCategoryDialog()">新增分类</el-button>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <el-table :data="categories" style="width: 100%">
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="description" label="描述" />
          <el-table-column label="操作" width="150" align="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openCategoryDialog(row)">编辑</el-button>
              <el-button link type="danger" @click="deleteCategory(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Tags -->
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-800">标签管理</h3>
        <el-button size="small" type="primary" @click="openTagDialog()">新增标签</el-button>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <el-table :data="tags" style="width: 100%">
          <el-table-column prop="name" label="名称">
            <template #default="{ row }">
              <el-tag :color="row.color" effect="dark" class="border-none">{{ row.name }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="color" label="颜色" />
          <el-table-column label="操作" width="150" align="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openTagDialog(row)">编辑</el-button>
              <el-button link type="danger" @click="deleteTag(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Category Dialog -->
    <el-dialog v-model="categoryDialog.visible" :title="categoryDialog.isEdit ? '编辑分类' : '新增分类'" width="500px">
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="categoryForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sort_order" :min="0" />
        </el-form-item>
        <el-divider content-position="left">页面配置</el-divider>
        <el-form-item label="背景图">
          <el-input v-model="categoryForm.banner_url" placeholder="输入图片URL" />
        </el-form-item>
        <el-form-item label="名言">
          <el-input v-model="categoryForm.quote" placeholder="例如：行路难 · 其一" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="categoryForm.quote_author" placeholder="例如：李白" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">确定</el-button>
      </template>
    </el-dialog>

    <!-- Tag Dialog -->
    <el-dialog v-model="tagDialog.visible" :title="tagDialog.isEdit ? '编辑标签' : '新增标签'" width="400px">
      <el-form :model="tagForm" label-width="60px">
        <el-form-item label="名称">
          <el-input v-model="tagForm.name" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="tagForm.color" :predefine="['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tagDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveTag">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as api from '../../api'

// Data
const categories = ref<any[]>([])
const tags = ref<any[]>([])

const fetchData = async () => {
  try {
    const [catsRes, tgsRes]: any = await Promise.all([api.getCategories(), api.getTags()])
    if (catsRes.code === 200) categories.value = catsRes.data || []
    if (tgsRes.code === 200) tags.value = tgsRes.data || []
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchData()
})

// Category Logic
const categoryDialog = reactive({ visible: false, isEdit: false, id: null })
const categoryForm = reactive({ 
  name: '', 
  description: '', 
  sort_order: 0,
  banner_url: '',
  quote: '',
  quote_author: ''
})

const openCategoryDialog = (row?: any) => {
  categoryDialog.visible = true
  categoryDialog.isEdit = !!row
  if (row) {
    categoryDialog.id = row.id
    categoryForm.name = row.name
    categoryForm.description = row.description
    categoryForm.sort_order = row.sort_order
    categoryForm.banner_url = row.banner_url || ''
    categoryForm.quote = row.quote || ''
    categoryForm.quote_author = row.quote_author || ''
  } else {
    categoryForm.name = ''
    categoryForm.description = ''
    categoryForm.sort_order = 0
    categoryForm.banner_url = ''
    categoryForm.quote = ''
    categoryForm.quote_author = ''
  }
}

const saveCategory = async () => {
  try {
    let res: any
    if (categoryDialog.isEdit) {
      res = await api.updateCategory(categoryDialog.id!, categoryForm)
    } else {
      res = await api.createCategory(categoryForm)
    }
    
    if (res.code === 200) {
      ElMessage.success('保存成功')
      categoryDialog.visible = false
      fetchData()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error(error)
  }
}

const deleteCategory = (row: any) => {
  ElMessageBox.confirm('确定删除该分类吗？').then(async () => {
    try {
      const res: any = await api.deleteCategory(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      console.error(error)
    }
  })
}

// Tag Logic
const tagDialog = reactive({ visible: false, isEdit: false, id: null as number | null })
const tagForm = reactive({ name: '', color: '#409EFF' })

const openTagDialog = (row?: any) => {
  tagDialog.visible = true
  tagDialog.isEdit = !!row
  if (row) {
    tagDialog.id = row.id
    tagForm.name = row.name
    tagForm.color = row.color
  } else {
    tagDialog.id = null
    tagForm.name = ''
    tagForm.color = '#409EFF'
  }
}

const saveTag = async () => {
  try {
    let res: any
    const data = {
      name: tagForm.name,
      color: tagForm.color || '#409EFF'
    }
    
    if (tagDialog.isEdit) {
      res = await api.updateTag(tagDialog.id!, data)
    } else {
      res = await api.createTag(data)
    }
    
    if (res.code === 200) {
      ElMessage.success('保存成功')
      tagDialog.visible = false
      fetchData()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error(error)
  }
}

const deleteTag = (row: any) => {
  ElMessageBox.confirm('确定删除该标签吗？').then(async () => {
    try {
      const res: any = await api.deleteTag(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      console.error(error)
    }
  })
}
</script>
