// 控制命令
export const CONTROL = {
  BYTE1: 0x10,
  BYTE2: 0x11,
  BYTES: 0x13,
  GROUP_MAINTAIN: 0x12, // 组合保持运动
}

// 配置的KEY
export const OPTIONS = {
  BUILT_IN_IO: 'builtIn_io', // 板载IO
  WALK_EXTENDS: 'walk_extends',
  WALK_SERVOS: 'walk_servos',
  WALK_GROUPS: 'walk_groups',
  WALK_PWMS: 'walk_pwms',
  WALK_DIGITALS: 'walk_digitals',
  CHASSIS: 'chassis',
  PZT: 'pzt',
  SCREEN: 'screen',
  WIFI: 'wifi',
  NETWORK: 'network', // 互联网配置
  TOKEN: 'token', // 密码
  BATTERY: 'battery',
} as const

export const AP_MODE_IP = '1.2.1.1'

// 一些ID的前缀
export const PREFIX = {
  PWM: 'p:', // pwm
  SERVO: 's:', // 舵机
  INPUT: 'i:', // 输入
  DIGITAL: 'o:', // 输出
  GROUP: 'g:', // 组合
  EXTEND: 'e:', // 扩展的PIN
  PIN: 'io:', // 引脚的PIN
}

export const PWM_MAX = 255
export const PWM_MIN = 0

export const SERVO_MAX = 180
export const SERVO_MIN = 0
export const SERVO_uS_LOW = 500
export const SERVO_uS_HIGH = 2500
export const SERVO_uS_LOW_DEFAULT = 544
export const SERVO_uS_HIGH_DEFAULT = 2400
export const SERVO_hz_LOW = 50
export const SERVO_hz_HIGH = 500
export const SERVO_hz_DEFAULT = 50
