export default {
  box: (...children: any[]) => {
    return children
  },
  tabs: (...children: any[]) => {
    return {
      type: 'tabs',
      children,
    }
  },
  tab: (name, ...children: any[]) => {
    return {
      type: 'tab',
      name,
      children,
    }
  },
  group: (name, ...children: any[]) => {
    return {
      type: 'group',
      name,
      children,
    }
  },
  radio: (key, ...options: { text: string; value: string }[]) => {
    return {
      type: 'radio',
      key,
      options,
    }
  },

  gamepadKey: (key, name) => {
    return {
      type: 'gamepad-key',
      key,
      name,
    }
  },
  keyboardKey: (key, name) => {
    return {
      type: 'keyboard-key',
      key,
      name,
    }
  },
  slider: (key, name, min, max, step) => {
    return {
      type: 'slider',
      key,
      name,
      min: min ?? 0,
      max: max ?? 255,
      step: step ?? 1,
    }
  },
  switch: (key, name) => {
    return {
      type: 'switch',
      key,
      name,
    }
  },
  pin: (
    key,
    name,
    option?: {
      selectServo?: boolean
      selectGroup?: boolean
      selectPin?: boolean
    }
  ) => {
    return {
      type: 'pin',
      key,
      name,
      ...option,
    }
  },
  device: (
    key,
    name,
    option?: {
      selectServo?: boolean
      selectGroup?: boolean
      selectPwm?: boolean
      selectDigital?: boolean
    }
  ) => {
    return {
      type: 'device',
      key,
      name,
      ...option,
    }
  },
  icon: (key, name) => {
    return {
      type: 'icon',
      key,
      name,
    }
  },
}
