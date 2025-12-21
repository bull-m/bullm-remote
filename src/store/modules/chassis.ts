import { defineStore } from 'pinia'
import { store } from '../index.ts'
import { ref, WatchHandle } from 'vue'
import { useStoreWalk } from '@/store/control/walk.ts'
import { CarGetOptionToObj, CarRemoveOption, CarSetOption } from '@/utils/car/options.ts'
import { useStoreLink } from '@/store/link'
import { mapTo } from '@/utils'
import { OPTIONS } from '@/constants'

export type CarModeType = 'tank' | 'mecanum' | 'steering'

// 底盘有关
export const useStore = defineStore(
  'chassis',
  () => {
    const mode = ref<CarModeType>('tank') // 车的模式

    const steering = ref({
      pin: '',
      range: 90,
      center: 90,
    })

    const motor = ref({
      'top-left': '',
      'top-right': '',
      'bottom-left': '',
      'bottom-right': '',
      wheel: '', // 舵机转向时的驱动轮
      wheel2: '', // 舵机转向时的驱动轮
    })

    let WatchHandle1: WatchHandle

    function init() {
      clear()
      if (!useStoreLink().isLink) return Promise.reject()
      return CarGetOptionToObj(OPTIONS.CHASSIS).then(data => {
        if (data) {
          if (data.mode) mode.value = data.mode
          if (data.steering) steering.value = data.steering
          if (data.motor) motor.value = data.motor
        }
        WatchHandle1 = watch(
          [mode, steering, motor],
          () => {
            const data = {
              mode: mode.value,
              steering: steering.value,
              motor: motor.value,
            }
            CarSetOption(OPTIONS.CHASSIS, data).then(() => {
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
      mode.value = 'tank'
      steering.value = {
        pin: '',
        range: 90,
        center: 90,
      }
      motor.value = {
        'top-left': '',
        'top-right': '',
        'bottom-left': '',
        'bottom-right': '',
        wheel: '',
        wheel2: '', // 舵机转向时的驱动轮
      }
      await CarRemoveOption(OPTIONS.CHASSIS)
      await init()
      showToast('重置成功')
    }

    // 运动, 控制每一个独立的轮子
    function walkRelative(speed: number, wheel: keyof typeof motor.value, max: number = 1) {
      speed = speed > max ? max : speed
      speed = speed < -max ? -max : speed
      if (mode.value == 'tank' || mode.value == 'mecanum') {
        const { auto } = useStoreWalk()
        auto(motor.value[wheel], Math.round(mapTo(speed, -max, max, -255, 255)))
      }
    }

    /**
     * 自动控制
     * @param front_back 前后
     * @param direction 左右转, 舵机转向时控制舵机
     * @param left_right 左右平移,麦克纳姆轮可用
     */
    function auto(front_back: number, direction: number = 0, left_right: number = 0) {
      if (mode.value == 'steering') {
        return
      }
      // 坦克和麦克纳姆轮
      const x = left_right ?? 0 // 麦轮平移
      const y = front_back ?? 0 // 前后
      const z = direction ?? 0 // 旋转
      const leftTop = y + z + x
      const rightTop = y - z - x
      const leftBottom = y + z - x
      const rightBottom = y - z + x
      walkRelative(leftTop, 'top-left', 255)
      walkRelative(rightTop, 'top-right', 255)
      walkRelative(leftBottom, 'bottom-left', 255)
      walkRelative(rightBottom, 'bottom-right', 255)
    }

    /**
     * 坦克控制模式
     * @param left_speed 左侧速度
     * @param right_speed 右侧速度
     */
    function tank(left_speed: number, right_speed: number) {
      walkRelative(left_speed, 'top-left', 255)
      walkRelative(right_speed, 'top-right', 255)
      walkRelative(left_speed, 'bottom-left', 255)
      walkRelative(right_speed, 'bottom-right', 255)
    }

    function stop() {
      walkRelative(0, 'top-left')
      walkRelative(0, 'top-right')
      walkRelative(0, 'bottom-left')
      walkRelative(0, 'bottom-right')
    }

    return {
      init,
      clear,
      reset,
      walkRelative,
      auto,
      tank,
      mode,
      motor,
      steering,
      stop,
    }
  },
  {
    // 开启持久化
    persist: false,
  }
)

export function useStoreChassis() {
  return useStore(store)
}
