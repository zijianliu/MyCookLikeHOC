/**
 * 收藏功能组合式函数
 * 封装收藏相关的业务逻辑
 */
import { computed, ref } from 'vue'
import { useUserStore } from '../store/user'
import { addFavorite, checkFavorite, getUserFavorites, removeFavorite } from '../api/modules/user'

export function useFavorites() {
  const userStore = useUserStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 检查是否已登录
  const isLoggedIn = computed(() => userStore.isLoggedIn)

  /**
   * 加载用户收藏列表
   */
  async function loadFavorites(): Promise<boolean> {
    if (!userStore.isLoggedIn || !userStore.userId || !userStore.token) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      const favorites = await getUserFavorites(userStore.userId, userStore.token)
      userStore.setFavorites(favorites)
      return true
    }
    catch (err: any) {
      error.value = err?.message || '加载收藏失败'
      console.error('加载收藏失败:', err)
      return false
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 添加收藏
   * @param recipeId 菜谱ID
   */
  async function addToFavorites(recipeId: string): Promise<boolean> {
    if (!userStore.isLoggedIn || !userStore.userId || !userStore.token) {
      error.value = '请先登录'
      return false
    }

    // 检查是否已收藏
    if (userStore.isFavorite(recipeId)) {
      return true
    }

    loading.value = true
    error.value = null

    try {
      const result = await addFavorite(userStore.userId, recipeId, userStore.token)
      if (result && result.length > 0) {
        userStore.addFavorite(result[0])
        return true
      }
      return false
    }
    catch (err: any) {
      error.value = err?.message || '添加收藏失败'
      console.error('添加收藏失败:', err)
      return false
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 取消收藏
   * @param recipeId 菜谱ID
   */
  async function removeFromFavorites(recipeId: string): Promise<boolean> {
    if (!userStore.isLoggedIn || !userStore.userId || !userStore.token) {
      error.value = '请先登录'
      return false
    }

    loading.value = true
    error.value = null

    try {
      await removeFavorite(userStore.userId, recipeId, userStore.token)
      userStore.removeFavorite(recipeId)
      return true
    }
    catch (err: any) {
      error.value = err?.message || '取消收藏失败'
      console.error('取消收藏失败:', err)
      return false
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 切换收藏状态
   * @param recipeId 菜谱ID
   */
  async function toggleFavorite(recipeId: string): Promise<boolean> {
    if (userStore.isFavorite(recipeId)) {
      return await removeFromFavorites(recipeId)
    }
    else {
      return await addToFavorites(recipeId)
    }
  }

  /**
   * 检查是否已收藏
   * @param recipeId 菜谱ID
   */
  async function checkIsFavorite(recipeId: string): Promise<boolean> {
    if (!userStore.isLoggedIn || !userStore.userId || !userStore.token) {
      return false
    }

    try {
      const result = await checkFavorite(userStore.userId, recipeId, userStore.token)
      return result && result.length > 0
    }
    catch (err) {
      console.error('检查收藏状态失败:', err)
      return false
    }
  }

  /**
   * 检查是否需要登录
   */
  function checkLogin(): boolean {
    return userStore.isLoggedIn
  }

  return {
    // 状态
    loading,
    error,
    isLoggedIn,
    favorites: computed(() => userStore.favorites),
    favoriteIds: computed(() => userStore.favoriteIds),
    favoriteCount: computed(() => userStore.favoriteCount),
    isFavorite: (recipeId: string) => userStore.isFavorite(recipeId),

    // 方法
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    checkIsFavorite,
    checkLogin,
  }
}
