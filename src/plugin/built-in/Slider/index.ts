import Icon from './icon.vue'
import Popup from './Popup.vue'
import Setup from './Setup.vue'
import { PluginType } from '@/plugin'

export function popup() {
  return Popup
}

export function icon() {
  return Icon
}

export function setup() {
  return Setup
}

export type ItemType = {
  label: string
  device: string
  color?: string
  min?: number
  max?: number
  step?: number
  reverse?: boolean
  readonly?: boolean
}

export function getDefaultConfig() {
  return {
    list: [
      { label: 'pwm', step: 1, device: 'p:1' },
      { label: 'servo', step: 1, device: 's:1' },
    ] as ItemType[],
    direction: 'horizontal' as 'horizontal' | 'vertical',
  }
}

export type ConfigType = ReturnType<typeof getDefaultConfig>

export function getUseDevices(config: ConfigType) {
  return config.list.map(item => {
    return {
      id: item.device,
      label: item.label,
    }
  })
}
