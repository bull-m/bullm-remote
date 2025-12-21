// 在app内安装的npm包
import * as vue from 'vue'
import { PluginType } from '@/plugin'

const packages = {
  vue,
  // 其他npm包
} as Record<string, any>

const _require = (packageName: string) => {
  return packages[packageName]
}

// 从某个路径加载插件
export async function loadPluginCode(rawCode: string): Promise<PluginType> {
  // 初始化模块信息
  const _module = {
    exports: {},
  }
  const pluginError = Function(`
        'use strict';
        try {
            return function({require, module, exports}) {
                ${rawCode}
            }
        } catch (e) {
            return () => e;
        }
    `)()({
    require: _require,
    module: _module,
    exports: _module.exports,
  })
  if (pluginError) {
    console.error('插件加载失败：', pluginError)
    throw pluginError
  }
  return _module.exports as PluginType // 模块的导出
}

export async function loadPlugin(plugin: { origin: 'built-in' | 'remote' | 'custom'; source: string }): Promise<PluginType> {
  if (plugin.origin === 'built-in') {
    // 内置插件
    return await import(`@/plugin/built-in/${plugin.source}/index.ts`)
  } else if (plugin.origin === 'remote') {
    // 远程插件
    const response = await fetch(plugin.source)
    const rawCode = await response.text()
    return await loadPluginCode(rawCode)
  } else if (plugin.origin === 'custom') {
    // 自定义插件
    return await loadPluginCode(plugin.source)
  }
  throw new Error(`未知的插件类型：${plugin.origin}`)
}
