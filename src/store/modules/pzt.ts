import { defineStore } from 'pinia'
import { store } from '../index.ts'
import { ref, WatchHandle } from 'vue'
import { useStoreWalk } from '@/store/control/walk.ts'
import { CarGetOptionToObj, CarRemoveOption, CarSetOption } from '@/utils/car/options.ts'
import { useStoreLink } from '@/store/link'
import { OPTIONS } from '@/constants'

// 云台有关
export const useStore = defineStore(
  'pzt',
  () => {
    const pitch_device = ref('') // 俯仰
    const roll_device = ref('') // 翻滚

    let WatchHandle1: WatchHandle

    async function init() {
      clear()
      if (!useStoreLink().isLink) return Promise.reject()
      await CarGetOptionToObj(OPTIONS.PZT).then(data => {
        pitch_device.value = data?.pitch_device
        roll_device.value = data?.roll_device
        WatchHandle1 = watch(
          [pitch_device, roll_device],
          () => {
            const data = {
              pitch_device: pitch_device.value,
              roll_device: roll_device.value,
            }
            CarSetOption(OPTIONS.PZT, data).then(() => {
              showToast('保存成功')
            })
          },
          { deep: true }
        )
      })
    }

    function clear() {
      if (WatchHandle1) WatchHandle1()
    }

    async function reset() {
      await showConfirmDialog({
        title: '提示',
        message: '确认要重置此项设置为小车自带的设置吗？',
      })
      clear()
      pitch_device.value = ''
      roll_device.value = ''
      await CarRemoveOption(OPTIONS.PZT)
      await init()
      showToast('重置成功')
    }

    function walkRelative(speed: number, direction: 'pitch' | 'roll') {
      const { auto, device_state } = useStoreWalk()
      if (pitch_device.value && direction === 'pitch') {
        auto(pitch_device.value, device_state[pitch_device.value].value + speed)
      }
      if (roll_device.value && direction === 'roll' && device_state[roll_device.value]) {
        auto(roll_device.value, device_state[roll_device.value].value + speed)
      }
    }

    function walkAbsolute(angle: number, direction: 'pitch' | 'roll') {
      const { auto } = useStoreWalk()
      if (pitch_device.value && direction === 'pitch') {
        auto(pitch_device.value, angle)
      }
      if (roll_device.value && direction === 'roll') {
        auto(roll_device.value, angle)
      }
    }

    return {
      init,
      clear,
      reset,
      walkRelative,
      walkAbsolute,
      pitch_device,
      roll_device,
    }
  },
  {
    // 开启持久化
    persist: false,
  }
)

export function useStorePZT() {
  return useStore(store)
}
