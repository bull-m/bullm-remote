import { defineStore } from 'pinia'
import { store } from '../index.ts'
import { WsSendFuncMode } from '@/utils/car/message.ts'
import { UdpBindAt } from '@/utils/car/udp.ts'
import bus from '@/utils/bus.ts'

// 相机，视频流相关
export const useStore = defineStore(
  'camera',
  () => {
    const events: any[] = [] // 订阅了视频的事件
    let i = 0 // 帧率计数器
    let timer: any = null // 定时器
    let time = 0 // 记录上一次收到数据的时间

    const fps = ref(0) // 帧率
    const delay = ref(0) // 帧延迟

    function videoData(data: any) {
      dog_error = 0 // 重置错误计数器
      dog_run() // 重置狗狗
      delay.value = time ? Date.now() - time : 0
      time = Date.now()
      i += 1
      // 发送图片给图片处理模块
      bufferToImg(data).then(img => {
        events.forEach((callback: any) => {
          callback(img)
        })
      })
    }

    const isStart = ref(false) // 相机是否启动
    const camera_pause = ref(false)

    // 启动相机
    async function start() {
      camera_pause.value = false
      if (events.length === 0 || !is_init) return Promise.resolve()
      isStart.value = true
      await WsSendFuncMode(
        'camera',
        'start',
        {
          port: Number(UdpBindAt.split(':')[1]),
        },
        2000
      )
      dog_run()
      bus.on('timeout', dog_run)
    }

    // 关闭相机
    function stop() {
      dog_stop() // 停止狗狗
      isStart.value = false
      return WsSendFuncMode('camera', 'stop', undefined, 2000)
    }

    async function pause() {
      await WsSendFuncMode('camera', 'pause', undefined, 2000)
      camera_pause.value = true
    }

    let is_init = false // 是否初始化过
    function init() {
      clear()
      is_init = true
      bus.on('udp:array:1', videoData)
      bus.on('ws:array:1', videoData)
      timer = setInterval(() => {
        fps.value = i
        i = 0
      }, 1000)
      if (events.length > 0) return start()
      return Promise.resolve()
    }

    function clear() {
      is_init = false
      isStart.value = false // 设置状态就行，不用发送停止命令
      bus.off('udp:array:1', videoData)
      bus.off('ws:array:1', videoData)
      bus.off('timeout', dog_run)
      delay.value = 0
      fps.value = 0
      time = 0
      timer && clearInterval(timer)
      dog_stop() // 停止狗狗
    }

    // 添加视频监听器
    function addListener(callback: any) {
      const index = events.indexOf(callback)
      if (index > -1) {
        events.splice(index, 1)
      }
      events.push(callback)
      if (is_init && !isStart.value && events.length > 0) start()
    }

    // 移除视频监听器
    function removeListener(callback: any) {
      const index = events.indexOf(callback)
      if (index > -1) {
        events.splice(index, 1)
      }
      if (events.length === 0) {
        stop()
      }
    }

    // 看门狗
    let dog_error = 0 // 错误计数器
    let dog_timer: any = null // 定时器
    function dog_run() {
      clearTimeout(dog_timer)
      if (isStart.value) {
        // 启动状态
        // 超时没有收到数据，重启相机
        dog_timer = setTimeout(() => {
          if (camera_pause.value) {
            console.log('相机已暂停,跳过这次看门狗')
            dog_run()
            return
          }
          dog_error++
          if (dog_error > 3) {
            stop() // 停掉相机
            dog_error = 0
            showConfirmDialog({
              title: '错误',
              message:
                '已经尝试重启相机三次，还没有收到视频流，请检查网络和相机是否正常工作。（视频流使用UDP协议，需要确保小车能连接到你的控制设备）',
              confirmButtonText: '重启小车',
              cancelButtonText: '取消',
            }).then(() => {
              // TODO 重启小车
              stop().then(() => setTimeout(start, 1000))
            })
            return
          }
          showToast('超时没有收到视频流，尝试重启相机')
          stop().then(() => setTimeout(start, 1000))
        }, 5000)
      }
    }

    function dog_stop() {
      clearTimeout(dog_timer)
    }

    function bufferToImg(buffer: any) {
      const blob = new Blob([buffer], { type: 'image/jpeg' })
      if ('createImageBitmap' in window) {
        return createImageBitmap(blob)
      } else {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = URL.createObjectURL(blob)
        })
      }
    }

    return {
      init,
      start,
      pause,
      clear,
      addListener,
      removeListener,
      fps,
      delay,
    }
  },
  {
    // 开启持久化
    persist: false,
  }
)

export function useStoreCamera() {
  return useStore(store)
}
