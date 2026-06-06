import { defineStore } from 'pinia'
import { store } from '../index.ts'
import { ref, WatchHandle } from 'vue'
import { ExtendType, useStoreWalk } from '@/store/control/walk.ts'
import { CarGetOptionToObj, CarRemoveOption, CarSetOption, syncOptionCar } from '@/utils/car/options.ts'
import { useStoreLink } from '@/store/link'
import { OPTIONS } from '@/constants'
import { fieldsFilter, fieldsFilterHigh } from '@/utils'
import { WsSendFuncMode } from '@/utils/car/message.ts'
import $bus from '@/utils/bus.ts'

type SensorValueType = {
  name: string
  unit: string
  value: number
}

// 云台有关
export const useStore = defineStore(
  'sensors',
  () => {
    const {
      data: options,
      refresh: refreshOption,
      reset: resetOption,
      clear: clearOption,
    } = syncOptionCar<{
      id: string
      type: string
      name: string
      u_t: number
      [key: string]: any
    }>(OPTIONS.SENSORS, {})

    async function init() {
      clear()
      if (!useStoreLink().isLink) return Promise.reject()
      await refreshOption()
      $bus.on('ws:msg:sensor-update', updateSensors)
    }

    function clear() {
      clearOption()
      $bus.off('ws:msg:sensor-update', updateSensors)
    }

    async function reset() {
      await showConfirmDialog({
        title: '提示',
        message: '确认要重置此项设置为小车自带的设置吗？',
      })
      await resetOption()
      showToast('重置成功')
    }

    const sensors = ref({} as Record<string, SensorValueType[]>)

    function updateSensors(json: any) {
      const values = json.values.map(value => ({
        name: value.n,
        unit: value.u,
        value: value.v,
      }))
      sensors.value[json.sensorId] = values
    }

    function refreshSensor(id: string) {
      return new Promise((resolve, reject) => {
        // 请求更新传感器数据
        WsSendFuncMode('sensor', 'refresh', { id })
        // 超时处理
        const timeout = setTimeout(() => {
          $bus.off('ws:msg:sensor-update', jt)
          reject(new Error('超时'))
        }, 5000)
        // 处理传感器数据更新
        const jt = (res: any) => {
          if (res.sensorId === id) {
            resolve(res)
            clearTimeout(timeout)
          }
        }
        $bus.on('ws:msg:sensor-update', jt)
      })
    }

    return {
      init,
      clear,
      reset,
      options,
      sensors,
      refreshSensor,
    }
  },
  {
    // 开启持久化
    persist: false,
  }
)

export function useStoreSensor() {
  return useStore(store)
}
