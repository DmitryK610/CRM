import type { PriceListFormData } from '@/types'


const defaultPriceList: PriceListFormData = {
  measurement: 1.0,
  deliveryType: {
    city: 1.0,
    outside_city: 1.0,
  },
  surfaceBondingPerM: 1.0,
  edgeTypePerM: {
    radius: 1.0,
    figured: 1.0,
  },
  drainageTypePerM: {
    overlay: 1.0,
    integrated: 1.0,
  },
  frontBendPerM: 1.0,
  ventilationHolePerUnit: 1.0,
  cooktopCutoutPerUnit: 1.0,
  overlaySinkCutoutPerUnit: 1.0,
  undermountSinkInstallationPerUnit: 1.0,
  onSiteJoiningPerUnit: 1.0,
  radius10To300PerUnit: 1.0,
  radius300To1000PerUnit: 1.0,
  verticalRadiusPerUnit: 1.0,
  twoPlaneProductPerUnit: 1.0,
  baseMultiplier: 1.0,
  coefficient0To300: 1.0,
  coefficient300To340: 1.0,
  coefficient340To380: 1.0,
  coefficient380To500: 1.0,
  coefficient500To550: 1.0,
  coefficient550Plus: 1.0,
  lastSaved: new Date().toISOString(),
}


const STORAGE_KEY = 'priceList'

export const priceListApi = {

  get: async (): Promise<PriceListFormData> => {
    return new Promise((resolve) => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          resolve(JSON.parse(stored))
        } catch {
          resolve(defaultPriceList)
        }
      } else {
        resolve(defaultPriceList)
      }
    })
  },


  update: async (priceList: PriceListFormData): Promise<PriceListFormData> => {
    return new Promise((resolve) => {
      const updatedPriceList = {
        ...priceList,
        lastSaved: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPriceList))
      resolve(updatedPriceList)
    })
  },


  reset: async (): Promise<PriceListFormData> => {
    return new Promise((resolve) => {
      const resetPriceList = {
        ...defaultPriceList,
        lastSaved: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetPriceList))
      resolve(resetPriceList)
    })
  },
}
