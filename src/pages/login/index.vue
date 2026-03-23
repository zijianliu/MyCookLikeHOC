<script setup lang="ts">
import { useUserStore } from '../../store/user'

definePage({
  name: 'login',
  style: {
    navigationBarTitleText: '登录',
  },
})

const router = useRouter()
const userStore = useUserStore()

const phone = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!phone.value || !password.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
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

  loading.value = true
  try {
    const result = await userStore.login({
      phone: phone.value,
      password: password.value,
    })

    if (result.success) {
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        router.back()
      }, 1500)
    }
    else {
      uni.showToast({ title: result.error || '登录失败', icon: 'none' })
    }
  }
  finally {
    loading.value = false
  }
}

function goToRegister() {
  router.push({ name: 'register' })
}
</script>

<template>
  <view class="min-h-100% bg-white">
    <view class="flex flex-col items-center pt-20">
      <image src="@/static/logo.png" class="h-24 w-24" mode="aspectFit" />
      <text class="mt-4 text-5 text-gray-800 font-bold">欢迎回来</text>
      <text class="mt-2 text-3 text-gray-500">登录后享受更多功能</text>
    </view>

    <view class="mx-6 mt-10">
      <wd-cell-group border custom-class="rounded-2! overflow-hidden">
        <wd-cell custom-class="cell-pad">
          <wd-input
            v-model="phone"
            label="手机号"
            label-width="60px"
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
            label-width="60px"
            placeholder="请输入密码"
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
          @click="handleLogin"
        >
          登录
        </wd-button>
      </view>

      <view class="mt-4 flex justify-between px-2">
        <text class="text-3 text-blue-500" @click="goToRegister">还没有账号？立即注册</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.cell-pad {
  padding: 8px 0;
}
</style>
