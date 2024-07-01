import CURRENCIES from '../database/redis/seed/currencies.json'
export const CURRENCY_SYMBOLS = Object.entries(CURRENCIES).map(currency => currency[1].symbol)
