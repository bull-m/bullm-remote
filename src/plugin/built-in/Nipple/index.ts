import Index from './index.vue'
import { view } from '@/plugin/export'

export type ConfigType = ReturnType<typeof getDefaultConfig>

export function install() {}

export function template() {
  return Index
}

export function getUseDevices(config: ConfigType) {
  return []
}

export function getDefaultConfig() {
  return {
    control_mode: 'wheel' as 'wheel' | 'tank' | 'left',
    nipple_left_mode: 'dynamic' as 'dynamic' | 'semi' | 'static',
    nipple_right_mode: 'dynamic' as 'dynamic' | 'semi' | 'static',
    pzt: true
  }
}

export function getConfigView(config: ConfigType) {
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
    view.tabs(
      view.tab(
        '左摇杆',
        view.group('模式', view.radio('nipple_left_mode', { text: '动态位置', value: 'dynamic' }, { text: '绝对位置', value: 'static' }))
      ),
      view.tab(
        '右摇杆',
        view.group('模式', view.radio('nipple_right_mode', { text: '动态位置', value: 'dynamic' }, { text: '绝对位置', value: 'static' }))
      )
    ),
    view.group(
      '云台控制',
      view.switch('pzt', '启用云台控制')
    )
  )
}
