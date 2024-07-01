import { IBase } from './base'
export interface IArticle extends IBase {
  sku: string
  title: string
  shortDescription: string
  unity: string
  qtyStock: number // TODO: remove if product depends on multiple warehouses
  unitPrice: number
  currencyId: string
  isVirtual: boolean
  isAvailable: boolean
  isDeleted: boolean
  // TODO: Add more fields like images, taxId, etc.
}
