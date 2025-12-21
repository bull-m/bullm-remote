<template>
  <div v-bind="$attrs" class="z-popover" ref="reference" @click="show = !show">
    <slot></slot>
  </div>
  <Teleport to="body">
    <transition name="fade" :duration="200">
      <div v-if="show && $slots.popup" ref="floating" class="floating" :class="placementSide" :style="[floatingStyles, arrowStyle]">
        <div class="floating-fade" v-show="middlewareData.arrow">
          <div v-show="showArrow" ref="floatingArrow" class="arrow"></div>
          <div class="content">
            <slot name="popup"></slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
<script setup>
import { ref } from 'vue'
import { offset, shift, flip, useFloating, autoUpdate, arrow } from '@floating-ui/vue'
import { useClickAway } from '@vant/use'

const show = defineModel('show')

const props = defineProps({
  placement: {
    type: String,
    default: 'bottom',
  },
  showArrow: {
    type: Boolean,
    default: true,
  },
  clickAwayClose: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits(['open', 'close'])
watch(show, value => {
  setTimeout(() => {
    emit(value ? 'open' : 'close')
  })
})

const reference = ref(null)
const floating = ref(null)
const floatingArrow = ref(null)
const { floatingStyles, middlewareData, placement } = useFloating(reference, floating, {
  middleware: [offset(6), shift(), flip(), arrow({ element: floatingArrow })],
  placement: props.placement,
  whileElementsMounted: autoUpdate,
  transform: false,
})
const arrowStyle = ref({})
const placementSide = computed(() => {
  return placement.value.split('-')[0] || props.placement.split('-')[0]
})

// 监听 placement 变化，更新 arrow 位置
watch(
  [placementSide, middlewareData],
  () => {
    const staticSide = {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right',
    }[placementSide.value]
    if (middlewareData.value.arrow) {
      const { x, y } = middlewareData.value.arrow
      arrowStyle.value = {
        '--arrow-left': x != null ? `${x}px` : '',
        '--arrow-top': y != null ? `${y}px` : '',
        ['--arrow-' + staticSide]: `${-floatingArrow.value.offsetWidth}px`,
      }
    }
  },
  {
    deep: true,
    immediate: true,
  }
)

// 点击弹出层外关闭弹出层
useClickAway(
  [floating, reference],
  () => {
    if (props.clickAwayClose) {
      show.value = false
    }
  },
  {
    eventName: 'touchstart',
  }
)
</script>
<style scoped lang="scss">
.z-popover {
  flex-shrink: 0;
  &:empty {
    display: none;
  }
}
.arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  transition: all 0.1s;
  top: var(--arrow-top);
  left: var(--arrow-left);
  right: var(--arrow-right);
  bottom: var(--arrow-bottom);

  .top & {
    border-top-color: var(--background);
  }

  .bottom & {
    border-bottom-color: var(--background);
  }

  .left & {
    border-left-color: var(--background);
  }

  .right & {
    border-right-color: var(--background);
  }
}

.floating {
  z-index: 21;
  transition: none;

  &.bottom .floating-fade {
    transform-origin: var(--arrow-left) top;
  }

  &.top .floating-fade {
    transform-origin: var(--arrow-left) bottom;
  }

  &.left .floating-fade {
    transform-origin: right var(--arrow-top);
  }

  &.right .floating-fade {
    transform-origin: left var(--arrow-top);
  }

  .floating-fade {
    transition: all 0.2s ease-in-out;
    transform-origin: var(--arrow-left) top;
    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.1));
  }

  .content {
    background-color: var(--background);
    border-radius: 10px;
    //box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
}

.fade-enter-from .floating-fade,
.fade-leave-to .floating-fade {
  opacity: 0;
  transform: scale(0.8);
}
</style>
