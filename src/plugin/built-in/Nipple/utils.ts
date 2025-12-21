/**
 * 差速和麦轮的运动
 * @param data x: 麦轮平移, y: 前后, z: 旋转
 */
export function axle_speed(data: { x?: number; y: number; z: number }) {
  const x = data.x ?? 0 // 麦轮平移
  const y = data.y ?? 0 // 前后
  const z = data.z ?? 0 // 旋转
  const leftTop = y + z + x
  const rightTop = y - z - x
  const leftBottom = y + z - x
  const rightBottom = y - z + x
  return {
    leftTop: Math.max(-255, Math.min(255, leftTop)),
    rightTop: Math.max(-255, Math.min(255, rightTop)),
    leftBottom: Math.max(-255, Math.min(255, leftBottom)),
    rightBottom: Math.max(-255, Math.min(255, rightBottom)),
  }
}
