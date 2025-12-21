<template>
  <ZPopupSetup v-model:show="show" title="小车连接配置">
    <WiFiList @error="show = false" />
    <Token />
    <Network />
  </ZPopupSetup>
</template>

<script setup lang="ts">
import ZPopupSetup from '@/components/base/ZPopupSetup.vue'
import WiFiList from './WiFiList.vue'
import Token from './Token.vue'
import Network from './Network.vue'
const show = defineModel<boolean>('show')
</script>
