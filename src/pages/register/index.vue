<script setup lang="ts">
import { register, userValidators } from '../../api/modules/user'
import { useUserStore } from '../../store/user'

definePage({
  name: 'register',
  style: {
    navigationBarTitleText: '用户注册',
  },
})

const router = useRouter()
const _userStore = useUserStore()
const { show: showToast } = useGlobalToast()

// 表单数据
const formData = ref({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

// 加载状态
const loading = ref(false)

// 错误信息
const errors = ref({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

// 清除错误
function clearErrors() {
  errors.value = {
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  }
}

// 验证表单
function validateForm(): boolean {
  clearErrors()
  let isValid = true

  // 验证用户名
  const usernameCheck = userValidators.validateUsername(formData.value.username)
  if (!usernameCheck.valid) {
    errors.value.username = usernameCheck.message || ''
    isValid = false
  }

  // 验证邮箱或手机号（至少填一个）
  if (!formData.value.email && !formData.value.phone) {
    errors.value.email = '请填写邮箱或手机号'
    isValid = false
  }
  else if (formData.value.email) {
    const emailCheck = userValidators.validateEmail(formData.value.email)
    if (!emailCheck.valid) {
      errors.value.email = emailCheck.message || ''
      isValid = false
    }
  }

  // 验证密码
  const passwordCheck = userValidators.validatePassword(formData.value.password)
  if (!passwordCheck.valid) {
    errors.value.password = passwordCheck.message || ''
    isValid = false
  }

  // 验证确认密码
  const confirmCheck = userValidators.validateConfirmPassword(
    formData.value.password,
    formData.value.confirmPassword,
  )
  if (!confirmCheck.valid) {
    errors.value.confirmPassword = confirmCheck.message || ''
    isValid = false
  }

  return isValid
}

// 处理注册
async function handleRegister() {
  if (!validateForm())
    return

  loading.value = true
  try {
    const response = await register({
      username: formData.value.username,
      email: formData.value.email,
      phone: formData.value.phone,
      password: formData.value.password,
      confirmPassword: formData.value.confirmPassword,
    })

    if (response) {
      showToast({
        msg: '注册成功，请登录',
      })

      // 延迟跳转到登录页
      setTimeout(() => {
        router.replace('/pages/login/index')
      }, 1500)
    }
  }
  catch (error: any) {
    console.error('注册失败:', error)
    // 处理 Supabase 错误格式
    const errorMsg = error?.error_description
      || error?.message
      || error?.error?.message
      || error?.msg
      || '注册失败，请稍后重试'
    showToast({
      msg: errorMsg,
    })
  }
  finally {
    loading.value = false
  }
}

// 跳转到登录页面
function goToLogin() {
  router.back()
}

// 返回上一页
function goBack() {
  router.back()
}
</script>

<template>
  <view class="min-h-screen bg-white px-60rpx py-60rpx">
    <!-- 返回按钮 -->
    <view class="mb-40rpx">
      <wd-icon name="arrow-left" size="40rpx" color="#333" @click="goBack" />
    </view>

    <!-- 标题 -->
    <view class="mb-60rpx">
      <text class="block text-48rpx text-gray-800 font-bold">
        创建账号
      </text>
      <text class="mt-16rpx block text-28rpx text-gray-500">
        注册以收藏你喜欢的菜谱
      </text>
    </view>

    <!-- 注册表单 -->
    <scroll-view scroll-y class="h-auto">
      <view class="space-y-32rpx">
        <!-- 用户名输入 -->
        <view>
          <text class="mb-16rpx block text-28rpx text-gray-700">
            用户名 <text class="text-red-500">
              *
            </text>
          </text>
          <wd-input
            v-model="formData.username"
            type="text"
            placeholder="请输入用户名（2-20个字符）"
            clearable
            custom-class="h-96rpx rounded-16rpx bg-gray-50 px-24rpx"
            @focus="errors.username = ''"
          />
          <text v-if="errors.username" class="mt-8rpx block text-24rpx text-red-500">
            {{ errors.username }}
          </text>
        </view>

        <!-- 邮箱输入 -->
        <view>
          <text class="mb-16rpx block text-28rpx text-gray-700">
            邮箱地址 <text class="text-red-500">
              *
            </text>
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
            密码 <text class="text-red-500">
              *
            </text>
          </text>
          <wd-input
            v-model="formData.password"
            placeholder="请输入密码（6-20个字符）"
            clearable
            show-password
            custom-class="h-96rpx rounded-16rpx bg-gray-50 px-24rpx"
            @focus="errors.password = ''"
          />
          <text v-if="errors.password" class="mt-8rpx block text-24rpx text-red-500">
            {{ errors.password }}
          </text>
        </view>

        <!-- 确认密码输入 -->
        <view>
          <text class="mb-16rpx block text-28rpx text-gray-700">
            确认密码 <text class="text-red-500">
              *
            </text>
          </text>
          <wd-input
            v-model="formData.confirmPassword"
            placeholder="请再次输入密码"
            clearable
            show-password
            custom-class="h-96rpx rounded-16rpx bg-gray-50 px-24rpx"
            @focus="errors.confirmPassword = ''"
          />
          <text v-if="errors.confirmPassword" class="mt-8rpx block text-24rpx text-red-500">
            {{ errors.confirmPassword }}
          </text>
        </view>

        <!-- 注册按钮 -->
        <wd-button
          type="primary"
          size="large"
          :loading="loading"
          custom-class="mt-60rpx h-96rpx rounded-48rpx"
          @click="handleRegister"
        >
          注册
        </wd-button>

        <!-- 登录入口 -->
        <view class="mt-40rpx pb-40rpx text-center">
          <text class="text-28rpx text-gray-500">
            已有账号？
          </text>
          <text class="text-primary ml-8rpx text-28rpx font-medium" @click="goToLogin">
            立即登录
          </text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.text-primary {
  color: #f6c042;
}
</style>
