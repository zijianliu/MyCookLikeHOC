<script setup lang="ts">
import { useUserStore } from '../../store/user'

definePage({
  name: 'register',
  style: {
    navigationBarTitleText: '注册',
  },
})

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

async function handleRegister() {
  if (!username.value || !phone.value || !password.value || !confirmPassword.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  if (username.value.length < 2 || username.value.length > 20) {
    uni.showToast({ title: '用户名长度需在2-20位之间', icon: 'none' })
    return
  }

  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  if (password.value.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' })
    return
  }

  if (password.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const result = await userStore.register({
      username: username.value,
      phone: phone.value,
      password: password.value,
    })

    if (result.success) {
      uni.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => {
        router.replace({ name: 'login' })
      }, 1500)
    }
    else {
      uni.showToast({ title: result.error || '注册失败', icon: 'none' })
    }
  }
  finally {
    loading.value = false
  }
}

function goToLogin() {
  router.back()
}
</script>

<template>
  <view class="min-h-100% bg-white">
    <view class="flex flex-col items-center pt-12">
      <image src="@/static/logo.png" class="h-20 w-20" mode="aspectFit" />
      <text class="mt-4 text-5 text-gray-800 font-bold">创建账号</text>
      <text class="mt-2 text-3 text-gray-500">加入我们，开始美食之旅</text>
    </view>

    <view class="mx-6 mt-8">
      <wd-cell-group border custom-class="rounded-2! overflow-hidden">
        <wd-cell custom-class="cell-pad">
          <wd-input
            v-model="username"
            label="用户名"
            label-width="70px"
            placeholder="请输入用户名"
            type="text"
            :maxlength="20"
            clearable
          />
        </wd-cell>
        <wd-cell custom-class="cell-pad">
          <wd-input
            v-model="phone"
            label="手机号"
            label-width="70px"
            placeholder="请输入手机号"
            type="text"
            inputmode="numeric"
            :maxlength="11"
            clearable
          />
        </wd-cell>
        <wd-cell custom-class="cell-pad">
          <wd-input
            v-model="password"
            label="密码"
            label-width="70px"
            placeholder="请输入密码"
            type="text"
            password
            :maxlength="20"
            clearable
          />
        </wd-cell>
        <wd-cell custom-class="cell-pad">
          <wd-input
            v-model="confirmPassword"
            label="确认密码"
            label-width="70px"
            placeholder="请再次输入密码"
            type="text"
            password
            :maxlength="20"
            clearable
          />
        </wd-cell>
      </wd-cell-group>

      <view class="mt-6">
        <wd-button
          type="primary"
          size="large"
          :loading="loading"
          custom-class="rounded-2! bg-orange-500! border-none! hover:bg-orange-600!"
          @click="handleRegister"
        >
          注册
        </wd-button>
      </view>

      <view class="mt-4 flex justify-between px-2">
        <text class="text-3 text-gray-500">已有账号？</text>
        <text class="text-3 text-blue-500" @click="goToLogin">立即登录</text>
      </view>
    </view>

    <view class="mx-6 mt-8 text-2.5 text-gray-400 text-center">
      <text>注册即表示同意</text>
      <text class="text-blue-400">《用户协议》</text>
      <text>和</text>
      <text class="text-blue-400">《隐私政策》</text>
    </view>
  </view>
</template>

<style scoped>
.cell-pad {
  padding: 8px 0;
}
</style>
