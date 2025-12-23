import { defineStore } from 'pinia'
import { store } from '.'
import { useStorePlugin } from '@/store/plugin.ts'
import { useStoreWalk } from '@/store/control/walk.ts'
import { useStoreChassis } from '@/store/modules/chassis.ts'
import { executePromisesInSequence } from '@/utils'
import { useStoreDog } from '@/store/link/dog.ts'
import { useStoreCamera } from '@/store/modules/camera.ts'
import { useStoreUi } from '@/store/ui.ts'
import { useStoreScreen } from '@/store/modules/screen.ts'
import { useStoreI2C } from '@/store/modules/i2c.ts'
import $bus from '@/utils/bus.ts'
import { useStoreLink } from '@/store/link'
import { useStoreUdp } from '@/store/link/udp.ts'
import { useStorePZT } from '@/store/modules/pzt.ts'
import { useStoreBattery } from '@/store/modules/battery.ts'

export const useStore = defineStore(
  'car',
  () => {
    const isControl = ref(false) // 是否有控制权
    const server_id = ref('')

    function init() {
      // 控制权切换事件
      $bus.on('ws:msg:control-change', data => {
        isControl.value = data.isControl
        server_id.value = data.id
        if (isControl.value) {
          initCar().catch(() => {
            showNotify({ type: 'danger', message: '初始化车辆信息失败，请重新连接或重置您的小车' })
            useStoreLink().close()
          })
        } else {
          clearCar()
        }
      })
    }

    function clear() {
      $bus.off('ws:msg:control-change')
      clearCar()
    }

    async function initCar() {
      showToast('初始化数据中')
      await executePromisesInSequence([
        useStoreUdp().init,
        useStoreUi().init, // 初始化UI
        useStoreWalk().init, // 初始化运动
        useStoreChassis().init, // 初始化底盘
        useStorePZT().init, // 初始化云台
        useStorePlugin().init, // 初始化插件
        useStoreCamera().init, // 初始化相机
        useStoreScreen().init, // 初始化屏幕
        useStoreBattery().init, // 初始化电池
        useStoreI2C().init, // 初始化I2C
        useStoreDog().init, // 初始化狗狗 ♪(´▽｀)
      ])
    }

    function clearCar() {
      useStoreUdp().clear()
      useStoreUi().clear()
      useStoreWalk().clear()
      useStoreChassis().clear()
      useStorePZT().clear()
      useStorePlugin().clear()
      useStoreCamera().clear()
      useStoreScreen().clear()
      useStoreBattery().clear()
      useStoreI2C().clear()
      useStoreDog().clear()
    }

    // 是否临时禁用控制
    const isDisableControl = computed(() => {
      return useStoreUi().showSetup
    })

    return {
      initCar,
      clearCar,
      server_id,
      init,
      clear,
      isControl,
      isDisableControl,
    }
  },
  {
    // 开启持久化
    persist: false,
  }
)

export function useStoreCar() {
  return useStore(store)
}
