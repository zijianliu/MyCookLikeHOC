/**
 * 用户相关 API 模块
 * 包含登录、注册、用户信息管理等功能
 */
import { alovaInstance } from '../core/instance'
import { SUPABASE_REST_CONFIG } from '../../config/supabase'
import type { FavoriteRecipe, LoginParams, LoginResponse, RegisterParams, UpdateUserParams, User } from '../../types/user'

// API响应类型
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

/**
 * 用户注册
 * @param params 注册参数
 */
export function register(params: RegisterParams) {
  // 使用 Supabase Auth API 进行注册
  return alovaInstance.Post<User>(`/auth/v1/signup`, {
    email: params.email,
    password: params.password,
    data: {
      username: params.username,
      phone: params.phone,
    },
  }, {
    headers: {
      'apikey': SUPABASE_REST_CONFIG.headers.apikey,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * 用户登录
 * @param params 登录参数（支持手机号或邮箱）
 */
export function login(params: LoginParams) {
  // 使用 Supabase Auth API 进行登录
  return alovaInstance.Post<LoginResponse>(`/auth/v1/token?grant_type=password`, {
    email: params.email,
    password: params.password,
  }, {
    headers: {
      'apikey': SUPABASE_REST_CONFIG.headers.apikey,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * 获取当前用户信息
 * @param token 访问令牌
 */
export function getCurrentUser(token: string) {
  return alovaInstance.Get<User>(`/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_REST_CONFIG.headers.apikey,
      Authorization: `Bearer ${token}`,
    },
  })
}

/**
 * 刷新令牌
 * @param refreshToken 刷新令牌
 */
export function refreshToken(refreshToken: string) {
  return alovaInstance.Post<{ token: string, expires_at: string }>(`/auth/v1/token?grant_type=refresh_token`, {
    refresh_token: refreshToken,
  }, {
    headers: {
      'apikey': SUPABASE_REST_CONFIG.headers.apikey,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * 退出登录
 * @param token 访问令牌
 */
export function logout(token: string) {
  return alovaInstance.Post(`/auth/v1/logout`, {}, {
    headers: {
      'apikey': SUPABASE_REST_CONFIG.headers.apikey,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * 更新用户信息
 * @param userId 用户ID
 * @param params 更新参数
 * @param token 访问令牌
 */
export function updateUserInfo(userId: string, params: UpdateUserParams, token: string) {
  return alovaInstance.Patch<User[]>(`/rest/v1/users?id=eq.${userId}`, params, {
    headers: {
      ...SUPABASE_REST_CONFIG.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

/**
 * 上传头像
 * 使用 Supabase Storage 存储头像
 * @param filePath 本地文件路径
 * @param fileName 文件名
 * @param token 访问令牌
 */
export function uploadAvatar(filePath: string, fileName: string, token: string) {
  // 上传文件到 Supabase Storage
  return uni.uploadFile({
    url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/avatars/${fileName}`,
    filePath,
    name: 'file',
    header: {
      'Authorization': `Bearer ${token}`,
      'x-upsert': 'true',
    },
  })
}

/**
 * 获取头像公开访问URL
 * @param fileName 文件名
 */
export function getAvatarUrl(fileName: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`
}

/**
 * 获取用户收藏列表
 * @param userId 用户ID
 * @param token 访问令牌
 */
export function getUserFavorites(userId: string, token: string) {
  return alovaInstance.Get<FavoriteRecipe[]>(`/rest/v1/favorites?user_id=eq.${userId}&select=*,recipe:recipes(id,title,cover_image,category)`, {
    headers: {
      ...SUPABASE_REST_CONFIG.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

/**
 * 添加收藏
 * @param userId 用户ID
 * @param recipeId 菜谱ID
 * @param token 访问令牌
 */
export function addFavorite(userId: string, recipeId: string, token: string) {
  return alovaInstance.Post<FavoriteRecipe[]>(`/rest/v1/favorites`, {
    user_id: userId,
    recipe_id: recipeId,
  }, {
    headers: {
      ...SUPABASE_REST_CONFIG.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

/**
 * 取消收藏
 * @param userId 用户ID
 * @param recipeId 菜谱ID
 * @param token 访问令牌
 */
export function removeFavorite(userId: string, recipeId: string, token: string) {
  return alovaInstance.Delete(`/rest/v1/favorites?user_id=eq.${userId}&recipe_id=eq.${recipeId}`, {
    headers: {
      ...SUPABASE_REST_CONFIG.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

/**
 * 检查是否已收藏
 * @param userId 用户ID
 * @param recipeId 菜谱ID
 * @param token 访问令牌
 */
export function checkFavorite(userId: string, recipeId: string, token: string) {
  return alovaInstance.Get<FavoriteRecipe[]>(`/rest/v1/favorites?user_id=eq.${userId}&recipe_id=eq.${recipeId}&select=*`, {
    headers: {
      ...SUPABASE_REST_CONFIG.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

/**
 * 表单验证工具函数
 */
export const userValidators = {
  /**
   * 验证用户名
   */
  validateUsername(username: string): { valid: boolean, message?: string } {
    if (!username || username.trim().length === 0) {
      return { valid: false, message: '用户名不能为空' }
    }
    if (username.length < 2 || username.length > 20) {
      return { valid: false, message: '用户名长度应在2-20个字符之间' }
    }
    if (!/^[\u4E00-\u9FA5\w]+$/.test(username)) {
      return { valid: false, message: '用户名只能包含中文、字母、数字和下划线' }
    }
    return { valid: true }
  },

  /**
   * 验证手机号
   */
  validatePhone(phone: string): { valid: boolean, message?: string } {
    if (!phone || phone.trim().length === 0) {
      return { valid: false, message: '手机号不能为空' }
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return { valid: false, message: '请输入正确的手机号' }
    }
    return { valid: true }
  },

  /**
   * 验证邮箱
   */
  validateEmail(email: string): { valid: boolean, message?: string } {
    if (!email || email.trim().length === 0) {
      return { valid: false, message: '邮箱不能为空' }
    }
    if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email)) {
      return { valid: false, message: '请输入正确的邮箱地址' }
    }
    return { valid: true }
  },

  /**
   * 验证密码
   */
  validatePassword(password: string): { valid: boolean, message?: string } {
    if (!password || password.length === 0) {
      return { valid: false, message: '密码不能为空' }
    }
    if (password.length < 6 || password.length > 20) {
      return { valid: false, message: '密码长度应在6-20个字符之间' }
    }
    return { valid: true }
  },

  /**
   * 验证确认密码
   */
  validateConfirmPassword(password: string, confirmPassword: string): { valid: boolean, message?: string } {
    if (!confirmPassword || confirmPassword.length === 0) {
      return { valid: false, message: '请确认密码' }
    }
    if (password !== confirmPassword) {
      return { valid: false, message: '两次输入的密码不一致' }
    }
    return { valid: true }
  },

  /**
   * 验证注册表单
   */
  validateRegisterForm(params: RegisterParams): { valid: boolean, message?: string } {
    // 验证用户名
    const usernameCheck = this.validateUsername(params.username)
    if (!usernameCheck.valid)
      return usernameCheck

    // 验证手机号或邮箱（至少填一个）
    if (!params.phone && !params.email) {
      return { valid: false, message: '请填写手机号或邮箱' }
    }
    if (params.phone) {
      const phoneCheck = this.validatePhone(params.phone)
      if (!phoneCheck.valid)
        return phoneCheck
    }
    if (params.email) {
      const emailCheck = this.validateEmail(params.email)
      if (!emailCheck.valid)
        return emailCheck
    }

    // 验证密码
    const passwordCheck = this.validatePassword(params.password)
    if (!passwordCheck.valid)
      return passwordCheck

    // 验证确认密码
    const confirmCheck = this.validateConfirmPassword(params.password, params.confirmPassword)
    if (!confirmCheck.valid)
      return confirmCheck

    return { valid: true }
  },

  /**
   * 验证登录表单
   */
  validateLoginForm(params: LoginParams): { valid: boolean, message?: string } {
    if (!params.email && !params.phone) {
      return { valid: false, message: '请填写邮箱或手机号' }
    }
    if (params.email) {
      const emailCheck = this.validateEmail(params.email)
      if (!emailCheck.valid)
        return emailCheck
    }
    if (params.phone) {
      const phoneCheck = this.validatePhone(params.phone)
      if (!phoneCheck.valid)
        return phoneCheck
    }

    const passwordCheck = this.validatePassword(params.password)
    if (!passwordCheck.valid)
      return passwordCheck

    return { valid: true }
  },
}
