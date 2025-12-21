import $bus from '@/utils/bus.ts'

// 添加手柄配置接口
interface GamepadConfig {
  deadZone: number // 死区设置
  buttonMapping: Record<number, string> // 按键映射
  axesMapping: Record<number, string> // 摇杆映射
}

// 默认配置
const DEFAULT_CONFIG: GamepadConfig = {
  deadZone: 0.1,
  buttonMapping: {
    // 主要按钮 (Face buttons)
    0: 'A', // Xbox: A, PS: ×
    1: 'B', // Xbox: B, PS: ○
    2: 'X', // Xbox: X, PS: □
    3: 'Y', // Xbox: Y, PS: △

    // 肩部按钮 (Shoulder buttons)
    4: 'LB', // 左肩键 (Left Bumper)
    5: 'RB', // 右肩键 (Right Bumper)
    6: 'LT', // 左扳机 (Left Trigger)
    7: 'RT', // 右扳机 (Right Trigger)

    // 功能按钮
    8: 'SELECT', // Select/Back/Share
    9: 'START', // Start/Options

    // 摇杆按压
    10: 'L3', // 左摇杆按压 (Left Stick Press)
    11: 'R3', // 右摇杆按压 (Right Stick Press)

    // 方向键 (D-Pad)
    12: 'DPAD_UP', // 方向键上
    13: 'DPAD_DOWN', // 方向键下
    14: 'DPAD_LEFT', // 方向键左
    15: 'DPAD_RIGHT', // 方向键右

    // 特殊按钮 (不是所有手柄都有)
    16: 'HOME', // Home/Guide/PS按钮
    17: 'TOUCHPAD', // PS4/PS5触摸板按压
  },
  axesMapping: {
    // 左摇杆
    0: 'LEFT_STICK_X', // 左摇杆X轴
    1: 'LEFT_STICK_Y', // 左摇杆Y轴

    // 右摇杆
    2: 'RIGHT_STICK_X', // 右摇杆X轴
    3: 'RIGHT_STICK_Y', // 右摇杆Y轴

    // 某些手柄的方向键也会被映射为轴
    4: 'DPAD_X', // 方向键X轴
    5: 'DPAD_Y', // 方向键Y轴

    // 模拟扳机（某些手柄）
    6: 'LEFT_TRIGGER', // 左扳机轴
    7: 'RIGHT_TRIGGER', // 右扳机轴
  },
}

// 添加手柄类型枚举
enum GamepadType {
  XBOX = 'xbox',
  PLAYSTATION = 'playstation',
  NINTENDO = 'nintendo',
  GENERIC = 'generic',
}

// 添加按键别名配置，用于不同类型手柄的按键映射
const BUTTON_ALIASES: Record<GamepadType, Record<string, string>> = {
  [GamepadType.XBOX]: {
    A: 'A',
    B: 'B',
    X: 'X',
    Y: 'Y',
    LB: 'LB',
    RB: 'RB',
    SELECT: 'SELECT',
    START: 'START',
    HOME: 'XBOX',
  },
  [GamepadType.PLAYSTATION]: {
    A: 'CROSS',
    B: 'CIRCLE',
    X: 'SQUARE',
    Y: 'TRIANGLE',
    LB: 'L1',
    RB: 'R1',
    SELECT: 'SHARE',
    START: 'OPTIONS',
    HOME: 'PS',
  },
  [GamepadType.NINTENDO]: {
    A: 'B',
    B: 'A',
    X: 'Y',
    Y: 'X',
    LB: 'L',
    RB: 'R',
    SELECT: 'MINUS',
    START: 'PLUS',
    HOME: 'HOME',
  },
  [GamepadType.GENERIC]: {
    A: 'BUTTON_1',
    B: 'BUTTON_2',
    X: 'BUTTON_3',
    Y: 'BUTTON_4',
    LB: 'L1',
    RB: 'R1',
    SELECT: 'SELECT',
    START: 'START',
    HOME: 'HOME',
  },
}

let gamepad: Gamepad | null = null
export const selectIndex = ref(-1)

export const GamepadIsLink = computed(() => selectIndex.value >= 0 && GamepadCurrent.value.isLink)

export const GamepadCurrent = computed(() => {
  const gamepad = getGamepad()
  return {
    isLink: !!gamepad,
    id: gamepad?.id,
    index: gamepad?.index,
    type: getGamepadType(),
    mapping: gamepad?.mapping,
    buttons: gamepad?.buttons,
    axes: gamepad?.axes,
  }
})

export const gamepadType = ref(getGamepadType())

// 已经插入的手柄
export const gamepads = ref<
  {
    index: number
    name: string
  }[]
>([])

function getGamepad() {
  return navigator.getGamepads()[selectIndex.value]
}

// 当前按下的键盘按键,
export const GamepadButtons = ref([] as boolean[])
export const GamepadAxes = ref([] as number[])
export const GamepadButtonsDef: boolean[] = new Array(20).fill(false)
export const GamepadAxesDef: number[] = new Array(20).fill(0)

let animationFrameId: number
watch(selectIndex, val => {
  GamepadButtons.value = [...GamepadButtonsDef]
  GamepadAxes.value = [...GamepadAxesDef]
  // 选择手柄
  gamepad = val >= 0 ? navigator.getGamepads()[val] : null
  cancelAnimationFrame(animationFrameId)
  if (getGamepad()) {
    gamepadType.value = getGamepadType()
    GamepadVibration()
    setTimeout(() => {
      GamepadVibration()
    }, 400)
    const update = () => {
      updata()
      animationFrameId = requestAnimationFrame(update)
    }
    update()
  }
})

function gamepadHandler(event, connecting) {
  if (connecting) {
    console.log('手柄插入', event.gamepad)
  } else {
    console.log('手柄拔出', event.gamepad)
  }
  // 原来选择的还可以用
  if (navigator.getGamepads()[selectIndex.value]?.connected) return
  // 重新选择一个可用的手柄
  selectIndex.value = -1
  navigator.getGamepads().some(gamepad => {
    if (gamepad) selectIndex.value = gamepad.index
    return !!gamepad
  })
  gamepads.value = navigator
    .getGamepads()
    .filter(gamepad => !!gamepad)
    .map(gamepad => ({
      index: gamepad.index,
      name: gamepad.id,
    }))
}

window.addEventListener('gamepadconnected', e => gamepadHandler(e, true), false)
window.addEventListener('gamepaddisconnected', e => gamepadHandler(e, false), false)

function updata() {
  const gamepad = getGamepad()
  if (!gamepad) return
  // 按钮状态更新
  gamepad.buttons.forEach((button, index) => {
    const pressed = button.pressed || button.value == 1
    if (GamepadButtons.value[index] !== pressed) {
      GamepadButtons.value[index] = pressed
      $bus.emit('gamepad:button', { index, value: pressed, label: getButtonLabel(index) })
    }
  })

  // 摇杆状态更新，添加阈值判断
  const axiss = gamepad.axes.map((axis, index) => {
    // 只有当摇杆移动超过阈值时才触发
    if (Math.abs(axis) < DEFAULT_CONFIG.deadZone) axis = 0
    // 重新映射超出死区的值到 0-1 范围
    const sign = Math.sign(axis)
    axis = (sign * (Math.abs(axis) - DEFAULT_CONFIG.deadZone)) / (1 - DEFAULT_CONFIG.deadZone)
    axis = Math.round(axis * 1000) / 1000 // 四舍五入到小数点后三位
    if (GamepadAxes.value[index] !== axis) {
      $bus.emit('gamepad:axes', { index, value: axis, label: DEFAULT_CONFIG.axesMapping[index] })
    }
    return axis
  })
  // 是否不同
  if (axiss.join(',') !== GamepadAxes.value.join(',')) {
    $bus.emit('gamepad:axes:all', axiss)
    GamepadAxes.value = axiss
  }
}

function getButtonLabel(index: number) {
  const label = DEFAULT_CONFIG.buttonMapping[index]
  if (BUTTON_ALIASES[gamepadType.value]?.[label]) {
    return BUTTON_ALIASES[gamepadType.value][label]
  }
  return label
}

export function GamepadVibration(value: number = 1, duration: number = 200) {
  if (!gamepad) return Promise.reject(false)

  // Firefox 使用 hapticActuators
  // @ts-ignore
  if (gamepad.hapticActuators && gamepad.hapticActuators.length > 0) {
    // @ts-ignore
    return gamepad.hapticActuators[0].pulse(value, duration)
  }

  // Chrome 和其他浏览器使用 vibrationActuator
  if (gamepad.vibrationActuator) {
    return gamepad.vibrationActuator.playEffect('dual-rumble', {
      startDelay: 0,
      duration: duration,
      weakMagnitude: value,
      strongMagnitude: value,
    })
  }

  return Promise.reject(false)
}

export function getGamepadType(): string {
  if (!gamepad) return GamepadType.GENERIC
  // 根据手柄ID判断类型
  let gamepadId = gamepad.id.toLowerCase()
  if (gamepadId.includes('xbox') || gamepadId.includes('microsoft')) {
    return GamepadType.XBOX
  } else if (gamepadId.includes('playstation') || gamepadId.includes('ps4') || gamepadId.includes('ps5')) {
    return GamepadType.PLAYSTATION
  } else if (gamepadId.includes('nintendo') || gamepadId.includes('switch')) {
    return GamepadType.NINTENDO
  }
  return GamepadType.GENERIC
}

export const GamepadButtonIndexToLabel = getButtonLabel
