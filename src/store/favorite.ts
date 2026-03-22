import { defineStore } from 'pinia'
import { addFavorite, removeFavorite, getUserFavorites, checkIsFavorite, type FavoriteWithRecipe } from '../api/modules/favorite'
import { useUserStore } from './user'

interface FavoriteState {
  favorites: FavoriteWithRecipe[]
  favoriteIds: Set<string>
  loading: boolean
}

export const useFavoriteStore = defineStore('favorite', {
  state: (): FavoriteState => ({
    favorites: [],
    favoriteIds: new Set(),
    loading: false,
  }),

  getters: {
    isFavorite: (state) => (recipeId: string) => state.favoriteIds.has(recipeId),
    favoriteCount: (state) => state.favorites.length,
  },

  actions: {
    async loadUserFavorites() {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn)
        return

      this.loading = true
      try {
        const data = await getUserFavorites()
        if (data) {
          this.favorites = data
          this.favoriteIds = new Set(data.map(f => f.recipe_id))
        }
      }
      catch (error) {
        console.error('获取收藏列表失败:', error)
      }
      finally {
        this.loading = false
      }
    },

    async toggleFavorite(recipeId: string) {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return false
      }

      try {
        if (this.favoriteIds.has(recipeId)) {
          await removeFavorite(recipeId)
          this.favoriteIds.delete(recipeId)
          this.favorites = this.favorites.filter(f => f.recipe_id !== recipeId)
          uni.showToast({ title: '已取消收藏', icon: 'success' })
        }
        else {
          await addFavorite(recipeId)
          this.favoriteIds.add(recipeId)
          await this.loadUserFavorites()
          uni.showToast({ title: '收藏成功', icon: 'success' })
        }
        return true
      }
      catch (error) {
        console.error('收藏操作失败:', error)
        uni.showToast({ title: '操作失败', icon: 'error' })
        return false
      }
    },

    async checkFavoriteStatus(recipeId: string) {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn)
        return false

      try {
        const isFavorited = await checkIsFavorite(recipeId)
        if (isFavorited) {
          this.favoriteIds.add(recipeId)
        }
        return isFavorited
      }
      catch (error) {
        console.error('检查收藏状态失败:', error)
        return false
      }
    },

    clearFavorites() {
      this.favorites = []
      this.favoriteIds.clear()
    },
  },
})
