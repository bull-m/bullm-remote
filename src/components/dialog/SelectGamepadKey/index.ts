import { openDialog } from '@/utils/ui/dialog.ts'
import Index from './index.vue'

export function openSelectGamepadKey(defKey?: number): Promise<number> {
  return new Promise((resolve, reject) => {
    openDialog(
      Index,
      {
        index: defKey,
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
