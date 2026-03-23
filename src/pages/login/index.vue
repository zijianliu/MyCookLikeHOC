<script setup lang="ts">
import { login, userValidators } from '../../api/modules/user'
import { useUserStore } from '../../store/user'

definePage({
  name: 'login',
  style: {
    navigationBarTitleText: '用户登录',
  },
})

const router = useRouter()
const userStore = useUserStore()
const { show: showToast } = useGlobalToast()

// 表单数据
const formData = ref({
  email: '',
  password: '',
})

// 加载状态
const loading = ref(false)

// 错误信息
const errors = ref({
  email: '',
  password: '',
})

// 清除错误
function clearErrors() {
  errors.value = {
    email: '',
    password: '',
  }
}

// 验证表单
function validateForm(): boolean {
  clearErrors()
  let isValid = true

  // 验证邮箱
  const emailCheck = userValidators.validateEmail(formData.value.email)
  if (!emailCheck.valid) {
    errors.value.email = emailCheck.message || ''
    isValid = false
  }

  // 验证密码
  const passwordCheck = userValidators.validatePassword(formData.value.password)
  if (!passwordCheck.valid) {
    errors.value.password = passwordCheck.message || ''
    isValid = false
  }

  return isValid
}

// 处理登录
async function handleLogin() {
  if (!validateForm())
    return

  loading.value = true
  try {
    const response = await login({
      email: formData.value.email,
      password: formData.value.password,
    })

    if (response && response.user) {
      // 保存用户信息
      const userMeta = (response.user as any).user_metadata
      userStore.setUserInfo(
        {
          id: response.user.id,
          username: userMeta?.username || response.user.email?.split('@')[0] || '用户',
          email: response.user.email,
          avatar: userMeta?.avatar,
        },
        (response as any).access_token,
        (response as any).expires_at,
      )

      showToast({
        msg: '登录成功',
      })

      // 延迟跳转
      setTimeout(() => {
        // 如果有返回页面则返回，否则跳转到首页
        const pages = getCurrentPages()
        if (pages.length > 1) {
          router.back()
        }
        else {
          router.replace('/pages/index/index')
        }
      }, 1500)
    }
  }
  catch (error: any) {
    console.error('登录失败:', error)
    // 处理 Supabase 错误格式
    const errorMsg = error?.error_description
      || error?.message
      || error?.error?.message
      || error?.msg
      || '登录失败，请检查邮箱和密码'
    showToast({
      msg: errorMsg,
    })
  }
  finally {
    loading.value = false
  }
}

// 跳转到注册页面
function goToRegister() {
  router.push('/pages/register/index')
}

// 返回上一页
function goBack() {
  router.back()
}
</script>

<template>
  <view class="min-h-screen bg-white px-60rpx py-80rpx">
    <!-- 返回按钮 -->
    <view class="mb-60rpx">
      <wd-icon name="arrow-left" size="40rpx" color="#333" @click="goBack" />
    </view>

    <!-- 标题 -->
    <view class="mb-80rpx">
      <text class="block text-48rpx text-gray-800 font-bold">
        欢迎回来
      </text>
      <text class="mt-16rpx block text-28rpx text-gray-500">
        登录以继续浏览和收藏菜谱
      </text>
    </view>

    <!-- 登录表单 -->
    <view class="space-y-40rpx">
      <!-- 邮箱输入 -->
      <view>
        <text class="mb-16rpx block text-28rpx text-gray-700">
          邮箱地址
        </text>
        <wd-input
          v-model="formData.email"
          type="text"
          placeholder="请输入邮箱地址"
          clearable
          custom-class="h-96rpx rounded-16rpx bg-gray-50 px-24rpx"
          @focus="errors.email = ''"
        />
        <text v-if="errors.email" class="mt-8rpx block text-24rpx text-red-500">
          {{ errors.email }}
        </text>
      </view>

      <!-- 密码输入 -->
      <view>
        <text class="mb-16rpx block text-28rpx text-gray-700">
          密码
        </text>
        <wd-input
          v-model="formData.password"
          placeholder="请输入密码"
          clearable
          show-password
          custom-class="h-96rpx rounded-16rpx bg-gray-50 px-24rpx"
          @focus="errors.password = ''"
        />
        <text v-if="errors.password" class="mt-8rpx block text-24rpx text-red-500">
          {{ errors.password }}
        </text>
      </view>

      <!-- 登录按钮 -->
      <wd-button
        type="primary"
        size="large"
        :loading="loading"
        custom-class="mt-60rpx h-96rpx rounded-48rpx"
        @click="handleLogin"
      >
        登录
      </wd-button>

      <!-- 注册入口 -->
      <view class="mt-40rpx text-center">
        <text class="text-28rpx text-gray-500">
          还没有账号？
        </text>
        <text class="text-primary ml-8rpx text-28rpx font-medium" @click="goToRegister">
          立即注册
        </text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.text-primary {
  color: #f6c042;
}
</style>
