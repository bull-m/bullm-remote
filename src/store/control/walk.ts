import { defineStore } from 'pinia'
import { store } from '@/store'
import { ref } from 'vue'
import { delectUndefined, executePromisesInSequence, fieldsFilter, fieldsFilterHigh } from '@/utils'
import { CarGetOptionToObj, CarRemoveOption, syncOptionCar } from '@/utils/car/options.ts'
import { useStoreLink } from '@/store/link'
import { OPTIONS, PREFIX, PWM_MAX, PWM_MIN, SERVO_MAX, SERVO_MIN } from '@/constants'
import { useStorePlugin } from '@/store/plugin.ts'
import { useWalkControl } from '@/store/control/walk_control.ts'
import { useStoreChassis } from '@/store/modules/chassis.ts'

/**
 * 控制逻辑基本都在这里实现
 */

/**
 * 关于数据结构
 * id: 全局唯一，用来标记设备
 * pin: 指定引脚(可能是内置引脚，也可能是扩展引脚) 字符串类型，‘e:’ 或 ‘io:’ 开头,指向对应的一个引脚
 * remote_key: 用于控制指定设备的key, number类型，两个字节大小
 */

export const MotorDriveMapping = {
  TB6612FNG: '2D1Pwm',
  L298N: '2Pwm',
  'TEST-1Pwm': '1Pwm',
  BTS7970D: '2En2Pwm',
}

export const WalkGroupTypeName = {
  '2En2Pwm': '2使能2调速引脚',
  '2D1Pwm': '2引脚控制方向 1调速',
  '2Pwm': '2PWM',
  '1Pwm': '1PWM控制方向及速度',
}

export type WalkGroupType = keyof typeof WalkGroupTypeName

export type DevicePublicType = {
  id: string // 本地id
  name: string
  pin: string
  builtIn?: boolean // 是否是内置的，不可更改的
  hide?: boolean // 是否隐藏，不对外公开的
  from?: string
}

// 舵机的选项配置
export type ServoOptionType = {
  hz?: number
  pulse_min?: number
  pulse_max?: number
  min?: number
  max?: number
  def?: number
  reset?: boolean
}
export type ServoType = DevicePublicType & ServoOptionType

// pwm 的选项配置
export type PwmOptionType = {
  hz?: number
  def?: number
  min?: number
  max?: number
  reset?: boolean
}
export type PwmType = DevicePublicType & PwmOptionType

// 二进制输出的选项配置
export type DigitalOptionType = {
  def?: boolean
  reset?: boolean
}
export type DigitalType = DevicePublicType & DigitalOptionType

// 组合的选项配置
export type GroupOptionType = {
  reversal?: boolean // 是否反转
  auto_brake?: boolean // 是否自动刹车
  drive?: WalkGroupType
  def?: number
} & (
  | {
      type: '2D1Pwm'
      pwm: string
      forward: string
      back: string
    }
  | {
      type: '2Pwm'
      forward: string
      back: string
    }
  | {
      type: '1Pwm'
      pwm: string
    }
  | {
      type: '2En2Pwm'
      forward: string
      back: string
      forward_pwm: string
      back_pwm: string
    }
)

export type GroupType = Omit<DevicePublicType, 'pin'> & GroupOptionType

export type PinFuncType = 'pwm' | 'servo' | 'input' | 'digital'

export type builtInIoType = {
  pin: number
  name: string
  func: PinFuncType[]
}

export type ExtendType = {
  id: string
  builtIn: boolean
  name: string
  type: string
  address: number
  hz: number
  chip?: 'pca9685' | 'pca9555' // 芯片类型
  pins?: { pin: number; hide?: boolean; func: PinFuncType[]; name?: string }[]
  pwms?: ({ pin: number; hide?: boolean; name?: string } & PwmOptionType)[]
  digitals?: ({ pin: number; hide?: boolean; name?: string } & DigitalOptionType)[]
  servos?: ({ pin: number; hide?: boolean; name?: string } & ServoOptionType)[]
  groups?: GroupType[] // 扩展板内的组合  id规则：group:address-index-i
}

// 最终使用的IO口列表
export type PinType = {
  id: string // id按规则生成
  name: string
  func: PinFuncType[]
  isBuiltInUse?: boolean // 是否已经被内置功能使用
  used: { label: string; device: string }[] // 已经被使用的设备
  used_label: string // 已经被使用的设备的展示文案
  from?: string
} & (
  | {
      type: 'extend-pwm'
      index: number
      address: number
      hz: number
    }
  | {
      type: 'io'
      pin: number
    }
)

/**
 * 扩展版里面的设备id和pin生成规则 `${设备类型前缀}${扩展id}-${引脚}`
 */

// 通用运动有关
export const useStore = defineStore(
  'walk',
  () => {
    const { device_state, upDeviceState, ...control } = useWalkControl()
    // 扩展板
    const {
      data: extend,
      refresh: refreshExtend,
      reset: resetExtend,
      clear: clearExtend,
    } = syncOptionCar<ExtendType[]>(OPTIONS.WALK_EXTENDS, {
      filter: data =>
        data.map(item => {
          return {
            ...fieldsFilter(item, 'id', 'builtIn', 'name', 'type', 'address', 'total', 'hz', 'chip'),
            groups: item.groups ? groupsFieldsFilter(item.groups) : undefined,
            digitals: item.digitals?.map(fieldsFilterHigh('pin', 'hide', 'def', 'reset', 'name')),
            pwms: item.pwms?.map(fieldsFilterHigh('pin', 'hide', 'def', 'hz', 'min', 'max', 'reset', 'name')),
            servos: item.servos?.map(fieldsFilterHigh('pin', 'hide', 'hz', 'pulse_min', 'pulse_max', 'min', 'max', 'def', 'reset', 'name')),
            pins: item.pins?.map(fieldsFilterHigh('pin', 'func', 'name')),
          }
        }),
    })
    // PWM设备
    const {
      data: pwms,
      refresh: refreshPwms,
      reset: resetPwms,
      clear: clearPwms,
    } = syncOptionCar<PwmType[]>(OPTIONS.WALK_PWMS, {
      filter: T => T.map(fieldsFilterHigh('id', 'name', 'pin', 'hz', 'def', 'min', 'max', 'reset')).map(delectUndefined),
      callback: upDeviceState,
    })
    // 二进制输出设备
    const {
      data: digitals,
      refresh: refreshDigitals,
      reset: resetDigitals,
      clear: clearDigitals,
    } = syncOptionCar<DigitalType[]>(OPTIONS.WALK_DIGITALS, {
      filter: T => T.map(fieldsFilterHigh('id', 'name', 'pin', 'def', 'reset')).map(delectUndefined),
      callback: upDeviceState,
    })
    // 舵机
    const {
      data: servos,
      refresh: refreshServos,
      reset: resetServos,
      clear: clearServos,
    } = syncOptionCar<ServoType[]>(OPTIONS.WALK_SERVOS, {
      filter: T => T.map(fieldsFilterHigh('id', 'name', 'pin', 'hz', 'pulse_min', 'pulse_max', 'min', 'max', 'def', 'reset')).map(delectUndefined),
      callback: upDeviceState,
    })
    // 组合引脚，并统一控制
    const {
      data: groups,
      refresh: refreshGroups,
      reset: resetGroups,
      clear: clearGroups,
    } = syncOptionCar<GroupType[]>(OPTIONS.WALK_GROUPS, {
      filter: groupsFieldsFilter,
      callback: upDeviceState,
    })

    // 内置IO口
    const builtInIos = ref<builtInIoType[]>([])

    async function refreshBuiltInIo() {
      builtInIos.value = (await CarGetOptionToObj(OPTIONS.BUILT_IN_IO)) ?? []
    }

    // 扩展板展示
    const extend_all = computed(() => {
      let index = 0
      // 加载顺序不允许改变 = 电平 > PWM > Servo > 组合
      return extend.value.map(item => ({
        ...item, // 保留原有属性
        digitals:
          item.digitals?.map(digital => {
            const id = DeviceId.extendDigital(item.id, digital.pin)
            return {
              ...digital,
              pin: '', // 扩展板里自带设备不需要定义pin
              id: id,
              name: digital.name || item.name + '-' + digital.pin,
              from: `来自扩展(${item.name})`,
              builtIn: true,
              hide: digital.hide,
              remote_key: RemoteKey.extendDrive(index++),
            }
          }) ?? [],
        pwms:
          item.pwms?.map(pwm => {
            const id = DeviceId.extendPwm(item.id, pwm.pin)
            return {
              ...pwm,
              pin: '', // 扩展板里自带设备不需要定义pin
              id: id,
              name: pwm.name || item.name + '-' + pwm.pin,
              hz: item.hz,
              def: pwm.def,
              reset: pwm.reset,
              min: pwm.min,
              max: pwm.max,
              builtIn: true,
              hide: pwm.hide,
              from: `来自扩展(${item.name})`,
              remote_key: RemoteKey.extendDrive(index++),
            }
          }) ?? [],
        servos:
          item.servos?.map(servo => {
            const id = DeviceId.extendServo(item.id, servo.pin)
            return {
              ...servo,
              pin: '', // 扩展板里自带设备不需要定义pin
              id: id,
              name: servo.name || item.name + '-' + servo.pin,
              from: `来自扩展(${item.name})`,
              builtIn: true,
              hide: servo.hide,
              remote_key: RemoteKey.extendDrive(index++),
            }
          }) ?? [],
        groups:
          item.groups?.map((group, g_index) => {
            const id = DeviceId.extendGroup(item.id, g_index)
            return {
              ...group,
              id,
              builtIn: true,
              from: `来自扩展(${item.name})`,
              remote_key: RemoteKey.extendDrive(index++),
            }
          }) ?? [],
        pins:
          item.pins?.map(pin => {
            // id 标记了扩展和引脚
            const id = PinId.extend(item.id, pin.pin)
            return {
              ...pin,
              type: 'extend-pwm' as const,
              id: id,
              name: pin.name || item.name + '-' + pin.pin,
              address: item.address,
              index: pin.pin,
              func: pin.func,
              hz: item.hz,
              from: `来自扩展(${item.name})`,
            }
          }) ?? [],
      }))
    })

    // 所以可用的IO口，id自动生成
    const pins = computed<PinType[]>(() => {
      return [
        ...builtInIos.value.map(item => {
          const id = PinId.pin(item.pin)
          return {
            type: 'io' as const,
            id: id,
            name: item.name,
            pin: item.pin,
            func: item.func,
            used: used_pins.value[id] || [],
            used_label: used_pins.value[id]?.map(x => x.label)?.join('\n'),
          }
        }),
        ...extend_all.value.flatMap(item =>
          item.pins.map(pin => ({
            ...pin,
            used: used_pins.value[pin.id] || [],
            used_label: used_pins.value[pin.id]?.map(x => x.label)?.join('\n'),
          }))
        ),
      ]
    })

    // 可以自定义的功能的IO口
    const pins_use = computed(() => {
      return pins.value.filter(x => !x.isBuiltInUse)
    })

    const pins_obj = computed(() => {
      const obj = {} as Record<string, PinType>
      pins.value.forEach(item => {
        obj[item.id] = item
      })
      return obj
    })

    /// 所有的PWM设备，包括扩展板生成的
    const pwms_all = computed<(PwmType & { remote_key: number })[]>(() => {
      // 合并扩展板的pwm
      return [
        ...pwms.value.map((x, i) => ({
          ...x,
          remote_key: RemoteKey.pwm(i),
        })),
        ...extend_all.value.flatMap(item => item.pwms),
      ]
    })
    /// 所有的二进制输出设备，包括扩展板生成的
    const digitals_all = computed<(DigitalType & { remote_key: number })[]>(() => {
      // 合并扩展板的pwm
      return [
        ...digitals.value.map((x, i) => ({
          ...x,
          remote_key: RemoteKey.digital(i),
        })),
        ...extend_all.value.flatMap(item => item.digitals),
      ]
    })
    // 所有的舵机
    const servos_all = computed<(ServoType & { remote_key: number })[]>(() => {
      // 顺序很重要，先合并自定义的组合，再合并扩展板内置的组合
      return [
        ...servos.value.map((x, i) => ({
          ...x,
          remote_key: RemoteKey.servo(i),
        })),
        ...extend_all.value.flatMap(item => item.servos),
      ]
    })
    // 所有的组合，包括扩展板生成的
    const groups_all = computed(() => {
      // 顺序很重要，先合并自定义的组合，再合并扩展板内置的组合
      return [
        ...groups.value.map((x, i) => ({
          ...x,
          remote_key: RemoteKey.group(i),
        })),
        ...extend_all.value.flatMap(item => item.groups),
      ]
    })

    // 扩展板展示
    const extend_show = extend_all
    // PWM展示
    const pwms_show = computed(() => {
      return pwms_all.value.map(x => ({
        ...x, // 保留原有属性
        pin_label: pinIdToName(x.pin), // 引脚的展示文案
        type_label: '简单PWM', // 组合类型展示文案
        used: used_devices.value[x.id] || [],
        used_label: used_devices.value[x.id]?.map(x => x.label)?.join('\n'),
        state: device_state.value[x.id]?.value,
        min: x.min ?? PWM_MIN,
        max: x.max ?? PWM_MAX,
      }))
    })
    // 二进制展示
    const digitals_show = computed(() => {
      return digitals_all.value.map(x => ({
        ...x, // 保留原有属性
        pin_label: pinIdToName(x.pin), // 引脚的展示文案
        type_label: '简单二进制输出', // 组合类型展示文案
        used: used_devices.value[x.id] || [],
        used_label: used_devices.value[x.id]?.map(x => x.label)?.join('\n'),
        state: device_state.value[x.id]?.value,
      }))
    })
    // 舵机展示
    const servos_show = computed(() => {
      return servos_all.value.map((x, index) => ({
        ...x, // 保留原有属性
        type_label: '简单舵机', // 舵机类型展示文案
        pin_label: pinIdToName(x.pin), // 引脚的展示文案
        used: used_devices.value[x.id] || [],
        used_label: used_devices.value[x.id]?.map(x => x.label)?.join('\n'),
        state: device_state.value[x.id]?.value,
        min: x.min ?? SERVO_MIN,
        max: x.max ?? SERVO_MAX,
        index,
      }))
    })
    // 组合展示
    const groups_show = computed(() => {
      function toName(item: GroupType) {
        switch (item.type) {
          case '2En2Pwm':
            return `正转使能：${deviceIdToName(item.forward)}\n正转PWM：${deviceIdToName(item.forward_pwm)}\n反转使能：${deviceIdToName(item.back)}\n反转PWM：${deviceIdToName(item.back_pwm)}`
          case '2D1Pwm':
            return `正转方向：${deviceIdToName(item.forward)}\n反转方向：${deviceIdToName(item.back)}\nPWM调速：${deviceIdToName(item.pwm)}`
          case '2Pwm':
            return `正转PWM：${deviceIdToName(item.forward)}\n反转PWM：${deviceIdToName(item.back)}`
          case '1Pwm':
            return `PWM：${deviceIdToName(item.pwm)}`
        }
      }

      return groups_all.value.map(x => ({
        ...x, // 保留原有属性
        type_label: WalkGroupTypeName[x.type], // 组合类型展示文案
        pin_label: toName(x), // 引脚的展示文案
        used: used_devices.value[x.id] || [],
        used_label: used_devices.value[x.id]?.map(x => x.label)?.join('\n'),
        state: device_state.value[x.id]?.value,
      }))
    })

    // 已经使用的ping
    const used_pins = computed(() => {
      const used_list: {
        [key: string]: { label: string; device: string }[]
      } = {}

      function add(pin: string, label: string, device: string) {
        used_list[pin] = used_list[pin] || []
        used_list[pin].push({ label, device })
      }

      servos_all.value.forEach(item => {
        add(item.pin, `舵机(${item.name})使用`, item.id)
      })
      pwms_all.value.forEach(item => {
        add(item.pin, `PWM输出(${item.name})使用`, item.id)
      })
      digitals_all.value.forEach(item => {
        add(item.pin, `输出(${item.name})使用`, item.id)
      })
      return used_list
    })

    // 已经使用的设备
    const used_devices = computed(() => {
      const used_list = {} as Record<string, { label: string }[]>

      function add(pin: string, label: string) {
        used_list[pin] = used_list[pin] || []
        used_list[pin].push({ label })
      }

      // 组
      groups_all.value.forEach(item => {
        if (item.type === '2D1Pwm') {
          add(item.pwm, `电机驱动(${item.name})使用`)
          add(item.forward, `电机驱动(${item.name})使用`)
          add(item.back, `电机驱动(${item.name})使用`)
        } else if (item.type === '2En2Pwm') {
          add(item.forward_pwm, `电机驱动(${item.name})使用`)
          add(item.back_pwm, `电机驱动(${item.name})使用`)
          add(item.forward, `电机驱动(${item.name})使用`)
          add(item.back, `电机驱动(${item.name})使用`)
        } else if (item.type === '2Pwm') {
          add(item.forward, `电机驱动(${item.name})使用`)
          add(item.back, `电机驱动(${item.name})使用`)
        } else if (item.type === '1Pwm') {
          add(item.pwm, `电机驱动(${item.name})使用`)
        }
      })
      const chassis = useStoreChassis()
      if (chassis.mode === 'tank' || chassis.mode === 'mecanum') {
        add(chassis.motor['top-left'], `底盘左前轮使用`)
        add(chassis.motor['top-right'], `底盘右前轮使用`)
        add(chassis.motor['bottom-left'], `底盘左后轮使用`)
        add(chassis.motor['bottom-right'], `底盘右后轮使用`)
      } else if (chassis.mode === 'steering') {
        add(chassis.motor.wheel, `底盘驱动轮使用`)
        add(chassis.motor.wheel2, `底盘驱动轮2使用`)
        add(chassis.steering.pin, `底盘转向使用`)
      }
      const plugin = useStorePlugin()
      plugin.list.forEach(item => {
        item.useDevices.forEach(device => {
          add(device.id, `插件(${item.options.name}${device.label ? `-${device.label}` : ''})使用`)
        })
      })
      return used_list
    })

    // 转换pin id到pin name
    function pinIdToName(id?: string): string | undefined {
      if (!id) return ''
      return pins.value.find(item => item.id === id)?.name
    }

    // 设备id转设备名称
    function deviceIdToName(id?: string): string | undefined {
      if (!id) return ''
      if (isGroup(id)) {
        return groups_all.value.find(item => item.id === id)?.name
      } else if (isServo(id)) {
        return servos_all.value.find(item => item.id === id)?.name
      } else if (isPwm(id)) {
        return pwms_all.value.find(item => item.id === id)?.name
      } else if (isDigital(id)) {
        return digitals_all.value.find(item => item.id === id)?.name
      } else {
        return pinIdToName(id)
      }
    }

    function init() {
      clear()
      if (!useStoreLink().isLink) return Promise.reject()
      return executePromisesInSequence([refreshBuiltInIo, refreshExtend, refreshServos, refreshPwms, refreshDigitals, refreshGroups, upDeviceState])
    }

    function clear() {
      clearExtend()
      builtInIos.value = []
      clearServos()
      clearGroups()
      clearPwms()
      clearDigitals()
      control.clear()
    }

    async function reset(key?: string) {
      await showConfirmDialog({
        title: '提示',
        message: key ? '确认要重置此项设置为小车自带的设置吗？' : '确认要重置基础设置为小车自带的设置吗？',
      })
      try {
        const apis = {
          [OPTIONS.WALK_EXTENDS]: resetExtend,
          [OPTIONS.WALK_SERVOS]: resetServos,
          [OPTIONS.WALK_PWMS]: resetPwms,
          [OPTIONS.WALK_DIGITALS]: resetDigitals,
          [OPTIONS.WALK_GROUPS]: resetGroups,
        }
        if (key) {
          if (!apis[key]) return showToast('重置失败，未知选项')
          await apis[key]?.() // 重新初始化
        } else {
          clear()
          await executePromisesInSequence(Object.keys(apis).map(key => () => CarRemoveOption(key)))
          await init()
        }
        showToast('重置成功')
      } catch (e) {
        console.log(e)
        showToast('重置失败')
      }
    }

    return {
      init,
      clear,
      reset,
      auto: control.auto,
      deviceIdToName,
      pins,
      pins_use,
      pins_obj,
      groups,
      groups_show,
      servos,
      servos_show,
      pwms,
      pwms_show,
      digitals,
      digitals_show,
      extend,
      extend_show,
      device_state,
      used_pins,
      used_devices,
    }
  },
  {
    // 开启持久化
    persist: false,
  }
)

export function useStoreWalk() {
  return useStore(store)
}

function groupsFieldsFilter(list: GroupType[]) {
  let pub_key = ['id', 'name', 'type', 'reversal', 'auto_brake', 'builtIn']
  return list.map(item => {
    switch (item.type) {
      case '2En2Pwm':
        return fieldsFilter(item, ...pub_key, 'forward', 'back', 'forward_pwm', 'back_pwm')
      case '2D1Pwm':
        return fieldsFilter(item, ...pub_key, 'pwm', 'forward', 'back')
      case '2Pwm':
        return fieldsFilter(item, ...pub_key, 'forward', 'back')
      case '1Pwm':
        return fieldsFilter(item, ...pub_key, 'pwm')
    }
  })
}

// 生成数字类型的远程key,和小车代码同步，不允许随便修改，方便用更少的数据(两字节)就定位一个设备
const RemoteKey = {
  // 自定义输出
  digital(index: number) {
    return 10000 + index // 10000 ~ 11999
  },
  // 自定义pwm
  pwm(index: number) {
    return 12000 + index // 12000 ~ 13999
  },
  // 自定义舵机
  servo(index: number) {
    return 14000 + index // 14000 ~ 15999
  },
  // 自定义组合
  group(index: number) {
    return 16000 + index // 16000 ~ 17999
  },
  // 扩展里面定义的固定设备
  extendDrive(index: number) {
    return 18000 + index // 18000 ~ 19999
  },
}

// 生成完整的Pin的d
export const PinId = {
  extend(id: string, pin: number) {
    return `${PREFIX.EXTEND}${id}-${pin}`
  },
  pin(id: string | number) {
    return `${PREFIX.PIN}${id}`
  },
}

// 生成完整的设备id
export const DeviceId = {
  // 一个组合会使用多个pin，使用下标生成id，特殊处理
  extendGroup(id: string, index: number) {
    return `${PREFIX.GROUP}${id}-${index}`
  },

  // 舵机、pwm、电平、引脚都要pin字段且都是唯一的，所以用pin生成唯一id
  extendServo(id: string, pin: number) {
    return `${PREFIX.SERVO}${id}-${pin}`
  },
  extendPwm(id: string, pin: number) {
    return `${PREFIX.PWM}${id}-${pin}`
  },
  extendDigital(id: string, pin: number) {
    return `${PREFIX.DIGITAL}${id}-${pin}`
  },

  // 下面是自定义添加设备的id
  group(id: string) {
    return `${PREFIX.GROUP}${id}`
  },
  pwm(id: string) {
    return `${PREFIX.PWM}${id}`
  },
  servo(id: string) {
    return `${PREFIX.SERVO}${id}`
  },
  digital(id: string) {
    return `${PREFIX.DIGITAL}${id}`
  },
}

export const isPwm = (id?: string) => id?.startsWith(PREFIX.PWM)
export const isServo = (id?: string) => id?.startsWith(PREFIX.SERVO)
export const isDigital = (id?: string) => id?.startsWith(PREFIX.DIGITAL)
export const isGroup = (id?: string) => id?.startsWith(PREFIX.GROUP)
