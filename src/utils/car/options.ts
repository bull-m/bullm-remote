import { WsSendFuncMode, WsSendToCall } from '@/utils/car/message.ts'
import { OPTIONS } from '@/constants'
import { WatchHandle } from 'vue'

export function CarGetOption(key: string) {
  return WsSendFuncMode(
    'options',
    'get',
    {
      key: key,
    },
    2000
  )
}

export function CarGetOptionToObj(key: string) {
  return CarGetOption(key).then(res => {
    try {
      return JSON.parse(res.data)
    } catch (e) {
      return null
    }
  })
}

export function CarSetOption(key: string, value: any) {
  return WsSendFuncMode(
    'options',
    'set',
    {
      key: key,
      data: typeof value === 'object' ? JSON.stringify(value) : value,
    },
    2000
  )
}

export function CarRemoveOption(key: string) {
  return WsSendFuncMode('options', 'remove', {
    key: key,
  })
}

/**
 * 单向同步配置
 * @param key
 * @param data
 * @param op
 */
export function syncOptionCar<T>(
  key: string,
  op: {
    def?: any
    callback?: () => Promise<any> // 保存时会回调
    filter?: (data: T) => any
    load?: boolean
  } = {}
) {
  const data = ref<T>(op?.def ?? [])

  async function refresh() {
    data.value = (await CarGetOptionToObj(key)) ?? op.def ?? []
    // await op?.callback?.()
  }

  function start() {
    return watch(
      data,
      () => {
        const new_data = op?.filter?.(data.value) ?? data.value
        CarSetOption(key, new_data)
          .then(op?.callback)
          .then(_ => showToast('保存成功'))
          .catch(e => showToast('保存失败'))
      },
      { deep: true }
    )
  }

  let watchHandles: WatchHandle
  if (op?.load) {
    refresh().then(async _ => {
      // await op.callback?.() // 回调
      watchHandles = start()
    })
  }
  return {
    data,
    // 从云端刷新
    refresh: async () => {
      watchHandles && watchHandles.stop()
      await refresh()
      watchHandles = start()
    },
    // 取消监听
    clear: () => {
      watchHandles && watchHandles.stop()
      data.value = op.def ?? []
    },
    // 重置到云端的数据
    reset: async () => {
      // 重置
      watchHandles && watchHandles.stop()
      await CarRemoveOption(key)
      await refresh()
      await op.callback?.() // 回调
      watchHandles = start()
    },
  }
}
