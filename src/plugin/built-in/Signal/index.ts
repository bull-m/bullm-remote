import Icon from './icon.vue'
import Popup from './Popup.vue'

export const voltage = ref(-1)

export function popup() {
  return Popup
}
export function icon() {
  return Icon
}
