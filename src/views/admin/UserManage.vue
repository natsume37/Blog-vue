<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">用户管理</h1>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">
        添加用户
      </el-button>
    </div>

    <!-- Search -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户名、昵称或邮箱..."
        class="w-64"
        clearable
        @clear="fetchUsers"
        @keyup.enter="fetchUsers"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button @click="fetchUsers">搜索</el-button>
        </template>
      </el-input>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow-sm">
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <UserAvatar 
                :src="row.avatar" 
                :name="row.nickname || row.username"
                class="w-10 h-10"
              />
              <div>
                <div class="font-medium text-gray-800">{{ row.nickname || row.username }}</div>
                <div class="text-xs text-gray-400">@{{ row.username }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="email" label="邮箱" min-width="180">
          <template #default="{ row }">
            <span class="text-gray-600">{{ row.email || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_admin ? 'danger' : 'info'" size="small">
              {{ row.is_admin ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
              {{ row.is_active ? '正常' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="注册时间" width="180">
          <template #default="{ row }">
            <span class="text-gray-500 text-sm">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button 
              link 
              :type="row.is_active ? 'warning' : 'success'"
              @click="toggleUserStatus(row)"
            >
              {{ row.is_active ? '禁用' : '启用' }}
            </el-button>
            <el-popconfirm
              title="确定要删除这个用户吗？"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button link type="danger" :disabled="row.id === 1">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- Pagination -->
      <div class="flex justify-center p-4 border-t">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, total"
          @current-change="fetchUsers"
        />
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        label-position="left"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </el-form-item>
        
        <el-form-item label="密码" :prop="isEdit ? '' : 'password'">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="isEdit ? '留空则不修改密码' : '请输入密码'"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="角色">
          <el-switch
            v-model="form.is_admin"
            active-text="管理员"
            inactive-text="普通用户"
          />
        </el-form-item>
        
        <el-form-item v-if="isEdit" label="状态">
          <el-switch
            v-model="form.is_active"
            active-text="正常"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../../api'
import UserAvatar from '../../components/UserAvatar.vue'

// 状态
const loading = ref(false)
const submitting = ref(false)
const users = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索
const searchKeyword = ref('')

// 表单
const formRef = ref<FormInstance>()
const form = reactive({
  username: '',
  password: '',
  nickname: '',
  email: '',
  is_admin: false,
  is_active: true
})

// 验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const res: any = await getAdminUsers({
      current: currentPage.value,
      size: pageSize.value,
      keyword: searchKeyword.value || undefined
    })
    if (res.code === 200) {
      users.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 打开创建对话框
const openCreateDialog = () => {
  isEdit.value = false
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (user: any) => {
  isEdit.value = true
  editingId.value = user.id
  form.username = user.username
  form.password = ''
  form.nickname = user.nickname || ''
  form.email = user.email || ''
  form.is_admin = user.is_admin
  form.is_active = user.is_active
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  form.username = ''
  form.password = ''
  form.nickname = ''
  form.email = ''
  form.is_admin = false
  form.is_active = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      if (isEdit.value && editingId.value) {
        // 更新用户
        const updateData: any = {
          nickname: form.nickname,
          email: form.email || null,
          is_admin: form.is_admin,
          is_active: form.is_active
        }
        if (form.password) {
          updateData.password = form.password
        }
        
        const res: any = await updateAdminUser(editingId.value, updateData)
        if (res.code === 200) {
          ElMessage.success('更新成功')
          dialogVisible.value = false
          fetchUsers()
        } else {
          ElMessage.error(res.msg || '更新失败')
        }
      } else {
        // 创建用户
        const res: any = await createAdminUser({
          username: form.username,
          password: form.password,
          nickname: form.nickname || undefined,
          email: form.email || undefined,
          is_admin: form.is_admin
        })
        if (res.code === 200) {
          ElMessage.success('创建成功')
          dialogVisible.value = false
          fetchUsers()
        } else {
          ElMessage.error(res.msg || '创建失败')
        }
      }
    } catch (error) {
      console.error('Failed to submit:', error)
      ElMessage.error('操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 切换用户状态
const toggleUserStatus = async (user: any) => {
  try {
    const res: any = await updateAdminUser(user.id, {
      is_active: !user.is_active
    })
    if (res.code === 200) {
      ElMessage.success(user.is_active ? '已禁用' : '已启用')
      fetchUsers()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error('Failed to toggle status:', error)
    ElMessage.error('操作失败')
  }
}

// 删除用户
const handleDelete = async (id: number) => {
  try {
    const res: any = await deleteAdminUser(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchUsers()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('Failed to delete:', error)
    ElMessage.error('删除失败')
  }
}

// 初始化
onMounted(() => {
  fetchUsers()
})
</script>
