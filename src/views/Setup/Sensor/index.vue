<template>
  <ZPopupSetup :reset="() => sensorStore.reset()" title="传感器" box-id="SetupSensor">
    <van-cell-group inset title="传感器">
      <van-cell v-for="(item, i) in sensorStore.options" class="group-cell" inset center clickable :title="item.name" :label="item.type">
        <template #value>
          {{
            useSensor(item.id)
              ?.values?.map(x => `${x.name}: ${x.value}${x.unit || ''}`)
              .join('\n')
          }}
        </template>
      </van-cell>
    </van-cell-group>
  </ZPopupSetup>
</template>

<script setup lang="ts">
import { useStoreWalk } from '@/store/control/walk.ts'
import ZPopupSetup from '@/components/base/ZPopupSetup.vue'
import { useStoreSensor } from '@/store/sensor'
import { useSensor } from '@/plugin/export'

const sensorStore = useStoreSensor()
</script>
<style lang="scss" scoped></style>
