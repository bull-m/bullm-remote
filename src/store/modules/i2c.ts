import { defineStore } from 'pinia'
import { store } from '../index.ts'
import { ref, WatchHandle } from 'vue'
import { useStoreLink } from '@/store/link'
import { fieldsFilter, mapTo, toHexStr } from '@/utils'
import { OPTIONS } from '@/constants'
import { WsSendFuncMode } from '@/utils/car/message.ts'
import { useStoreWalk } from '@/store/control/walk.ts'
import { useStoreScreen } from '@/store/modules/screen.ts'

// I2C 有关
export const useStore = defineStore(
  'i2c',
  () => {
    const walkStore = useStoreWalk()
    const screenStore = useStoreScreen()

    const use = computed(() => {
      let use = {} as { [key: number]: string[] }
      function add(address: number, name: string) {
        use[address] ? use[address].push(name) : (use[address] = [name])
      }
      walkStore.extend.forEach(item => {
        add(item.address, `扩展板(${item.name})`)
      })
      if (screenStore.option.enable) {
        add(screenStore.option.address, `屏幕使用`)
      }
      return use
    })

    // I2C 所有的状态
    const states = ref<Array<boolean>>([])
    const list = computed(() => {
      return states.value
        .map((state, address) => ({
          name: toHexStr(address),
          value: address,
          state: state,
          used_label: use.value[address]?.join('\n') || '',
        }))
        .filter((x, i) => x.state && i !== 0)
    })

    async function init() {
      if (!useStoreLink().isLink) return Promise.reject()
      await WsSendFuncMode('i2c', 'scan').then(res => {
        states.value = res.data.map((x: number) => x === 0)
      })
    }

    function clear() {}

    let last_refresh_time = 0
    let refresh_interval = 1000 * 5 // 5秒刷新一次
    async function refresh() {
      if (Date.now() - last_refresh_time < refresh_interval) return
      last_refresh_time = Date.now()
      await init()
    }

    return {
      init,
      clear,
      list,
      use,
      states,
      refresh,
    }
  },
  {
    // 开启持久化
    persist: false,
  }
)

export function useStoreI2C() {
  return useStore(store)
}
