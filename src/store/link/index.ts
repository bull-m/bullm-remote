// 模块
import { defineStore } from 'pinia'
import { store } from '../index.ts'
import $bus from '@/utils/bus.ts'
import { isBlob } from '@/utils'
import { useStoreCar } from '@/store/car.ts'
import Http from '@/utils/car/http.ts'
import { initCommunication, monitorWsById } from '@/utils/car/message.ts'
import WsLink from '@/utils/link/method/WsLink.ts'
import TestLink from '@/utils/link/method/TestLink.ts'
import HotspotLink from '@/utils/link/method/HotspotLink.ts'
import { itemFromKind } from '@tauri-apps/api/menu/submenu'
import { ref } from 'vue'

export type CarInfo = {
  mac: string
  name: string
  type: string
  version: string
  hardware_version: string
  esp_reset_reason?: number
  server?: boolean
}

export type LinkOption = (
  | {
      ip: string
      token: string
      type: 'ws'
    }
  | {
      type: 'test'
    }
  | {
      type: 'usb'
    }
  | {
      type: 'hotspot'
    }
  | {
      type: 'network'
      ip: string
      token: string
    }
) & {
  name: string
}

export type LinkInstanceType = {
  close: () => void
  send: (data: string | DataView) => void
  onopen: () => void
  onclose: (e: any) => void
  onerror: (e: any) => void
  onmessage_json: (data: any) => void
  onmessage_byte: (data: Uint8Array) => void
  onmessage_str: (data: string) => void
}

export type LinkUtilType = {
  getCarList(op: any): Promise<CarInfo[]>
  getCarInfo(mac: string, op: any): Promise<CarInfo | undefined>
  isAllowConnect(mac: string, op: any): Promise<void>
  connect(mac: string, linkOption: any): Promise<LinkInstanceType>
}

// 连接相关
export const useStore = defineStore(
  'link',
  () => {
    const linkOptions = ref<LinkOption[]>([])
    // 收藏的车
    const star_car = ref<CarInfo[]>([]) // 星标车
    // 默认打开的小车
    const default_mac = ref<string | undefined>(undefined)

    const connectMac = ref('')

    const connect = ref<
      {} & (
        | {
            state: 'error' | 'loading' | 'ununited'
            instance?: LinkInstanceType
            strength: number // 信号强度
            linkOption?: LinkOption
            info?: CarInfo
          }
        | {
            state: 'success'
            instance: LinkInstanceType
            strength: number // 信号强度
            linkOption: LinkOption
            info: CarInfo
          }
      )
    >({
      state: 'ununited',
      strength: 0,
    })
    const isLink = computed(() => connect.value.state === 'success')

    function init() {
      initCommunication()
    }

    function useLinkUtil(op: LinkOption): LinkUtilType {
      if (op.type === 'ws') {
        return WsLink
      }
      if (op.type === 'hotspot') {
        return HotspotLink
      }
      return TestLink
    }

    /**
     * 扫描链接的小车
     */
    async function scan(): Promise<{
      cars: (CarInfo & {
        links: LinkOption[]
      })[]
      links: {
        cars: CarInfo[]
        state: 'error' | 'success' | 'error-token'
        linkOption: LinkOption
      }[]
    }> {
      // 增加局域网的链接选项
      let links = [...linkOptions.value, { type: 'hotspot' as const, name: 'AP直连' }].map(linkOption => {
        return useLinkUtil(linkOption)
          .getCarList(linkOption)
          .then(cars => {
            return { linkOption, cars, state: 'success' as const }
          })
          .catch(e => {
            return { linkOption, cars: [] as CarInfo[], state: e?.status === 401 ? ('error-token' as const) : ('error' as const) }
          })
      })
      return Promise.all(links).then(result => {
        let carsList = [] as (CarInfo & {
          links: LinkOption[]
        })[]
        for (let i = 0; i < result.length; i++) {
          let { cars, state, linkOption } = result[i]
          if (state === 'success') {
            for (let j = 0; j < cars.length; j++) {
              // 是否有重复的车
              let req = carsList.find(item => item.mac === cars[j].mac)
              req ? req.links.push(linkOption) : carsList.push({ links: [linkOption], ...cars[j] })
            }
          }
        }
        return { cars: carsList, links: result }
      })
    }

    // 连接小车
    async function connectCar(mac: string, linkOption?: LinkOption) {
      const loading = showLoadingToast({
        message: '正在连接中...',
        duration: 0,
        overlay: true,
        overlayStyle: {background: 'rgba(0, 0, 0, 0)',}
      })
      if (!linkOption) {
        // mac地址，查询最近的链接
        const { cars } = await scan()
        let car = cars.find(item => item.mac === mac)
        if (!car) {
          showToast({ type: 'fail', message: '小车不在线，请检查你的连接配置' })
          throw new Error('小车不在线')
        }
        const link = car.links[0]
        linkOption = { ...link }
      }
      console.log('正在连接', mac, linkOption)
      try {
        close()
        // 等小车完成资源的清楚
        await new Promise(resolve => setTimeout(resolve, 500))
        connectMac.value = mac
        const LinkUtil = useLinkUtil(linkOption)
        // 获取小车信息
        const info = await LinkUtil.getCarInfo(mac, linkOption)
        if (!info) {
          showToast({ type: 'fail', message: '小车不在线，请检查你的连接配置' })
          throw new Error('小车不在线')
        }
        // 检查是否允许连接
        await LinkUtil.isAllowConnect(mac, linkOption)
        await new Promise(async (resolve: any, reject: any) => {
          const instance = await LinkUtil.connect(mac, linkOption)
          connect.value = {
            ...connect.value,
            linkOption,
            info: info,
            state: 'loading',
            instance: instance,
            strength: 0,
          }
          // 计时器，超时2秒未连接成功，自动关闭WebSocket
          let connectTimer: any = setTimeout(() => {
            reject && reject(new Error('超时'))
            connectTimer = null
            if (connect.value.instance === instance) {
              close() // 手动关闭WebSocket
            }
          }, 10000)

          instance.onopen = () => {
            connect.value.state = 'success'
            resolve({ ...connect.value })
            connectTimer && clearTimeout(connectTimer) // WebSocket已连接成功，清除计时器
            useStoreCar().init()
            monitorWsById('control-change', 2000).catch(e => {
              showNotify({ type: 'danger', message: '错误：您的小车没有响应必须的参数' })
              close()
            })
            instance.onclose = e => {
              console.log(e)
              connect.value.instance = undefined
              connect.value.state = 'ununited'
              close()
              reject && reject(e)
              reject = undefined
              if (e.code === 1006) {
                showConfirmDialog({
                  title: '提示',
                  message: '异常断开，是否重新连接？',
                }).then(() => {
                  connectCar(mac, linkOption)
                })
              } else if (e.code === 4004) {
                showToast({ message: e.reason })
              } else {
                showToast({ message: '已断开连接' })
              }
            }
          }
          instance.onerror = e => {
            connect.value.state = 'error'
            connect.value.instance = undefined
            reject && reject(e)
            reject = undefined
            console.log(e)
          }
          instance.onmessage_byte = (uint8: Uint8Array) => {
            const type = uint8[0] // 提取第一个字节作为类型标识
            const data = uint8.slice(1) // 删除第一个字节，获取实际数据
            $bus.emit('ws:array', { type, data })
            $bus.emit(`ws:array:${type}`, data)
          }
          instance.onmessage_json = (json: any) => {
            $bus.emit('ws:msg', json)
            if (json.type === 'msg') {
              // 通知
              showNotify({ type: 'primary', message: '小车：' + json.msg })
            }
            if (json.type) {
              // 有i属性,回调对应的方法
              $bus.emit('ws:msg:' + json.type, json)
            }
            if (json.i) {
              // 有i属性,回调对应的方法
              $bus.emit('ws:msg:' + json.i, json)
            }
          }
        }).finally(() => {
          loading.close()
        })
      } finally {
        loading.close()
      }
    }

    // 关闭连接
    function close() {
      connect.value.state = 'ununited'
      connectMac.value = ''
      useStoreCar().clear()
      try {
        if (connect.value?.instance) {
          connect.value.instance.close()
          connect.value.instance = undefined
        }
      } catch (e) {}
    }

    const connectIp = computed(() => {
      if (isLink.value) {
        if (connect.value.linkOption?.type === 'ws') {
          return connect.value.linkOption!.ip.includes(':') ? connect.value.linkOption!.ip : connect.value.linkOption!.ip + ':80'
        }
      }
      return undefined
    })

    return {
      connectIp,
      connectMac,
      linkOptions,
      connect,
      isLink,
      init,
      scan,
      close,
      connectCar,
      star_car,
      default_mac,
    }
  },
  {
    persist: {
      pick: ['linkOptions', 'star_car', 'default_mac'],
    },
  }
)

export function useStoreLink() {
  return useStore(store)
}
