<template>
  <ZPopup @open="open" style="width: 300px" v-model:show="show" title="改个名字">
    <van-field label-width="2.5em" disabled v-model="props.mac" label="MAC" />
    <van-field label-width="2.5em" v-model="new_name" label="名称" placeholder="重新命名，为空则使用默认名称" />
    <van-cell title="默认打开此小车" center>
      <template #value>
        <van-switch @update:model-value="default_mac = $event ? props.mac : undefined" :model-value="default_mac == props.mac" />
      </template>
    </van-cell>
    <div style="display: flex; margin-top: 10px; gap: 10px">
      <!--      <van-button-->
      <!--        type="warning"-->
      <!--        class="w-full"-->
      <!--        style="height: 38px; border-radius: 10px"-->
      <!--        square-->
      <!--        @click="onDelect">-->
      <!--        取消收藏-->
      <!--      </van-button>-->
      <van-button type="primary" class="w-full" style="height: 38px; border-radius: 10px" square @click="onSubmit">确定</van-button>
    </div>
  </ZPopup>
</template>

<script setup lang="ts">
import ZPopup from '@/components/base/ZPopup.vue'
import { useStoreLink } from '@/store/link'

const props = defineProps({
  mac: String,
  name: String,
})

const emit = defineEmits(['submit', 'delect'])

const show = defineModel<boolean>('show', { default: false })

const link = useStoreLink()

const new_name = ref('')
const onSubmit = () => {
  link.default_mac = default_mac.value
  if (new_name.value.length > 10) {
    showToast('名称不能超过10个字符哦')
    return
  }
  emit('submit', new_name.value)
  show.value = false
}

const default_mac = ref<string | undefined>(undefined)
function open() {
  new_name.value = props.name == props.mac ? '' : (props.name ?? '')
  default_mac.value = link.default_mac
}

function onDelect() {
  emit('delect')
  show.value = false
}
</script>
