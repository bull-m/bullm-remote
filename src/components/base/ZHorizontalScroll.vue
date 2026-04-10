<template>
  <div
    v-bind="$attrs"
    class="z-horizontal-scroll"
    :class="{
      'mouse-drag-enabled': enableMouseDrag,
      'is-mouse-dragging': isMouseDragging,
    }"
    ref="containerRef"
    @dragstart.capture="onDragStartCapture"
    @selectstart.capture="onSelectStartCapture"
    @click.capture="onClickCapture"
    @mousedown="onMouseDown"
    @wheel="onWheel">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  enableMouseDrag: {
    type: Boolean,
    default: false,
  },
})

const enableMouseDrag = computed(() => props.enableMouseDrag)

const containerRef = ref<HTMLElement | null>(null)
const isMouseDragging = ref(false)
let didMouseDrag = false
let dragStartX = 0
let dragStartScrollLeft = 0
let removeDragListeners: null | (() => void) = null

function resolveContainer(target: EventTarget | null) {
  if (containerRef.value) return containerRef.value
  if (target instanceof HTMLElement) {
    containerRef.value = target
    return target
  }
  return null
}

function isScrollable(container: HTMLElement) {
  return container.scrollWidth > container.clientWidth
}

function stopMouseDrag() {
  isMouseDragging.value = false
  if (removeDragListeners) {
    removeDragListeners()
    removeDragListeners = null
  }
}

function onMouseDown(event: MouseEvent) {
  if (!enableMouseDrag.value) return
  if (event.button !== 0) return

  const container = resolveContainer(event.currentTarget)
  if (!container || !isScrollable(container)) return

  didMouseDrag = false
  dragStartX = event.clientX
  dragStartScrollLeft = container.scrollLeft
  isMouseDragging.value = false
  let isActivated = false

  const onMouseMove = (moveEvent: MouseEvent) => {
    const dx = moveEvent.clientX - dragStartX
    if (!isActivated) {
      if (Math.abs(dx) < 3) return
      isActivated = true
      isMouseDragging.value = true
      didMouseDrag = true
    }
    moveEvent.preventDefault()
    container.scrollLeft = dragStartScrollLeft - dx
  }
  const onMouseUp = () => {
    stopMouseDrag()
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('blur', onMouseUp)

  removeDragListeners = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('blur', onMouseUp)
  }
}

function onClickCapture(event: MouseEvent) {
  if (!didMouseDrag) return
  didMouseDrag = false
  event.preventDefault()
  event.stopPropagation()
}

function onDragStartCapture(event: DragEvent) {
  if (!enableMouseDrag.value) return
  event.preventDefault()
}

function onSelectStartCapture(event: Event) {
  if (!isMouseDragging.value) return
  event.preventDefault()
}

function onWheel(event: WheelEvent) {
  const container = resolveContainer(event.currentTarget)
  if (!container || !isScrollable(container)) return

  const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX
  if (!delta) return

  event.preventDefault()
  container.scrollBy({
    left: delta * 0.5,
  })
}

onBeforeUnmount(() => {
  stopMouseDrag()
})
</script>

<style scoped lang="scss">
.z-horizontal-scroll.mouse-drag-enabled {
  cursor: grab;
}
.z-horizontal-scroll.mouse-drag-enabled.is-mouse-dragging {
  cursor: grabbing;
  user-select: none;
}
.z-horizontal-scroll.mouse-drag-enabled {
  :deep(img) {
    -webkit-user-drag: none;
    user-drag: none;
  }
}
</style>
