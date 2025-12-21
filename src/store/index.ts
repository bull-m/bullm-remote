import type { App } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
// import {LazyStore} form "@tauri-apps/plugin-store";
// const tauriStore = new LazyStore('pinia.bin');

export const store = createPinia()
store.use(
  createPersistedState({
    key: id => `store_${id}`,
    storage: {
      getItem: key => {
        return localStorage.getItem(key)
      },
      setItem: (key, value) => {
        localStorage.setItem(key, value)
      },
    },
  })
)

// 初始化方法
export function setupStore(app: App<Element>) {
  app.use(store)
}
