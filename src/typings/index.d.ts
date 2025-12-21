import { StateTree } from 'pinia'
import { PersistenceOptions } from 'pinia-plugin-persistedstate'

type PromiseType<T extends Promise<any>> = T extends Promise<infer U> ? U : never

declare module 'pinia' {
  interface DefineStoreOptionsBase<S extends StateTree, Store> {
    /**
     * Persist store in storage
     * @see https://prazdevs.github.io/pinia-plugin-persistedstate
     */
    persist?: boolean | PersistenceOptions<S> | PersistenceOptions<S>[]
  }
  interface PiniaCustomProperties {
    /**
     * Hydrate store form configured storage
     * Warning: this is for advances usecases, make sure you know what you're doing
     */
    $hydrate: (opts?: { runHooks?: boolean }) => void
    /**
     * Persist store into configured storage
     * Warning: this is for advances usecases, make sure you know what you're doing
     */
    $persist: () => void
  }
}
