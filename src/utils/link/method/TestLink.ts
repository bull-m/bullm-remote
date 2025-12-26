import Http from '@/utils/car/http.ts'
import { CarInfo, LinkInstanceType, LinkUtilType } from '@/store/link'
import { isBlob } from '@/utils'
import $bus from '@/utils/bus.ts'
import { newMenu } from '@tauri-apps/api/menu/base'
import { OPTIONS } from '@/constants'

type LinkOption = {}
const info = {
  mac: '12:11',
  name: '示例车',
  type: 'nm-car-test',
  version: 'v1.0',
  hardware_version: 'v1.0',
  esp_reset_reason: 1,
  server: false,
}

const TestLink: LinkUtilType = {
  async getCarList(op: any): Promise<CarInfo[]> {
    return [{ ...info }]
  },
  async getCarInfo(mac: string, op: any) {
    return { ...info }
  },

  async isAllowConnect(mac: string, op: any) {},

  async connect(mac: string, linkOption: any): Promise<LinkInstanceType> {
    const instance = {
      onopen: () => {},
      onclose: e => {},
      onerror: e => {},
      onmessage_json: (data: object) => {},
      onmessage_byte: (data: Uint8Array) => {},
      onmessage_str: (data: string) => {},
      close: () => {},
      send: (data: string | number[] | Object) => {
        if (typeof data === 'string') {
          data = JSON.parse(data)
        }
        if (data instanceof DataView) {
          const hex = data.getUint8(0)
          if (hex === 0xfe) {
            const view = new Uint8Array(1)
            view[0] = 0xfe
            instance?.onmessage_byte(view)
          }
        } else {
          const json = data as any
          if (json.type === 'options') {
            if (json.mode === 'get') {
              const ops =
                {
                  [OPTIONS.BUILT_IN_IO]:
                    '[{"pin":7,"name":"IO7","func":["pwm","servo","input","output"]},{"pin":15,"name":"IO15","func":["pwm","servo","input","output"]},{"pin":16,"name":"IO16","func":["pwm","servo","input","output"]},{"pin":17,"name":"IO17","func":["pwm","servo","input","output"]},{"pin":18,"name":"IO18","func":["pwm","servo","input","output"]},{"pin":19,"name":"OTG_D-","func":["pwm","servo","input","output"]},{"pin":20,"name":"OTG_D+","func":["pwm","servo","input","output"]}]',
                  [OPTIONS.WALK_EXTENDS]:
                    '[{"id":"A","type":"pwms","address":64,"hz":3500,"name":"内置引脚扩展","chip":"pca9685","builtIn":true,"pins":[{"pin":10,"func":["pwm","digital","servo"]},{"pin":11,"func":["pwm","digital","servo"]},{"pin":12,"func":["pwm","digital","servo"]},{"pin":13,"func":["pwm","digital","servo"]}],"pwms":[{"pin":15,"hide":true},{"pin":4,"hide":true},{"pin":3,"hide":true},{"pin":8,"hide":true}],"digitals":[{"pin":14,"hide":true},{"pin":0,"hide":true},{"pin":2,"hide":true},{"pin":1,"hide":true},{"pin":5,"hide":true},{"pin":6,"hide":true},{"pin":9,"hide":true},{"pin":7,"hide":true}],"groups":[{"name":"电机1","builtIn":true,"type":"2D1Pwm","pwm":"p:A-15","forward":"o:A-14","back":"o:A-0"},{"name":"电机2","builtIn":true,"type":"2D1Pwm","pwm":"p:A-3","forward":"o:A-2","back":"o:A-1"},{"name":"电机3","builtIn":true,"type":"2D1Pwm","pwm":"p:A-4","forward":"o:A-5","back":"o:A-6"},{"name":"电机4","builtIn":true,"type":"2D1Pwm","pwm":"p:A-8","forward":"o:A-9","back":"o:A-7"}]}]',
                  [OPTIONS.WALK_GROUPS]: '[]',
                  [OPTIONS.WALK_PWMS]: '[{"id":"p:1","pin":"io:17","name":"大灯"}]',
                  [OPTIONS.WALK_DIGITALS]: '[{"id":"o:1","pin":"io:18","name":"喇叭"}]',
                  [OPTIONS.WALK_SERVOS]: '[{"id":"s:1","pin":"io:16","name":"云台俯仰","type":"180","def":0}]',
                  [OPTIONS.PZT]: '{"pitch_device":"s:1"}',
                  [OPTIONS.CHASSIS]: '{"mode":"tank","motor":{"top-left":"g:A-0","top-right":"g:A-1","bottom-left":"g:A-2","bottom-right":"g:A-3"}}',
                  [OPTIONS.SCREEN]:
                    '{"enable":true,"address":"60","modules":[{"type":0,"prefix":"wifi:"},{"type":2,"prefix":"ip: "},{"type":1,"prefix":"rssi: "}]}',
                }[json.key] || {}
              instance.onmessage_json({
                i: json.i,
                data: ops,
              })
            }
          } else if (json.type === 'walk') {
            if (json.mode === 'device-state') {
              instance.onmessage_json({
                i: json.i,
                data: {},
              })
            }
          } else if (json.type === 'i2c') {
            if (json.mode === 'scan') {
              instance.onmessage_json({
                i: json.i,
                data: new Array(128).fill(0),
              })
            }
          } else if (json.type === 'camera') {
            if (json.mode === 'start') {
              instance.onmessage_json({
                i: json.i,
              })
            }
          }
        }
      },
    }
    setTimeout(() => {
      instance.onopen()
      instance.onmessage_json({
        type: 'control-change',
        isControl: true,
      })
    }, 200)
    return instance
  },
}

export default TestLink
