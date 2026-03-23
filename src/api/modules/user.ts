import { alovaInstance } from '../core/instance'
import { SUPABASE_CONFIG, SUPABASE_REST_CONFIG } from '../../config/supabase'

export interface User {
  id: string
  username: string
  phone?: string
  email?: string
  avatar_url?: string
  created_at: string
}

export interface AuthResponse {
  user: User | null
  session: string | null
  error?: string
}

export interface LoginParams {
  phone: string
  password: string
}

export interface RegisterParams {
  username: string
  phone: string
  password: string
}

export interface UpdateUserParams {
  username?: string
  avatar_url?: string
  phone?: string
}

function getAuthHeaders() {
  return {
    'apikey': SUPABASE_CONFIG.anonKey,
    'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
    'Content-Type': 'application/json',
  }
}

export function loginByPhone(phone: string, password: string) {
  return alovaInstance.Post<{ user: User, session: string }>('/auth/v1/token?grant_type=password', {
    phone,
    password,
  }, {
    headers: getAuthHeaders(),
  })
}

export function registerByPhone(username: string, phone: string, password: string) {
  return alovaInstance.Post<{ user: User }>('/auth/v1/signup', {
    username,
    phone,
    password,
  }, {
    headers: getAuthHeaders(),
  })
}

export function getCurrentUser() {
  return alovaInstance.Get<User>('/auth/v1/user', {
    headers: {
      ...getAuthHeaders(),
      'Authorization': `Bearer ${uni.getStorageSync('session_token') || SUPABASE_CONFIG.anonKey}`,
    },
  })
}

export function updateUserProfile(params: UpdateUserParams) {
  const userId = uni.getStorageSync('user_id')
  if (!userId) {
    throw new Error('用户未登录')
  }

  return alovaInstance.Patch<User[]>(`/rest/v1/users?id=eq.${userId}`, params, {
    headers: {
      ...SUPABASE_REST_CONFIG.headers,
      'Authorization': `Bearer ${uni.getStorageSync('session_token') || SUPABASE_CONFIG.anonKey}`,
      'Prefer': 'return=representation',
    },
  })
}

export function getUserProfile(userId: string) {
  return alovaInstance.Get<User[]>(`/rest/v1/users?id=eq.${userId}`, {
    params: {
      select: '*',
      limit: 1,
    },
    headers: SUPABASE_REST_CONFIG.headers,
  })
}

export function uploadAvatar(filePath: string, fileName: string) {
  const userId = uni.getStorageSync('user_id')
  return alovaInstance.Post<{ Key: string, url: string }>('/storage/v1/object/avatars/${userId}/${fileName}', {
    file: filePath,
  }, {
    headers: {
      'apikey': SUPABASE_CONFIG.anonKey,
      'Authorization': `Bearer ${uni.getStorageSync('session_token') || SUPABASE_CONFIG.anonKey}`,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    },
  })
}

export function getAvatarUrl(avatarPath: string) {
  if (!avatarPath)
    return ''
  if (avatarPath.startsWith('http'))
    return avatarPath
  return `${SUPABASE_CONFIG.url}/storage/v1/object/public/${avatarPath}`
}
