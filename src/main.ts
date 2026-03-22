import { createSSRApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'uno.css'
import { useUserStore } from './store/user'

const pinia = createPinia()
pinia.use(persistPlugin)

export function createApp() {
  const app = createSSRApp(App)
  app.use(router)
  app.use(pinia)

  const userStore = useUserStore()
  userStore.checkLoginStatus()

  return {
    app,
  }
}
