<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#fbfbfd]">
    <!-- Abstract Background Shapes -->
    <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[100px] animate-blob"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
    <div class="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-pink-200/30 rounded-full blur-[80px] animate-blob animation-delay-4000"></div>

    <div class="w-full max-w-md z-10 px-4">
      <div class="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 sm:p-10 transition-all duration-500">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 tracking-tight mb-2">
            {{ isLogin ? 'Welcome Back' : 'Create Account' }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ isLogin ? 'Enter your credentials to access your account' : 'Fill in the information to get started' }}
          </p>
        </div>

        <!-- Toggle Switch -->
        <div class="bg-gray-100/80 p-1 rounded-xl flex mb-8 relative">
          <div class="w-[calc(50%-4px)] absolute top-1 bottom-1 bg-white rounded-lg shadow-sm transition-all duration-300 ease-out left-1"
               :class="isLogin ? 'translate-x-0' : 'translate-x-full'"></div>
          <button @click="isLogin = true" 
                  class="flex-1 py-2 text-sm font-medium rounded-lg relative z-10 transition-colors duration-300"
                  :class="isLogin ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'">
            Sign In
          </button>
          <button @click="isLogin = false" 
                  class="flex-1 py-2 text-sm font-medium rounded-lg relative z-10 transition-colors duration-300"
                  :class="!isLogin ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'">
            Sign Up
          </button>
        </div>

        <!-- Forms -->
        <div class="relative overflow-hidden min-h-[320px]">
          <transition name="slide-fade" mode="out-in">
            
            <!-- Login Form -->
            <form v-if="isLogin" key="login" @submit.prevent="handleLogin" class="space-y-5">
              <div class="space-y-1">
                <label class="text-xs font-medium text-gray-500 ml-1">Username</label>
                <input type="text" required v-model="loginForm.username"
                       class="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                       placeholder="Your username" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-gray-500 ml-1">Password</label>
                <input type="password" required v-model="loginForm.password"
                       class="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                       placeholder="••••••••" />
              </div>
              
              <div class="flex items-center justify-between text-xs">
                <label class="flex items-center text-gray-500 cursor-pointer hover:text-gray-700">
                  <input type="checkbox" class="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2">
                  Remember me
                </label>
                <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">Forgot password?</a>
              </div>

              <button type="submit" :disabled="loading" class="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-medium text-sm shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
                {{ loading ? 'Signing In...' : 'Sign In' }}
              </button>
            </form>

            <!-- Register Form -->
            <form v-else key="register" @submit.prevent="handleRegister" class="space-y-5">
              <div class="space-y-1">
                <label class="text-xs font-medium text-gray-500 ml-1">Username</label>
                <input type="text" required v-model="registerForm.username"
                       class="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                       placeholder="Your username" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-gray-500 ml-1">Email</label>
                <input type="email" required v-model="registerForm.email"
                       class="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                       placeholder="name@example.com" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-gray-500 ml-1">Password</label>
                <input type="password" required v-model="registerForm.password"
                       class="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-800 placeholder-gray-400"
                       placeholder="Create a password" />
              </div>

              <div class="pt-2">
                <button type="submit" :disabled="loading" class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
                  {{ loading ? 'Creating Account...' : 'Create Account' }}
                </button>
              </div>
              
              <p class="text-center text-xs text-gray-500 mt-4">
                By creating an account, you agree to our 
                <a href="#" class="text-gray-900 hover:underline">Terms of Service</a> and 
                <a href="#" class="text-gray-900 hover:underline">Privacy Policy</a>.
              </p>
            </form>

          </transition>
        </div>

        <!-- Social Login (Optional) -->
        <div class="mt-8 pt-6 border-t border-gray-100">
          <div class="flex justify-center gap-4">
            <button class="p-2 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-gray-600">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
            </button>
            <button class="p-2 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-gray-600">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isLogin = ref(true)
const loading = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  email: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  const result = await userStore.login(loginForm.value.username, loginForm.value.password)
  loading.value = false
  
  if (result.success) {
    ElMessage.success(result.msg)
    // 跳转到之前的页面或默认页面
    const redirect = route.query.redirect as string
    if (redirect) {
      router.push(redirect)
    } else if (userStore.isAdmin) {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } else {
    ElMessage.error(result.msg)
  }
}

const handleRegister = async () => {
  loading.value = true
  const result = await userStore.register(registerForm.value)
  loading.value = false
  
  if (result.success) {
    ElMessage.success(result.msg + '，请登录')
    isLogin.value = true
  } else {
    ElMessage.error(result.msg)
  }
}
</script>

<style scoped>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>