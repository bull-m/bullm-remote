// 所有的插件应用的入口文件

import { useStoreChassis } from '@/store/modules/chassis.ts'
import { isDigital, isGroup, isPwm, isServo, useStoreWalk } from '@/store/control/walk.ts'
import { useStoreUi } from '@/store/ui.ts'
import _view from '@/plugin/configView.ts'
import ZVanDevice from '@/components/form/ZVanDevice.vue'
import IconView from './component/IconView.vue'
import { PluginRunType, PluginSaveType } from '@/store/plugin.ts'
import { useStorePZT } from '@/store/modules/pzt.ts'
import { KeyboardKey } from '@/utils/device/keyboard.ts'
import { useStoreCamera } from '@/store/modules/camera.ts'
import ZVanNumber from '@/components/form/ZVanNumber.vue'
import { PREFIX } from '@/constants'
import ZVanSwitch from '@/components/form/ZVanSwitch.vue'
import { useStoreBattery } from '@/store/modules/battery.ts'
import { GamepadAxes, GamepadAxesDef, GamepadButtons, GamepadButtonsDef, GamepadCurrent, GamepadIsLink } from '@/utils/device/gamepad.ts'
import { useStoreCar } from '@/store/car.ts'

export { isDigital, isGroup, isPwm, isServo } from '@/store/control/walk.ts'

export const Components = {
  IconView,
  FromNumber: ZVanNumber,
  FromSwitch: ZVanSwitch,
  FromDevice: ZVanDevice,
}
export const view = _view

export function usePlugin() {
  return inject<PluginRunType>('plugin')
}
export function useConfig<T = any>() {
  return inject<T>('config', {} as T)
}
export function useOptions() {
  return inject<PluginSaveType>('options')
}

/**
 * 获取PWM信息
 * @param id
 */
export function usePwmInfo(id: string) {
  return useStoreWalk().pwms_show.find(x => x.id === id)
}
/**
 * 获取电平输出信息
 * @param id
 */
export function useDigitalInfo(id: string) {
  return useStoreWalk().digitals_show.find(x => x.id === id)
}

/**
 * 获取舵机信息
 * @param id
 */
export function useServoInfo(id: string) {
  return useStoreWalk().servos_show.find(x => x.id === id)
}

/**
 * 获取组合信息
 * @param id
 */
export function useGroupInfo(id: string) {
  return useStoreWalk().groups_show.find(x => x.id === id)
}

export function useGeneralOutput(id?: string) {
  if (!id) return
  if (isPwm(id)) {
    const info = usePwmInfo(id)
    if (!info) return
    return {
      id: info?.id,
      state: info?.state,
      min: info?.min,
      max: info?.max,
      step: 1,
    }
  }
  if (isServo(id)) {
    const info = useServoInfo(id)
    if (!info) return
    return {
      id: info?.id,
      state: info?.state,
      min: info?.min,
      max: info?.max,
      step: 1,
    }
  }
  if (isDigital(id)) {
    const info = useDigitalInfo(id)
    if (!info) return
    return {
      id: info?.id,
      state: info?.state,
      min: 0,
      max: 1,
      step: 1,
    }
  }
  if (isGroup(id)) {
    const info = useGroupInfo(id)
    if (!info) return
    return {
      id: info?.id,
      state: info?.state,
      min: -255,
      max: 255,
      step: 1,
    }
  }
  return
}

/**
 * 获取底盘信息
 */
export function useChassis() {
  const chassis = useStoreChassis()
  const mode = computed(() => chassis.mode) // mode是字符串，需要用computed包装一下，使其变成响应式数据
  return reactive({
    mode: mode,
    steering: chassis.steering,
    walkRelative: chassis.walkRelative,
    tank: chassis.tank,
    auto: chassis.auto,
    stop: chassis.stop,
  })
}

export function usePZT() {
  const pzt = useStorePZT()
  return reactive({
    walkRelative: pzt.walkRelative,
    walkAbsolute: pzt.walkAbsolute,
    pitch_device: computed(() => pzt.pitch_device),
    roll_device: computed(() => pzt.roll_device),
  })
}

export function useWalk() {
  const walk = useStoreWalk()
  return {
    pwms: walk.pwms_show,
    servos: walk.servos_show,
    groups: walk.groups_show,
    digitals: walk.digitals_show,
    auto: walk.auto,
  }
}

export function useCamera() {
  const camera = useStoreCamera()
  return {
    addListener: camera.addListener,
    removeListener: camera.removeListener,
  }
}

export function useBattery() {
  const battery = useStoreBattery()
  const voltage = computed(() => battery.voltage) // 需要用computed包装一下，使其变成响应式数据
  return reactive({
    voltage: voltage,
    getBattery: battery.getBattery,
  })
}

export function useUi() {
  return useStoreUi()
}

export function useKeyboard() {
  const car = useStoreCar()
  return reactive({
    keys: computed<typeof KeyboardKey>(() => (car.isDisableControl ? {} : KeyboardKey)),
  })
}
export function useGamepad() {
  const car = useStoreCar()
  return reactive({
    buttons: computed(() => (car.isDisableControl ? GamepadButtonsDef : GamepadButtons.value)),
    axes: computed(() => (car.isDisableControl ? GamepadAxesDef : GamepadAxes.value)),
    isLink: GamepadIsLink,
    current: GamepadCurrent,
  })
}
