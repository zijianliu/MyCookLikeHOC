import { defineStore } from 'pinia'
import { getCurrentUser, getUserProfile, loginByPhone, registerByPhone, updateUserProfile, type User, type LoginParams, type RegisterParams } from '../api/modules/user'
import { getAvatarUrl } from '../api/modules/user'

interface UserState {
  user: User | null
  isLoggedIn: boolean
  sessionToken: string
  loading: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    isLoggedIn: false,
    sessionToken: '',
    loading: false,
  }),

  getters: {
    avatarUrl: (state) => {
      if (!state.user?.avatar_url)
        return ''
      return getAvatarUrl(state.user.avatar_url)
    },
    username: (state) => state.user?.username || '用户',
    userId: (state) => state.user?.id || '',
  },

  actions: {
    async login(params: LoginParams) {
      this.loading = true
      try {
        const res = await loginByPhone(params.phone, params.password)
        if (res.user) {
          this.user = res.user
          this.sessionToken = res.session || ''
          this.isLoggedIn = true
          uni.setStorageSync('session_token', this.sessionToken)
          uni.setStorageSync('user_id', res.user.id)
          return { success: true }
        }
        return { success: false, error: '登录失败' }
      }
      catch (error: any) {
        return { success: false, error: error.message || '登录失败，请检查手机号和密码' }
      }
      finally {
        this.loading = false
      }
    },

    async register(params: RegisterParams) {
      this.loading = true
      try {
        const res = await registerByPhone(params.username, params.phone, params.password)
        if (res.user) {
          this.user = res.user
          this.isLoggedIn = true
          uni.setStorageSync('user_id', res.user.id)
          return { success: true }
        }
        return { success: false, error: '注册失败' }
      }
      catch (error: any) {
        return { success: false, error: error.message || '注册失败，请稍后重试' }
      }
      finally {
        this.loading = false
      }
    },

    async logout() {
      this.user = null
      this.sessionToken = ''
      this.isLoggedIn = false
      uni.removeStorageSync('session_token')
      uni.removeStorageSync('user_id')
    },

    async fetchUserProfile() {
      const userId = uni.getStorageSync('user_id')
      if (!userId)
        return

      try {
        const data = await getUserProfile(userId)
        if (data && data.length > 0) {
          this.user = data[0]
          this.isLoggedIn = true
        }
      }
      catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },

    async checkLoginStatus() {
      const userId = uni.getStorageSync('user_id')
      const sessionToken = uni.getStorageSync('session_token')

      if (userId && sessionToken) {
        this.sessionToken = sessionToken
        await this.fetchUserProfile()
      }
    },

    async updateProfile(params: { username?: string; avatar_url?: string }) {
      try {
        const data = await updateUserProfile(params)
        if (data && data.length > 0) {
          this.user = data[0]
          return { success: true }
        }
        return { success: false, error: '更新失败' }
      }
      catch (error: any) {
        return { success: false, error: error.message || '更新失败' }
      }
    },
  },
})
