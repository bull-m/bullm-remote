import { CarInfo, LinkInstanceType, LinkUtilType } from '@/store/link'
import { AP_MODE_IP } from '@/constants'
import WsLink from '@/utils/link/method/WsLink.ts'

type LinkOption = {
  type: 'hotspot'
}

const wsOp = {
  ip: AP_MODE_IP,
  token: '',
  type: 'ws',
}

const HotspotLink: LinkUtilType = {
  getCarList(op: LinkOption): Promise<CarInfo[]> {
    return WsLink.getCarList(wsOp)
  },
  getCarInfo(mac: string, op: LinkOption) {
    return WsLink.getCarInfo(mac, wsOp)
  },

  isAllowConnect(mac: string, op: LinkOption) {
    return WsLink.isAllowConnect(mac, wsOp)
  },

  connect(mac: string, linkOption: LinkOption): Promise<LinkInstanceType> {
    return WsLink.connect(mac, wsOp)
  },
}

export default HotspotLink
