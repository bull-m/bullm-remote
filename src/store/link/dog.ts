import { defineStore } from 'pinia'
import { store } from '../index.ts'
import { useStoreLink } from '@/store/link/index.ts'
import { WsSend } from '@/utils/car/message.ts'
import $bus from '@/utils/bus.ts'

// 看门狗
export const useStore = defineStore(
  'dog',
  () => {
    // ------------------ 超时检测 ------------------
    // 超过5秒未收到数据，则认为连接断开
    let t1: any = null
    let t2: any = null
    function timeout() {
      t1 && clearTimeout(t1)
      t2 && clearTimeout(t2)
      t1 = setTimeout(() => {
        WsSend([0xfe])
        // 5秒内没有收到数据，则认为连接断开
        t2 = setTimeout(() => {
          const link = useStoreLink()
          link.close()
          showToast('超时无数据响应，已断开连接')
        }, 7000)
      }, 7000)
    }
    function link_dog_on() {
      timeout()
      $bus.on('timeout', timeout)
      $bus.on('ws:array', timeout)
      $bus.on('ws:msg', timeout)
    }
    function link_dog_off() {
      t1 && clearTimeout(t1)
      t2 && clearTimeout(t2)
      $bus.off('timeout', timeout)
      $bus.off('ws:array', timeout)
      $bus.off('ws:msg', timeout)
    }
    // ------------------------------------

    function init() {
      clear()
      link_dog_on()
      return Promise.resolve()
    }

    function clear() {
      link_dog_off()
    }

    return {
      init,
      clear,
    }
  },
  {
    // 开启持久化
    persist: false,
  }
)

export function useStoreDog() {
  return useStore(store)
}
