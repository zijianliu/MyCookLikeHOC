/**
 * 用户状态管理 Store
 * 使用 Pinia 管理用户登录状态、信息和收藏
 */
import { defineStore } from 'pinia'
import type { FavoriteRecipe, User } from '../types/user'

interface UserState {
  // 用户信息
  user: User | null
  // 登录令牌
  token: string | null
  // 令牌过期时间
  expiresAt: string | null
  // 收藏列表
  favorites: FavoriteRecipe[]
  // 收藏ID集合（用于快速查询）
  favoriteIds: Set<string>
  // 是否已初始化
  isInitialized: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    token: null,
    expiresAt: null,
    favorites: [],
    favoriteIds: new Set(),
    isInitialized: false,
  }),

  getters: {
    // 是否已登录
    isLoggedIn: (state): boolean => {
      if (!state.token || !state.user)
        return false
      // 检查令牌是否过期
      if (state.expiresAt) {
        return new Date(state.expiresAt) > new Date()
      }
      return true
    },

    // 获取用户ID
    userId: (state): string | null => state.user?.id || null,

    // 获取用户头像（带默认头像）
    userAvatar: (state): string => {
      return state.user?.avatar || '/static/default-avatar.png'
    },

    // 获取用户昵称/用户名
    displayName: (state): string => {
      return state.user?.nickname || state.user?.username || '未登录'
    },

    // 是否已收藏某菜谱
    isFavorite: state => (recipeId: string): boolean => {
      return state.favoriteIds.has(recipeId)
    },

    // 收藏数量
    favoriteCount: (state): number => state.favorites.length,
  },

  actions: {
    /**
     * 设置用户信息（登录成功时调用）
     */
    setUserInfo(user: User, token: string, expiresAt?: string) {
      this.user = user
      this.token = token
      this.expiresAt = expiresAt || null
      this.isInitialized = true

      // 保存到本地存储
      uni.setStorageSync('user_token', token)
      uni.setStorageSync('user_info', JSON.stringify(user))
      if (expiresAt) {
        uni.setStorageSync('token_expires', expiresAt)
      }
    },

    /**
     * 从本地存储恢复登录状态
     */
    restoreFromStorage(): boolean {
      try {
        const token = uni.getStorageSync('user_token')
        const userStr = uni.getStorageSync('user_info')
        const expiresAt = uni.getStorageSync('token_expires')

        if (token && userStr) {
          const user = JSON.parse(userStr)
          this.user = user
          this.token = token
          this.expiresAt = expiresAt || null
          this.isInitialized = true

          // 检查令牌是否过期
          if (expiresAt && new Date(expiresAt) <= new Date()) {
            this.logout()
            return false
          }
          return true
        }
      }
      catch (error) {
        console.error('恢复登录状态失败:', error)
      }
      this.isInitialized = true
      return false
    },

    /**
     * 更新用户信息
     */
    updateUserInfo(userInfo: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...userInfo }
        uni.setStorageSync('user_info', JSON.stringify(this.user))
      }
    },

    /**
     * 更新头像
     */
    updateAvatar(avatarUrl: string) {
      if (this.user) {
        this.user.avatar = avatarUrl
        uni.setStorageSync('user_info', JSON.stringify(this.user))
      }
    },

    /**
     * 退出登录
     */
    logout() {
      this.user = null
      this.token = null
      this.expiresAt = null
      this.favorites = []
      this.favoriteIds.clear()

      // 清除本地存储
      uni.removeStorageSync('user_token')
      uni.removeStorageSync('user_info')
      uni.removeStorageSync('token_expires')
    },

    /**
     * 设置收藏列表
     */
    setFavorites(favorites: FavoriteRecipe[]) {
      this.favorites = favorites
      this.favoriteIds = new Set(favorites.map(f => f.recipe_id))
    },

    /**
     * 添加收藏
     */
    addFavorite(favorite: FavoriteRecipe) {
      this.favorites.unshift(favorite)
      this.favoriteIds.add(favorite.recipe_id)
    },

    /**
     * 移除收藏
     */
    removeFavorite(recipeId: string) {
      this.favorites = this.favorites.filter(f => f.recipe_id !== recipeId)
      this.favoriteIds.delete(recipeId)
    },

    /**
     * 清除过期状态
     */
    clearExpired() {
      if (this.expiresAt && new Date(this.expiresAt) <= new Date()) {
        this.logout()
      }
    },
  },
})
