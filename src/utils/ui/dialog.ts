import { type Component, markRaw, type Ref, ref, watch, type VNode } from 'vue'
import { getId } from '@/utils'
import { ActionSheet, ActionSheetAction } from 'vant'

export async function openDialog(
  component: (() => Promise<any>) | VNode<any> | Component | any,
  props?: {
    [key: string]: any
  },
  options?: {
    teleport?: string | HTMLElement
    close?: () => void
  }
) {
  const show = ref(false)
  const id = getId()
  const close = () => {
    show.value = false
  }
  const w = watch(show, newVal => {
    if (!newVal) {
      window.removeEventListener('popstate', close)
      w.stop()
      setTimeout(() => {
        dialogs.value = dialogs.value.filter(item => item.id !== id)
      }, 1500)
      if (options?.close) {
        options.close()
      }
    }
  })
  window.addEventListener('popstate', close)
  if (typeof component === 'function') {
    component = (await component()).default
  }
  if (component.install && component.install instanceof Function) {
    component = h(component)
  }
  const dialog = {
    component: markRaw(component),
    props,
    id,
    show: show as any,
    teleport: options?.teleport,
  }
  dialogs.value.push(dialog)
  setTimeout(() => {
    show.value = true
  })
  return {
    close: () => {
      show.value = false
    },
  }
}

export const dialogs = ref<
  {
    id: string
    component: any
    props?: { [key: string]: any }
    teleport?: string | HTMLElement
    show: Ref<boolean, boolean>
  }[]
>([])

export function showActionSheet<T = { value?: any }>(
  options: InstanceType<typeof ActionSheet>['$props'] & {
    actions: (ActionSheetAction & T)[]
  }
) {
  return openDialog(ActionSheet, options)
}
