import $bus from '@/utils/bus.ts'

const modifiers = ['Ctrl', 'Alt', 'Shift']
// 按键映射
const Keyboard = {
  Control: 'Ctrl',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  ArrowDown: 'Down',
  ArrowUp: 'Up',
}
// 小写到大写
for (let keyCode = 65; keyCode <= 90; keyCode += 1) {
  const keyName = String.fromCharCode(keyCode + 32)
  Keyboard[keyName] = String.fromCharCode(keyCode)
}

// 当前按下的键盘按键
export const KeyboardKey = reactive<{
  [key: string]: boolean | undefined
  Alt?: boolean
  Ctrl?: boolean
  Shift?: boolean
}>({})
export const KeyboardStr = ref('')

function update() {
  // 将 Shift、Alt、Ctrl 排在前面
  const keys = Object.keys(KeyboardKey).sort((a, b) => {
    const isModifierA = modifiers.includes(a)
    const isModifierB = modifiers.includes(b)
    if (isModifierA && !isModifierB) return -1
    if (!isModifierA && isModifierB) return 1
    return a.localeCompare(b)
  })
  KeyboardStr.value = keys.join('+')
  $bus.emit('keyboard:change', {
    str: KeyboardStr.value,
    keys: KeyboardKey,
  })
}

function toKey(e: KeyboardEvent) {
  return Keyboard[e.key] || e.key
}

function keydown(e: KeyboardEvent) {
  KeyboardKey[toKey(e)] = true
  update()
  $bus.emit('keyboard:down', {
    key: toKey(e),
    str: KeyboardStr.value,
    keys: KeyboardKey,
  })
}

function keyup(e: KeyboardEvent) {
  delete KeyboardKey[toKey(e)]
  update()
  $bus.emit('keyboard:up', {
    key: toKey(e),
    str: KeyboardStr.value,
    keys: KeyboardKey,
  })
}

function keypress(e) {
  $bus.emit('keyboard:press', {
    code: e.code,
    key: e.key,
    isAlt: e.altKey,
    isCtrl: e.ctrlKey,
    isShift: e.shiftKey,
  })
}

function mousewheel(e) {
  $bus.emit('keyboard:mousewheel', {
    deltaX: e.deltaX,
    deltaY: e.deltaY,
    isUp: e.deltaY == 0 ? undefined : e.deltaY < 0,
  })
}

function reset() {
  console.log('系统消息:窗口隐藏或失去焦点')
  for (let key in KeyboardKey) {
    delete KeyboardKey[key]
  }
  update()
  $bus.emit('window:blur')
}

function visibilitychange() {
  if (document.visibilityState === 'hidden') {
    reset()
  }
  $bus.emit('keyboard:visibilitychange', document.visibilityState === 'visible')
}

export function KeyboardInit() {
  window.addEventListener('keydown', keydown, false)
  window.addEventListener('keyup', keyup, false)
  window.addEventListener('keypress', keypress, false)
  window.addEventListener('mousewheel', mousewheel, false)
  document.addEventListener('visibilitychange', visibilitychange)
  window.addEventListener('blur', reset)
}

export function KeyboardClear() {
  window.removeEventListener('keydown', keydown, false)
  window.removeEventListener('keyup', keyup, false)
  window.removeEventListener('keypress', keypress, false)
  window.removeEventListener('mousewheel', mousewheel, false)
  document.removeEventListener('visibilitychange', visibilitychange)
  window.removeEventListener('blur', reset)
}
