<script setup lang="ts">
import { useUserStore } from '../../store/user'
import { useFavoriteStore } from '../../store/favorite'

definePage({
  name: 'profile',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '我的',
  },
})

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()

const showLoginDialog = ref(false)

onMounted(async () => {
  await userStore.checkLoginStatus()
  if (userStore.isLoggedIn) {
    await favoriteStore.loadUserFavorites()
  }
})

function goToLogin() {
  router.push({ name: 'login' })
}

function goToRegister() {
  router.push({ name: 'register' })
}

function goToEditProfile() {
  router.push({ name: 'edit-profile' })
}

function goToMyFavorites() {
  if (!userStore.isLoggedIn) {
    uni.showModal({
      title: '提示',
      content: '请先登录后查看收藏',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          goToLogin()
        }
      },
    })
    return
  }
  router.push({ name: 'my-favorites' })
}

async function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    confirmText: '确定',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        await userStore.logout()
        favoriteStore.clearFavorites()
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    },
  })
}

const defaultAvatar = '/static/logo.png'
</script>

<template>
  <view class="min-h-100% bg-gray-50">
    <view v-if="!userStore.isLoggedIn" class="flex flex-col items-center pt-20">
      <image src="/static/logo.png" class="h-24 w-24" mode="aspectFit" />
      <text class="mt-4 text-4 text-gray-600">登录后享受更多功能</text>
      <view class="mt-8 flex gap-4">
        <wd-button type="primary" size="medium" round custom-class="bg-orange-500! border-none!" @click="goToLogin">
          登录
        </wd-button>
        <wd-button type="info" size="medium" round @click="goToRegister">
          注册
        </wd-button>
      </view>
    </view>

    <view v-else>
      <view class="bg-gradient-to-b from-orange-400 to-orange-500 px-4 pt-12 pb-8">
        <view class="flex items-center gap-4">
          <view class="relative">
            <image
              :src="userStore.avatarUrl || defaultAvatar"
              class="h-20 w-20 rounded-full bg-white"
              mode="aspectFill"
            />
          </view>
          <view class="flex-1">
            <text class="text-5 text-white font-bold">{{ userStore.username }}</text>
            <text class="mt-1 block text-3 text-orange-100">ID: {{ userStore.userId }}</text>
          </view>
          <wd-button type="info" size="small" round plain @click="goToEditProfile">
            编辑
          </wd-button>
        </view>
      </view>

      <view class="mx-3 -mt-4 rounded-2 bg-white p-4 shadow-sm">
        <view class="flex justify-around">
          <view class="flex flex-col items-center" @click="goToMyFavorites">
            <text class="text-5 text-gray-800 font-bold">{{ favoriteStore.favoriteCount }}</text>
            <text class="mt-1 text-2.5 text-gray-500">收藏</text>
          </view>
        </view>
      </view>

      <view class="mx-3 mt-4">
        <wd-cell-group border custom-class="rounded-2! overflow-hidden">
          <wd-cell
            title="我的收藏"
            title-width="200px"
            is-link
            @click="goToMyFavorites"
          />
          <wd-cell
            title="编辑资料"
            title-width="200px"
            is-link
            @click="goToEditProfile"
          />
        </wd-cell-group>
      </view>

      <view class="mx-3 mt-4">
        <wd-cell-group border custom-class="rounded-2! overflow-hidden">
          <wd-cell
            title="退出登录"
            title-width="200px"
            is-link
            @click="handleLogout"
          />
        </wd-cell-group>
      </view>
    </view>
  </view>
</template>
