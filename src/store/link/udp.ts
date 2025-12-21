import { defineStore } from 'pinia'
import { store } from '../index.ts'
import { useStorePlugin } from '@/store/plugin.ts'
import { useStoreWalk } from '@/store/control/walk.ts'
import { useStoreChassis } from '@/store/modules/chassis.ts'
import { executePromisesInSequence } from '@/utils'
import { useStoreDog } from '@/store/link/dog.ts'
import { useStoreCamera } from '@/store/modules/camera.ts'
import { UdpSend } from '@/utils/car/message.ts'
import { useStoreCar } from '@/store/car.ts'
import { useStoreLink } from '@/store/link/index.ts'

export const useStore = defineStore(
  'udp',
  () => {
    function init() {
      return UdpSend(
        JSON.stringify({
          id: useStoreCar().server_id,
          type: 'client',
          // @ts-ignore
          token: useStoreLink().connect.linkOption!.token,
          mac: useStoreLink().connect.info?.mac,
        })
      )
    }

    function clear() {}

    return {
      init,
      clear,
    }
  },
  {
    persist: false,
  }
)

export function useStoreUdp() {
  return useStore(store)
}
