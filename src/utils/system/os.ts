import { platform } from '@tauri-apps/plugin-os'

export function isMobile() {
  return ['android', 'ios'].includes(platform())
}
