import { alovaInstance } from '../core/instance'
import { SUPABASE_CONFIG, SUPABASE_REST_CONFIG } from '../../config/supabase'
import type { Recipe } from './recipe'

export interface Favorite {
  id: string
  user_id: string
  recipe_id: string
  created_at: string
  recipe?: Recipe
}

export interface FavoriteWithRecipe extends Favorite {
  recipe: Recipe
}

function getAuthHeaders() {
  return {
    'apikey': SUPABASE_CONFIG.anonKey,
    'Authorization': `Bearer ${uni.getStorageSync('session_token') || SUPABASE_CONFIG.anonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  }
}

export function addFavorite(recipeId: string) {
  const userId = uni.getStorageSync('user_id')
  if (!userId)
    throw new Error('用户未登录')

  return alovaInstance.Post<Favorite>('/rest/v1/favorites', {
    user_id: userId,
    recipe_id: recipeId,
  }, {
    headers: getAuthHeaders(),
  })
}

export function removeFavorite(recipeId: string) {
  const userId = uni.getStorageSync('user_id')
  if (!userId)
    throw new Error('用户未登录')

  return alovaInstance.Delete(`/rest/v1/favorites?user_id=eq.${userId}&recipe_id=eq.${recipeId}`, {
    headers: getAuthHeaders(),
  })
}

export function getUserFavorites() {
  const userId = uni.getStorageSync('user_id')
  if (!userId)
    throw new Error('用户未登录')

  return alovaInstance.Get<FavoriteWithRecipe[]>('/rest/v1/favorites', {
    params: {
      select: '*,recipe:recipes(*)',
      user_id: `eq.${userId}`,
      order: 'created_at.desc',
    },
    headers: getAuthHeaders(),
  })
}

export async function checkIsFavorite(recipeId: string): Promise<boolean> {
  const userId = uni.getStorageSync('user_id')
  if (!userId)
    return false

  try {
    const data = await alovaInstance.Get<Favorite[]>('/rest/v1/favorites', {
      params: {
        select: 'id',
        user_id: `eq.${userId}`,
        recipe_id: `eq.${recipeId}`,
        limit: 1,
      },
      headers: getAuthHeaders(),
    })
    return !!(data && data.length > 0)
  }
  catch {
    return false
  }
}

export function getFavoriteCount(recipeId: string) {
  return alovaInstance.Get<{ count: number }[]>('/rest/v1/favorites', {
    params: {
      select: 'id',
      recipe_id: `eq.${recipeId}`,
      count: 'exact',
    },
    headers: SUPABASE_REST_CONFIG.headers,
  })
}
