import Icon from './icon.vue'
import view from '@/plugin/configView.ts'
import SetUp from './Setup.vue'
import { useGeneralOutput } from '@/plugin/export.ts'

export const defaultConfig = {
  device: undefined as string | undefined,
  state: 255,
}

export function icon() {
  return Icon
}

export function getDefaultConfig() {
  return defaultConfig
}

export function getConfigView(config: typeof defaultConfig) {
  let list = [] as any
  const info = useGeneralOutput(config.device)
  if (info) {
    list = [view.slider('state', '目标状态', info.min, info.max, info.step)]
    if (config.state > info.max) config.state = info.max
    if (config.state < info.min) config.state = info.min
  }
  return view.box(
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
