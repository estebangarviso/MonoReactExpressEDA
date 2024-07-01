import { CURRENCY_SYMBOLS } from '../../../constants/currency'
import { IBase } from './base'

export interface ICurrency extends IBase {
  name: string
  symbol: CURRENCY_SYMBOLS
  rate: number
  decimals: number
  sign: string
  isDefault: boolean
}
