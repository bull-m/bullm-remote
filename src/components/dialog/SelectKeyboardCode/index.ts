import { openDialog } from '@/utils/ui/dialog.ts'
import Index from './index.vue'

export function openSelectKeyboardCode(defCode?: string): Promise<number> {
  return new Promise((resolve, reject) => {
    openDialog(
      Index,
      {
        code: defCode,
        onSelect(key: number) {
          resolve(key)
          reject = () => {}
        },
      },
      {
        close() {
          reject()
        },
      }
    )
  })
}
