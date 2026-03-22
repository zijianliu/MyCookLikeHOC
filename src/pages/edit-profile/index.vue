<script setup lang="ts">
import { useUserStore } from '../../store/user'
import { useFavoriteStore } from '../../store/favorite'
import { alovaInstance } from '../../api/core/instance'
import { SUPABASE_CONFIG } from '../../config/supabase'

definePage({
  name: 'edit-profile',
  style: {
    navigationBarTitleText: '编辑资料',
  },
})

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()

const username = ref('')
const avatarUrl = ref('')
const uploading = ref(false)
const loading = ref(false)

const defaultAvatar = '/static/logo.png'

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      router.replace({ name: 'login' })
    }, 1500)
    return
  }

  username.value = userStore.user?.username || ''
  avatarUrl.value = userStore.avatarUrl || ''
})

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]

      const fileInfo = res.tempFiles[0] as any
      if (fileInfo.size > 5 * 1024 * 1024) {
        uni.showToast({ title: '图片大小不能超过5MB', icon: 'none' })
        return
      }

      uploading.value = true
      try {
        const fileName = `${userStore.userId}_${Date.now()}.jpg`
        const storagePath = `avatars/${userStore.userId}/${fileName}`

        const uploadUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/${storagePath}`
        const sessionToken = uni.getStorageSync('session_token') || SUPABASE_CONFIG.anonKey

        const uploadRes = await uni.uploadFile({
          url: uploadUrl,
          filePath: tempFilePath,
          name: 'file',
          header: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'image/jpeg',
            'x-upsert': 'true',
          },
        })

        const result = JSON.parse(uploadRes.data) as any
        if (result.Key || result.url) {
          const fullUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/public/${storagePath}`
          avatarUrl.value = fullUrl

          await userStore.updateProfile({ avatar_url: storagePath })
          uni.showToast({ title: '头像上传成功', icon: 'success' })
        }
        else {
          throw new Error('上传失败')
        }
      }
      catch (error: any) {
        console.error('上传头像失败:', error)
        uni.showToast({ title: error.message || '上传失败', icon: 'none' })
      }
      finally {
        uploading.value = false
      }
    },
    fail: () => {
      // 用户取消选择
    },
  })
}

async function handleSave() {
  if (!username.value.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  if (username.value.length < 2 || username.value.length > 20) {
    uni.showToast({ title: '昵称长度需在2-20位之间', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const result = await userStore.updateProfile({ username: username.value.trim() })
    if (result.success) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        router.back()
      }, 1500)
    }
    else {
      uni.showToast({ title: result.error || '保存失败', icon: 'none' })
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="min-h-100% bg-gray-50">
    <view class="mx-3 mt-4">
      <wd-cell-group border custom-class="rounded-2! overflow-hidden">
        <wd-cell custom-class="cell-pad">
          <view class="flex items-center gap-4">
            <text class="text-3 text-gray-600 w-16">头像</text>
            <view class="relative flex-1 flex justify-end">
              <view v-if="uploading" class="flex items-center gap-2">
                <wd-loading />
                <text class="text-2.5 text-gray-500">上传中...</text>
              </view>
              <image
                v-else
                :src="avatarUrl || defaultAvatar"
                class="h-16 w-16 rounded-full"
                mode="aspectFill"
                @click="chooseAvatar"
              />
            </view>
          </view>
        </wd-cell>

        <wd-cell custom-class="cell-pad">
          <view class="flex items-center gap-4">
            <text class="text-3 text-gray-600 w-16">昵称</text>
            <wd-input
              v-model="username"
              placeholder="请输入昵称"
              maxlength="20"
              clearable
              custom-class="flex-1"
            />
          </view>
        </wd-cell>
      </wd-cell-group>
    </view>

    <view class="mx-3 mt-4">
      <view class="rounded-2 bg-white p-4">
        <text class="text-2.5 text-gray-400">点击头像可更换图片</text>
      </view>
    </view>

    <view class="mx-3 mt-6">
      <wd-button
        type="primary"
        size="large"
        :loading="loading"
        custom-class="rounded-2! bg-orange-500! border-none!"
        @click="handleSave"
      >
        保存
      </wd-button>
    </view>
  </view>
</template>

<style scoped>
.cell-pad {
  padding: 12px 0;
}
</style>
