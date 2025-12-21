import $bus from '@/utils/bus.ts'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import { invoke, isTauri } from '@tauri-apps/api/core'

export let UdpBindAt = '0.0.0.0:6123'

// UDP数据包解析器
// 数据包格式：
// [包头(3)] [长度(3)] [类型(1)] [数据(n)] [校验和(1)] [包尾(3)]

// 常量定义
const INITIAL_BUFFER_SIZE = 64 * 1024 // 64KB
const MAX_BUFFER_SIZE = 0xffffff // 16MB
const HEADER_MARKER = [0xaa, 0x66, 0xaa]
const TAIL_MARKER = [0x66, 0xaa, 0x66]

// 状态变量
let buffer = new Uint8Array(INITIAL_BUFFER_SIZE)
let position = 0
let expectedLength = -1
// 统计数据
let totalPackets = 0 // 总包数统计
let invalidPackets = 0 // 无效包统计

setInterval(() => {
  totalPackets = 0 // 总包数统计
  invalidPackets = 0 // 无效包统计
}, 1000 * 60)

export const ValidPackage = ref(100)

let isInit = false
let unlisten: UnlistenFn | void
async function initUdp() {
  if (isInit) return
  if (!isTauri()) {
    showToast('非Tauri环境，无法初始化UDP')
    return
  }
  // 初始化udp
  await invoke('bind', {
    bindAt: UdpBindAt,
    broadcast: false,
  })
    .then(() => {
      isInit = true
      console.log('UDP初始化成功')
      showToast({
        message: '初始化UDP成功',
      })
    })
    .catch(e => {
      console.log('初始化UDP失败', e)
      showToast({
        message: '初始化UDP失败，这可能无法传输视频，3秒后会尝试重试',
      })
      setTimeout(() => {
        initUdp()
      }, 3000)
      return Promise.reject(e)
    })
  reset()
  unlisten && unlisten()
  unlisten = await listen('plugin://udp', x => {
    // TODO 检查ip是否是连接的ip
    let arr = (x.payload as any).data as number[]
    // 检查数据有效性
    if (!arr || arr.length === 0) return
    $bus.emit('timeout')
    totalPackets++
    const result = parse(arr)
    if (result.isComplete) {
      $bus.emit('udp:array', {
        data: result.data,
        type: result.type,
      })
      $bus.emit(`udp:array:${result.type}`, result.data)
    } else if (result.isInvalid) {
      invalidPackets++
    }
    ValidPackage.value = Math.round((invalidPackets / totalPackets) * 1000) / 10 // 计算丢包率
  }).catch(e => {
    console.log('初始化UDP监听失败', e)
  })
}

function parse(newData) {
  if (expectedLength !== -1) {
    if (expectedLength + 11 < position + newData.length) {
      invalidPackets++
      expectedLength = -1
      position = 0
    }
  }
  // 确保buffer有足够空间
  ensureBufferSize(newData.length)
  let start = position
  // 添加新数据
  buffer.set(newData, start)
  position = start + newData.length
  // 解析数据
  return parseBuffer(start, position)
}

function parseBuffer(start, end) {
  // 如果还没找到包的开始
  if (expectedLength === -1) {
    // 确保有足够的数据来检查头部 (增加1字节用于类型)
    if (end - start < 6) {
      // 小于6字节，直接认为无效数据
      console.log('小于6字节，直接认为无效数据')
      reset()
      return { isComplete: false, isInvalid: true }
    }
    // 检查起始标记
    if (checkHeader(0)) {
      // 计算预期长度
      expectedLength = (buffer[3] << 16) | (buffer[4] << 8) | buffer[5]
    } else {
      // 无效数据，重置缓冲区
      // console.log("无效数据，重置缓冲区");
      reset()
      return { isComplete: false, isInvalid: true }
    }
  }

  // 验证包长度的合理性
  if (expectedLength <= 0 || expectedLength >= MAX_BUFFER_SIZE) {
    console.log('验证包长度的合理性')
    reset()
    return { isComplete: false, isInvalid: true }
  }

  const totalRequired = expectedLength + 11 // 总长度 = 数据长度 + 头部(7) + 校验和(1) + 尾部(3)
  if (totalRequired > end) {
    // 数据不完整，等待更多数据
    return { isComplete: false, isInvalid: false }
  }
  // 数据超出了数据长度
  if (totalRequired < end) {
    console.log('数据超出了数据长度')
    return { isComplete: false, isInvalid: true }
  }

  const type = buffer[6]
  const dataEndIndex = totalRequired - 4 // 减去校验和(1)和尾部标记(3)
  const data = buffer.slice(7, dataEndIndex)

  // 获取接收到的校验和
  const receivedChecksum = buffer[dataEndIndex]
  // 计算校验和
  const calculatedChecksum = calculateChecksum(type, data)

  // 验证校验和和尾部标记
  if (calculatedChecksum === receivedChecksum && checkTail(dataEndIndex + 1)) {
    reset()
    return { isComplete: true, data, type, isInvalid: false }
  } else {
    // console.log("验证校验和和尾部标记");
    reset()
    return { isComplete: false, isInvalid: true }
  }
}

function ensureBufferSize(additionalSize) {
  const requiredSize = position + additionalSize
  if (requiredSize > buffer.length) {
    // 扩展 buffer，但不超过最大限制
    const newSize = Math.max(requiredSize, Math.min(buffer.length * 2, MAX_BUFFER_SIZE))
    const newBuffer = new Uint8Array(newSize)
    newBuffer.set(buffer.slice(0, position))
    buffer = newBuffer
  }
}

function calculateChecksum(type, data) {
  let sum = type // 初始值为类型字节
  for (let byte of data) {
    // 加入所有数据字节
    sum = (sum + byte) & 0xff
  }
  return sum
}

function checkHeader(startIndex) {
  return buffer[startIndex] === HEADER_MARKER[0] && buffer[startIndex + 1] === HEADER_MARKER[1] && buffer[startIndex + 2] === HEADER_MARKER[2]
}

function checkTail(startIndex) {
  return buffer[startIndex] === TAIL_MARKER[0] && buffer[startIndex + 1] === TAIL_MARKER[1] && buffer[startIndex + 2] === TAIL_MARKER[2]
}

function reset() {
  position = 0
  expectedLength = -1
}

// 获取统计信息
export function getStats() {
  return {
    total: totalPackets,
    invalid: invalidPackets,
    rate: totalPackets === 0 ? 0 : ((invalidPackets / totalPackets) * 100).toFixed(2),
  }
}
initUdp()
