const prefix = 'z-car_'
export function StorageSetItem(key, value: object | Array<any> | string | null) {
  if (value === null) {
    localStorage.removeItem(prefix + key)
    return
  }
  if (typeof value === 'object' || Array.isArray(value)) {
    value = JSON.stringify(value)
  }
  localStorage.setItem(prefix + key, value)
}

export function StorageGetItem<T = any>(key): T | null {
  const value = localStorage.getItem(prefix + key)
  if (value === null) {
    return null
  }
  try {
    return JSON.parse(value)
  } catch (e) {
    return value as T
  }
}

export function StorageRemoveItem(key) {
  localStorage.removeItem(prefix + key)
}
