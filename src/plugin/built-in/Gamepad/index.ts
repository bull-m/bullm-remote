import Icon from './icon.vue'
import Popup from './Popup.vue'
import Setup from './Setup.vue'
import view from '@/plugin/configView.ts'

export function popup() {
  return Popup
}

export function icon() {
  return Icon
}

export function setup() {
  return Setup
}

export function getDefaultConfig() {
  return {
    control_mode: 'tank',
    xUpKey: 5,
    xDownKey: 7,
  }
}

export type ConfigType = ReturnType<typeof getDefaultConfig>

export function getConfigView(config?: any) {
  return view.box(
    view.group(
      '控制模式',
      view.radio(
        'control_mode',
        { text: '坦克摇杆', value: 'tank' },
        { text: '左边油门右边方向', value: 'wheel' },
        { text: '单独左摇杆', value: 'left' }
      )
    ),
    view.group('云台设置', view.gamepadKey('xUpKey', '云台向上按键'), view.gamepadKey('xDownKey', '云台向下按键'))
  )
}
