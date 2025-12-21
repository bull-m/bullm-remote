import Icon from './icon.vue'
import view from '@/plugin/configView.ts'
import SetUp from './Setup.vue'
import { useGeneralOutput } from '@/plugin/export.ts'

export const defaultConfig = {
  icon_on: undefined as string | undefined, // 亮度
  icon_off: undefined as string | undefined, // 快捷键
  device: undefined as string | undefined,
  state_on: 255,
  state_off: 0,
}

export function icon() {
  return Icon
}

// export function setup(){
//     return SetUp
// }

export function getDefaultConfig() {
  return defaultConfig
}

export function getConfigView(config: typeof defaultConfig) {
  let list = [] as any
  const info = useGeneralOutput(config.device)
  if (info) {
    list = [view.slider('state_on', '开启状态', info.min, info.max, info.step), view.slider('state_off', '关闭状态', info.min, info.max, info.step)]
    if (config.state_on > info.max) config.state_on = info.max
    if (config.state_off > info.max) config.state_off = info.max
    if (config.state_on < info.min) config.state_on = info.min
    if (config.state_off < info.min) config.state_off = info.min
  }
  return view.box(
    view.group('UI配置', view.icon('icon_on', '开启时图标'), view.icon('icon_off', '关闭时图标')),
    view.group(
      '控制',
      view.device('device', '控制设备', {
        selectPwm: true,
        selectDigital: true,
        selectServo: true,
        selectGroup: true,
      }),
      ...list
    )
  )
}

export type ConfigType = ReturnType<typeof getDefaultConfig>
export function getUseDevices(config: typeof defaultConfig) {
  if (config?.device) {
    return [{ id: config.device, label: '' }]
  }
}
