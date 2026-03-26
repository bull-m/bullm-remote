<template>
  <div
    v-bind="$attrs"
    class="z-horizontal-scroll"
    @wheel="onWheel">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const containerRef = ref<HTMLElement | null>(null)

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
</script>
