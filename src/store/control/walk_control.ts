import { WsSend, WsSendFuncMode } from '@/utils/car/message.ts'
import { minMax, numTo2Byte } from '@/utils'
import { CONTROL, PWM_MAX, PWM_MIN, SERVO_MAX, SERVO_MIN } from '@/constants'
import { isDigital, isGroup, isPwm, isServo, useStoreWalk } from '@/store/control/walk.ts'
import { ref } from 'vue'
import { useStoreWarning } from '@/store/warning.ts'

// 通用运动有关
export const useWalkControl = () => {
  const device_state = ref<{ [key in string]: { value: number } }>({})

  function upDeviceState() {
    device_state.value = {}
    return WsSendFuncMode('walk', 'device-state', undefined, 2000).then(res => {
      Object.keys(res.data).forEach(key => {
        device_state.value[key] = { value: res.data[key] }
      })
    })
  }

  // 等待发送的数据
  let wait_send = {} as Record<string, { value: number | number[]; remote_key: number }>

  /**
   * 根据id自动控制
   * @param id - 设备id 或者 引脚id
   * @param value -1 ~ 1 // 根据数值最大值范围
   */
  const walk = useStoreWalk()

  function auto(id: string, value: number) {
    if (!id) {
      useStoreWarning().add(`缺少设备参数`, 'error')
      return
    }

    let remote_key = -1
    let new_value = value as number | number[]

    if (isGroup(id)) {
      const group = walk.groups_show.find(item => item.id === id)
      if (!group) {
        console.error('group not found', id)
        useStoreWarning().add(`ID为(${id})的设备不存在`, 'warning')
        return
      }
      value = minMax(Number(value), -PWM_MAX, PWM_MAX)
      new_value = [value > 0 ? 1 : 0, Math.abs(value)]
      remote_key = group.remote_key
    } else if (isServo(id)) {
      const servo = walk.servos_show.find(item => item.id === id)
      if (!servo) {
        console.error('servo not found', id)
        useStoreWarning().add(`ID为(${id})的设备不存在`, 'warning')
        return
      }
      // 舵机目前只支持180度
      if (value != 255) {
        new_value = value = minMax(value, servo.min ?? SERVO_MIN, servo.max ?? SERVO_MAX)
      }
      remote_key = servo.remote_key
    } else if (isPwm(id)) {
      const pwm = walk.pwms_show.find(item => item.id === id)
      if (!pwm) {
        useStoreWarning().add(`ID为(${id})的设备不存在`, 'warning')
        console.error('pwm not found', id)
        return
      }
      new_value = value = minMax(value, PWM_MIN, PWM_MAX)
      remote_key = pwm.remote_key
    } else if (isDigital(id)) {
      const output = walk.digitals_show.find(item => item.id === id)
      if (!output) {
        console.error('digital not found', id)
        useStoreWarning().add(`ID为(${id})的设备不存在`, 'warning')
        return
      }
      remote_key = output.remote_key
    }
    if (remote_key === -1) {
      useStoreWarning().add(`ID为(${id})的设备类型未知`, 'error')
      return
    }
    if (device_state.value[id]?.value === value) return // 相同值不重复发送
    device_state.value[id] = { value } // 保存状态
    wait_send[id] = {
      value: new_value,
      remote_key: remote_key,
    }
    sendMotionData()
  }

  let timer: any = null

  function sendMotionData() {
    if (Object.keys(wait_send).length === 0) return
    if (timer) return
    setTimeout(async () => {
      const txs: { [key: number]: number[] } = {}
      Object.keys(wait_send).forEach(id => {
        let data = wait_send[id]
        let mode = 0

        let arr = Array.isArray(data.value) ? data.value : [data.value]
        // 由于1字节和2字节的数据使用的多，所有给一个独立的控制指令
        if (arr.length === 1) {
          mode = CONTROL.BYTE1
        } else if (arr.length === 2) {
          mode = CONTROL.BYTE2
        } else if (arr.length <= 255){
          mode = CONTROL.BYTES // 多字节数据
          arr.unshift(arr.length)
        } else {
          throw '数据格式错误'
        }
        let load_data = [...numTo2Byte(data.remote_key), ...arr]
        // 准备数据
        txs[mode] = txs[mode] || []
        txs[mode].push(...load_data)
      })
      for (let mode in txs) {
        WsSend([Number(mode), ...txs[mode]]) // 发送数据
      }
      wait_send = {}
    })
    clearTimeout(timer)
    // 下次需要等待一下，太快会堵塞消息通道
    timer = setTimeout(() => {
      timer = null
      sendMotionData()
    }, 12)
  }

  function clear() {
    wait_send = {}
    device_state.value = {}
  }

  return {
    clear,
    auto,
    device_state,
    upDeviceState,
  }
}
