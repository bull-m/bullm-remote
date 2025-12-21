import Setup from './Setup.vue'
import Icon from './icon.vue'

export function icon() {
  return Icon
}

export function setup() {
  return Setup
}
export function getDefaultConfig() {
  return {
    def_speed: 127, // 默认速度
    slow_shift_key: true, // 按住 shift 键变慢
    slow_speed: 30, // 变慢时速度
    tall_ctrl_key: true, // 按住 ctrl 键变高
    tall_speed: 255, // 变高时速度
    forward_key: 'W',
    back_key: 'S',
    left_key: 'A',
    right_key: 'D',
    hy_left_key: 'Left',
    hy_right_key: 'Right',

    // 云台
    ptz_down_key: 'Down',
    ptz_up_key: 'Up',

    mousewheel: true, // 是否开启鼠标滚轮控制
  }
}

export type ConfigType = ReturnType<typeof getDefaultConfig>
