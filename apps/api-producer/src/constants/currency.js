const CURRENCIES = [
  {
    "name": "US Dollar",
    "symbol": "USD",
    "sign": "$",
    "rate": 1,
    "decimals": 2,
    "isDefault": true
  },
  {
    "name": "Chilean Peso",
    "symbol": "CLP",
    "sign": "$",
    "rate": 1000,
    "decimals": 0,
    "isDefault": false
  }
]

export const CURRENCY_SYMBOLS = Object.entries(CURRENCIES).map(currency => currency[1].symbol)
