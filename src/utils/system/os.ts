import { platform as _platform } from '@tauri-apps/plugin-os'

export function platform(){
  return _platform()
}

export function isMobile() {
  return ['android', 'ios'].includes(platform())
}

