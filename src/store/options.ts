import { defineStore } from 'pinia'
import { store } from '.'

// 一些保存在前端的配置
export const useStore = defineStore(
  'options',
  () => {
    return {}
  },
  {
    persist: true,
  }
)

export function useStoreOptions() {
  return useStore(store)
}
