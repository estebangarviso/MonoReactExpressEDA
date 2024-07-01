export interface IUserTransactions {
  id: string
  userId: string
  receiverId: string
  amount: number
  currencyId: string
  status: 'pending' | 'paid' | 'failed'
  // If the user is customer and giving the amount to himself, the entry is debit (because the ecommerce is holding the money from the user) and
  // the other way around if the user is giving the amount to another user, that is admin, is credit (because the admin is holding the money from the ecommerce)
  // It represent the double entry in the accounting system (debit and credit, https://www.investopedia.com/terms/d/double-entry.asp)
  entry: 'credit' | 'debit'
}
