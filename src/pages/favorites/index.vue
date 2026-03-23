<script setup lang="ts">
import { useFavorites } from '../../composables/useFavorites'
import { useUserStore } from '../../store/user'
import type { FavoriteRecipe } from '../../types/user'

definePage({
  name: 'favorites',
  style: {
    navigationBarTitleText: '我的收藏',
  },
})

const router = useRouter()
const userStore = useUserStore()
const { show: showToast } = useGlobalToast()
const { show: showMessage } = useGlobalMessage()

// 收藏功能
const {
  loading,
  favorites,
  loadFavorites,
  removeFromFavorites,
  isLoggedIn,
} = useFavorites()

// 页面加载时获取收藏列表
onShow(() => {
  if (!userStore.isInitialized) {
    userStore.restoreFromStorage()
  }

  if (!isLoggedIn.value) {
    showToast({ msg: '请先登录' })
    router.replace('/pages/login/index')
    return
  }

  loadFavorites()
})

// 跳转到菜谱详情
function goToRecipeDetail(recipeId: string) {
  router.push({
    name: 'recipe-detail',
    params: { id: recipeId },
  })
}

// 取消收藏
async function handleRemoveFavorite(favorite: FavoriteRecipe, event: Event) {
  event.stopPropagation()

  showMessage({
    title: '取消收藏',
    msg: `确定要取消收藏「${favorite.recipe?.title || '这道菜'}」吗？`,
    type: 'confirm',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    confirm: async () => {
      const success = await removeFromFavorites(favorite.recipe_id)
      if (success) {
        showToast({ msg: '已取消收藏' })
      }
      else {
        showToast({ msg: '操作失败，请重试' })
      }
    },
  })
}
</script>

<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 空状态 -->
    <view v-if="!loading && favorites.length === 0" class="flex flex-col items-center justify-center pt-200rpx">
      <wd-icon name="star" size="120rpx" color="#ddd" />
      <text class="mt-40rpx text-32rpx text-gray-400">
        还没有收藏任何菜谱
      </text>
      <text class="mt-16rpx text-26rpx text-gray-400">
        去首页发现更多美食吧
      </text>
      <wd-button
        type="primary"
        size="small"
        custom-class="mt-60rpx"
        @click="router.push('/pages/index/index')"
      >
        去逛逛
      </wd-button>
    </view>

    <!-- 收藏列表 -->
    <scroll-view v-else scroll-y class="h-full">
      <view class="p-24rpx">
        <!-- 加载状态 -->
        <view v-if="loading" class="space-y-24rpx">
          <view
            v-for="n in 3"
            :key="n"
            class="flex items-center rounded-24rpx bg-white p-24rpx"
          >
            <wd-skeleton :row-col="[{ size: '160rpx', type: 'rect' }]" animation="gradient" />
            <view class="ml-24rpx flex-1">
              <wd-skeleton :row-col="[{ width: '60%', height: '36rpx' }]" animation="gradient" />
              <wd-skeleton :row-col="[{ width: '40%', height: '28rpx', marginTop: '16rpx' }]" animation="gradient" />
            </view>
          </view>
        </view>

        <!-- 列表内容 -->
        <view v-else class="space-y-24rpx">
          <view
            v-for="favorite in favorites"
            :key="favorite.id"
            class="flex items-center rounded-24rpx bg-white p-24rpx shadow-sm"
            @click="goToRecipeDetail(favorite.recipe_id)"
          >
            <!-- 菜谱封面 -->
            <image
              :src="favorite.recipe?.cover_image || '/static/default-recipe.png'"
              class="h-160rpx w-160rpx rounded-16rpx bg-gray-100"
              mode="aspectFill"
            />

            <!-- 菜谱信息 -->
            <view class="ml-24rpx flex-1">
              <text class="line-clamp-1 block text-32rpx text-gray-800 font-bold">
                {{ favorite.recipe?.title || '未知菜谱' }}
              </text>
              <text class="mt-12rpx block text-26rpx text-gray-500">
                {{ favorite.recipe?.category || '其他' }}
              </text>
              <text class="mt-8rpx block text-22rpx text-gray-400">
                {{ new Date(favorite.created_at).toLocaleDateString() }} 收藏
              </text>
            </view>

            <!-- 取消收藏按钮 -->
            <view
              class="h-64rpx w-64rpx flex items-center justify-center rounded-full bg-red-50"
              @click="handleRemoveFavorite(favorite, $event)"
            >
              <wd-icon name="delete" size="32rpx" color="#ef4444" />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
