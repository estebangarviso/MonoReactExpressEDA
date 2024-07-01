const ArticleResponse = {
  type: 'object',
  properties: {
    sku: { type: 'string' },
    title: { type: 'string' },
    shortDescription: { type: 'string' },
    unity: { type: 'string' },
    qtyStock: { type: 'number' },
    unitPrice: { type: 'number' },
    currencyId: { type: 'string' },
    isVirtual: { type: 'boolean' },
    isAvailable: { type: 'boolean' },
    isDeleted: { type: 'boolean' }
  }
}

const ArticleRequestBody = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    shortDescription: { type: 'string' },
    unity: { type: 'string' },
    qtyStock: { type: 'number' },
    unitPrice: { type: 'number' },
    isVirtual: { type: 'boolean' },
    isAvailable: { type: 'boolean' }
  }
}

const CurrencyResponse = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    symbol: { type: 'string' },
    rate: { type: 'number' },
    decimals: { type: 'number' },
    sign: { type: 'string' },
    isDefault: { type: 'boolean' }
  }
}

const CurrencyRequestBody = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    symbol: { type: 'string' },
    rate: { type: 'number' },
    decimals: { type: 'number' },
    sign: { type: 'string' },
    isDefault: { type: 'boolean' }
  }
}

const OrderResponse = {
  type: 'object',
  properties: {
    trackingNumber: { type: 'string' },
    userTransactionId: { type: 'string' },
    userId: { type: 'string' },
    currencyId: { type: 'string' },
    receiverId: { type: 'string' },
    currencyRate: { type: 'number' },
    total: { type: 'number' },
    details: { type: 'array', items: { type: 'object' } },
    status: { type: 'string' }
  }
}

const UserResponse = {
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  birthDate: { type: 'date' },
  email: { type: 'string' },
  roleId: { type: 'number' },
  secureToken: { type: 'string' }
}

const UserTransactionsResponse = {
  type: 'object',
  properties: {
    userId: { type: 'string' },
    receiverId: { type: 'string' },
    amount: { type: 'number' },
    currencyId: { type: 'string' },
    status: { type: 'string' },
    entry: { type: 'string' }
  }
}

const Response = {
  type: 'object',
  properties: {
    error: { type: 'boolean' },
    details: { type: 'object' },
    status: { type: 'number' }
  }
}

const HealthcheckResponse = {
  type: 'string'
}

export default {
  ArticleResponse,
  ArticleRequestBody,
  CurrencyResponse,
  CurrencyRequestBody,
  OrderResponse,
  UserResponse,
  UserTransactionsResponse,
  Response,
  HealthcheckResponse
}
