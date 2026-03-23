<script setup lang="ts">
import { useUserStore } from '../../store/user'
import { getAvatarUrl, getUserFavorites, uploadAvatar } from '../../api/modules/user'

definePage({
  name: 'profile',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '我的',
  },
})

const router = useRouter()
const userStore = useUserStore()
const { show: showToast } = useGlobalToast()
const { show: showMessage } = useGlobalMessage()

// 头像上传中状态
const uploadingAvatar = ref(false)

// 默认头像
const defaultAvatar = '/static/default-avatar.png'

// 菜单列表
const menuList = [
  {
    title: '我的收藏',
    icon: 'star',
    path: '/pages/favorites/index',
    badge: computed(() => userStore.favoriteCount > 0 ? userStore.favoriteCount : undefined),
  },
  {
    title: '编辑资料',
    icon: 'edit',
    path: '/pages/profile/edit',
  },
  {
    title: '关于我们',
    icon: 'info',
    path: '/pages/about/index',
  },
]

// 检查登录状态
onShow(() => {
  if (!userStore.isInitialized) {
    userStore.restoreFromStorage()
  }
  // 如果已登录，加载收藏列表
  if (userStore.isLoggedIn && userStore.token) {
    loadFavorites()
  }
})

// 加载收藏列表
async function loadFavorites() {
  if (!userStore.userId || !userStore.token)
    return
  try {
    const favorites = await getUserFavorites(userStore.userId, userStore.token)
    userStore.setFavorites(favorites)
  }
  catch (error) {
    console.error('加载收藏失败:', error)
  }
}

// 处理头像上传
async function handleAvatarUpload() {
  if (!userStore.isLoggedIn) {
    showToast({ msg: '请先登录' })
    router.push('/pages/login/index')
    return
  }

  if (uploadingAvatar.value)
    return

  try {
    // 选择图片
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })

    const tempFilePath = res.tempFilePaths[0]
    const tempFile = Array.isArray(res.tempFiles) ? res.tempFiles[0] : res.tempFiles

    // 验证文件大小（限制2MB）
    if (tempFile.size && tempFile.size > 2 * 1024 * 1024) {
      showToast({ msg: '图片大小不能超过2MB' })
      return
    }

    uploadingAvatar.value = true

    // 生成文件名
    const fileExt = tempFilePath.split('.').pop() || 'jpg'
    const fileName = `${userStore.userId}_${Date.now()}.${fileExt}`

    // 上传头像
    if (!userStore.token) {
      showToast({ msg: '登录已过期，请重新登录' })
      return
    }

    const uploadRes = await uploadAvatar(tempFilePath, fileName, userStore.token)

    if (uploadRes.statusCode === 200) {
      // 获取头像URL
      const avatarUrl = getAvatarUrl(fileName)
      // 更新用户信息
      userStore.updateAvatar(avatarUrl)
      showToast({ msg: '头像上传成功' })
    }
    else {
      showToast({ msg: '头像上传失败' })
    }
  }
  catch (error: any) {
    if (error.errMsg && error.errMsg.includes('cancel')) {
      // 用户取消，不处理
      return
    }
    console.error('上传头像失败:', error)
    showToast({ msg: '上传失败，请重试' })
  }
  finally {
    uploadingAvatar.value = false
  }
}

// 跳转到登录页
function goToLogin() {
  router.push('/pages/login/index')
}

// 处理菜单点击
function handleMenuClick(item: typeof menuList[0]) {
  if (!userStore.isLoggedIn && item.path !== '/pages/about/index') {
    showToast({ msg: '请先登录' })
    router.push('/pages/login/index')
    return
  }
  router.push(item.path)
}

// 退出登录
function handleLogout() {
  showMessage({
    title: '确认退出',
    msg: '确定要退出登录吗？',
    type: 'confirm',
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    confirm: () => {
      userStore.logout()
      showToast({ msg: '已退出登录' })
    },
  })
}

// 编辑资料
function goToEditProfile() {
  if (!userStore.isLoggedIn) {
    showToast({ msg: '请先登录' })
    router.push('/pages/login/index')
    return
  }
  router.push('/pages/profile/edit')
}
</script>

<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 用户信息卡片 -->
    <view class="from-primary to-primary-light relative overflow-hidden bg-gradient-to-b px-40rpx pb-60rpx pt-80rpx">
      <!-- 背景装饰 -->
      <view class="absolute right-0 top-0 h-200rpx w-200rpx rounded-full bg-white opacity-10" />
      <view class="absolute bottom-40rpx left-40rpx h-100rpx w-100rpx rounded-full bg-white opacity-10" />

      <!-- 用户信息 -->
      <view class="relative flex items-center">
        <!-- 头像 -->
        <view class="relative" @click="handleAvatarUpload">
          <image
            :src="userStore.userAvatar || defaultAvatar"
            class="h-140rpx w-140rpx border-4 border-white rounded-full bg-white"
            mode="aspectFill"
          />
          <view v-if="uploadingAvatar" class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <wd-loading color="#fff" size="40rpx" />
          </view>
          <view class="absolute h-48rpx w-48rpx flex items-center justify-center rounded-full bg-white shadow-md -bottom-4 -right-4">
            <wd-icon name="camera" size="24rpx" color="#666" />
          </view>
        </view>

        <!-- 用户信息 -->
        <view class="ml-32rpx flex-1">
          <template v-if="userStore.isLoggedIn">
            <text class="block text-40rpx text-white font-bold">
              {{ userStore.displayName }}
            </text>
            <text class="mt-8rpx block text-26rpx text-white/80">
              {{ userStore.user?.email || userStore.user?.phone || '' }}
            </text>
          </template>
          <template v-else>
            <text class="block text-40rpx text-white font-bold" @click="goToLogin">
              点击登录
            </text>
            <text class="mt-8rpx block text-26rpx text-white/80">
              登录后收藏喜欢的菜谱
            </text>
          </template>
        </view>

        <!-- 编辑按钮 -->
        <wd-icon
          v-if="userStore.isLoggedIn"
          name="edit"
          size="40rpx"
          color="rgba(255,255,255,0.8)"
          @click="goToEditProfile"
        />
      </view>

      <!-- 统计信息 -->
      <view v-if="userStore.isLoggedIn" class="mt-40rpx flex justify-around">
        <view class="text-center" @click="handleMenuClick(menuList[0])">
          <text class="block text-40rpx text-white font-bold">
            {{ userStore.favoriteCount }}
          </text>
          <text class="mt-4rpx block text-24rpx text-white/80">
            收藏
          </text>
        </view>
        <view class="text-center">
          <text class="block text-40rpx text-white font-bold">
            0
          </text>
          <text class="mt-4rpx block text-24rpx text-white/80">
            浏览
          </text>
        </view>
        <view class="text-center">
          <text class="block text-40rpx text-white font-bold">
            0
          </text>
          <text class="mt-4rpx block text-24rpx text-white/80">
            点赞
          </text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="rounded-t-40rpx bg-gray-50 px-24rpx pt-40rpx -mt-40rpx">
      <wd-cell-group border custom-class="rounded-24rpx overflow-hidden bg-white">
        <wd-cell
          v-for="item in menuList"
          :key="item.path"
          :title="item.title"
          :value="item.badge?.value"
          is-link
          @click="handleMenuClick(item)"
        >
          <template #icon>
            <view class="bg-primary/10 mr-16rpx h-72rpx w-72rpx flex items-center justify-center rounded-16rpx">
              <wd-icon :name="item.icon" size="36rpx" color="#f6c042" />
            </view>
          </template>
        </wd-cell>
      </wd-cell-group>

      <!-- 退出登录按钮 -->
      <wd-button
        v-if="userStore.isLoggedIn"
        type="primary"
        size="large"
        plain
        custom-class="mt-60rpx h-96rpx rounded-48rpx"
        @click="handleLogout"
      >
        退出登录
      </wd-button>

      <!-- 登录按钮 -->
      <wd-button
        v-else
        type="primary"
        size="large"
        custom-class="mt-60rpx h-96rpx rounded-48rpx"
        @click="goToLogin"
      >
        立即登录
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.bg-gradient-to-b {
  background: linear-gradient(180deg, #f6c042 0%, #f9d71c 100%);
}

.from-primary {
  --tw-gradient-from: #f6c042;
}

.to-primary-light {
  --tw-gradient-to: #f9d71c;
}

.bg-primary\/10 {
  background-color: rgba(246, 192, 66, 0.1);
}

.bg-primary {
  background-color: #f6c042;
}
</style>
