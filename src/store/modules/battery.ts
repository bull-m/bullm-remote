import { defineStore } from 'pinia'
import { store } from '../index.ts'
import { ref, WatchHandle } from 'vue'
import { ExtendType, useStoreWalk } from '@/store/control/walk.ts'
import { CarGetOptionToObj, CarRemoveOption, CarSetOption, syncOptionCar } from '@/utils/car/options.ts'
import { useStoreLink } from '@/store/link'
import { OPTIONS } from '@/constants'
import { fieldsFilter, fieldsFilterHigh } from '@/utils'
import { WsSendFuncMode } from '@/utils/car/message.ts'

// 云台有关
export const useStore = defineStore(
  'battery',
  () => {
    const {
      data: options,
      refresh: refreshOption,
      reset: resetOption,
      clear: clearOption,
    } = syncOptionCar<{
      offset: number
    }>(OPTIONS.BATTERY, {})

    const remoteVoltage = ref(-1)
    const voltage = computed(() => {
      if (remoteVoltage.value < 0) return remoteVoltage.value
      const v = remoteVoltage.value + (options.value.offset || 0)
      return Number(v.toFixed(2))
    })

    async function getBattery() {
      const res = await WsSendFuncMode('adc', 'get', {}, 5000)
      const v = (res.voltage / 1000).toFixed(2)
      remoteVoltage.value = Number(v)
      return voltage.value
    }

    let timer: any

    async function init() {
      clear()
      if (!useStoreLink().isLink) return Promise.reject()
      await refreshOption()
      // 开始监听
      timer = setInterval(getBattery, 20000)
      setTimeout(getBattery, 3000)
    }

    function clear() {
      // 停止监听
      clearInterval(timer)
      clearOption()
    }

    async function reset() {
      await showConfirmDialog({
        title: '提示',
        message: '确认要重置此项设置为小车自带的设置吗？',
      })
      await resetOption()
      showToast('重置成功')
    }

    return {
      init,
      clear,
      reset,
      voltage,
      options,
      getBattery,
    }
  },
  {
    // 开启持久化
    persist: false,
  }
)

export function useStoreBattery() {
  return useStore(store)
}
