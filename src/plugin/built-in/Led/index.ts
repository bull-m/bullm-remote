import Icon from './icon.vue'
import view from '@/plugin/configView.ts'

export const defaultConfig = {
  brightness: 200, // 亮度
  shortcutKey: -1, // 快捷键
  io: 'extend:64-13',
}

export function icon() {
  return Icon
}

export function getDefaultConfig() {
  return defaultConfig
}
export function getConfigView(config: typeof defaultConfig) {
  return view.box(
    view.group(
      '大灯设置',
      view.slider('brightness', '亮度', 0, 255, 1),
      view.gamepadKey('shortcutKey', '手柄快捷键'),
      view.device('io', '引脚', {
        selectPwm: true,
      })
    )
  )
}
export function getUseDevices(config: typeof defaultConfig) {
  if (config?.io) {
    return [{ id: config.io, label: '灯' }]
  }
}
