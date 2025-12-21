import { LinkOption } from '@/store/link'

// 判断两个连接选项是否相同
export function isSameLinkOption(a?: LinkOption, b?: LinkOption) {
  if (!a || !b) return false
  if (a.type !== b.type) return false
  if (['ws', 'network'].includes(a.type) && a.type === b.type) {
    return (a as any).ip === (b as any).ip
  }
  return true
}
