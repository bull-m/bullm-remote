import { platform as _platform } from '@tauri-apps/plugin-os'
import { isTauri } from '@tauri-apps/api/core'
export const FrameworkTauri = 'tauri'
export const FrameworkWeb = 'web'

export function platform(){
  return _platform()
// 上层框架
export function framework() {
  return isTauri() ? FrameworkTauri : FrameworkWeb
}

}

export function isMobile() {
  return ['android', 'ios'].includes(platform())
}

