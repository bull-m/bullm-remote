import Http from '@/utils/car/http.ts'
import { CarInfo, LinkInstanceType, LinkUtilType } from '@/store/link'
import { isBlob } from '@/utils'
import $bus from '@/utils/bus.ts'

type LinkOption = {
  ip: string
  token: string
  type: 'ws'
}

const WsLink: LinkUtilType = {
  // 获取通道的所有车
  async getCarList(op: LinkOption): Promise<CarInfo[]> {
    return await Http.get(`http://${op.ip}/api/info`, {
      timeout: 500,
      params: { token: op.token },
    }).then((cars: CarInfo[]) => {
      if (!Array.isArray(cars)) cars = [cars]
      return cars
    })
  },
  async getCarInfo(mac: string, op: LinkOption) {
    return await Http.get(`http://${op.ip}/api/info`, {
      timeout: 500,
      params: { token: op.token },
    }).then((cars: CarInfo[]) => {
      if (!Array.isArray(cars)) cars = [cars]
      return cars.find(item => item.mac === mac) || undefined
    })
  },

  async isAllowConnect(mac: string, op: LinkOption) {
    await Http.get(`http://${op.ip}/api/ws/valid`, {
      params: { token: op.token, mac: mac },
    })
      .then(() => {
        return false // 验证通过，不需要踢掉其他用户
      })
      .catch(e => {
        if (e.status === 401) {
          throw new Error('Token不正确，请检查')
        } else if (e.status === 402) {
          // loading.close()
          return showConfirmDialog({
            title: '提示',
            message: '有其他设备正在控制，你想要断开他并重新连接吗？',
          })
            .catch(() => {
              throw new Error('有其他用户正在控制')
            })
            .then(() => {
              // loading.open({})
              // 清楚其他用户的控制
              return Http.get(`http://${op.ip}/api/ws/clear`, {
                params: { token: op.token },
              }).catch(res => {
                throw new Error('尝试断开其他设备时失败了')
              })
            })
        }
        throw e
      })
  },

  async connect(mac: string, linkOption: LinkOption): Promise<LinkInstanceType> {
    let ws = new WebSocket(`ws://${linkOption.ip}/ws?token=${linkOption.token}&mac=${mac}`)
    const instance = {
      onopen: () => {},
      onclose: e => {},
      onerror: e => {},
      onmessage_json: (data: object) => {},
      onmessage_byte: (data: Uint8Array) => {},
      onmessage_str: (data: string) => {},
      close: () => {
        ws.onopen = () => {}
        ws.onclose = () => {}
        ws.onerror = () => {}
        ws.onmessage = () => {}
        ws.close()
      },
      send: (data: string | number[] | Object) => {
        if (ws.readyState !== WebSocket.OPEN) return
        if (typeof data === 'string') {
          ws.send(data)
        } else if (Array.isArray(data)) {
          ws.send(new Uint8Array(data))
        } else {
          ws.send(JSON.stringify(data))
        }
      },
    }
    ws.onopen = () => instance.onopen()
    ws.onclose = e => instance.onclose(e)
    ws.onerror = e => instance.onerror(e)
    ws.onmessage = (msg: MessageEvent<any>) => {
      if (isBlob(msg.data)) {
        // 兼容低版本浏览器
        if (typeof msg.data.arrayBuffer === 'function') {
          // 现代浏览器
          msg.data.arrayBuffer().then(uint8Array => {
            if (uint8Array.byteLength === 0) {
              console.warn('Received empty binary message')
              return
            }
            instance.onmessage_byte(uint8Array)
          })
        } else {
          // 低版本浏览器使用 FileReader
          const reader = new FileReader()
          reader.onload = (e) => {
            if (!e.target) return
            const uint8Array = new Uint8Array(e.target.result as ArrayBuffer)
            if (uint8Array.byteLength === 0) {
              console.warn('Received empty binary message')
              return
            }
            instance.onmessage_byte(uint8Array)
          }
          reader.onerror = () => {
            console.error('Failed to read binary message')
          }
          reader.readAsArrayBuffer(msg.data)
        }
        return
      }
      try {
        instance.onmessage_json(JSON.parse(msg.data))
      } catch (e) {
        instance.onmessage_str(msg.data)
      }
    }
    return instance
  },
}

export default WsLink
