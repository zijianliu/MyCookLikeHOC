/**
 * 用户相关类型定义
 */

// 用户基础信息
export interface User {
  id: string
  username: string
  phone?: string
  email?: string
  avatar?: string
  nickname?: string
  created_at?: string
  updated_at?: string
}

// 登录请求参数
export interface LoginParams {
  phone?: string
  email?: string
  password: string
}

// 注册请求参数
export interface RegisterParams {
  username: string
  phone?: string
  email?: string
  password: string
  confirmPassword: string
}

// 登录响应
export interface LoginResponse {
  user: User
  token: string
  expires_at?: string
}

// 更新用户信息参数
export interface UpdateUserParams {
  username?: string
  nickname?: string
  avatar?: string
  phone?: string
  email?: string
}

// 收藏菜谱
export interface FavoriteRecipe {
  id: string
  user_id: string
  recipe_id: string
  created_at: string
  recipe?: {
    id: string
    title: string
    cover_image?: string
    category: string
  }
}

// 表单验证错误
export interface ValidationError {
  field: string
  message: string
}
