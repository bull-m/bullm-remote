import { defineStore } from 'pinia'
import { store } from '.'

// 警告信息
export const useStore = defineStore(
  'warning',
  () => {
    const list = ref<
      {
        text: string
        type: 'error' | 'warning' | 'info'
        count: number
        delay?: number
        timer?: any
      }[]
    >([])

    function add(text: string, type: 'error' | 'warning' | 'info' = 'warning', delay = 5000) {
      const timer = setTimeout(() => {
        list.value = list.value.filter(x => x.text !== text)
      }, delay)
      // 是否重复
      const item = list.value.find(x => x.text === text)
      if (item) {
        item.count++
        clearTimeout(item.timer)
        item.timer = timer
        return
      }
      list.value.push({
        count: 1,
        text,
        type,
        delay,
        timer,
      })
    }

    return {
      list,
      add,
    }
  },
  {
    // 开启持久化
    persist: false,
  }
)

export function useStoreWarning() {
  return useStore(store)
}
