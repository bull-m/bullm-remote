import mitt from 'mitt'
type Events = {
  'gamepad:axes:all': number[]
  'gamepad:axes': { index: number; value: number; label: string }
  'gamepad:button': { index: number; value: boolean; label: string }
  [key: string]: any
}
export default mitt<Events>()
