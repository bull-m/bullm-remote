/**
 * 一些首页的公共方法
 */
import { CarInfo } from '@/store/link'
import pcbPng from './assets/pcb.png?url'

// 获取小车的图标
export function getCarIcon(car: CarInfo) {
  return (
    {
      'nm-car': pcbPng,
    }[car.version] || pcbPng
  )
}
