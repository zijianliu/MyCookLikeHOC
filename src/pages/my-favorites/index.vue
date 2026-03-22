<script setup lang="ts">
import { useUserStore } from '../../store/user'
import { useFavoriteStore } from '../../store/favorite'
import { applyImagePreset } from '../../utils/image'
import type { Recipe } from '../../api/modules/recipe'

definePage({
  name: 'my-favorites',
  style: {
    navigationBarTitleText: '我的收藏',
  },
})

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      router.replace({ name: 'login' })
    }, 1500)
    return
  }

  await favoriteStore.loadUserFavorites()
})

function goToRecipeDetail(recipe: Recipe) {
  router.push({
    name: 'recipe-detail',
    params: { id: encodeURIComponent(recipe.id) },
  })
}

async function handleRemoveFavorite(recipeId: string, event: Event) {
  event.stopPropagation()
  uni.showModal({
    title: '提示',
    content: '确定要取消收藏吗？',
    confirmText: '确定',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        await favoriteStore.toggleFavorite(recipeId)
      }
    },
  })
}

function onRefresh() {
  favoriteStore.loadUserFavorites()
}
</script>

<template>
  <view class="min-h-100% bg-gray-50">
    <view v-if="!userStore.isLoggedIn" class="flex flex-col items-center pt-20">
      <text class="text-4 text-gray-500">请先登录</text>
    </view>

    <view v-else-if="favoriteStore.favorites.length === 0" class="flex flex-col items-center pt-20">
      <text class="text-6">🍽️</text>
      <text class="mt-4 text-4 text-gray-500">暂无收藏菜谱</text>
      <text class="mt-2 text-3 text-gray-400">快去收藏喜欢的菜谱吧</text>
    </view>

    <view v-else class="px-32rpx py-32rpx">
      <view class="space-y-24rpx">
        <view
          v-for="item in favoriteStore.favorites"
          :key="item.id"
          class="flex overflow-hidden rounded-16rpx bg-white"
          @click="goToRecipeDetail(item.recipe)"
        >
          <view class="h-200rpx w-200rpx flex items-center justify-center bg-gray-100">
            <image
              v-if="item.recipe?.cover_image"
              :src="applyImagePreset(item.recipe.cover_image, 'RECIPE_COVER')"
              class="h-full w-full object-cover"
              mode="aspectFill"
              :lazy-load="true"
            />
            <text v-else class="text-48rpx">🍽️</text>
          </view>

          <view class="flex-1 p-24rpx">
            <view class="flex items-start justify-between">
              <text class="mb-8rpx mr-2 flex-1 text-28rpx text-gray-800 font-medium line-clamp-1">
                {{ item.recipe?.title || '未知菜谱' }}
              </text>
              <wd-icon
                name="star-fill"
                size="18"
                color="#E17944"
                @click="handleRemoveFavorite(item.recipe_id, $event)"
              />
            </view>
            <text class="mb-12rpx block text-24rpx text-gray-500">
              {{ item.recipe?.category || '' }}
            </text>
            <text class="line-clamp-2 text-24rpx text-gray-600">
              {{ item.recipe?.ingredients?.slice(0, 50) || '' }}...
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
