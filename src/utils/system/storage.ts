import { framework, FrameworkTauri } from '@/utils/system/os.ts'
import { LazyStore } from '@tauri-apps/plugin-store'

const prefix = 'z-car_'
export function StorageSetItem(key: string, value: object | Array<any> | string | null) {
  if (value === null) {
    localStorage.removeItem(prefix + key)
    return
  }
  if (typeof value === 'object' || Array.isArray(value)) {
    value = JSON.stringify(value)
  }
  localStorage.setItem(prefix + key, value)
}

export function StorageGetItem<T = any>(key: string): T | null {
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

export function StorageRemoveItem(key: string) {
  localStorage.removeItem(prefix + key)
}


/**
 * 高级存储
 * @param key
 * @constructor
 */
export function PlusStorage(key: string) {
  if (framework() === FrameworkTauri) {
    return new LazyStore(key)
  }
  return new IndexedDBStorage(key)
}


// IndexedDB 实现的存储类
class IndexedDBStorage {
  private dbName: string
  private storeName: string
  private db: IDBDatabase | null = null

  constructor(dbName: string, storeName: string = 'keyvalue') {
    this.dbName = dbName
    this.storeName = storeName
    this.initDB()
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error)
      }
    })
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB()
    }
    return this.db as IDBDatabase
  }

  async get<T>(key: string): Promise<T | undefined> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }
    })
  }

  async set(key: string, value: unknown): Promise<void> {
    const db = await this.getDB()
    // 确保值可以被结构化克隆算法序列化
    let serializableValue = value
    if (typeof value === 'object' && value !== null) {
      // 对于对象和数组，使用JSON序列化/反序列化来确保可克隆性
      serializableValue = JSON.parse(JSON.stringify(value))
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(serializableValue, key)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }
    })
  }

  async delete(key: string): Promise<boolean> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onsuccess = () => {
        resolve(true)
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }
    })
  }

  async has(key: string): Promise<boolean> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.count(key)

      request.onsuccess = () => {
        resolve(request.result > 0)
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }
    })
  }

  async clear(): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }
    })
  }

  async keys(): Promise<string[]> {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.getAllKeys()

        request.onsuccess = () => {
          resolve(request.result as string[])
        }

        request.onerror = (event) => {
          reject((event.target as IDBRequest).error)
        }
      })
  }
}