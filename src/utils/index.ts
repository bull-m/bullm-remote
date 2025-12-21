import { openUrl as tauriOpenUrl } from '@tauri-apps/plugin-opener'
import { isTauri } from '@tauri-apps/api/core'
import { useStoreWarning } from '@/store/warning.ts'

export function toHexStr(i?: number | string) {
  if (i == void 0) return ''
  if (typeof i == 'string') i = parseInt(i)
  return (i < 16 ? '0x0' : '0x') + i.toString(16).toLocaleUpperCase()
}

export function isBlob(obj) {
  return obj instanceof Blob && typeof obj.size === 'number' && typeof obj.type === 'string'
}

export function mapTo(val, I_Min = 0, I_Max = 1, O_Min = 0, O_Max = 4095) {
  return (val - I_Min) * ((O_Max - O_Min) / (I_Max - I_Min)) + O_Min
}

export function numTo2Byte(long) {
  let byteArray = [0, 0]
  for (let i = byteArray.length - 1; i >= 0; i--) {
    let byte = long & 0xff
    byteArray[i] = byte
    long = (long - byte) / 256
  }
  return byteArray
}

export function getId() {
  return Math.random().toString(36).substr(2, 9)
}

export function minMax(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max)
}

export function fieldsFilter(obj: any, ...fields: string[]) {
  let newObj = {} as any
  fields.forEach(field => {
    if (obj.hasOwnProperty(field)) {
      newObj[field] = obj[field]
    }
  })
  return newObj
}

export function fieldsFilterHigh(...fields: string[]) {
  return (obj: any) => {
    return fieldsFilter(obj, ...fields)
  }
}

export function delectUndefined(obj: any) {
  let newObj = {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
      newObj[key] = obj[key]
    }
  }
  return newObj
}

// Promise 顺序执行并在报错时返回
export async function executePromisesInSequence(promises: (() => Promise<any>)[]) {
  for (let i = 0; i < promises.length; i++) {
    try {
      await promises[i]()
    } catch (error) {
      console.error('执行过程中出错:', error, i)
      throw error // 中断执行
    }
  }
  return '所有Promise执行完成'
}

// 生成随机id
export function generateRandomId(num: number = 10, nos?: string[]) {
  let id = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const length = characters.length
  for (let i = 0; i < num; i++) {
    id += characters.charAt(Math.floor(Math.random() * length))
  }
  if (nos && nos.includes(id)) {
    // 若生成的id已存在于数组中，则重新生成
    return generateRandomId(num, nos)
  }
  return id
}

export function validatorIp(val) {
  if (val === '') return true
  return (
    /^([0-9]{1,3}\.){3}[0-9]{1,3}$/.test(val) ||
    /^([0-9]{1,3}\.){3}[0-9]{1,3}:\d+$/.test(val) ||
    /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/.test(val) ||
    /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}:\d+$/.test(val)
  )
}

export function openUrl(url: string) {
  if (isTauri()) {
    tauriOpenUrl(url)
      .then(() => {
        showToast('已使用系统浏览器打开')
      })
      .catch(e => {
        console.error(e)
        useStoreWarning().add(`打开链接失败了，未知原因：${url}`)
      })
  } else {
    window.open(url)
  }
}
