<script setup lang="ts">
import { useUserStore } from '../../store/user'
import { updateUserInfo, userValidators } from '../../api/modules/user'

definePage({
  name: 'profile-edit',
  style: {
    navigationBarTitleText: '编辑资料',
  },
})

const router = useRouter()
const userStore = useUserStore()
const { show: showToast } = useGlobalToast()

// 表单数据
const formData = ref({
  username: '',
  nickname: '',
  phone: '',
  email: '',
})

// 加载状态
const loading = ref(false)
const saving = ref(false)

// 错误信息
const errors = ref({
  username: '',
  nickname: '',
  phone: '',
  email: '',
})

// 初始化表单数据
onMounted(() => {
  if (!userStore.isLoggedIn) {
    showToast({ msg: '请先登录' })
    router.replace('/pages/login/index')
    return
  }

  // 填充当前用户信息
  formData.value = {
    username: userStore.user?.username || '',
    nickname: userStore.user?.nickname || '',
    phone: userStore.user?.phone || '',
    email: userStore.user?.email || '',
  }
})

// 清除错误
function clearErrors() {
  errors.value = {
    username: '',
    nickname: '',
    phone: '',
    email: '',
  }
}

// 验证表单
function validateForm(): boolean {
  clearErrors()
  let isValid = true

  // 验证用户名
  if (formData.value.username) {
    const usernameCheck = userValidators.validateUsername(formData.value.username)
    if (!usernameCheck.valid) {
      errors.value.username = usernameCheck.message || ''
      isValid = false
    }
  }

  // 验证手机号
  if (formData.value.phone) {
    const phoneCheck = userValidators.validatePhone(formData.value.phone)
    if (!phoneCheck.valid) {
      errors.value.phone = phoneCheck.message || ''
      isValid = false
    }
  }

  // 验证邮箱
  if (formData.value.email) {
    const emailCheck = userValidators.validateEmail(formData.value.email)
    if (!emailCheck.valid) {
      errors.value.email = emailCheck.message || ''
      isValid = false
    }
  }

  return isValid
}

// 保存资料
async function handleSave() {
  if (!validateForm()) return

  if (!userStore.userId || !userStore.token) {
    showToast({ msg: '登录已过期，请重新登录' })
    return
  }

  saving.value = true
  try {
    // 构建更新参数（只更新有变化的字段）
    const updateParams: any = {}
    if (formData.value.nickname !== userStore.user?.nickname) {
      updateParams.nickname = formData.value.nickname
    }
    if (formData.value.username !== userStore.user?.username) {
      updateParams.username = formData.value.username
    }

    // 如果没有变化，直接返回
    if (Object.keys(updateParams).length === 0) {
      showToast({ msg: '没有需要更新的内容' })
      router.back()
      return
    }

    await updateUserInfo(userStore.userId, updateParams, userStore.token)

    // 更新本地状态
    userStore.updateUserInfo(updateParams)

    showToast({ msg: '保存成功' })
    setTimeout(() => {
      router.back()
    }, 1500)
  }
  catch (error: any) {
    console.error('保存失败:', error)
    showToast({ msg: error?.message || '保存失败，请重试' })
  }
  finally {
    saving.value = false
  }
}

// 返回上一页
function goBack() {
  router.back()
}
</script>

<template>
  <view class="min-h-screen bg-gray-50 px-32rpx py-40rpx">
    <!-- 表单 -->
    <wd-cell-group border custom-class="rounded-24rpx overflow-hidden bg-white">
      <!-- 用户名 -->
      <wd-cell title="用户名" title-width="160rpx" center>
        <wd-input
          v-model="formData.username"
          type="text"
          placeholder="请输入用户名"
          clearable
          custom-class="text-right"
          @focus="errors.username = ''"
        />
      </wd-cell>

      <!-- 昵称 -->
      <wd-cell title="昵称" title-width="160rpx" center>
        <wd-input
          v-model="formData.nickname"
          type="text"
          placeholder="请输入昵称"
          clearable
          custom-class="text-right"
          @focus="errors.nickname = ''"
        />
      </wd-cell>

      <!-- 手机号（只读） -->
      <wd-cell title="手机号" title-width="160rpx" center>
        <text class="text-28rpx text-gray-500">
          {{ formData.phone || '未绑定' }}
        </text>
      </wd-cell>

      <!-- 邮箱（只读） -->
      <wd-cell title="邮箱" title-width="160rpx" center>
        <text class="text-28rpx text-gray-500">
          {{ formData.email || '未绑定' }}
        </text>
      </wd-cell>
    </wd-cell-group>

    <!-- 提示信息 -->
    <view class="mt-32rpx px-16rpx">
      <text class="text-24rpx text-gray-400">
        提示：手机号和邮箱暂不支持修改，如需修改请联系客服
      </text>
    </view>

    <!-- 保存按钮 -->
    <wd-button
      type="primary"
      size="large"
      :loading="saving"
      custom-class="mt-80rpx h-96rpx rounded-48rpx"
      @click="handleSave"
    >
      保存
    </wd-button>
  </view>
</template>

<style lang="scss" scoped>
:deep(.wd-cell__value) {
  flex: 1;
}
</style>
