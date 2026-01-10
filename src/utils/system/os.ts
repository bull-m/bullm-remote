import { platform as _platform } from '@tauri-apps/plugin-os'
import { isTauri } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import packageJson from '../../../package.json'

export const FrameworkTauri = 'tauri'
export const FrameworkWeb = 'web'

/**
 * 获取app版本
 */
export function getAppVersion(){
  return packageJson.version
}

// 上层框架
export function framework() {
  return isTauri() ? FrameworkTauri : FrameworkWeb
}

export function platform() {
  if (framework() === FrameworkTauri) {
    return _platform()
  }
  return 'web' // TODO 应该根据ua判断
}

export function isMobile() {
  return ['android', 'ios'].includes(platform())
}

/**
 * 窗口开始拖拽
 */
export function startDragging() {
  if (framework() === FrameworkTauri) {
    const appWindow = getCurrentWindow()
    return appWindow.startDragging()
  }
  return Promise.reject('当前环境不支持')
}

/**
 * 最小化
 */
export function appMinimize(){
  if (framework() === FrameworkTauri) {
    const appWindow = getCurrentWindow()
    return appWindow.minimize()
  }
}

/**
 *
 */
export function appToggleMaximize(){
  if (framework() === FrameworkTauri) {
    const appWindow = getCurrentWindow()
    return appWindow.toggleMaximize()
  }
}

export function appClose(){
  if (framework() === FrameworkTauri) {
    const appWindow = getCurrentWindow()
    return appWindow.close()
  }
}