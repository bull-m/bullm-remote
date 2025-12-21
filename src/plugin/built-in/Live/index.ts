import Index from './index.vue'
import Setup from './Setup.vue'

export type ConfigType = ReturnType<typeof getDefaultConfig>

export function template() {
  return Index
}

export function setup() {
  return Setup
}

export function getUseDevices(config: ConfigType) {
  return []
}

export function getDefaultConfig() {
  return {
    vertical: false,
    horizontal: false,
    object_fit: 'cover' as 'contain' | 'cover' | 'fill',
    brightness: 100, // 亮度
    contrast: 100, // 对比度
    saturate: 100, // 饱和度
  }
}

export function getConfigView(config: ConfigType) {
  return null
}
