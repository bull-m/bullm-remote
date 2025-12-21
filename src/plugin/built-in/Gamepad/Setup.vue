<template>
  <div>
    <!--    <SetUpItem  :item="view.pin('asd', 'aaa')" :options="props.config"/>-->
  </div>
</template>

<script setup lang="ts">
import $bus from '@/utils/bus.ts'
import { getConfigView } from '.'
import SetUpItem from '@/views/Setup/Plugin/SetUpItem.vue'
import view from '@/plugin/configView.ts'

const props = defineProps<{
  config: {}
}>()
</script>

<style scoped lang="scss"></style>
