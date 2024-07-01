import CURRENCIES from '../database/redis/seed/currencies.json'
export const CURRENCY_SYMBOLS: string[] = Object.entries(CURRENCIES).map(
  currency => currency[1].symbol
)
export type CURRENCY_SYMBOLS = 'USD' | 'CLP'
