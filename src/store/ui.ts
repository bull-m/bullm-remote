import { defineStore } from 'pinia'
import { store } from '.'
import { useStorePlugin } from '@/store/plugin.ts'
import { useStoreWalk } from '@/store/control/walk.ts'
import { useStoreChassis } from '@/store/modules/chassis.ts'
import { executePromisesInSequence } from '@/utils'
import { useStoreDog } from '@/store/link/dog.ts'
import { useStoreCamera } from '@/store/modules/camera.ts'

export const useStore = defineStore(
  'ui',
  () => {
    const showSetup = ref(false)

    // 是否在控制页面
    const isControl = computed(() => {
      return !showSetup.value
    })

    const theme = ref('dark' as 'light' | 'dark')

    watch(
      theme,
      newVal => {
        document.documentElement.setAttribute('theme', newVal)
      },
      { immediate: true }
    )

    const setup = ref({
      noOverlay: false, // 是否隐藏mark层
    })

    function init() {
      return Promise.resolve()
    }
    function clear() {
      showSetup.value = false
    }

    return {
      showSetup,
      isControl,
      init,
      clear,
      theme,
      setup,
    }
  },
  {
    // 开启持久化
    persist: {
      pick: ['theme'],
    },
  }
)

export function useStoreUi() {
  return useStore(store)
}
