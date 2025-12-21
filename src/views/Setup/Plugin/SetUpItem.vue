<template>
  <van-cell-group v-if="item.type === 'group'" inset :title="item.name">
    <SetUpItem v-for="item2 in item.children" :item="item2" :option="option" />
  </van-cell-group>

  <van-radio-group v-else-if="item.type === 'radio'" v-model="option[item.key]">
    <van-cell :title="song.text" @click="option[item.key] = song.value" clickable v-for="song in item.options || []">
      <template #right-icon>
        <van-radio :name="song.value" />
      </template>
    </van-cell>
  </van-radio-group>

  <van-tabs style="margin-top: 20px" v-else-if="item.type === 'tabs'" animated type="card" offset-top="56px" duration="0.5" sticky>
    <SetUpItem v-for="item2 in item.children" :item="item2" :option="option" />
  </van-tabs>

  <van-tab v-else-if="item.type === 'tab'" :title="item.name">
    <SetUpItem v-for="item2 in item.children" :item="item2" :option="option" />
  </van-tab>

  <van-cell
    v-else-if="item.type === 'gamepad-key'"
    :title="item.name"
    is-link
    :value="GamepadButtonIndexToLabel(option[item.key])"
    @click="handleShortcutKeyClick(item)"></van-cell>

  <van-cell v-else-if="item.type === 'keyboard-key'" :title="item.name" is-link :value="option[item.key]" @click="selectKeyboard(item)"></van-cell>

  <ZVanSlider v-else-if="item.type === 'slider'" :label="item.name" v-model="option[item.key]" :min="item.min" :max="item.max" :step="item.step" />

  <ZVanSwitch v-else-if="item.type === 'switch'" :label="item.name" v-model="option[item.key]" />

  <ZVanPin v-else-if="item.type === 'pin'" :label="item.name" v-model="option[item.key]" />

  <ZVanDevice
    v-else-if="item.type === 'device'"
    :label="item.name"
    v-model="option[item.key]"
    :select-group="item.selectGroup"
    :select-pwm="item.selectPwm"
    :select-servo="item.selectServo"
    :select-digital="item.selectDigital" />

  <ZSelectIcon v-else-if="item.type === 'icon'" :label="item.name" v-model="option[item.key]" />
</template>

<script setup lang="ts">
import { GamepadButtonIndexToLabel } from '@/utils/device/gamepad.ts'
import { openSelectGamepadKey } from '@/components/dialog/SelectGamepadKey/index.ts'
import { useStoreWalk } from '@/store/control/walk.ts'
import { openSelectKeyboardCode } from '@/components/dialog/SelectKeyboardCode/index.ts'

const props = defineProps<{
  option: any
  item: any
}>()

function handleShortcutKeyClick(item: { name: string; key: string }) {
  openSelectGamepadKey(props.option[item.key]).then(res => {
    props.option[item.key] = res as number
  })
}
function selectKeyboard(item: { name: string; key: string }) {
  openSelectKeyboardCode(props.option[item.key]).then(res => {
    props.option[item.key] = res
  })
}
</script>

<style scoped lang="scss"></style>
