<template>
  <div class="icon-view" v-if="options" :class="{ 'horizontal-layout': options?.position === 'top' }">
    <div class="icon-item-icon icon-shadow" :style="{ color: iconColor }">
      <slot>
        <ZIcon v-if="icon ?? options?.icon" :icon="icon ?? options.icon!" />
      </slot>
    </div>
    <div v-if="name ?? options?.name" class="icon-item-name" :style="{ color: nameColor }">
      {{ name ?? options?.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOptions } from '@/plugin/export.ts'

defineProps({
  icon: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  nameColor: {
    type: String,
    required: false,
  },
  iconColor: {
    type: String,
    required: false,
  },
})

const options = useOptions()
</script>

<style scoped lang="scss">
.icon-view {
  width: var(--side-width);
  height: var(--side-width);
  //background: rgba(2, 2, 2, 0.7);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    //background: rgba(100, 100, 100, 0.3);
    //transform: translateY(-2px);
    opacity: 0.9;
  }

  &:active {
    //background: rgba(100, 100, 100, 0.3);
    //transform: translateY(0);
    opacity: 0.8;
  }

  .icon-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;

    img {
      max-width: 40%;
      max-height: 40%;
      object-fit: contain;
    }
  }

  .icon-item-name {
    font-size: 14px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
    word-break: break-word;
    line-height: 1.2;
    //text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
    text-shadow:
      0 0 10px rgba(0, 0, 0, 0.6),
      -1px -1px rgba(0, 0, 0, 0.5),
      1px -1px rgba(0, 0, 0, 0.5),
      -1px 1px rgba(0, 0, 0, 0.5),
      1px 1px rgba(0, 0, 0, 0.5);
  }
}

// 当position为top时，横向排列
.icon-view.horizontal-layout {
  flex-direction: row;
  width: auto;
  background: transparent;
  padding: 0 13px;
  height: var(--top-height);

  .icon-item-icon {
    flex: none;
    margin-right: 5px;
  }

  .icon-item-name {
    flex: none;
    height: auto;
    text-align: left;
    font-size: 16px;
    padding: 0;
  }
}

// 当没有name时，图标居中

// 当没有slot内容且没有icon时，居中name
.icon-view:has(.icon-item-icon:empty):not(:has(.icon-item-name)) {
  .icon-item-name {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.icon-view:not(:has(.icon-item-icon img)):not(:has(.icon-item-icon :slotted(*))) {
  .icon-item-name {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
