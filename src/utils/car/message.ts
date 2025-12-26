import { invoke } from '@tauri-apps/api/core'
import { useStoreLink } from '@/store/link'
import $bus from '@/utils/bus.ts'
import Http from '@/utils/car/http.ts'
import axios from 'axios'
import { UdpBindAt } from '@/utils/car/udp.ts'
import { numTo2Byte } from '@/utils'

export function initCommunication() {
  $bus.off('send')
  $bus.off('ws:send')
  $bus.off('udp:send')
  // 适配旧版本
  $bus.on('send', (data: any) => {
    WsSend(data)
  })
  $bus.on('ws:send', (data: any) => {
    WsSend(data)
  })
  $bus.on('udp:send', (data: any) => {
    UdpSend(data)
  })
}

let seq = 0
/**
 * UDP发送数据
 * @param data
 */
export async function UdpSend(data: Array<number> | Object | string) {
  const { connectIp } = useStoreLink()
  if (!connectIp) {
    console.log('没有连接的小车')
    return
  }
  if (Array.isArray(data)) {
    if (data.length > 536) {
      throw new Error('数据长度过长')
    }
    seq++
    if (seq > 60000) {
      seq = 0
    }
    // 加入seq和校验码
    let new_data = [...data, ...numTo2Byte(seq), ...numTo2Byte(data.length)]
    // 计算校验码
    new_data = [...new_data, new_data.reduce((acc, cur) => (acc + cur) & 0xff, 0)]
    await invoke('send', {
      id: UdpBindAt,
      target: connectIp,
      message: new Uint8Array(new_data),
    })
    return
  }
  if (typeof data === 'object') {
    data = JSON.stringify(data)
  }
  await invoke('send_str', {
    id: UdpBindAt,
    target: connectIp,
    message: data,
  })
}

/**
 * WebSocket发送数据
 * @param data
 */
export function WsSend(data: Array<number> | Object) {
  const { connect, isLink } = useStoreLink()
  if (isLink) {
    connect.instance?.send(data)
  } else {
    console.log('没有连接的小车')
  }
}

/**
 * WebSocket触发函数
 * @param type
 * @param data
 * @param timeout
 * @constructor
 */
export function WsSendFunc(type, data: Object = {}, timeout = 1000) {
  return WsSendToCall({ type, ...data }, timeout)
}
/**
 * WebSocket触发函数
 */
export function WsSendFuncMode(type: string, mode: string, data: Object = {}, timeout = 1000) {
  return WsSendToCall({ type, mode, ...data }, timeout)
}

let id = 1
function getId() {
  if (id >= 1000) id = 1
  return id++
}

/**
 * WebSocket发送数据并监听返回
 * @param data
 * @param timeout
 */
export function WsSendToCall(data: Array<number> | Object, timeout = 1000) {
  // 生成一个id
  let id = getId()
  let promise = monitorWsById(id, timeout)
  WsSend({ i: id, ...data })
  return promise
}

/**
 * 监听对应的id消息
 * @param id ID
 * @param timeout 超时时间
 */
let timer
export function monitorWsById(id: string | number, timeout = 1000): Promise<any> {
  return new Promise((resolve, reject) => {
    function success(data) {
      timer && clearTimeout(timer)
      $bus.off('ws:msg:' + id, success)
      resolve(data)
    }
    $bus.on('ws:msg:' + id, success)
    // 超时监测
    timer = setTimeout(() => {
      $bus.off('ws:msg:' + id, success)
      reject()
    }, timeout)
  })
}
