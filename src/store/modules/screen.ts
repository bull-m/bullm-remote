import { defineStore } from 'pinia'
import { store } from '../index.ts'
import { ref, WatchHandle } from 'vue'
import { CarGetOptionToObj, CarRemoveOption, CarSetOption } from '@/utils/car/options.ts'
import { useStoreLink } from '@/store/link'
import { fieldsFilter, mapTo } from '@/utils'
import { OPTIONS } from '@/constants'

// 屏幕有关
export const useStore = defineStore(
  'screen',
  () => {
    const option = ref({
      enable: false,
      address: 0x3c,
      logo: [] as number[],
      module: [] as {
        type: number
        size: number | undefined // 占用的行数
        prefix: string
        delay: number | undefined
      }[],
    })

    const def_logo = [
      3, 255, 255, 192, 15, 255, 255, 240, 31, 255, 255, 248, 63, 255, 255, 252, 127, 255, 255, 254, 126, 31, 248, 126, 252, 31, 248, 63, 252, 31,
      248, 63, 252, 0, 0, 63, 252, 0, 0, 63, 252, 30, 120, 63, 252, 30, 120, 63, 252, 30, 120, 63, 255, 254, 127, 255, 255, 254, 127, 255, 255, 254,
      127, 255, 255, 254, 127, 255, 255, 254, 127, 255, 255, 254, 127, 255, 252, 30, 120, 63, 252, 30, 120, 63, 252, 30, 120, 63, 252, 0, 0, 63, 252,
      0, 0, 63, 252, 31, 248, 63, 252, 31, 248, 63, 126, 31, 248, 126, 127, 255, 255, 254, 63, 255, 255, 252, 31, 255, 255, 248, 15, 255, 255, 240, 3,
      255, 255, 192,
    ]

    let WatchHandle: WatchHandle

    async function init() {
      clear()
      if (!useStoreLink().isLink) return Promise.reject()
      option.value = (await CarGetOptionToObj(OPTIONS.SCREEN)) ?? {
        address: 0x3c,
        logo: def_logo,
        module: [],
      }
      WatchHandle = watch(
        option,
        val => {
          const new_val = fieldsFilter(val, 'enable', 'address', 'logo', 'module')
          CarSetOption(OPTIONS.SCREEN, new_val).then(_ => showToast('保存成功'))
        },
        { deep: true }
      )
    }

    function clear() {
      if (WatchHandle) WatchHandle()
    }

    async function reset() {
      await showConfirmDialog({
        title: '提示',
        message: '确认要重置此项设置为小车自带的设置吗？',
      })
      clear()
      await CarRemoveOption(OPTIONS.SCREEN)
      await init()
      showToast('重置成功')
    }
    return {
      init,
      clear,
      reset,
      option,
    }
  },
  {
    // 开启持久化
    persist: false,
  }
)

export function useStoreScreen() {
  return useStore(store)
}
