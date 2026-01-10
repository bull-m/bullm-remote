<template>
  <div class="remote-pole" ref="bgRef" :key="String(isDynamics)">
    <div class="ptz-tip" v-show="showPTZ">
      <DynamicsJt4 style="width: 100%; height: 100%" :pitch="isPtzPitch" :roll="isPtzRoll" />
    </div>
    <div class="box" ref="boxRef" :class="{ disable: showPTZ || !showYg }">
      <div class="more" ref="moreRef"></div>
      <div class="bj"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import DynamicsJt4 from './DynamicsJt4.vue'

const props = defineProps<{
  isDynamics: boolean // 是否动态模式
  isPtz?: boolean // 是否启用云台控制
  isPtzPitch?: boolean
  isPtzRoll?: boolean
  disableX?: boolean // 是否禁用X轴
  disableY?: boolean // 是否禁用Y轴
}>()

const emit = defineEmits<{
  (e: 'ptz', data: { x: number; y: number }): void
  (e: 'joystick', data: { x: number; y: number }): void
}>()

// 随机id
const id = String(Math.random()).slice(2)

const boxRef = ref<HTMLDivElement>()
const bgRef = ref<HTMLDivElement>()
const moreRef = ref<HTMLDivElement>()
const text = ref('')

const showPTZ = ref(false)
const showYg = ref(false)

watch([() => props.isDynamics, () => props.isPtz], () => {
  init()
})

onMounted(() => {
  init()
})

let timer: any

async function init() {
  await new Promise(resolve => resolve(1))
  upRect()
  clearTimeout(timer)
  if (props.isDynamics) {
    // 动态位置
    showYg.value = false
    bgRef.value?.addEventListener('touchstart', e => {
      upRect() // 更新矩形位置
      clearTimeout(timer)
      // e.preventDefault();
      // e.stopPropagation()
      showPTZ.value = false
      showYg.value = true
      isMove = false
      const touch = e.targetTouches[0]
      boxRef.value!.style.left = `${touch.clientX - bgRect.left}px`
      boxRef.value!.style.top = `${touch.clientY - bgRect.top}px`
      boxRef.value!.offsetWidth // 触发重绘
      upRect() // 更新矩形位置
      startYg()
      if (props.isPtz) {
        timer = setTimeout(() => {
          if (!isMove) {
            // 长按
            startPTZ(e)
            stopYg()
          }
        }, 300)
      }
    })
  } else {
    // 静态位置直接启用背景的触摸
    if (props.isPtz) {
      bgRef.value!.addEventListener('touchstart', e => {
        // e.preventDefault();
        startPTZ(e)
      })
    }
    showYg.value = true
    upRect() // 更新矩形位置
    boxRef.value?.addEventListener('touchstart', e => {
      // e.preventDefault();
      // e.stopPropagation()
      moreRef.value!.style.transition = 'transform 0.2s'
      startYg()
      handleYgMove(e)
    })
  }
}

let bgRect: DOMRect
let baseRect: DOMRect
let baseRadius: number
let moreRect: DOMRect
let stickRadius: number // joystick-stick的半径
function upRect() {
  bgRect = bgRef.value!.getBoundingClientRect()
  moreRect = moreRef.value!.getBoundingClientRect()
  stickRadius = Math.max(moreRect.width, moreRect.height) / 2 // joystick-stick的半径
  baseRect = boxRef.value!.getBoundingClientRect()
  baseRadius = Math.max(baseRect.width, baseRect.height) / 2
}

// 计算触摸点相对于摇杆中心的位置
let PztDeltaX: number
let PztDeltaY: number
const PztTouchend = (e: TouchEvent) => {
  e.preventDefault()
  stopPTZ()
  if (!props.isDynamics) {
    showYg.value = true
  }
}
const PztTouchmove = (e: TouchEvent) => {
  e.preventDefault()
  const touch = e.targetTouches[0]
  // 移动的位置
  let newX = ((touch.clientX - PztDeltaX) / baseRadius) * 100
  let newY = ((touch.clientY - PztDeltaY) / baseRadius) * 100
  emit('ptz', { x: Math.round(newX), y: Math.round(newY) })
  PztDeltaX = touch.clientX
  PztDeltaY = touch.clientY
}

function startPTZ(e: TouchEvent) {
  stopPTZ()
  showPTZ.value = true
  showYg.value = false
  const touch = e.touches[0]
  // 计算触摸点相对于摇杆中心的位置
  PztDeltaX = touch.clientX
  PztDeltaY = touch.clientY
  bgRef.value?.addEventListener('touchmove', PztTouchmove)
  bgRef.value?.addEventListener('touchend', PztTouchend)
}

function stopPTZ() {
  showPTZ.value = false
  bgRef.value?.removeEventListener('touchmove', PztTouchmove)
  bgRef.value?.removeEventListener('touchend', PztTouchend)
}

let isMove = false // 是否已经移动
function handleYgMove(e: TouchEvent) {
  e.preventDefault()
  const touch = e.targetTouches[0]
  const containerX = baseRect.left + baseRadius
  const containerY = baseRect.top + baseRadius
  const bigRadius = baseRadius - stickRadius

  // 计算触摸点相对于摇杆中心的位置
  let deltaX = touch.clientX - containerX
  let deltaY = touch.clientY - containerY
  let distance = 0
  if (!props.disableX && !props.disableY) {
    // 计算距离
    distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  } else if (props.disableX) {
    deltaX = 0
    distance = Math.abs(deltaY)
  } else if (props.disableY) {
    deltaY = 0
    distance = Math.abs(deltaX)
  }
  // 限制摇杆在基础范围内移动
  if (distance > bigRadius) {
    deltaX = (deltaX / distance) * bigRadius
    deltaY = (deltaY / distance) * bigRadius
  }
  emit('joystick', {
    x: Math.round((deltaX / bigRadius) * 255),
    y: -Math.round((deltaY / bigRadius) * 255),
  })
  // 更新摇杆位置
  moreRef.value!.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`
}

const ygTouchmove = (e: TouchEvent) => {
  isMove = true
  moreRef.value!.style.transition = ''
  handleYgMove(e)
}
const ygTouchend = (e: TouchEvent) => {
  clearTimeout(timer)
  e.preventDefault()
  moreRef.value!.style.transition = 'transform 0.2s'
  emit('joystick', { x: 0, y: 0 })
  moreRef.value!.style.transform = 'translate(-50%, -50%)'
  if (props.isDynamics) showYg.value = false
  stopYg()
}

function startYg() {
  stopYg()
  bgRef.value?.addEventListener('touchmove', ygTouchmove)
  bgRef.value?.addEventListener('touchend', ygTouchend)
}

function stopYg() {
  bgRef.value?.removeEventListener('touchmove', ygTouchmove)
  bgRef.value?.removeEventListener('touchend', ygTouchend)
}
</script>

<style scoped lang="scss">
.remote-pole {
  width: 100%;
  height: 100%;
  position: relative;

  .ptz-tip {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: #ffffff;
    text-align: center;
    font-weight: bold;
    user-select: none;
    pointer-events: none;
  }

  .box {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;

    &.disable {
      opacity: 0;
      pointer-events: none;
    }
    .more {
      width: 40%;
      height: 40%;
      border-radius: 50%;
      background-color: #ffffffcc;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 2;
    }
    .bj {
      width: 70%;
      height: 70%;
      border-radius: 50%;
      //background-color: #ff0000dd;
      box-sizing: border-box;
      border: 3px solid #ffffffdd;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 1;
    }
  }
}
</style>
