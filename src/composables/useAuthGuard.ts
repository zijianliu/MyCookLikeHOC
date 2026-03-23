/**
 * 登录守卫组合式函数
 * 用于需要登录才能访问的页面
 */
import { useUserStore } from '../store/user'

export function useAuthGuard() {
  const router = useRouter()
  const userStore = useUserStore()
  const { show: showToast } = useGlobalToast()

  /**
   * 检查登录状态，未登录则跳转到登录页
   * @param redirect 登录成功后是否重定向回原页面
   * @returns 是否已登录
   */
  function checkAuth(redirect: boolean = true): boolean {
    // 确保已初始化
    if (!userStore.isInitialized) {
      userStore.restoreFromStorage()
    }

    // 检查登录状态
    if (!userStore.isLoggedIn) {
      showToast({ msg: '请先登录' })
      if (redirect) {
        router.push('/pages/login/index')
      }
      return false
    }

    // 检查令牌是否过期
    userStore.clearExpired()
    if (!userStore.isLoggedIn) {
      showToast({ msg: '登录已过期，请重新登录' })
      if (redirect) {
        router.push('/pages/login/index')
      }
      return false
    }

    return true
  }

  /**
   * 需要登录才能执行的操作
   * @param callback 登录后执行的回调函数
   */
  function requireAuth<T>(callback: () => T): T | undefined {
    if (checkAuth()) {
      return callback()
    }
    return undefined
  }

  /**
   * 跳转到登录页
   * @param redirectUrl 登录成功后重定向的地址
   */
  function goToLogin(redirectUrl?: string) {
    if (redirectUrl) {
      // 可以在这里存储重定向地址
      uni.setStorageSync('redirect_after_login', redirectUrl)
    }
    router.push('/pages/login/index')
  }

  return {
    checkAuth,
    requireAuth,
    goToLogin,
    isLoggedIn: () => userStore.isLoggedIn,
  }
}
