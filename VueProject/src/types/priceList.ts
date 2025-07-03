// src/types/priceList.ts

export interface DeliveryType {
  city: number
  outside_city: number
}

export interface EdgeTypePerM {
  radius: number
  figured: number
}

export interface DrainageTypePerM {
  overlay: number
  integrated: number
}

export interface PriceList {
  measurement: number
  surfaceBondingPerM: number
  edgeTypePerM: EdgeTypePerM
  drainageTypePerM: DrainageTypePerM
  frontBendPerM: number
  deliveryType: DeliveryType
  ventilationHolePerUnit: number
  cooktopCutoutPerUnit: number
  overlaySinkCutoutPerUnit: number
  undermountSinkInstallationPerUnit: number
  onSiteJoiningPerUnit: number
  radius10To300PerUnit: number
  radius300To1000PerUnit: number
  verticalRadiusPerUnit: number
  twoPlaneProductPerUnit: number
  baseMultiplier: number
  coefficient0To300: number
  coefficient300To340: number
  coefficient340To380: number
  coefficient380To500: number
  coefficient500To550: number
  coefficient550Plus: number
}

export interface PriceListFormData extends PriceList {
  isChanged?: boolean
  lastSaved?: string
}

export interface PriceListHistory {
  id: string
  priceList: PriceList
  updatedBy: string
  updatedAt: string
  comment?: string
}
