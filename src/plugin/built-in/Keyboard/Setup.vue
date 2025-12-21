<template>
  <div>
    <SetUpItem
      :item="
        view.group(
          '速度控制',
          view.slider('def_speed', '默认速度', 10, 255, 1),
          view.switch('tall_ctrl_key', 'Ctrl键急行'),
          view.slider('tall_speed', '急行速度', 10, 255, 1),
          view.switch('slow_shift_key', 'Shift键缓行'),
          view.slider('slow_speed', '缓行速度', 10, 255, 1)
        )
      "
      :option="props.config" />
    <template v-if="chassis.mode === 'tank'">
      <SetUpItem
        :item="
          view.group(
            '行动按键',
            view.keyboardKey('forward_key', '前进'),
            view.keyboardKey('back_key', '后退'),
            view.keyboardKey('left_key', '左旋'),
            view.keyboardKey('right_key', '右旋')
          )
        "
        :option="props.config" />
    </template>
    <SetUpItem
      :item="
        view.group(
          '云台控制',
          view.keyboardKey('ptz_up_key', '往上'),
          view.keyboardKey('ptz_down_key', '往下'),
          view.switch('mousewheel', '鼠标滚轮控制俯仰')
        )
      "
      :option="props.config" />
  </div>
</template>

<script setup lang="ts">
import SetUpItem from '@/views/Setup/Plugin/SetUpItem.vue'
import view from '@/plugin/configView.ts'
import { useChassis } from '@/plugin/export.ts'

const chassis = useChassis()
const props = defineProps<{
  config: {}
}>()
</script>

<style scoped lang="scss"></style>
