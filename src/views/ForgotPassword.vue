<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          重置密码
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          请输入您的注册邮箱以获取验证码
        </p>
      </div>
      
      <!-- Step 1: Send Code -->
      <el-form v-if="step === 1" ref="emailFormRef" :model="emailForm" :rules="emailRules" class="mt-8 space-y-6" @submit.prevent>
        <el-form-item prop="email">
          <el-input 
            v-model="emailForm.email" 
            placeholder="请输入邮箱地址" 
            :prefix-icon="Message"
            size="large"
          />
        </el-form-item>
        
        <div>
          <el-button 
            type="primary" 
            class="w-full" 
            :loading="loading" 
            size="large"
            @click="handleSendCode"
          >
            发送验证码
          </el-button>
        </div>
      </el-form>

      <!-- Step 2: Reset Password -->
      <el-form v-else ref="resetFormRef" :model="resetForm" :rules="resetRules" class="mt-8 space-y-6" @submit.prevent>
        <div class="text-center mb-4">
          <span class="text-sm text-gray-500">验证码已发送至 {{ emailForm.email }}</span>
        </div>
        
        <el-form-item prop="code">
          <el-input 
            v-model="resetForm.code" 
            placeholder="请输入6位验证码" 
            :prefix-icon="Key"
            size="large"
            maxlength="6"
          />
        </el-form-item>
        
        <el-form-item prop="new_password">
          <el-input 
            v-model="resetForm.new_password" 
            type="password" 
            placeholder="请输入新密码" 
            :prefix-icon="Lock"
            show-password
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="confirm_password">
          <el-input 
            v-model="resetForm.confirm_password" 
            type="password" 
            placeholder="请确认新密码" 
            :prefix-icon="Lock"
            show-password
            size="large"
          />
        </el-form-item>
        
        <div class="flex gap-4">
          <el-button class="flex-1" size="large" @click="step = 1">返回上一步</el-button>
          <el-button 
            type="primary" 
            class="flex-1" 
            :loading="loading" 
            size="large"
            @click="handleResetPassword"
          >
            重置密码
          </el-button>
        </div>
      </el-form>

      <div class="text-center">
        <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
          返回登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Key, Lock } from '@element-plus/icons-vue'
import * as api from '../api'

const router = useRouter()
const step = ref(1)
const loading = ref(false)
const emailFormRef = ref()
const resetFormRef = ref()

const emailForm = reactive({
  email: ''
})

const resetForm = reactive({
  code: '',
  new_password: '',
  confirm_password: ''
})

const emailRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const resetRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value !== resetForm.new_password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleSendCode = async () => {
  if (!emailFormRef.value) return
  
  await emailFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res: any = await api.forgotPassword({ email: emailForm.email })
        if (res.code === 200) {
          ElMessage.success(res.msg)
          step.value = 2
        } else {
          ElMessage.error(res.msg || '发送失败')
        }
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleResetPassword = async () => {
  if (!resetFormRef.value) return
  
  await resetFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res: any = await api.resetPassword({
          email: emailForm.email,
          code: resetForm.code,
          new_password: resetForm.new_password
        })
        
        if (res.code === 200) {
          ElMessage.success('密码重置成功，请重新登录')
          router.push('/login')
        } else {
          ElMessage.error(res.msg || '重置失败')
        }
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
